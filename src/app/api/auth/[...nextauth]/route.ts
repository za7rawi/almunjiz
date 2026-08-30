import crypto from "crypto";
import NextAuth, { type NextAuthOptions, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthService } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";
import { isSessionRevoked } from "@/lib/session-revocation";

function hmacSign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function createVerificationToken(email: string, type: 'otp'): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const payload = `${email}|${type}|${expiresAt}`;
  const signature = hmacSign(payload, secret);
  return `vt_${Buffer.from(payload).toString('base64url')}.${signature}`;
}

export function consumeVerificationToken(token: string): { email: string; type: 'otp' } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;
    const [encodedPayload, signature] = token.slice(3).split('.');
    if (!encodedPayload || !signature) return null;
    const payload = Buffer.from(encodedPayload, 'base64url').toString();
    const expectedSig = hmacSign(payload, secret);
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expectedBuf.length) return null;
    let diff = 0;
    for (let i = 0; i < sigBuf.length; i++) {
      diff |= sigBuf[i] ^ expectedBuf[i];
    }
    if (diff !== 0) return null;
    const [email, type, expiresAtStr] = payload.split('|');
    if (Date.now() > Number(expiresAtStr)) return null;
    if (type !== 'otp') return null;
    return { email, type };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان");
        }

        const user = await AuthService.findByEmail(credentials.email);

        if (!user) {
          throw new Error("Invalid credentials");
        }

        let isVerified = false;
        if (credentials.password?.startsWith('vt_')) {
          const verification = consumeVerificationToken(credentials.password);
          isVerified = verification !== null && verification.email === credentials.email;
        } else {
          const isValid = await AuthService.verifyPassword(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid credentials");
          }
          isVerified = true;
        }

        if (!isVerified) {
          throw new Error("رمز التحقق غير صالح أو منتهي الصلاحية");
        }

        // TODO: Add a `status` field to User model to support banning/suspending accounts
        // if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
        //   throw new Error("Account is disabled");
        // }

        await AuthService.updateLastLogin(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          sessionVersion: user.sessionVersion ?? 1,
          rememberMe: String(credentials.rememberMe) === 'true',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;

        let dbUser = await prisma.user.findUnique({ where: { email } });
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              name: user.name || 'User',
              email,
              password: crypto.randomUUID(),
              role: 'CUSTOMER',
            },
          });
        } else {
          await AuthService.updateLastLogin(dbUser.id);
        }

        const extendedUser = user as unknown as Record<string, unknown>;
        extendedUser.id = dbUser.id;
        extendedUser.role = dbUser.role;
        extendedUser.avatar = dbUser.avatar;
        extendedUser.sessionVersion = dbUser.sessionVersion;
      }

      // Create session tracking record
      const sessionToken = crypto.randomUUID();
      const userId = (user as unknown as Record<string, unknown>).id as string;
      if (userId) {
        const extendedUser = user as unknown as Record<string, unknown>;
        const isRememberMe = extendedUser.rememberMe === true;
        const sessionMaxAge = isRememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        await prisma.sessionTracking.create({
          data: {
            userId,
            sessionToken,
            expiresAt: new Date(Date.now() + sessionMaxAge * 1000),
            ipAddress: 'unknown',
            userAgent: 'unknown',
          },
        });
        extendedUser.sessionTrackingId = sessionToken;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const extendedUser = user as unknown as Record<string, unknown>;
        token.id = extendedUser.id;
        token.role = extendedUser.role;
        token.avatar = extendedUser.avatar;
        token.provider = account?.provider || 'credentials';
        token.sessionTrackingId = extendedUser.sessionTrackingId;
        token.sessionVersion = extendedUser.sessionVersion;

        // Handle "Remember Me" - extend session to 30 days
        if (extendedUser.rememberMe) {
          token.maxAge = 30 * 24 * 60 * 60; // 30 days
        }
      }

      // SECURITY: Periodically verify user still exists and is active in DB
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, role: true },
          });
          if (!dbUser) {
            // User deleted from DB — invalidate token
            return {};
          }
          // Sync role changes from DB to token
          if (dbUser.role !== token.role) {
            token.role = dbUser.role;
          }
        } catch {
          // On DB error, allow the token to pass (fail-open for availability)
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.id as string;
        if (userId) {
          const revoked = await isSessionRevoked(userId, token.iat as number | undefined);
          if (revoked) {
            return { user: null } as unknown as Session;
          }
          const tokenVersion = token.sessionVersion as number | undefined;
          if (tokenVersion !== undefined) {
            const { isSessionValid } = await import('@/lib/session-security');
            if (!(await isSessionValid(userId, tokenVersion))) {
              return { user: null } as unknown as Session;
            }
          }
        }
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).avatar = token.avatar;
        (session.user as Record<string, unknown>).provider = token.provider;
        (session.user as Record<string, unknown>).sessionVersion = token.sessionVersion;
        (session.user as Record<string, unknown>).createdAt = (session.user as Record<string, unknown>).createdAt || new Date().toISOString();
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
