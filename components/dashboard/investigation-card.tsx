"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Clock, Users, Activity, MoreHorizontal, ExternalLink, Folder, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

interface Investigation {
	id: string;
	name: string;
	description: string;
	status: "draft" | "active" | "processing" | "completed" | "archived";
	created_at: string;
	updated_at: string;
	file_count: number;
	processing_files: number;
	completed_files: number;
	total_size: number;
	processing_time: string;
	creator: {
		name: string;
		email: string;
	};
}

interface InvestigationCardProps {
	investigation: Investigation;
	onClick: () => void;
	className?: string;
}

export function InvestigationCard({ investigation, onClick, className }: InvestigationCardProps) {
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	};

	const getStatusIcon = (status: string) => {
		const icons = {
			processing: <Activity className="h-4 w-4 text-orange-600 animate-pulse" />,
			active: <GitBranch className="h-4 w-4 text-blue-600" />,
			completed: <FileText className="h-4 w-4 text-green-600" />,
			draft: <Folder className="h-4 w-4 text-gray-600" />,
			archived: <Upload className="h-4 w-4 text-gray-400" />,
		};
		return icons[status as keyof typeof icons] || icons.draft;
	};

	const getStatusColor = (status: string) => {
		const colors = {
			processing: "text-orange-600",
			active: "text-blue-600",
			completed: "text-green-600",
			draft: "text-gray-600",
			archived: "text-gray-400",
		};
		return colors[status as keyof typeof colors] || colors.draft;
	};

	return (
		<li className="relative flex flex-col gap-3 p-4 leading-5 border border-border rounded-sm bg-card hover:border-gray-500 transition-colors cursor-pointer group">
			{/* Invisible click area */}
			<button className="absolute inset-0 z-0" onClick={onClick} aria-label={`Open ${investigation.name}`} />

			{/* Header section */}
			<div className="flex flex-row items-center gap-4">
				{/* Investigation avatar/icon */}
				<div className="relative inline-flex h-8 w-8 flex-shrink-0">
					<span className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted" role="img" aria-label={investigation.name}>
						{getStatusIcon(investigation.status)}
					</span>
				</div>

				{/* Investigation name and external link */}
				<div className="flex min-w-0 flex-1 flex-col justify-between gap-0.5">
					<button className="min-w-0 text-left no-underline hover:underline font-medium text-foreground h-5 truncate w-fit max-w-full z-10" onClick={onClick}>
						{investigation.name}
					</button>
					<button className="min-w-0 text-left no-underline hover:underline text-muted-foreground h-5 truncate w-fit leading-5 max-w-full flex items-center gap-1 z-10" onClick={onClick}>
						Investigation #{investigation.id}
						<ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
					</button>
				</div>

				{/* Status indicator with progress */}
				{investigation.status === "processing" ? (
					<div className="relative z-10">
						<div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-200" role="progressbar" aria-valuenow={Math.round((investigation.completed_files / investigation.file_count) * 100)} aria-valuemin={0} aria-valuemax={100}>
							<Activity className="h-4 w-4 text-orange-600 animate-pulse" />
						</div>
					</div>
				) : (
					<div className="relative z-10">
						<div className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-border", getStatusColor(investigation.status))}>{getStatusIcon(investigation.status)}</div>
					</div>
				)}

				{/* Menu button */}
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						// Handle menu action
					}}
				>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</div>

			{/* Status badge */}
			<div className="flex h-5 w-fit items-center">
				<Badge variant="secondary" className="flex min-w-0 flex-none flex-row items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium w-fit max-w-48">
					<div className={cn("w-2 h-2 rounded-full", investigation.status === "processing" ? "bg-orange-500" : investigation.status === "active" ? "bg-blue-500" : investigation.status === "completed" ? "bg-green-500" : investigation.status === "draft" ? "bg-gray-400" : "bg-gray-300")} />
					<span className="truncate capitalize">{investigation.status}</span>
				</Badge>
			</div>

			{/* Progress bar for processing */}
			{investigation.status === "processing" && investigation.file_count > 0 && (
				<div className="space-y-1">
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>Processing files</span>
						<span>
							{investigation.completed_files}/{investigation.file_count}
						</span>
					</div>
					<Progress value={(investigation.completed_files / investigation.file_count) * 100} className="h-1" />
				</div>
			)}

			{/* Bottom metadata */}
			<div className="flex min-w-0 flex-col justify-between gap-0.5">
				<p className="min-w-0 no-underline hover:underline text-foreground font-medium truncate h-5 text-sm">{investigation.description}</p>
				<div className="flex h-5 flex-row items-center gap-1 text-xs text-muted-foreground">
					<span className="flex-none">{getTimeAgo(investigation.updated_at)} by</span>
					<Users className="h-3 w-3 flex-none" />
					<span className="min-w-0 truncate">{investigation.creator.name}</span>

					<span className="mx-1">•</span>

					<FileText className="h-3 w-3 flex-none" />
					<span className="flex-none">{investigation.file_count} files</span>

					<span className="mx-1">•</span>

					<Upload className="h-3 w-3 flex-none" />
					<span className="flex-none">{formatFileSize(investigation.total_size)}</span>
				</div>
			</div>
		</li>
	);
}
