import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/services/auth.service";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("رقم الهاتف وكلمة المرور مطلوبان / Phone and password are required");
        }

        const user = await AuthService.findByPhone(credentials.phone);

        if (!user) {
          throw new Error("المستخدم غير موجود / User not found");
        }

        const isValid = await AuthService.verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("كلمة المرور غير صحيحة / Incorrect password");
        }

        await AuthService.updateLastLogin(user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
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
        token.phone = (user as unknown as Record<string, unknown>).phone;
        token.avatar = (user as unknown as Record<string, unknown>).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).id = token.id;
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).phone = token.phone;
        (session.user as unknown as Record<string, unknown>).avatar = token.avatar;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
