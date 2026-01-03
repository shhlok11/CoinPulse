import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isSessionCookiePresent = (request: NextRequest) =>
  request.cookies.getAll().some(
    ({ name }) => name.includes('better-auth') && name.includes('session'),
  );

const publicPaths = ['/login'];

const isPublicPath = (pathname: string) =>
  publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const hasSession = isSessionCookiePresent(request);
  const isLoginRoute = pathname === '/login';
  const isPublicRoute = isPublicPath(pathname);

  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginRoute) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};
