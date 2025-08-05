"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle, X, Plus, File, Image, Video, Music, FileImage, Clock, Zap, Settings, Eye, Trash2, RotateCw, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn, formatFileSize, getFileIcon, isValidFileType } from "@/lib/utils";
import { UploadProgress } from "@/types/investigation";

interface EnhancedFileUploadZoneProps {
	onFilesSelected: (files: File[]) => void;
	maxFileSize?: number;
	maxTotalSize?: number;
	acceptedFileTypes?: string[];
	multiple?: boolean;
	disabled?: boolean;
	uploadProgress?: UploadProgress[];
	className?: string;
	investigationId?: string;
	priority?: "low" | "medium" | "high" | "critical";
	enableEnhancedProcessing?: boolean;
	onUploadStart?: (files: File[]) => void;
	onUploadComplete?: (results: any[]) => void;
	onUploadError?: (error: string) => void;
}

interface FilePreview {
	file: File;
	id: string;
	preview?: string;
	status: "pending" | "uploading" | "processing" | "completed" | "failed";
	progress: number;
	error?: string;
	estimatedTime?: number;
}

const DEFAULT_ACCEPTED_TYPES = ["image/*", "video/*", "audio/*", "application/pdf", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

const PRIORITY_CONFIG = {
	low: { label: "Low Priority", color: "bg-gray-500", icon: Clock },
	medium: { label: "Medium Priority", color: "bg-blue-500", icon: Upload },
	high: { label: "High Priority", color: "bg-orange-500", icon: Zap },
	critical: { label: "Critical Priority", color: "bg-red-500", icon: AlertCircle },
};

export function EnhancedFileUploadZone({
	onFilesSelected,
	maxFileSize = 100 * 1024 * 1024, // 100MB default
	maxTotalSize = 1000 * 1024 * 1024 * 1024, // 1TB default
	acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
	multiple = true,
	disabled = false,
	uploadProgress = [],
	className,
	investigationId,
	priority = "medium",
	enableEnhancedProcessing = true,
	onUploadStart,
	onUploadComplete,
	onUploadError,
}: EnhancedFileUploadZoneProps) {
	const [errors, setErrors] = useState<string[]>([]);
	const [dragActive, setDragActive] = useState(false);
	const [fileQueue, setFileQueue] = useState<FilePreview[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStats, setUploadStats] = useState({
		totalFiles: 0,
		completedFiles: 0,
		totalSize: 0,
		uploadedSize: 0,
		estimatedTimeRemaining: 0,
	});
	const fileInputRef = useRef<HTMLInputElement>(null);

	const priorityConfig = PRIORITY_CONFIG[priority];

	const validateFiles = useCallback(
		(files: File[]): { valid: File[]; errors: string[] } => {
			const validFiles: File[] = [];
			const newErrors: string[] = [];
			let totalSize = 0;

			files.forEach((file) => {
				// Check file size
				if (file.size > maxFileSize) {
					newErrors.push(`${file.name}: File too large (max ${formatFileSize(maxFileSize)})`);
					return;
				}

				// Check file type
				if (!isValidFileType(file, acceptedFileTypes)) {
					newErrors.push(`${file.name}: File type not supported`);
					return;
				}

				// Check for duplicates in queue
				const isDuplicate = fileQueue.some((queuedFile) => queuedFile.file.name === file.name && queuedFile.file.size === file.size);
				if (isDuplicate) {
					newErrors.push(`${file.name}: File already in queue`);
					return;
				}

				totalSize += file.size;
				validFiles.push(file);
			});

			// Check total size
			const currentQueueSize = fileQueue.reduce((sum, f) => sum + f.file.size, 0);
			if (totalSize + currentQueueSize > maxTotalSize) {
				newErrors.push(`Total size would exceed limit (max ${formatFileSize(maxTotalSize)})`);
				return { valid: [], errors: newErrors };
			}

			return { valid: validFiles, errors: newErrors };
		},
		[maxFileSize, maxTotalSize, acceptedFileTypes, fileQueue]
	);

	const createFilePreview = async (file: File): Promise<FilePreview> => {
		const id = `${file.name}-${Date.now()}-${Math.random()}`;
		let preview: string | undefined;

		// Generate preview for images
		if (file.type.startsWith("image/")) {
			try {
				preview = URL.createObjectURL(file);
			} catch (error) {
				console.warn("Failed to create image preview:", error);
			}
		}

		return {
			file,
			id,
			preview,
			status: "pending",
			progress: 0,
		};
	};

	const addFilesToQueue = useCallback(async (files: File[]) => {
		const filePreviews = await Promise.all(files.map(createFilePreview));
		setFileQueue((prev) => [...prev, ...filePreviews]);

		// Update stats
		setUploadStats((prev) => ({
			...prev,
			totalFiles: prev.totalFiles + files.length,
			totalSize: prev.totalSize + files.reduce((sum, f) => sum + f.size, 0),
		}));
	}, []);

	const onDrop = useCallback(
		async (acceptedFiles: File[]) => {
			setDragActive(false);
			const { valid, errors } = validateFiles(acceptedFiles);

			setErrors(errors);

			if (valid.length > 0) {
				await addFilesToQueue(valid);
				onFilesSelected(valid);
			}
		},
		[validateFiles, addFilesToQueue, onFilesSelected]
	);

	const removeFromQueue = useCallback((fileId: string) => {
		setFileQueue((prev) => {
			const fileToRemove = prev.find((f) => f.id === fileId);
			if (fileToRemove?.preview) {
				URL.revokeObjectURL(fileToRemove.preview);
			}
			const newQueue = prev.filter((f) => f.id !== fileId);

			// Update stats
			if (fileToRemove) {
				setUploadStats((current) => ({
					...current,
					totalFiles: current.totalFiles - 1,
					totalSize: current.totalSize - fileToRemove.file.size,
				}));
			}

			return newQueue;
		});
	}, []);

	const clearQueue = useCallback(() => {
		// Cleanup object URLs
		fileQueue.forEach((file) => {
			if (file.preview) {
				URL.revokeObjectURL(file.preview);
			}
		});
		setFileQueue([]);
		setUploadStats({
			totalFiles: 0,
			completedFiles: 0,
			totalSize: 0,
			uploadedSize: 0,
			estimatedTimeRemaining: 0,
		});
	}, [fileQueue]);

	const startUpload = useCallback(async () => {
		if (fileQueue.length === 0 || !investigationId) return;

		setIsUploading(true);
		onUploadStart?.(fileQueue.map((f) => f.file));

		try {
			// Simulate upload progress for demo - replace with actual upload logic
			for (const filePreview of fileQueue) {
				setFileQueue((prev) => prev.map((f) => (f.id === filePreview.id ? { ...f, status: "uploading" as const } : f)));

				// Simulate progress
				for (let progress = 0; progress <= 100; progress += 10) {
					await new Promise((resolve) => setTimeout(resolve, 200));
					setFileQueue((prev) => prev.map((f) => (f.id === filePreview.id ? { ...f, progress } : f)));
				}

				// Mark as processing
				setFileQueue((prev) => prev.map((f) => (f.id === filePreview.id ? { ...f, status: "processing" as const } : f)));

				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Mark as completed
				setFileQueue((prev) => prev.map((f) => (f.id === filePreview.id ? { ...f, status: "completed" as const, progress: 100 } : f)));

				setUploadStats((prev) => ({
					...prev,
					completedFiles: prev.completedFiles + 1,
					uploadedSize: prev.uploadedSize + filePreview.file.size,
				}));
			}

			onUploadComplete?.(
				fileQueue.map((f) => ({
					fileId: f.id,
					fileName: f.file.name,
					status: "completed",
				}))
			);
		} catch (error) {
			onUploadError?.(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setIsUploading(false);
		}
	}, [fileQueue, investigationId, onUploadStart, onUploadComplete, onUploadError]);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDragEnter: () => setDragActive(true),
		onDragLeave: () => setDragActive(false),
		multiple,
		disabled: disabled || isUploading,
		accept: acceptedFileTypes.reduce((acc, type) => {
			acc[type] = [];
			return acc;
		}, {} as Record<string, string[]>),
	});

	const getFileTypeIcon = (mimeType: string) => {
		if (mimeType.startsWith("image/")) return FileImage;
		if (mimeType.startsWith("video/")) return Video;
		if (mimeType.startsWith("audio/")) return Music;
		return FileText;
	};

	const overallProgress = uploadStats.totalFiles > 0 ? (uploadStats.completedFiles / uploadStats.totalFiles) * 100 : 0;

	return (
		<div className={cn("w-full space-y-6", className)}>
			{/* Main Upload Zone */}
			<Card className={cn("transition-all duration-300 overflow-hidden", dragActive && "ring-2 ring-primary ring-offset-2 scale-[1.02]", isUploading && "opacity-75")}>
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Upload className="h-5 w-5" />
							Evidence Upload
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className={cn("text-xs", priorityConfig.color)}>
								<priorityConfig.icon className="h-3 w-3 mr-1" />
								{priorityConfig.label}
							</Badge>
							{enableEnhancedProcessing && (
								<Badge variant="outline" className="text-xs">
									<Settings className="h-3 w-3 mr-1" />
									Enhanced AI
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent>
					<div
						{...getRootProps()}
						className={cn("relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer group", "hover:border-primary hover:bg-primary/5", {
							"border-primary bg-primary/10": isDragActive || dragActive,
							"border-muted-foreground/25": !isDragActive && !dragActive,
							"opacity-50 cursor-not-allowed": disabled || isUploading,
						})}
					>
						<input {...getInputProps()} ref={fileInputRef} />

						<div className="flex flex-col items-center space-y-4">
							<div className={cn("p-6 rounded-full transition-all duration-300", isDragActive || dragActive ? "bg-primary text-primary-foreground scale-110" : "bg-muted group-hover:bg-primary/10")}>
								<Upload className={cn("h-10 w-10 transition-transform duration-300", isDragActive && "scale-110")} />
							</div>

							<div className="space-y-2">
								<h3 className="text-xl font-semibold">{isDragActive || dragActive ? "Drop files here" : "Upload Evidence Files"}</h3>
								<p className="text-muted-foreground">Drag and drop files here, or click to browse</p>
								<p className="text-xs text-muted-foreground">Supports images, videos, audio, documents • Max {formatFileSize(maxFileSize)} per file</p>
							</div>

							{!disabled && !isUploading && (
								<div className="flex gap-2">
									<Button variant="outline" size="sm">
										<Plus className="w-4 h-4 mr-2" />
										Choose Files
									</Button>
									{fileQueue.length > 0 && (
										<Button
											onClick={(e) => {
												e.stopPropagation();
												startUpload();
											}}
											className="bg-primary hover:bg-primary/90"
											size="sm"
										>
											<Upload className="w-4 h-4 mr-2" />
											Upload {fileQueue.length} Files
										</Button>
									)}
								</div>
							)}
						</div>

						{/* Upload Progress Overlay */}
						{isUploading && (
							<div className="absolute inset-0 bg-background/95 flex items-center justify-center rounded-lg">
								<div className="text-center space-y-4 max-w-sm">
									<div className="relative">
										<div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
										<div className="absolute inset-0 flex items-center justify-center">
											<span className="text-lg font-bold">{Math.round(overallProgress)}%</span>
										</div>
									</div>
									<div className="space-y-2">
										<h4 className="font-semibold">Processing Files</h4>
										<p className="text-sm text-muted-foreground">
											{uploadStats.completedFiles} of {uploadStats.totalFiles} files completed
										</p>
										<Progress value={overallProgress} className="w-full" />
									</div>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* File Queue */}
			{fileQueue.length > 0 && (
				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Upload Queue</CardTitle>
							<div className="flex items-center gap-2">
								<Badge variant="secondary">
									{fileQueue.length} files • {formatFileSize(uploadStats.totalSize)}
								</Badge>
								{!isUploading && (
									<Button variant="outline" size="sm" onClick={clearQueue} className="h-8">
										<Trash2 className="h-3 w-3 mr-1" />
										Clear
									</Button>
								)}
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<div className="space-y-3 max-h-80 overflow-y-auto">
							{fileQueue.map((filePreview) => {
								const FileIcon = getFileTypeIcon(filePreview.file.type);

								return (
									<div key={filePreview.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
										{/* File Preview/Icon */}
										<div className="flex-shrink-0">
											{filePreview.preview ? (
												<img src={filePreview.preview} alt={filePreview.file.name} className="h-12 w-12 rounded object-cover" />
											) : (
												<div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
													<FileIcon className="h-6 w-6 text-muted-foreground" />
												</div>
											)}
										</div>

										{/* File Info */}
										<div className="flex-1 min-w-0 space-y-1">
											<div className="flex items-center gap-2">
												<p className="font-medium truncate">{filePreview.file.name}</p>
												<StatusBadge status={filePreview.status} />
											</div>

											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span>{formatFileSize(filePreview.file.size)}</span>
												<span>{filePreview.file.type}</span>
											</div>

											{/* Progress Bar */}
											{(filePreview.status === "uploading" || filePreview.status === "processing") && (
												<div className="space-y-1">
													<Progress value={filePreview.progress} className="h-1" />
													<div className="flex justify-between text-xs text-muted-foreground">
														<span>{filePreview.status === "uploading" ? "Uploading..." : "Processing..."}</span>
														<span>{filePreview.progress}%</span>
													</div>
												</div>
											)}

											{filePreview.error && <p className="text-xs text-destructive">{filePreview.error}</p>}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-1">
											{filePreview.status === "completed" && (
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
													<Eye className="h-4 w-4" />
												</Button>
											)}

											{filePreview.status === "pending" && !isUploading && (
												<Button variant="ghost" size="sm" onClick={() => removeFromQueue(filePreview.id)} className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground">
													<X className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Error Messages */}
			{errors.length > 0 && (
				<Card className="border-destructive/50 bg-destructive/5">
					<CardContent className="pt-6">
						<div className="flex items-start gap-3">
							<AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
							<div className="space-y-2">
								<h4 className="font-semibold text-destructive">Upload Errors</h4>
								<ul className="text-sm space-y-1">
									{errors.map((error, index) => (
										<li key={index} className="text-destructive/90">
											• {error}
										</li>
									))}
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Upload Statistics */}
			{uploadStats.totalFiles > 0 && (
				<Card>
					<CardContent className="pt-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div>
								<p className="text-2xl font-bold">{uploadStats.totalFiles}</p>
								<p className="text-xs text-muted-foreground">Total Files</p>
							</div>
							<div>
								<p className="text-2xl font-bold">{uploadStats.completedFiles}</p>
								<p className="text-xs text-muted-foreground">Completed</p>
							</div>
							<div>
								<p className="text-2xl font-bold">{formatFileSize(uploadStats.totalSize)}</p>
								<p className="text-xs text-muted-foreground">Total Size</p>
							</div>
							<div>
								<p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
								<p className="text-xs text-muted-foreground">Progress</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Accepted File Types */}
			<Card className="bg-muted/30">
				<CardContent className="pt-6">
					<details className="cursor-pointer">
						<summary className="text-sm font-medium hover:text-primary transition-colors">Supported file types and requirements</summary>
						<div className="mt-4 space-y-4">
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{acceptedFileTypes.map((type) => (
									<div key={type} className="flex items-center gap-2 text-xs">
										{type === "image/*" && <FileImage className="h-4 w-4" />}
										{type === "video/*" && <Video className="h-4 w-4" />}
										{type === "audio/*" && <Music className="h-4 w-4" />}
										{(type === "application/pdf" || type === "text/*") && <FileText className="h-4 w-4" />}
										<span>{type === "image/*" ? "Images (JPG, PNG, GIF, WebP)" : type === "video/*" ? "Videos (MP4, AVI, MOV, WebM)" : type === "audio/*" ? "Audio (MP3, WAV, M4A, OGG)" : type === "application/pdf" ? "PDF Documents" : type === "text/*" ? "Text Files" : type}</span>
									</div>
								))}
							</div>
							<Separator />
							<div className="text-xs text-muted-foreground space-y-1">
								<p>• Maximum file size: {formatFileSize(maxFileSize)}</p>
								<p>• Maximum total upload: {formatFileSize(maxTotalSize)}</p>
								<p>• All files are scanned for security and processed with AI analysis</p>
								{enableEnhancedProcessing && <p>• Enhanced processing includes OCR, object detection, and metadata extraction</p>}
							</div>
						</div>
					</details>
				</CardContent>
			</Card>
		</div>
	);
}

// Status Badge Component
function StatusBadge({ status }: { status: FilePreview["status"] }) {
	const statusConfig = {
		pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
		uploading: { label: "Uploading", variant: "default" as const, icon: Upload },
		processing: { label: "Processing", variant: "default" as const, icon: RotateCw },
		completed: { label: "Completed", variant: "secondary" as const, icon: CheckCircle },
		failed: { label: "Failed", variant: "destructive" as const, icon: AlertCircle },
	};

	const config = statusConfig[status];
	const Icon = config.icon;

	return (
		<Badge variant={config.variant} className="text-xs">
			<Icon className={cn("h-3 w-3 mr-1", (status === "uploading" || status === "processing") && "animate-spin")} />
			{config.label}
		</Badge>
	);
}
