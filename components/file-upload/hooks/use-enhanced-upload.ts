"use client";

import { useState, useCallback, useRef } from "react";
import { UploadProgress } from "@/types/investigation";

export interface UploadFile {
	file: File;
	id: string;
	progress: number;
	status: "pending" | "uploading" | "processing" | "completed" | "failed" | "cancelled";
	error?: string;
	uploadedSize: number;
	estimatedTimeRemaining?: number;
	startTime?: number;
	processingJobId?: string;
}

export interface UploadOptions {
	investigationId: string;
	priority?: "low" | "medium" | "high" | "critical";
	analysisTypes?: string[];
	enableEnhancedProcessing?: boolean;
	chunkSize?: number;
	maxRetries?: number;
}

export interface UploadStats {
	totalFiles: number;
	completedFiles: number;
	failedFiles: number;
	totalSize: number;
	uploadedSize: number;
	estimatedTimeRemaining: number;
	averageSpeed: number;
	isUploading: boolean;
}

export function useEnhancedUpload() {
	const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
	const [stats, setStats] = useState<UploadStats>({
		totalFiles: 0,
		completedFiles: 0,
		failedFiles: 0,
		totalSize: 0,
		uploadedSize: 0,
		estimatedTimeRemaining: 0,
		averageSpeed: 0,
		isUploading: false,
	});

	const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
	const uploadsInProgressRef = useRef<Set<string>>(new Set());

	const generateFileId = useCallback(() => {
		return `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}, []);

	const addFiles = useCallback(
		(files: File[]) => {
			const newUploadFiles: UploadFile[] = files.map((file) => ({
				file,
				id: generateFileId(),
				progress: 0,
				status: "pending",
				uploadedSize: 0,
			}));

			setUploadFiles((prev) => [...prev, ...newUploadFiles]);

			setStats((prev) => ({
				...prev,
				totalFiles: prev.totalFiles + files.length,
				totalSize: prev.totalSize + files.reduce((sum, f) => sum + f.size, 0),
			}));

			return newUploadFiles;
		},
		[generateFileId]
	);

	const removeFile = useCallback((fileId: string) => {
		// Cancel upload if in progress
		const controller = abortControllersRef.current.get(fileId);
		if (controller) {
			controller.abort();
			abortControllersRef.current.delete(fileId);
		}

		setUploadFiles((prev) => {
			const fileToRemove = prev.find((f) => f.id === fileId);
			if (!fileToRemove) return prev;

			setStats((current) => ({
				...current,
				totalFiles: Math.max(0, current.totalFiles - 1),
				totalSize: Math.max(0, current.totalSize - fileToRemove.file.size),
				uploadedSize: Math.max(0, current.uploadedSize - fileToRemove.uploadedSize),
				failedFiles: fileToRemove.status === "failed" ? Math.max(0, current.failedFiles - 1) : current.failedFiles,
				completedFiles: fileToRemove.status === "completed" ? Math.max(0, current.completedFiles - 1) : current.completedFiles,
			}));

			return prev.filter((f) => f.id !== fileId);
		});

		uploadsInProgressRef.current.delete(fileId);
	}, []);

	const clearCompleted = useCallback(() => {
		setUploadFiles((prev) => {
			const completedFiles = prev.filter((f) => f.status === "completed");
			const remainingFiles = prev.filter((f) => f.status !== "completed");

			if (completedFiles.length > 0) {
				setStats((current) => ({
					...current,
					totalFiles: remainingFiles.length,
					completedFiles: 0,
					totalSize: remainingFiles.reduce((sum, f) => sum + f.file.size, 0),
					uploadedSize: remainingFiles.reduce((sum, f) => sum + f.uploadedSize, 0),
				}));
			}

			return remainingFiles;
		});
	}, []);

	const updateFileProgress = useCallback(
		(fileId: string, updates: Partial<UploadFile>) => {
			setUploadFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f)));

			// Update global stats when file status changes
			if (updates.status) {
				setStats((prev) => {
					let newStats = { ...prev };

					if (updates.status === "completed") {
						newStats.completedFiles = Math.min(prev.totalFiles, prev.completedFiles + 1);
					} else if (updates.status === "failed") {
						newStats.failedFiles = Math.min(prev.totalFiles, prev.failedFiles + 1);
					}

					if (updates.uploadedSize !== undefined) {
						const currentFile = uploadFiles.find((f) => f.id === fileId);
						const sizeDiff = updates.uploadedSize - (currentFile?.uploadedSize || 0);
						newStats.uploadedSize = Math.max(0, prev.uploadedSize + sizeDiff);
					}

					return newStats;
				});
			}
		},
		[uploadFiles]
	);

	const uploadFile = useCallback(
		async (fileId: string, options: UploadOptions, onProgress?: (progress: number, uploadedSize: number) => void): Promise<void> => {
			const uploadFile = uploadFiles.find((f) => f.id === fileId);
			if (!uploadFile || uploadsInProgressRef.current.has(fileId)) {
				return;
			}

			uploadsInProgressRef.current.add(fileId);
			const abortController = new AbortController();
			abortControllersRef.current.set(fileId, abortController);

			try {
				updateFileProgress(fileId, {
					status: "uploading",
					startTime: Date.now(),
				});

				const formData = new FormData();
				formData.append("files", uploadFile.file);
				formData.append("investigationId", options.investigationId);

				if (options.priority) {
					formData.append("priority", options.priority);
				}

				if (options.analysisTypes) {
					formData.append("analysisTypes", JSON.stringify(options.analysisTypes));
				}

				// Use enhanced upload API
				const apiEndpoint = options.enableEnhancedProcessing ? "/api/upload-enhanced" : "/api/upload";

				const response = await fetch(apiEndpoint, {
					method: "POST",
					body: formData,
					signal: abortController.signal,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Upload failed");
				}

				const result = await response.json();

				updateFileProgress(fileId, {
					status: "processing",
					progress: 100,
					uploadedSize: uploadFile.file.size,
					processingJobId: result.results?.[0]?.processingJobId,
				});

				// Simulate processing time for demo
				await new Promise((resolve) => setTimeout(resolve, 2000));

				updateFileProgress(fileId, {
					status: "completed",
					progress: 100,
				});
			} catch (error: any) {
				if (error.name === "AbortError") {
					updateFileProgress(fileId, {
						status: "cancelled",
						error: "Upload cancelled",
					});
				} else {
					updateFileProgress(fileId, {
						status: "failed",
						error: error.message || "Upload failed",
					});
				}
			} finally {
				abortControllersRef.current.delete(fileId);
				uploadsInProgressRef.current.delete(fileId);
			}
		},
		[uploadFiles, updateFileProgress]
	);

	const uploadAll = useCallback(
		async (options: UploadOptions) => {
			setStats((prev) => ({ ...prev, isUploading: true }));

			const pendingFiles = uploadFiles.filter((f) => f.status === "pending");

			// Upload files in parallel with concurrency limit
			const concurrency = 3;
			const chunks = [];
			for (let i = 0; i < pendingFiles.length; i += concurrency) {
				chunks.push(pendingFiles.slice(i, i + concurrency));
			}

			try {
				for (const chunk of chunks) {
					await Promise.all(chunk.map((file) => uploadFile(file.id, options)));
				}
			} finally {
				setStats((prev) => ({ ...prev, isUploading: false }));
			}
		},
		[uploadFiles, uploadFile]
	);

	const retryFile = useCallback(
		async (fileId: string, options: UploadOptions) => {
			updateFileProgress(fileId, {
				status: "pending",
				progress: 0,
				uploadedSize: 0,
				error: undefined,
			});

			await uploadFile(fileId, options);
		},
		[uploadFile, updateFileProgress]
	);

	const cancelFile = useCallback(
		(fileId: string) => {
			const controller = abortControllersRef.current.get(fileId);
			if (controller) {
				controller.abort();
			}

			updateFileProgress(fileId, {
				status: "cancelled",
				error: "Upload cancelled by user",
			});
		},
		[updateFileProgress]
	);

	const cancelAll = useCallback(() => {
		abortControllersRef.current.forEach((controller) => {
			controller.abort();
		});

		setUploadFiles((prev) => prev.map((f) => (f.status === "uploading" || f.status === "pending" ? { ...f, status: "cancelled" as const, error: "Upload cancelled" } : f)));

		setStats((prev) => ({ ...prev, isUploading: false }));
	}, []);

	const reset = useCallback(() => {
		cancelAll();
		setUploadFiles([]);
		setStats({
			totalFiles: 0,
			completedFiles: 0,
			failedFiles: 0,
			totalSize: 0,
			uploadedSize: 0,
			estimatedTimeRemaining: 0,
			averageSpeed: 0,
			isUploading: false,
		});
		abortControllersRef.current.clear();
		uploadsInProgressRef.current.clear();
	}, [cancelAll]);

	return {
		uploadFiles,
		stats,
		addFiles,
		removeFile,
		clearCompleted,
		uploadFile,
		uploadAll,
		retryFile,
		cancelFile,
		cancelAll,
		reset,
		updateFileProgress,
	};
}
