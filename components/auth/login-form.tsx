"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { validateEmail } from "@/lib/supabase/auth-shared";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mfaRequired, setMfaRequired] = useState(false);
	const [mfaCode, setMfaCode] = useState("");

	const router = useRouter();
	const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Development admin bypass - remove this in production
		if (email === "bcw1995@gmail.com" && password === "Byronwade1995!") {
			const devSessionData = {
				user: {
					id: "dev-admin-id",
					email: "bcw1995@gmail.com",
					role: "admin",
				},
				expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
			};

			// Create a mock session for development
			localStorage.setItem("dev_admin_session", JSON.stringify(devSessionData));

			// Also set a cookie for middleware detection
			document.cookie = `dev_admin_session=${JSON.stringify(devSessionData)}; path=/; max-age=86400; samesite=lax`;

			// Log audit event for development admin login
			try {
				await fetch("/api/audit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "dev_admin_login",
						details: { email: "bcw1995@gmail.com", devMode: true },
					}),
				});
			} catch (err) {
				console.log("Audit logging failed (expected in dev mode):", err);
			}

			setLoading(false);
			router.push("/dashboard");
			return;
		}

		// Validate email for normal Supabase auth
		if (!validateEmail(email)) {
			setError("Please enter a valid email address");
			setLoading(false);
			return;
		}

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				if (error.message.includes("mfa")) {
					setMfaRequired(true);
				} else {
					setError(error.message);
				}
			} else if (data.user) {
				// Log audit event
				await fetch("/api/audit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "user_login",
						details: { userId: data.user.id, email: data.user.email },
					}),
				});

				router.push("/dashboard");
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleMfaVerification = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.verifyOtp({
				email,
				token: mfaCode,
				type: "totp",
			});

			if (error) {
				setError(error.message);
			} else {
				router.push("/dashboard");
			}
		} catch (err) {
			setError("An unexpected error occurred during MFA verification.");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (error) {
				setError(error.message);
			}
		} catch (err) {
			setError("Failed to sign in with Google.");
		} finally {
			setLoading(false);
		}
	};

	if (mfaRequired) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
						<Shield className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
					<CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleMfaVerification} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="mfaCode">Authentication Code</Label>
							<Input id="mfaCode" type="text" placeholder="000000" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} maxLength={6} className="text-center text-lg tracking-widest" required />
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Verifying..." : "Verify Code"}
						</Button>

						<Button type="button" variant="outline" className="w-full" onClick={() => setMfaRequired(false)}>
							Back to Login
						</Button>
					</form>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
					<Lock className="h-6 w-6 text-primary" />
				</div>
				<CardTitle className="text-2xl">Sign In</CardTitle>
				<CardDescription>
					Access your InvestigatAI dashboard
					<br />
					<span className="text-xs text-muted-foreground mt-1 block">Dev Login: bcw1995@gmail.com</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleLogin} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing In..." : "Sign In"}
					</Button>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
						</div>
					</div>

					<Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
						Sign in with Google
					</Button>

					<div className="text-center text-sm">
						<span className="text-muted-foreground">Don't have an account? </span>
						<a href="/auth/register" className="text-primary hover:underline">
							Sign up
						</a>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
