"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, Settings, Activity, FileText, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { EnhancedFileUploadZone } from "./enhanced-file-upload-zone";
import { UploadProgressDashboard } from "./upload-progress-dashboard";
import { useEnhancedUpload } from "./hooks/use-enhanced-upload";
import { cn } from "@/lib/utils";

interface EnhancedUploadWorkspaceProps {
	investigationId: string;
	priority?: "low" | "medium" | "high" | "critical";
	enableEnhancedProcessing?: boolean;
	maxFileSize?: number;
	maxTotalSize?: number;
	acceptedFileTypes?: string[];
	className?: string;
	onUploadComplete?: (results: any[]) => void;
	onError?: (error: string) => void;
}

export function EnhancedUploadWorkspace({
	investigationId,
	priority = "medium",
	enableEnhancedProcessing = true,
	maxFileSize = 100 * 1024 * 1024, // 100MB
	maxTotalSize = 1000 * 1024 * 1024 * 1024, // 1TB
	acceptedFileTypes,
	className,
	onUploadComplete,
	onError,
}: EnhancedUploadWorkspaceProps) {
	const [activeTab, setActiveTab] = useState("upload");
	const [uploadOptions, setUploadOptions] = useState({
		priority,
		enableEnhancedProcessing,
		analysisTypes: [] as string[],
	});

	const { uploadFiles, stats, addFiles, removeFile, clearCompleted, uploadAll, retryFile, cancelFile, cancelAll, reset } = useEnhancedUpload();

	const handleFilesSelected = useCallback(
		(files: File[]) => {
			addFiles(files);
			// Auto-switch to queue tab when files are added
			if (files.length > 0) {
				setActiveTab("queue");
			}
		},
		[addFiles]
	);

	const handleStartUpload = useCallback(async () => {
		try {
			await uploadAll({
				investigationId,
				priority: uploadOptions.priority,
				enableEnhancedProcessing: uploadOptions.enableEnhancedProcessing,
				analysisTypes: uploadOptions.analysisTypes,
			});

			// Switch to progress tab during upload
			setActiveTab("progress");

			onUploadComplete?.(
				uploadFiles.map((f) => ({
					fileId: f.id,
					fileName: f.file.name,
					status: f.status,
				}))
			);
		} catch (error) {
			onError?.(error instanceof Error ? error.message : "Upload failed");
		}
	}, [uploadAll, investigationId, uploadOptions, uploadFiles, onUploadComplete, onError]);

	const handleRetryFile = useCallback(
		async (fileId: string) => {
			try {
				await retryFile(fileId, {
					investigationId,
					priority: uploadOptions.priority,
					enableEnhancedProcessing: uploadOptions.enableEnhancedProcessing,
					analysisTypes: uploadOptions.analysisTypes,
				});
			} catch (error) {
				onError?.(error instanceof Error ? error.message : "Retry failed");
			}
		},
		[retryFile, investigationId, uploadOptions, onError]
	);

	const handlePreviewFile = useCallback((fileId: string) => {
		// Implementation for file preview
		console.log("Preview file:", fileId);
	}, []);

	const pendingFiles = uploadFiles.filter((f) => f.status === "pending");
	const hasActiveUploads = stats.isUploading;
	const hasCompletedFiles = uploadFiles.some((f) => f.status === "completed");
	const hasFailedFiles = uploadFiles.some((f) => f.status === "failed");

	return (
		<div className={cn("space-y-6", className)}>
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<CardTitle className="flex items-center gap-2">
								<Upload className="h-5 w-5" />
								Evidence Upload Workspace
							</CardTitle>
							<p className="text-sm text-muted-foreground">Upload and process evidence files for investigation {investigationId}</p>
						</div>

						<div className="flex items-center gap-2">
							{hasActiveUploads && (
								<Badge variant="default" className="animate-pulse">
									<Activity className="h-3 w-3 mr-1" />
									Uploading
								</Badge>
							)}

							{hasCompletedFiles && (
								<Badge variant="secondary">
									<CheckCircle2 className="h-3 w-3 mr-1" />
									{stats.completedFiles} Completed
								</Badge>
							)}

							{hasFailedFiles && (
								<Badge variant="destructive">
									<AlertTriangle className="h-3 w-3 mr-1" />
									{stats.failedFiles} Failed
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Main Workspace */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="upload" className="flex items-center gap-2">
						<Upload className="h-4 w-4" />
						Upload
					</TabsTrigger>
					<TabsTrigger value="queue" className="flex items-center gap-2" disabled={uploadFiles.length === 0}>
						<FileText className="h-4 w-4" />
						Queue
						{pendingFiles.length > 0 && (
							<Badge variant="secondary" className="ml-1 text-xs">
								{pendingFiles.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="progress" className="flex items-center gap-2" disabled={uploadFiles.length === 0}>
						<Activity className="h-4 w-4" />
						Progress
					</TabsTrigger>
					<TabsTrigger value="settings" className="flex items-center gap-2">
						<Settings className="h-4 w-4" />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Upload Tab */}
				<TabsContent value="upload" className="space-y-4">
					<EnhancedFileUploadZone onFilesSelected={handleFilesSelected} investigationId={investigationId} priority={uploadOptions.priority} enableEnhancedProcessing={uploadOptions.enableEnhancedProcessing} maxFileSize={maxFileSize} maxTotalSize={maxTotalSize} acceptedFileTypes={acceptedFileTypes} multiple={true} disabled={hasActiveUploads} />

					{/* Quick Actions */}
					{pendingFiles.length > 0 && (
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<p className="font-medium">Ready to Upload</p>
										<p className="text-sm text-muted-foreground">{pendingFiles.length} files queued for processing</p>
									</div>
									<div className="flex items-center gap-2">
										<Button variant="outline" onClick={() => setActiveTab("queue")} size="sm">
											Review Queue
										</Button>
										<Button onClick={handleStartUpload} disabled={hasActiveUploads} size="sm">
											<Upload className="h-4 w-4 mr-2" />
											Start Upload
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Queue Tab */}
				<TabsContent value="queue" className="space-y-4">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Upload Queue</CardTitle>
								<div className="flex items-center gap-2">
									{pendingFiles.length > 0 && !hasActiveUploads && (
										<Button onClick={handleStartUpload} size="sm">
											<Upload className="h-4 w-4 mr-2" />
											Upload All ({pendingFiles.length})
										</Button>
									)}

									{hasActiveUploads && (
										<Button variant="outline" onClick={cancelAll} size="sm">
											Cancel All
										</Button>
									)}

									{uploadFiles.length > 0 && !hasActiveUploads && (
										<Button variant="outline" onClick={reset} size="sm">
											Clear All
										</Button>
									)}
								</div>
							</div>
						</CardHeader>

						<CardContent>
							{uploadFiles.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
									<p>No files in queue</p>
									<p className="text-sm">Add files in the Upload tab to get started</p>
								</div>
							) : (
								<UploadProgressDashboard files={uploadFiles} stats={stats} onRetryFile={handleRetryFile} onCancelFile={cancelFile} onRemoveFile={removeFile} onPreviewFile={handlePreviewFile} onClearCompleted={clearCompleted} />
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Progress Tab */}
				<TabsContent value="progress" className="space-y-4">
					<UploadProgressDashboard files={uploadFiles} stats={stats} onRetryFile={handleRetryFile} onCancelFile={cancelFile} onRemoveFile={removeFile} onPreviewFile={handlePreviewFile} onClearCompleted={clearCompleted} />
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Upload Settings</CardTitle>
							<p className="text-sm text-muted-foreground">Configure upload behavior and processing options</p>
						</CardHeader>

						<CardContent className="space-y-6">
							{/* Priority Setting */}
							<div className="space-y-3">
								<label className="text-sm font-medium">Processing Priority</label>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
									{(["low", "medium", "high", "critical"] as const).map((p) => (
										<Button key={p} variant={uploadOptions.priority === p ? "default" : "outline"} size="sm" onClick={() => setUploadOptions({ ...uploadOptions, priority: p })} className="justify-start">
											{p === "critical" && <Zap className="h-3 w-3 mr-1" />}
											{p.charAt(0).toUpperCase() + p.slice(1)}
										</Button>
									))}
								</div>
								<p className="text-xs text-muted-foreground">Higher priority files are processed first and with more resources</p>
							</div>

							<Separator />

							{/* Enhanced Processing */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div>
										<label className="text-sm font-medium">Enhanced AI Processing</label>
										<p className="text-xs text-muted-foreground">Enable advanced AI analysis including OCR, object detection, and metadata extraction</p>
									</div>
									<Button
										variant={uploadOptions.enableEnhancedProcessing ? "default" : "outline"}
										size="sm"
										onClick={() =>
											setUploadOptions({
												...uploadOptions,
												enableEnhancedProcessing: !uploadOptions.enableEnhancedProcessing,
											})
										}
									>
										{uploadOptions.enableEnhancedProcessing ? "Enabled" : "Disabled"}
									</Button>
								</div>
							</div>

							<Separator />

							{/* Analysis Types */}
							{uploadOptions.enableEnhancedProcessing && (
								<div className="space-y-3">
									<label className="text-sm font-medium">Analysis Types</label>
									<div className="grid grid-cols-2 gap-2">
										{["object_detection", "ocr", "face_recognition", "video_analysis", "audio_transcription", "metadata_extraction"].map((type) => {
											const isSelected = uploadOptions.analysisTypes.includes(type);
											return (
												<Button
													key={type}
													variant={isSelected ? "default" : "outline"}
													size="sm"
													onClick={() => {
														const types = isSelected ? uploadOptions.analysisTypes.filter((t) => t !== type) : [...uploadOptions.analysisTypes, type];
														setUploadOptions({ ...uploadOptions, analysisTypes: types });
													}}
													className="justify-start text-xs"
												>
													{type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
												</Button>
											);
										})}
									</div>
									<p className="text-xs text-muted-foreground">Leave empty to auto-select based on file type</p>
								</div>
							)}

							{/* File Limits */}
							<Separator />
							<div className="space-y-3">
								<label className="text-sm font-medium">File Limits</label>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground">Max file size</p>
										<p className="font-medium">{(maxFileSize / (1024 * 1024)).toFixed(0)} MB</p>
									</div>
									<div>
										<p className="text-muted-foreground">Max total size</p>
										<p className="font-medium">{(maxTotalSize / (1024 * 1024 * 1024)).toFixed(0)} GB</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
