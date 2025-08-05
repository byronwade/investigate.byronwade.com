import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	// Check for required environment variables
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error("Missing Supabase environment variables in middleware");
		// Allow the request to continue to show the error page from AuthProvider
		return NextResponse.next();
	}

	let response = NextResponse.next({
		request: {
			headers: req.headers,
		},
	});

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return req.cookies.get(name)?.value;
			},
			set(name: string, value: string, options: CookieOptions) {
				req.cookies.set({
					name,
					value,
					...options,
				});
				response = NextResponse.next({
					request: {
						headers: req.headers,
					},
				});
				response.cookies.set({
					name,
					value,
					...options,
				});
			},
			remove(name: string, options: CookieOptions) {
				req.cookies.set({
					name,
					value: "",
					...options,
				});
				response = NextResponse.next({
					request: {
						headers: req.headers,
					},
				});
				response.cookies.set({
					name,
					value: "",
					...options,
				});
			},
		},
	});

	// Refresh session if expired - required for Server Components
	await supabase.auth.getSession();

	const url = req.nextUrl.clone();

	// Get the session
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Check for development admin session in cookies (since middleware can't access localStorage)
	let hasDevSession = false;
	const devSessionCookie = req.cookies.get("dev_admin_session");
	if (devSessionCookie) {
		try {
			const parsedSession = JSON.parse(devSessionCookie.value);
			const expiresAt = new Date(parsedSession.expires_at);
			hasDevSession = expiresAt > new Date();
		} catch (err) {
			// Invalid session cookie, ignore
		}
	}

	// Public routes that don't require authentication
	const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/callback", "/api/auth"];

	const isPublicPath = publicPaths.some((path) => url.pathname === path || url.pathname.startsWith(path));

	// Redirect authenticated users away from auth pages
	if ((session || hasDevSession) && (url.pathname.startsWith("/auth/login") || url.pathname.startsWith("/auth/register"))) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	// Redirect unauthenticated users to login for protected routes
	if (!session && !hasDevSession && !isPublicPath) {
		const redirectUrl = new URL("/auth/login", req.url);
		redirectUrl.searchParams.set("redirectTo", url.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// Add security headers
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "DENY");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

	// CSP for enhanced security
	response.headers.set("Content-Security-Policy", ["default-src 'self'", "script-src 'self' 'unsafe-eval' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:", "connect-src 'self' https: wss:", "font-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"].join("; "));

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
