import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "./client-shared";

// Server-side auth utilities - ONLY use in Server Components
export async function getServerSession() {
	const cookieStore = await cookies();
	const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value;
			},
			set(name: string, value: string, options: CookieOptions) {
				cookieStore.set({ name, value, ...options });
			},
			remove(name: string, options: CookieOptions) {
				cookieStore.set({ name, value: "", ...options });
			},
		},
	});

	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return session;
	} catch (error) {
		console.error("Error getting server session:", error);
		return null;
	}
}

export async function getServerUser() {
	const session = await getServerSession();
	return session?.user ?? null;
}

// Require authentication for server components
export async function requireAuth() {
	const user = await getServerUser();
	if (!user) {
		redirect("/auth/login");
	}
	return user;
}

// API route authentication middleware
export async function withAuth(request: NextRequest, handler: Function) {
	try {
		const token = request.headers.get("authorization")?.replace("Bearer ", "");

		if (!token) {
			return NextResponse.json({ error: "Missing authentication token" }, { status: 401 });
		}

		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
		}

		// Add user to request context
		(request as any).user = user;

		return handler(request);
	} catch (error) {
		console.error("Auth middleware error:", error);
		return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
	}
}
