import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
	title: "Sign In | InvestigatAI",
	description: "Sign in to your InvestigatAI account to access your investigations",
};

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">InvestigatAI</h1>
					<p className="text-muted-foreground">AI-Powered Digital Investigation Platform</p>
				</div>
				<LoginForm />
			</div>
		</div>
	);
}
