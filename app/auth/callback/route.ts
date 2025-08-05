import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

		try {
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (error) {
				console.error("Auth callback error:", error);
				return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url));
			}
		} catch (err) {
			console.error("Auth callback exception:", err);
			return NextResponse.redirect(new URL("/auth/login?error=Authentication failed", request.url));
		}
	}

	// Redirect to the dashboard or the originally requested page
	const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard";
	return NextResponse.redirect(new URL(redirectTo, request.url));
}
