// NextAuth.js ミドルウェア（認証ガード）
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // 認証済みユーザーのみアクセス可能
    // 追加の認可ロジックをここに記述可能
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // ログインページは認証不要
        if (pathname === '/login') {
          return true;
        }

        // API認証エンドポイントは認証不要
        if (pathname.startsWith('/api/auth')) {
          return true;
        }

        // その他のページは認証が必要
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * すべてのリクエストパスにマッチ、ただし以下は除外:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|sw.js|workbox).*)',
  ],
};