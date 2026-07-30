import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { AuthService } from "@/services/auth.service";
import { prisma } from "@/lib/prisma";

function hmacSign(data: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
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
    if (signature !== expectedSig) return null;
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
    maxAge: 7 * 24 * 60 * 60,
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

        await AuthService.updateLastLogin(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).avatar = token.avatar;
        (session.user as Record<string, unknown>).provider = token.provider;
        (session.user as Record<string, unknown>).createdAt = (session.user as Record<string, unknown>).createdAt || new Date().toISOString();
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
