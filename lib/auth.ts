import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession, NextAuthOptions } from "next-auth";
import { db } from "./db";
import { Adapter } from "next-auth/adapters";
// import GoogleProvider from "next-auth/providers/google";
// import GithubProvider from "next-auth/providers/github";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { generateFromEmail } from "unique-username-generator";

// This file should be a server-side implementation

// Use a safe pattern for bcrypt that doesn't break client builds
let bcrypt: any = null;

// Only import bcrypt in server environment
export async function getBcrypt() {
  if (!bcrypt) {
    // Dynamic import only on server
    if (typeof window === 'undefined') {
      bcrypt = await import('bcrypt');
    }
  }
  return bcrypt;
}

// Server-only auth functions
export async function hashPassword(password: string): Promise<string> {
  const bcryptLib = await getBcrypt();
  if (!bcryptLib) {
    throw new Error('Cannot hash password on client-side');
  }
  return bcryptLib.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcryptLib = await getBcrypt();
  if (!bcryptLib) {
    throw new Error('Cannot compare password on client-side');
  }
  return bcryptLib.compare(password, hash);
}

// Client-safe functions
export function isAuthenticated() {
  // Implement with cookies or localStorage that works on both client/server
  if (typeof window !== 'undefined') {
    return Boolean(localStorage.getItem('authenticated'));
  }
  return false;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authenticated');
  }
}

// Add other auth methods that are safe for client use

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    error: "/sign-in",
    signIn: "/sign-in",
    signOut: "/sign-in",
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    // GoogleProvider removed
    // GithubProvider removed
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please enter email and password.");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("User was not found, Please enter valid email");
        }
        const bcryptLib = await getBcrypt();
        const passwordMatch = await bcryptLib.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          throw new Error(
            "The entered password is incorrect, please enter the correct one."
          );
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.username = token.username;
        session.user.surname = token.surname;
        session.user.completedOnboarding = !!token.completedOnboarding;
      }

      const user = await db.user.findUnique({
        where: {
          id: token.id,
        },
      });

      if (user) {
        session.user.image = user.image;
        session.user.completedOnboarding = user.completedOnboarding;
        session.user.username = user.username;
      }
     

      return session;
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
      });

      if (!dbUser) {
        token.id = user!.id;
        return token;
      }

      return {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
