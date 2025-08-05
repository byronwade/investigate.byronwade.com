import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Search, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

interface HeaderProps {
	className?: string;
	variant?: "home" | "dashboard" | "investigation";
	transparent?: boolean;
	showNavigation?: boolean;
	showUserMenu?: boolean;
	breadcrumbs?: React.ReactNode;
	actions?: React.ReactNode;
	children?: React.ReactNode;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(({ className, variant = "home", transparent = true, showNavigation = true, showUserMenu = true, breadcrumbs, actions, children, ...props }, ref) => {
	const { user } = useAuth();
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

	const baseClasses = cn(
		// Base styling - minimalistic with no background or borders
		"sticky top-0 z-50 w-full",
		// Transparent background with subtle backdrop for readability
		transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60",
		className
	);

	const navClasses = cn(
		"container mx-auto flex h-16 items-center justify-between px-6",
		"max-w-7xl" // Consistent max width with content
	);

	const logoSection = (
		<div className="flex items-center space-x-3">
			<div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
				<Search className="h-5 w-5 text-primary-foreground" />
			</div>
			<Link href="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
				InvestigatAI
			</Link>
			{variant === "dashboard" && <span className="hidden md:inline-flex text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Pro</span>}
		</div>
	);

	const navigationItems = showNavigation && (
		<nav className="hidden md:flex items-center space-x-6">
			{variant === "home" ? (
				<>
					<Link href="/dashboard" className="text-sm text-foreground hover:text-primary transition-colors">
						Dashboard
					</Link>
					<Link href="/techniques" className="text-sm text-foreground hover:text-primary transition-colors">
						Techniques
					</Link>
					<Link href="/forensics" className="text-sm text-foreground hover:text-primary transition-colors">
						Forensics
					</Link>
				</>
			) : variant === "dashboard" ? (
				<>
					<Link href="/dashboard" className="text-sm text-foreground hover:text-primary transition-colors">
						Overview
					</Link>
					<Link href="/dashboard/recent" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
						Recent
					</Link>
					<Link href="/dashboard/analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
						Analytics
					</Link>
					<Link href="/dashboard/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
						Team
					</Link>
					<Link href="/dashboard/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
						Settings
					</Link>
				</>
			) : null}
		</nav>
	);

	const userSection = (
		<div className="flex items-center space-x-4">
			{actions && actions}

			{showUserMenu && (
				<>
					{user ? (
						<div className="hidden md:flex items-center space-x-3">
							<Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90" aria-label="User menu">
								<User className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<Link href="/auth/login">
							<Button size="sm" className="text-sm">
								Get Started
							</Button>
						</Link>
					)}
				</>
			)}

			{/* Mobile menu toggle */}
			<Button variant="ghost" size="icon" className="md:hidden w-8 h-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
				{mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
			</Button>
		</div>
	);

	return (
		<header ref={ref} className={baseClasses} {...props}>
			<div className={navClasses}>
				{/* Breadcrumbs section for dashboard/investigation views */}
				{breadcrumbs ? (
					<>
						<div className="flex items-center space-x-2 min-w-0 flex-1">{breadcrumbs}</div>
						{userSection}
					</>
				) : (
					<>
						{logoSection}
						{navigationItems}
						{userSection}
					</>
				)}
			</div>

			{/* Custom children content */}
			{children}

			{/* Mobile navigation menu */}
			{mobileMenuOpen && showNavigation && (
				<div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-sm">
					<nav className="px-6 py-4 space-y-3">
						{variant === "home" ? (
							<>
								<Link href="/dashboard" className="block text-sm text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Dashboard
								</Link>
								<Link href="/techniques" className="block text-sm text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Techniques
								</Link>
								<Link href="/forensics" className="block text-sm text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Forensics
								</Link>
							</>
						) : variant === "dashboard" ? (
							<>
								<Link href="/dashboard" className="block text-sm text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Overview
								</Link>
								<Link href="/dashboard/recent" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Recent
								</Link>
								<Link href="/dashboard/analytics" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Analytics
								</Link>
								<Link href="/dashboard/team" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Team
								</Link>
								<Link href="/dashboard/settings" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
									Settings
								</Link>
							</>
						) : null}

						{!user && (
							<div className="pt-3 border-t border-border/20">
								<Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
									<Button size="sm" className="w-full">
										Get Started
									</Button>
								</Link>
							</div>
						)}
					</nav>
				</div>
			)}
		</header>
	);
});

Header.displayName = "Header";

export { Header, type HeaderProps };
