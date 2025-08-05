"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, User, Shield, Check, X } from "lucide-react";
import { validateEmail, validatePassword } from "@/lib/supabase/auth-shared";
import { cn } from "@/lib/utils";

export function RegisterForm() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const router = useRouter();
	const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

	const passwordValidation = validatePassword(formData.password);
	const emailValid = validateEmail(formData.email);
	const passwordsMatch = formData.password === formData.confirmPassword;

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError(null);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		// Validate form
		if (!formData.firstName.trim()) {
			setError("First name is required");
			setLoading(false);
			return;
		}

		if (!formData.lastName.trim()) {
			setError("Last name is required");
			setLoading(false);
			return;
		}

		if (!emailValid) {
			setError("Please enter a valid email address");
			setLoading(false);
			return;
		}

		if (!passwordValidation.isValid) {
			setError(passwordValidation.errors[0]);
			setLoading(false);
			return;
		}

		if (!passwordsMatch) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const { data, error } = await supabase.auth.signUp({
				email: formData.email,
				password: formData.password,
				options: {
					data: {
						first_name: formData.firstName,
						last_name: formData.lastName,
						full_name: `${formData.firstName} ${formData.lastName}`,
					},
				},
			});

			if (error) {
				setError(error.message);
			} else if (data.user) {
				// Create user profile
				const { error: profileError } = await supabase.from("user_profiles").insert({
					id: data.user.id,
					email: data.user.email,
					first_name: formData.firstName,
					last_name: formData.lastName,
					role: "investigator",
					created_at: new Date().toISOString(),
				});

				if (profileError) {
					console.error("Error creating user profile:", profileError);
				}

				// Log audit event
				await fetch("/api/audit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "user_register",
						details: {
							userId: data.user.id,
							email: data.user.email,
							name: `${formData.firstName} ${formData.lastName}`,
						},
					}),
				});

				setSuccess(true);
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
						<Check className="h-6 w-6 text-green-600" />
					</div>
					<CardTitle className="text-2xl">Account Created!</CardTitle>
					<CardDescription>Please check your email to verify your account before signing in.</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => router.push("/auth/login")} className="w-full">
						Go to Sign In
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
					<User className="h-6 w-6 text-primary" />
				</div>
				<CardTitle className="text-2xl">Create Account</CardTitle>
				<CardDescription>Join InvestigatAI to start analyzing evidence</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleRegister} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input id="firstName" type="text" placeholder="John" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input id="lastName" type="text" placeholder="Doe" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={cn("pl-10", formData.email && (emailValid ? "border-green-500" : "border-red-500"))} required />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="pl-10 pr-10" required />
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>

						{/* Password strength indicator */}
						{formData.password && (
							<div className="space-y-2 text-xs">
								<div className="flex flex-wrap gap-1">
									{passwordValidation.errors.map((error, index) => (
										<div key={index} className="flex items-center gap-1 text-red-500">
											<X className="h-3 w-3" />
											<span>{error}</span>
										</div>
									))}
									{passwordValidation.isValid && (
										<div className="flex items-center gap-1 text-green-500">
											<Check className="h-3 w-3" />
											<span>Password meets requirements</span>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<div className="relative">
							<Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} className={cn("pl-10 pr-10", formData.confirmPassword && (passwordsMatch ? "border-green-500" : "border-red-500"))} required />
							<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
								{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
						{formData.confirmPassword && !passwordsMatch && (
							<div className="flex items-center gap-1 text-xs text-red-500">
								<X className="h-3 w-3" />
								<span>Passwords do not match</span>
							</div>
						)}
					</div>

					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Button type="submit" className="w-full" disabled={loading || !passwordValidation.isValid || !passwordsMatch || !emailValid}>
						{loading ? "Creating Account..." : "Create Account"}
					</Button>

					<div className="text-center text-sm">
						<span className="text-muted-foreground">Already have an account? </span>
						<a href="/auth/login" className="text-primary hover:underline">
							Sign in
						</a>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
