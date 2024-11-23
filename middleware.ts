import micromatch from 'micromatch';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


// Add routes that don't require authentication
const unAuthenticatedRoutes = [
  '/api/hello',
  '/api/health',
  '/api/auth/**',
  '/api/oauth/**',
  '/api/scim/v2.0/**',
  '/auth/**',
  '/invitations/*',
  '/api/invitations/*',
  '/terms-condition',
];

const ulimitedPlanRoutes = [
  '/teams/:slug/asset/**',
  '/teams/:slug/asset-management/**'
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const patterns = ulimitedPlanRoutes.map((route) => route.replace(':slug', '*'));

  // Bypass routes that don't require authentication
  if (micromatch.isMatch(pathname, unAuthenticatedRoutes)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
  });

  // No token, redirect to signin page
  if (!token) {
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('callbackUrl ', encodeURI(req.url));

    return NextResponse.redirect(url);
  }

  if (micromatch.isMatch(pathname, patterns)) {
    const slugMatch = pathname.match(/\/teams\/([^/]+)\/(asset|asset-management)/);
    const slug = slugMatch ? slugMatch[1] : null;
    
    const response = await fetch(`${req.nextUrl.origin}/api/check-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ slug }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL('/upgrade', req.url));
    }
  }

  // All good, let the request through
  return NextResponse.next();
}

export const config = {
  //matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  matcher: ['/account/:path*', '/teams/:path*', '/tia', '/tasks'],
};
