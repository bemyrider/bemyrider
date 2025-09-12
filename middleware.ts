import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/cleanup',
    '/riders',
    '/test-direct',
    '/test-roles',
    '/test-supabase',
    '/debug-user',
  ];

  // API routes that should be accessible
  const apiRoutes = [
    '/api/stripe/webhook',
    '/api/stripe/onboarding',
    '/api/stripe/create-account',
    '/api/stripe/create-login-link',
    '/api/stripe/create-payment-intent',
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isApiRoute = apiRoutes.some(route => pathname.startsWith(route));

  // Allow API routes and static files to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Don't redirect static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.svg') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.ico')
  ) {
    return NextResponse.next();
  }

  // 🔒 SECURITY: Server-side authentication check for protected routes
  if (!isPublicRoute) {
    try {
      // Initialize Supabase server client
      const response = NextResponse.next();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              response.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );

      // Verify user authentication server-side
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Middleware: Session error:', sessionError);
      }

      if (!session) {
        console.log('🚪 Middleware: No session, redirecting to login');

        // Preserve the original URL for redirect after login
        const loginUrl = new URL('/auth/login', req.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Verify user exists in our database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Middleware: User profile not found:', profileError);
        const loginUrl = new URL('/auth/login', req.url);
        return NextResponse.redirect(loginUrl);
      }

      // Add user info to headers for client-side use
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-role', profile.role);
      response.headers.set('x-protected-route', 'true');

      return response;
    } catch (error) {
      console.error('❌ Middleware: Authentication error:', error);

      // On error, redirect to login
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
