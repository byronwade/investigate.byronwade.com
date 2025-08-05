"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (for App Router client components)
export const createSupabaseBrowserClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);

// Default browser client for client components
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Real-time subscription helper for client components
export function subscribeToTable<T>(table: string, filter?: string, callback?: (payload: T) => void) {
	return supabaseBrowser
		.channel(`public:${table}`)
		.on(
			"postgres_changes",
			{
				event: "*",
				schema: "public",
				table,
				filter,
			},
			callback || (() => {})
		)
		.subscribe();
}
