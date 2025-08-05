"use client";

import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
	children: React.ReactNode;
	className?: string;
	cols?: {
		default?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
		"2xl"?: number;
	};
	gap?: number;
}

export function ResponsiveGrid({ children, className, cols = { default: 1, md: 2, lg: 3 }, gap = 6 }: ResponsiveGridProps) {
	const gridCols = cn(
		// Default
		cols.default === 1 && "grid-cols-1",
		cols.default === 2 && "grid-cols-2",
		cols.default === 3 && "grid-cols-3",
		cols.default === 4 && "grid-cols-4",

		// Medium screens
		cols.md === 1 && "md:grid-cols-1",
		cols.md === 2 && "md:grid-cols-2",
		cols.md === 3 && "md:grid-cols-3",
		cols.md === 4 && "md:grid-cols-4",

		// Large screens
		cols.lg === 1 && "lg:grid-cols-1",
		cols.lg === 2 && "lg:grid-cols-2",
		cols.lg === 3 && "lg:grid-cols-3",
		cols.lg === 4 && "lg:grid-cols-4",
		cols.lg === 5 && "lg:grid-cols-5",
		cols.lg === 6 && "lg:grid-cols-6"
	);

	const gapClass = cn(gap === 4 && "gap-4", gap === 6 && "gap-6", gap === 8 && "gap-8");

	return <div className={cn("grid", gridCols, gapClass, className)}>{children}</div>;
}
