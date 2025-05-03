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

// Determine if we're in development or production
// Don't rely on NODE_ENV directly which can cause issues with Next.js
const isDevelopment = () => {
  // Check for specific development indicators
  if (
    // Check for localhost in URL
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    // Check if NETLIFY_DEV is set
    process.env.NETLIFY_DEV === 'true' ||
    // Explicit development URL
    process.env.NEXTAUTH_URL?.includes('localhost')
  ) {
    return true;
  }
  return false;
};

// Flexible base URL determination that works for both local and Netlify
const getBaseUrl = () => {
  // For Netlify deployment (prefer URL from environment)
  if (process.env.NETLIFY_URL) {
    return process.env.NETLIFY_URL;
  }
  
  // For other production environments (like Vercel)
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL;
  }
  
  // For development (localhost)
  if (isDevelopment()) {
    return process.env.NEXTAUTH_URL || "http://localhost:3000";
  }
  
  // Fallback for production
  return "https://uniwell.netlify.app";
};

// Export URL for use in other parts of the app
export const siteUrl = getBaseUrl();

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-in",
    error: "/sign-in", // Error code passed in query string as ?error=
    newUser: "/onboarding",
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
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          return null;
        }
        const bcryptLib = await getBcrypt();
        const passwordMatch = await bcryptLib.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!passwordMatch) {
          return null;
        }

        return user;
      },
    }),
  ],
  // Use explicit NEXTAUTH_SECRET from env variables
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-do-not-use-in-production',
  // Fix the auth URL issues on Netlify
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isDevelopment(), // Only secure in production
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isDevelopment(),
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isDevelopment(),
      },
    },
  },
  // Debug mode in development only
  debug: isDevelopment(),
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
        name: dbUser.name,
        surname: dbUser.surname,
        completedOnboarding: dbUser.completedOnboarding,
      };
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);

