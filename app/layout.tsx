import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "InvestigatAI - AI-Powered Digital Investigation Platform",
		template: "%s | InvestigatAI",
	},
	description: "Advanced AI-powered platform for digital evidence analysis, timeline generation, and comprehensive investigation management. Transform your investigations with cutting-edge AI technology.",
	keywords: ["digital investigation", "AI analysis", "evidence processing", "forensic analysis", "timeline generation", "entity recognition", "investigation platform", "law enforcement software", "digital forensics", "evidence analysis", "investigation management", "AI investigation tools"],
	authors: [{ name: "InvestigatAI Team", url: "https://investigatai.com" }],
	creator: "InvestigatAI",
	publisher: "InvestigatAI",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: process.env.NEXT_PUBLIC_APP_URL,
		title: "InvestigatAI - AI-Powered Digital Investigation Platform",
		description: "Transform digital investigations with advanced AI analysis. Process evidence, extract insights, and solve cases faster.",
		siteName: "InvestigatAI",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "InvestigatAI - AI-Powered Digital Investigation Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "InvestigatAI - AI-Powered Digital Investigation Platform",
		description: "Transform digital investigations with advanced AI analysis. Process evidence, extract insights, and solve cases faster.",
		creator: "@investigatai",
		images: ["/twitter-image.png"],
	},
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		shortcut: "/favicon.ico",
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
		other: [
			{
				rel: "mask-icon",
				url: "/safari-pinned-tab.svg",
				color: "#107C10",
			},
		],
	},
	manifest: "/site.webmanifest",
	verification: {
		google: process.env.GOOGLE_VERIFICATION_ID,
	},
	alternates: {
		canonical: process.env.NEXT_PUBLIC_APP_URL,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
					}}
				/>
			</head>
			<body className={cn(inter.className, "min-h-screen bg-background text-foreground antialiased")}>
				<AuthProvider>
					<div className="relative flex min-h-screen flex-col">
						<main className="flex-1">{children}</main>
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
