"use client";

import React, { useState, useEffect } from "react";
import { Upload, CheckCircle, AlertCircle, Clock, RotateCw, Pause, Play, X, Eye, Download, RefreshCw, Trash2, Filter, Search, ChevronDown, TrendingUp, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn, formatFileSize } from "@/lib/utils";
import { UploadFile, UploadStats } from "./hooks/use-enhanced-upload";

interface UploadProgressDashboardProps {
	files: UploadFile[];
	stats: UploadStats;
	onRetryFile: (fileId: string) => void;
	onCancelFile: (fileId: string) => void;
	onRemoveFile: (fileId: string) => void;
	onPreviewFile: (fileId: string) => void;
	onClearCompleted: () => void;
	className?: string;
}

type FilterStatus = "all" | "pending" | "uploading" | "processing" | "completed" | "failed" | "cancelled";
type SortOption = "name" | "size" | "status" | "progress" | "date";

export function UploadProgressDashboard({ files, stats, onRetryFile, onCancelFile, onRemoveFile, onPreviewFile, onClearCompleted, className }: UploadProgressDashboardProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
	const [sortBy, setSortBy] = useState<SortOption>("date");
	const [isExpanded, setIsExpanded] = useState(true);

	// Filter and sort files
	const filteredFiles = files
		.filter((file) => {
			const matchesSearch = file.file.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = filterStatus === "all" || file.status === filterStatus;
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.file.name.localeCompare(b.file.name);
				case "size":
					return b.file.size - a.file.size;
				case "status":
					return a.status.localeCompare(b.status);
				case "progress":
					return b.progress - a.progress;
				case "date":
				default:
					return (b.startTime || 0) - (a.startTime || 0);
			}
		});

	// Calculate real-time statistics
	const statusCounts = {
		pending: files.filter((f) => f.status === "pending").length,
		uploading: files.filter((f) => f.status === "uploading").length,
		processing: files.filter((f) => f.status === "processing").length,
		completed: files.filter((f) => f.status === "completed").length,
		failed: files.filter((f) => f.status === "failed").length,
		cancelled: files.filter((f) => f.status === "cancelled").length,
	};

	const overallProgress = stats.totalFiles > 0 ? (stats.completedFiles / stats.totalFiles) * 100 : 0;

	const averageSpeed = stats.averageSpeed || 0;
	const eta = stats.estimatedTimeRemaining || 0;

	if (files.length === 0) {
		return null;
	}

	return (
		<div className={cn("space-y-4", className)}>
			{/* Statistics Overview */}
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Activity className="h-5 w-5" />
							Upload Progress
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant={stats.isUploading ? "default" : "secondary"}>{stats.isUploading ? "Active" : "Idle"}</Badge>
							<Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
								<ChevronDown className={cn("h-4 w-4 transition-transform", !isExpanded && "rotate-180")} />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{/* Overall Progress */}
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span>Overall Progress</span>
								<span>{Math.round(overallProgress)}%</span>
							</div>
							<Progress value={overallProgress} className="h-2" />
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									{stats.completedFiles} of {stats.totalFiles} files completed
								</span>
								{eta > 0 && <span>~{Math.ceil(eta / 60)}min remaining</span>}
							</div>
						</div>

						{/* Statistics Grid */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<StatCard label="Total Files" value={stats.totalFiles} icon={Upload} color="blue" />
							<StatCard label="Completed" value={stats.completedFiles} icon={CheckCircle} color="green" />
							<StatCard label="Failed" value={stats.failedFiles} icon={AlertCircle} color="red" />
							<StatCard label="Total Size" value={formatFileSize(stats.totalSize)} icon={TrendingUp} color="purple" />
						</div>

						{/* Speed and ETA */}
						{stats.isUploading && (
							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									<Zap className="h-4 w-4" />
									<span>Speed: {formatFileSize(averageSpeed)}/s</span>
								</div>
								{eta > 0 && (
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4" />
										<span>ETA: {formatTime(eta)}</span>
									</div>
								)}
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Files List */}
			{isExpanded && (
				<Card>
					<CardHeader className="pb-4">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold">File Queue</h3>
								<div className="flex items-center gap-2">
									{statusCounts.completed > 0 && (
										<Button variant="outline" size="sm" onClick={onClearCompleted} className="h-8">
											<Trash2 className="h-3 w-3 mr-1" />
											Clear Completed
										</Button>
									)}
								</div>
							</div>

							{/* Filters and Search */}
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="flex-1">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
									</div>
								</div>

								<Select value={filterStatus} onValueChange={(value: FilterStatus) => setFilterStatus(value)}>
									<SelectTrigger className="w-40 h-9">
										<Filter className="h-4 w-4 mr-2" />
										<SelectValue placeholder="Filter by status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Files</SelectItem>
										<SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
										<SelectItem value="uploading">Uploading ({statusCounts.uploading})</SelectItem>
										<SelectItem value="processing">Processing ({statusCounts.processing})</SelectItem>
										<SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
										<SelectItem value="failed">Failed ({statusCounts.failed})</SelectItem>
										{statusCounts.cancelled > 0 && <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>}
									</SelectContent>
								</Select>

								<Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
									<SelectTrigger className="w-32 h-9">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="date">Date</SelectItem>
										<SelectItem value="name">Name</SelectItem>
										<SelectItem value="size">Size</SelectItem>
										<SelectItem value="status">Status</SelectItem>
										<SelectItem value="progress">Progress</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{filteredFiles.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
									<p>No files match your filters</p>
								</div>
							) : (
								filteredFiles.map((file) => <FileProgressItem key={file.id} file={file} onRetry={() => onRetryFile(file.id)} onCancel={() => onCancelFile(file.id)} onRemove={() => onRemoveFile(file.id)} onPreview={() => onPreviewFile(file.id)} />)
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Individual File Progress Item
function FileProgressItem({ file, onRetry, onCancel, onRemove, onPreview }: { file: UploadFile; onRetry: () => void; onCancel: () => void; onRemove: () => void; onPreview: () => void }) {
	const getStatusIcon = () => {
		switch (file.status) {
			case "pending":
				return <Clock className="h-4 w-4 text-muted-foreground" />;
			case "uploading":
				return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
			case "processing":
				return <RotateCw className="h-4 w-4 text-primary animate-spin" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "failed":
				return <AlertCircle className="h-4 w-4 text-destructive" />;
			case "cancelled":
				return <X className="h-4 w-4 text-muted-foreground" />;
			default:
				return <Clock className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const getStatusBadge = () => {
		const configs = {
			pending: { variant: "secondary" as const, label: "Pending" },
			uploading: { variant: "default" as const, label: "Uploading" },
			processing: { variant: "default" as const, label: "Processing" },
			completed: { variant: "secondary" as const, label: "Completed" },
			failed: { variant: "destructive" as const, label: "Failed" },
			cancelled: { variant: "outline" as const, label: "Cancelled" },
		};

		const config = configs[file.status];
		return (
			<Badge variant={config.variant} className="text-xs">
				{config.label}
			</Badge>
		);
	};

	const canRetry = file.status === "failed" || file.status === "cancelled";
	const canCancel = file.status === "uploading" || file.status === "pending";
	const canPreview = file.status === "completed";
	const canRemove = file.status !== "uploading" && file.status !== "processing";

	const elapsedTime = file.startTime ? Date.now() - file.startTime : 0;
	const uploadSpeed = file.uploadedSize && elapsedTime > 0 ? file.uploadedSize / (elapsedTime / 1000) : 0;

	return (
		<div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
			{/* Status Icon */}
			<div className="flex-shrink-0">{getStatusIcon()}</div>

			{/* File Info */}
			<div className="flex-1 min-w-0 space-y-1">
				<div className="flex items-center gap-2">
					<p className="font-medium truncate">{file.file.name}</p>
					{getStatusBadge()}
				</div>

				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					<span>{formatFileSize(file.file.size)}</span>
					<span>{file.file.type}</span>
					{uploadSpeed > 0 && <span>{formatFileSize(uploadSpeed)}/s</span>}
					{file.estimatedTimeRemaining && file.estimatedTimeRemaining > 0 && <span>~{Math.ceil(file.estimatedTimeRemaining)}s remaining</span>}
				</div>

				{/* Progress Bar */}
				{(file.status === "uploading" || file.status === "processing") && (
					<div className="space-y-1">
						<Progress value={file.progress} className="h-1" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>
								{file.status === "uploading" ? "Uploading..." : "Processing..."}
								{file.processingJobId && ` (Job: ${file.processingJobId.slice(-8)})`}
							</span>
							<span>{file.progress}%</span>
						</div>
					</div>
				)}

				{/* Error Message */}
				{file.error && <p className="text-xs text-destructive">{file.error}</p>}

				{/* Upload Details */}
				{file.uploadedSize > 0 && (
					<div className="text-xs text-muted-foreground">
						{formatFileSize(file.uploadedSize)} of {formatFileSize(file.file.size)} uploaded
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center gap-1">
				{canPreview && (
					<Button variant="ghost" size="sm" onClick={onPreview} className="h-8 w-8 p-0" title="Preview file">
						<Eye className="h-4 w-4" />
					</Button>
				)}

				{canRetry && (
					<Button variant="ghost" size="sm" onClick={onRetry} className="h-8 w-8 p-0" title="Retry upload">
						<RefreshCw className="h-4 w-4" />
					</Button>
				)}

				{canCancel && (
					<Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground" title="Cancel upload">
						<Pause className="h-4 w-4" />
					</Button>
				)}

				{canRemove && (
					<Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground" title="Remove from queue">
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}

// Statistics Card Component
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: "blue" | "green" | "red" | "purple" }) {
	const colorClasses = {
		blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
		green: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
		red: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
		purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
	};

	return (
		<div className="text-center">
			<div className={cn("inline-flex items-center justify-center w-8 h-8 rounded-full mb-2", colorClasses[color])}>
				<Icon className="h-4 w-4" />
			</div>
			<p className="text-lg font-bold">{value}</p>
			<p className="text-xs text-muted-foreground">{label}</p>
		</div>
	);
}

// Utility function to format time
function formatTime(seconds: number): string {
	if (seconds < 60) {
		return `${Math.ceil(seconds)}s`;
	} else if (seconds < 3600) {
		return `${Math.ceil(seconds / 60)}m`;
	} else {
		return `${Math.ceil(seconds / 3600)}h`;
	}
}
