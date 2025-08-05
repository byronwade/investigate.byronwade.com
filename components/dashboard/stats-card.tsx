"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	description?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, trend, className }: StatsCardProps) {
	return (
		<div className={cn("relative flex flex-col gap-3 p-4 leading-5 border border-border rounded-sm bg-card hover:border-gray-500 transition-colors", className)}>
			{/* Header section */}
			<div className="flex flex-row items-center gap-4">
				{/* Icon */}
				<div className="relative inline-flex h-8 w-8 flex-shrink-0">
					<span className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted" role="img" aria-label={title}>
						<Icon className="h-4 w-4 text-muted-foreground" />
					</span>
				</div>

				{/* Title and description */}
				<div className="flex min-w-0 flex-1 flex-col justify-between gap-0.5">
					<span className="text-sm font-medium text-muted-foreground">{title}</span>
					{description && <span className="text-xs text-muted-foreground">{description}</span>}
				</div>

				{/* Trend indicator */}
				{trend && (
					<div className="relative">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-medium", trend.isPositive ? "text-green-600 border-green-200" : "text-red-600 border-red-200")}>{trend.isPositive ? "↗" : "↘"}</div>
					</div>
				)}
			</div>

			{/* Value section */}
			<div className="flex min-w-0 flex-col justify-between gap-1">
				<div className="text-2xl font-bold text-foreground">{value}</div>
				{trend && (
					<div className="flex h-5 flex-row items-center gap-1 text-xs text-muted-foreground">
						<span className={cn("flex-none", trend.isPositive ? "text-green-600" : "text-red-600")}>
							{trend.isPositive ? "+" : ""}
							{trend.value}% from last month
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
