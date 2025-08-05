"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Check for required environment variables
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		console.error("Missing Supabase environment variables. Please check your .env.local file.");
		return (
			<div className="min-h-screen flex items-center justify-center bg-red-50">
				<div className="text-center p-8 bg-red-100 rounded-lg border border-red-200">
					<h1 className="text-2xl font-bold text-red-800 mb-4">Configuration Error</h1>
					<p className="text-red-700 mb-4">Missing Supabase environment variables. Please create a .env.local file with:</p>
					<pre className="text-left text-sm bg-red-200 p-4 rounded border text-red-800">
						{`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
					</pre>
					<p className="text-red-700 mt-4">
						Get these values from your{" "}
						<a href="https://supabase.com/dashboard" className="underline font-semibold">
							Supabase Dashboard
						</a>
					</p>
				</div>
			</div>
		);
	}

	const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

	useEffect(() => {
		// Get initial session
		const getSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			// Check for development admin session if no Supabase session
			if (!session) {
				const devSession = localStorage.getItem("dev_admin_session");
				if (devSession) {
					try {
						const parsedSession = JSON.parse(devSession);
						const expiresAt = new Date(parsedSession.expires_at);

						// Check if session is still valid
						if (expiresAt > new Date()) {
							// Create a mock user object
							const mockUser = {
								id: parsedSession.user.id,
								email: parsedSession.user.email,
								user_metadata: { role: parsedSession.user.role },
								app_metadata: {},
								aud: "authenticated",
								created_at: new Date().toISOString(),
								confirmed_at: new Date().toISOString(),
								last_sign_in_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
								role: "authenticated",
							} as User;

							setUser(mockUser);
							setSession({
								access_token: "dev-token",
								refresh_token: "dev-refresh",
								expires_in: 86400,
								expires_at: Math.floor(expiresAt.getTime() / 1000),
								token_type: "bearer",
								user: mockUser,
							} as Session);
						} else {
							// Remove expired session
							localStorage.removeItem("dev_admin_session");
						}
					} catch (err) {
						console.error("Error parsing dev session:", err);
						localStorage.removeItem("dev_admin_session");
					}
				}
			} else {
				setSession(session);
				setUser(session?.user ?? null);
			}
			setLoading(false);
		};

		getSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);

			// Handle different auth events
			switch (event) {
				case "SIGNED_IN":
					router.push("/dashboard");
					break;
				case "SIGNED_OUT":
					router.push("/auth/login");
					break;
				case "TOKEN_REFRESHED":
					console.log("Token refreshed");
					break;
				case "USER_UPDATED":
					console.log("User updated");
					break;
			}
		});

		return () => subscription.unsubscribe();
	}, [supabase, router]);

	const signOut = async () => {
		setLoading(true);

		// Clear development session if it exists
		localStorage.removeItem("dev_admin_session");

		// Also clear the development session cookie
		document.cookie = "dev_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";

		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Error signing out:", error);
		}
		setLoading(false);
	};

	const refreshSession = async () => {
		const { data, error } = await supabase.auth.refreshSession();
		if (error) {
			console.error("Error refreshing session:", error);
			throw error;
		}
		return data;
	};

	const value = {
		user,
		session,
		loading,
		signOut,
		refreshSession,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// Hook for protecting client components
export function useAuthRequired() {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth/login");
		}
	}, [user, loading, router]);

	return { user, loading };
}
