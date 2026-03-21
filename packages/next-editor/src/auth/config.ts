import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "./user-store";

declare module "next-auth" {
  interface User {
    role: string;
    title?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      title?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    title?: string | null;
  }
}

const _nextAuth: NextAuthResult = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await getUserByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.title = user.title ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.title = token.title as string | null | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
});

export const handlers = _nextAuth.handlers;
export const signIn = _nextAuth.signIn;
export const signOut = _nextAuth.signOut;

// next-auth v5's `auth` has a complex overloaded type that references internal
// lib paths, which TypeScript can't express portably in declaration files.
// We expose only the no-argument form used throughout this package.
import type { Session } from "next-auth";
export async function auth(): Promise<Session | null> {
  return (_nextAuth.auth as unknown as () => Promise<Session | null>)();
}
