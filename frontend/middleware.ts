import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_token';

// Chỉ cần secret để verify, không cần Prisma hay DB ở đây
const getSecret = () => {
  const secret = process.env.JWT_SECRET ?? 'express-cafe-secret';
  return new TextEncoder().encode(secret);
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Chỉ guard các route /admin/*
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // /admin/login là public — bỏ qua
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Không có token → redirect login
  if (!token) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, getSecret());

    // Inject user info vào header để pages có thể dùng
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-admin-id', String(payload.id ?? payload.sub ?? ''));
    requestHeaders.set('x-admin-email', String(payload.email ?? ''));
    requestHeaders.set('x-admin-role', String(payload.role ?? 'admin'));

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    // Token hết hạn hoặc không hợp lệ → xóa cookie + redirect login
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('error', 'session_expired');

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
