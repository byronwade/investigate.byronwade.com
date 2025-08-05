import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-sm px-3",
			lg: "h-11 rounded-sm px-8",
			icon: "h-10 w-10",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : "button";
	return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

// Touch-friendly button component for mobile
export interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "destructive";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	children: React.ReactNode;
}

export function TouchButton({ variant = "primary", size = "md", fullWidth = false, className, children, ...props }: TouchButtonProps) {
	const baseStyles = cn(
		"inline-flex items-center justify-center rounded-sm font-medium transition-all",
		"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
		"active:scale-95 touch-manipulation", // Touch improvements
		"disabled:opacity-50 disabled:pointer-events-none",
		fullWidth && "w-full"
	);

	const variants = {
		primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
		secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
		ghost: "hover:bg-muted/50 text-foreground",
		destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
	};

	const sizes = {
		sm: "h-9 px-3 text-sm min-h-[44px] min-w-[44px]", // Minimum touch target
		md: "h-11 px-4 text-sm min-h-[44px] min-w-[44px]",
		lg: "h-12 px-6 text-base min-h-[44px] min-w-[44px]",
	};

	return (
		<button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
			{children}
		</button>
	);
}

export { Button, buttonVariants };
