import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/services/auth.service";

// Server-side verification tokens (in-memory, single-server only)
const verificationTokens = new Map<string, { email: string; type: 'otp' | 'google'; expiresAt: number }>();

export function createVerificationToken(email: string, type: 'otp' | 'google'): string {
  const token = `vt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  verificationTokens.set(token, { email, type, expiresAt: Date.now() + 5 * 60 * 1000 });
  return token;
}

export function consumeVerificationToken(token: string): { email: string; type: 'otp' | 'google' } | null {
  const data = verificationTokens.get(token);
  if (!data || data.expiresAt < Date.now()) {
    verificationTokens.delete(token);
    return null;
  }
  verificationTokens.delete(token);
  return { email: data.email, type: data.type };
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
          throw new Error("المستخدم غير موجود");
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
            throw new Error("كلمة المرور غير صحيحة");
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role;
        token.avatar = (user as unknown as Record<string, unknown>).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).avatar = token.avatar;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
