import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

const locales = ["en"];
const publicPages = ["/", "/sign-in", "/sign-up"];
// Auth paths that should be allowed without middleware processing
const authPaths = [
  "/api/auth/callback", 
  "/api/auth/signin", 
  "/api/auth/signout", 
  "/api/auth/session", 
  "/api/auth/providers",
  "/api/auth/error",
  "/api/auth/_log"
];

// Safer way to determine if we're in development
const isDevelopment = 
  process.env.NETLIFY_DEV === 'true' || 
  process.env.NEXTAUTH_URL?.includes('localhost') ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
});

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => token !== null,
    },
    pages: {
      signIn: "/sign-in",
    },
  }
);

export default function middleware(req: NextRequest) {
  // Log request path in development
  if (isDevelopment) {
    console.log(`Middleware processing: ${req.nextUrl.pathname}`);
  }
  
  // Check if the path is an auth path
  const isAuthPath = authPaths.some(path => req.nextUrl.pathname.startsWith(path));
  if (isAuthPath) {
    if (isDevelopment) {
      console.log(`Auth path detected - bypassing middleware: ${req.nextUrl.pathname}`);
    }
    // Allow auth paths to pass through without middleware
    return NextResponse.next();
  }
  
  // Check if this is a Netlify function or API path
  if (req.nextUrl.pathname.includes('/.netlify/functions/') || req.nextUrl.pathname.startsWith('/api/')) {
    if (isDevelopment) {
      console.log(`API/Function path detected - bypassing middleware: ${req.nextUrl.pathname}`);
    }
    return NextResponse.next();
  }
  
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join("|")}))?(${publicPages.join("|")})?/?$`,
    "i"
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    if (isDevelopment) {
      console.log(`Public page detected - using intl middleware: ${req.nextUrl.pathname}`);
    }
    return intlMiddleware(req);
  } else {
    if (isDevelopment) {
      console.log(`Protected page detected - using auth middleware: ${req.nextUrl.pathname}`);
    }
    return (authMiddleware as any)(req);
  }
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - .well-known (well-known files)
    "/((?!_next/static|_next/image|favicon.ico|.well-known).*)",
  ],
};
