import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isSessionCookiePresent = (request: NextRequest) =>
  request.cookies.getAll().some(({ name }) => name.endsWith('session_token'));

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const hasSession = isSessionCookiePresent(request);
  const isLoginRoute = pathname === '/login';

  if (!hasSession && !isLoginRoute) {
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
