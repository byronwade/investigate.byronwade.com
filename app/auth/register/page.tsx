import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
	title: "Create Account | InvestigatAI",
	description: "Create your InvestigatAI account to start analyzing digital evidence",
};

export default function RegisterPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">InvestigatAI</h1>
					<p className="text-muted-foreground">AI-Powered Digital Investigation Platform</p>
				</div>
				<RegisterForm />
			</div>
		</div>
	);
}
