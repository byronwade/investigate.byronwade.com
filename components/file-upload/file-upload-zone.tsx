"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatFileSize, getFileIcon, isValidFileType } from "@/lib/utils";
import { UploadProgress } from "@/types/investigation";

interface FileUploadZoneProps {
	onFilesSelected: (files: File[]) => void;
	maxFileSize?: number;
	maxTotalSize?: number;
	acceptedFileTypes?: string[];
	multiple?: boolean;
	disabled?: boolean;
	uploadProgress?: UploadProgress[];
	className?: string;
}

const DEFAULT_ACCEPTED_TYPES = ["image/*", "video/*", "audio/*", "application/pdf", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

export function FileUploadZone({
	onFilesSelected,
	maxFileSize = 50 * 1024 * 1024, // 50MB default
	maxTotalSize = 1000 * 1024 * 1024 * 1024, // 1TB default
	acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
	multiple = true,
	disabled = false,
	uploadProgress = [],
	className,
}: FileUploadZoneProps) {
	const [errors, setErrors] = useState<string[]>([]);
	const [dragActive, setDragActive] = useState(false);

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

				totalSize += file.size;
				validFiles.push(file);
			});

			// Check total size
			if (totalSize > maxTotalSize) {
				newErrors.push(`Total size exceeds limit (max ${formatFileSize(maxTotalSize)})`);
				return { valid: [], errors: newErrors };
			}

			return { valid: validFiles, errors: newErrors };
		},
		[maxFileSize, maxTotalSize, acceptedFileTypes]
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setDragActive(false);
			const { valid, errors } = validateFiles(acceptedFiles);

			setErrors(errors);

			if (valid.length > 0) {
				onFilesSelected(valid);
			}
		},
		[validateFiles, onFilesSelected]
	);

	const onDragEnter = useCallback(() => {
		setDragActive(true);
	}, []);

	const onDragLeave = useCallback(() => {
		setDragActive(false);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDragEnter,
		onDragLeave,
		multiple,
		disabled,
		accept: acceptedFileTypes.reduce((acc, type) => {
			acc[type] = [];
			return acc;
		}, {} as Record<string, string[]>),
	});

	const isUploading = uploadProgress.some((p) => p.status === "uploading" || p.status === "processing");

	return (
		<div className={cn("w-full", className)}>
			{/* Upload Zone */}
			<div
				{...getRootProps()}
				className={cn("upload-zone relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer", "hover:border-primary hover:bg-primary/5", {
					"border-primary bg-primary/10 scale-[1.02]": isDragActive || dragActive,
					"border-muted-foreground/25": !isDragActive && !dragActive,
					"opacity-50 cursor-not-allowed": disabled,
					"animate-pulse-glow": isUploading,
				})}
			>
				<input {...getInputProps()} />

				<div className="flex flex-col items-center space-y-4">
					<div className={cn("p-4 rounded-full transition-colors", isDragActive || dragActive ? "bg-primary text-primary-foreground" : "bg-muted")}>
						<Upload className="h-8 w-8" />
					</div>

					<div className="space-y-2">
						<h3 className="text-lg font-semibold">{isDragActive || dragActive ? "Drop files here" : "Upload Evidence Files"}</h3>
						<p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
						<p className="text-xs text-muted-foreground">Supports images, videos, audio, documents • Max {formatFileSize(maxFileSize)} per file</p>
					</div>

					{!disabled && (
						<Button variant="outline" size="sm" className="mt-4">
							<FileText className="w-4 h-4 mr-2" />
							Choose Files
						</Button>
					)}
				</div>

				{isUploading && (
					<div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
						<div className="text-center space-y-2">
							<div className="processing-dots text-lg font-medium">Processing</div>
							<p className="text-sm text-muted-foreground">
								{uploadProgress.filter((p) => p.status === "uploading").length} uploading, {uploadProgress.filter((p) => p.status === "processing").length} processing
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Error Messages */}
			{errors.length > 0 && (
				<div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
					<div className="flex items-center space-x-2 mb-2">
						<AlertCircle className="h-4 w-4 text-destructive" />
						<span className="text-sm font-medium text-destructive">Upload Errors</span>
					</div>
					<ul className="text-sm text-destructive space-y-1">
						{errors.map((error, index) => (
							<li key={index}>• {error}</li>
						))}
					</ul>
				</div>
			)}

			{/* Upload Progress */}
			{uploadProgress.length > 0 && (
				<div className="mt-4 space-y-2">
					<h4 className="text-sm font-medium">Upload Progress</h4>
					<div className="space-y-2 max-h-40 overflow-y-auto">
						{uploadProgress.map((progress) => (
							<FileUploadProgress key={progress.fileId} progress={progress} />
						))}
					</div>
				</div>
			)}

			{/* Accepted File Types */}
			<div className="mt-4 text-xs text-muted-foreground">
				<details className="cursor-pointer">
					<summary className="hover:text-foreground">Supported file types</summary>
					<div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
						{acceptedFileTypes.map((type) => (
							<span key={type} className="bg-muted px-2 py-1 rounded">
								{type === "image/*" ? "🖼️ Images" : type === "video/*" ? "🎥 Videos" : type === "audio/*" ? "🎵 Audio" : type === "application/pdf" ? "📄 PDF" : type === "text/*" ? "📝 Text" : type}
							</span>
						))}
					</div>
				</details>
			</div>
		</div>
	);
}

interface FileUploadProgressProps {
	progress: UploadProgress;
}

function FileUploadProgress({ progress }: FileUploadProgressProps) {
	const getStatusIcon = () => {
		switch (progress.status) {
			case "uploading":
				return <Upload className="h-4 w-4 animate-pulse text-blue-500" />;
			case "processing":
				return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "failed":
				return <AlertCircle className="h-4 w-4 text-destructive" />;
			default:
				return <FileText className="h-4 w-4" />;
		}
	};

	return (
		<div className="flex items-center space-x-3 p-2 bg-muted/50 rounded">
			{getStatusIcon()}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{progress.fileName}</p>
				<div className="flex items-center space-x-2">
					<div className="flex-1 bg-muted rounded-full h-2">
						<div className={cn("h-2 rounded-full transition-all duration-300", progress.status === "completed" ? "bg-green-500" : progress.status === "failed" ? "bg-destructive" : "bg-primary")} style={{ width: `${progress.progress}%` }} />
					</div>
					<span className="text-xs text-muted-foreground w-12">{progress.progress}%</span>
				</div>
				{progress.error && <p className="text-xs text-destructive mt-1">{progress.error}</p>}
				{progress.estimatedTimeRemaining && progress.status === "uploading" && <p className="text-xs text-muted-foreground mt-1">~{Math.ceil(progress.estimatedTimeRemaining)}s remaining</p>}
			</div>
		</div>
	);
}
