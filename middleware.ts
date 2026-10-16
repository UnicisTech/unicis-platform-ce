import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import picomatch from 'picomatch/posix';

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
  '/teams/*/asset/**',
  '/teams/*/asset-management/**',
];

const isUnauthenticatedRoute = picomatch(unAuthenticatedRoutes);
const isUnlimitedPlanRoute = picomatch(ulimitedPlanRoutes);

const getInternalAppOrigin = (req: NextRequest) => {
  const configuredOrigin = process.env.NEXT_INTERNAL_APP_URL?.trim();

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.NODE_ENV === 'production') {
    return `http://127.0.0.1:${process.env.PORT || '4002'}`;
  }

  return req.nextUrl.origin;
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass routes that don't require authentication
  if (isUnauthenticatedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
  });

  // No token, redirect to signin page
  if (!token) {
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('callbackUrl', encodeURI(req.url));

    return NextResponse.redirect(url);
  }

  if (isUnlimitedPlanRoute(pathname)) {
    const slugMatch = pathname.match(
      /\/teams\/([^/]+)\/(asset|asset-management)/
    );
    const slug = slugMatch ? slugMatch[1] : null;

    let response: Response;

    try {
      response = await fetch(
        new URL('/api/check-plan', getInternalAppOrigin(req)),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: req.headers.get('cookie') ?? '',
          },
          body: JSON.stringify({ slug }),
        }
      );
    } catch (error) {
      console.error('Plan check request failed:', error);
      return NextResponse.redirect(new URL(`/teams/${slug}/billing`, req.url));
    }

    if (!response.ok) {
      return NextResponse.redirect(new URL(`/teams/${slug}/billing`, req.url));
    }
  }

  // All good, let the request through
  return NextResponse.next();
}

export const config = {
  //matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
  matcher: ['/account/:path*', '/teams/:path*', '/tia', '/tasks'],
};
