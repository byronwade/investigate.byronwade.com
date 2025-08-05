"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabase } from "./client-shared";

// Client-side auth utilities - ONLY use in Client Components
export function useSupabaseSession() {
	const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
	return supabase.auth.getSession();
}

// Sign out utility for client components
export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) {
		console.error("Error signing out:", error);
		throw error;
	}
	// Don't redirect here, let the auth provider handle navigation
}

// Session refresh utility for client components
export async function refreshSession() {
	const { data, error } = await supabase.auth.refreshSession();
	if (error) {
		console.error("Error refreshing session:", error);
		throw error;
	}
	return data;
}
