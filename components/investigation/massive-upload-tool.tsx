"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, CheckCircle, X, Plus, File, Image, Video, Music, FileImage, Clock, Zap, Settings, Eye, Trash2, RotateCw, Pause, Play, Brain, Search, Target, Shield, Database, Activity, Loader2, ChevronDown, ChevronUp, FolderPlus, Filter, SortAsc, Download, Share, Tag, Star, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn, formatFileSize, getFileIcon, isValidFileType } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import { useEnhancedUpload } from "@/components/file-upload/hooks/use-enhanced-upload";

interface QueuedFile {
	id: string;
	file: File;
	status: "pending" | "uploading" | "processing" | "completed" | "failed";
	progress: number;
	analysis?: any;
	thumbnail?: string;
	error?: string;
	investigationId?: string;
}

interface Investigation {
	id: string;
	name: string;
	description: string;
	status: string;
	created_at: string;
	file_count: number;
}

const DEFAULT_ACCEPTED_TYPES = ["image/*", "video/*", "audio/*", "application/pdf", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/x-rar-compressed"];

export function MassiveUploadTool() {
	const { user } = useAuth();
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Core state
	const [fileQueue, setFileQueue] = useState<QueuedFile[]>([]);
	const [investigations, setInvestigations] = useState<Investigation[]>([]);
	const [selectedInvestigation, setSelectedInvestigation] = useState<string>("new");
	const [newInvestigationName, setNewInvestigationName] = useState("");
	const [newInvestigationDescription, setNewInvestigationDescription] = useState("");

	// Upload state
	const [dragActive, setDragActive] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStats, setUploadStats] = useState({
		total: 0,
		completed: 0,
		failed: 0,
		processing: 0,
	});

	// UI state
	const [expandedSections, setExpandedSections] = useState({
		upload: true,
		queue: true,
		progress: true,
		investigations: false,
	});
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [searchQuery, setSearchQuery] = useState("");

	// Enhanced upload hook
	const { uploadFiles, cancelUpload, getUploadProgress, isProcessing } = useEnhancedUpload();

	// Load investigations on mount
	useEffect(() => {
		fetchInvestigations();
	}, []);

	// Update stats when queue changes
	useEffect(() => {
		updateUploadStats();
	}, [fileQueue]);

	const fetchInvestigations = async () => {
		try {
			const response = await fetch("/api/investigations");
			if (response.ok) {
				const data = await response.json();
				setInvestigations(data.data || []);
			}
		} catch (error) {
			console.error("Failed to fetch investigations:", error);
		}
	};

	const updateUploadStats = () => {
		const stats = fileQueue.reduce(
			(acc, file) => {
				acc.total++;
				if (file.status === "completed") acc.completed++;
				if (file.status === "failed") acc.failed++;
				if (file.status === "processing" || file.status === "uploading") acc.processing++;
				return acc;
			},
			{ total: 0, completed: 0, failed: 0, processing: 0 }
		);

		setUploadStats(stats);
	};

	const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
		const validFiles: File[] = [];
		const errors: string[] = [];
		const maxFileSize = 100 * 1024 * 1024; // 100MB

		files.forEach((file) => {
			if (file.size > maxFileSize) {
				errors.push(`${file.name}: File too large (max ${formatFileSize(maxFileSize)})`);
				return;
			}

			if (!isValidFileType(file, DEFAULT_ACCEPTED_TYPES)) {
				errors.push(`${file.name}: File type not supported`);
				return;
			}

			validFiles.push(file);
		});

		return { valid: validFiles, errors };
	}, []);

	const addFilesToQueue = useCallback(
		(files: File[]) => {
			const { valid, errors } = validateFiles(files);

			if (errors.length > 0) {
				console.error("File validation errors:", errors);
			}

			const newQueuedFiles: QueuedFile[] = valid.map((file) => ({
				id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				file,
				status: "pending",
				progress: 0,
			}));

			setFileQueue((prev) => [...prev, ...newQueuedFiles]);
		},
		[validateFiles]
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setDragActive(false);
			addFilesToQueue(acceptedFiles);
		},
		[addFilesToQueue]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		onDragEnter: () => setDragActive(true),
		onDragLeave: () => setDragActive(false),
		multiple: true,
		accept: DEFAULT_ACCEPTED_TYPES.reduce((acc, type) => {
			acc[type] = [];
			return acc;
		}, {} as Record<string, string[]>),
	});

	const removeFromQueue = (fileId: string) => {
		setFileQueue((prev) => prev.filter((f) => f.id !== fileId));
	};

	const clearQueue = () => {
		setFileQueue([]);
	};

	const startUpload = async () => {
		if (fileQueue.length === 0) return;

		// Handle investigation creation/selection
		let investigationId = selectedInvestigation;

		if (selectedInvestigation === "new") {
			if (!newInvestigationName.trim()) {
				alert("Please enter an investigation name");
				return;
			}

			try {
				const response = await fetch("/api/investigations", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: newInvestigationName,
						description: newInvestigationDescription,
					}),
				});

				if (response.ok) {
					const data = await response.json();
					investigationId = data.data.id;
					await fetchInvestigations();
				} else {
					throw new Error("Failed to create investigation");
				}
			} catch (error) {
				console.error("Investigation creation failed:", error);
				return;
			}
		}

		setIsUploading(true);

		// Process files one by one with real-time updates
		for (const queuedFile of fileQueue) {
			if (queuedFile.status !== "pending") continue;

			try {
				// Update status to uploading
				setFileQueue((prev) => prev.map((f) => (f.id === queuedFile.id ? { ...f, status: "uploading", investigationId } : f)));

				// Create FormData
				const formData = new FormData();
				formData.append("file", queuedFile.file);
				formData.append("investigationId", investigationId);
				formData.append("enableEnhancedProcessing", "true");

				// Upload with progress tracking
				const response = await fetch("/api/upload-enhanced", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					const result = await response.json();

					// Update to processing
					setFileQueue((prev) =>
						prev.map((f) =>
							f.id === queuedFile.id
								? {
										...f,
										status: "processing",
										progress: 100,
										analysis: result.analysis,
								  }
								: f
						)
					);

					// Simulate processing completion (in real app, this would be handled by webhooks)
					setTimeout(() => {
						setFileQueue((prev) => prev.map((f) => (f.id === queuedFile.id ? { ...f, status: "completed" } : f)));
					}, 2000 + Math.random() * 3000);
				} else {
					throw new Error(`Upload failed: ${response.statusText}`);
				}
			} catch (error) {
				console.error(`Upload failed for ${queuedFile.file.name}:`, error);
				setFileQueue((prev) =>
					prev.map((f) =>
						f.id === queuedFile.id
							? {
									...f,
									status: "failed",
									error: error instanceof Error ? error.message : "Upload failed",
							  }
							: f
					)
				);
			}
		}

		setIsUploading(false);
	};

	const toggleSection = (section: keyof typeof expandedSections) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	const filteredQueue = fileQueue.filter((file) => {
		const matchesSearch = file.file.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = filterStatus === "all" || file.status === filterStatus;
		return matchesSearch && matchesFilter;
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
			case "failed":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
			case "uploading":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
			case "processing":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	};

	const totalProgress = fileQueue.length > 0 ? Math.round((uploadStats.completed / fileQueue.length) * 100) : 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Modern Vercel-style Header */}
			<header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
				<div className="max-w-8xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
									<Upload className="h-4 w-4 text-white" />
								</div>
								<div>
									<h1 className="text-xl font-semibold">Evidence Processing</h1>
									<p className="text-sm text-muted-foreground">AI-powered investigation workspace</p>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{uploadStats.processing > 0 && (
								<div className="flex items-center gap-2 text-sm">
									<div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
									<span className="text-muted-foreground">{uploadStats.processing} processing</span>
								</div>
							)}
							<Badge variant="secondary" className="gap-1 font-normal">
								<CheckCircle className="h-3 w-3" />
								{uploadStats.completed} completed
							</Badge>
							{uploadStats.failed > 0 && (
								<Badge variant="destructive" className="gap-1 font-normal">
									<AlertCircle className="h-3 w-3" />
									{uploadStats.failed} failed
								</Badge>
							)}
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-8xl mx-auto px-6 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Upload Area */}
					<div className="lg:col-span-2 space-y-6">
						{/* Investigation Selection */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Investigation Setup</h2>
								<Button variant="outline" size="sm" onClick={fetchInvestigations}>
									<RotateCw className="h-4 w-4 mr-2" />
									Refresh
								</Button>
							</div>

							<div className="space-y-4">
								<Select value={selectedInvestigation} onValueChange={setSelectedInvestigation}>
									<SelectTrigger className="h-11">
										<SelectValue placeholder="Choose an investigation..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="new">
											<div className="flex items-center gap-2">
												<Plus className="h-4 w-4" />
												Create New Investigation
											</div>
										</SelectItem>
										{investigations.map((inv) => (
											<SelectItem key={inv.id} value={inv.id}>
												<div className="flex items-center justify-between w-full">
													<span>{inv.name}</span>
													<span className="text-xs text-muted-foreground ml-2">{inv.file_count || 0} files</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{selectedInvestigation === "new" && (
									<div className="space-y-4 p-4 border rounded-lg bg-muted/30">
										<div className="space-y-2">
											<Label htmlFor="investigation-name">Investigation Name</Label>
											<Input id="investigation-name" value={newInvestigationName} onChange={(e) => setNewInvestigationName(e.target.value)} placeholder="e.g., Case #2024-001 - Digital Evidence Analysis" className="h-11" />
										</div>
										<div className="space-y-2">
											<Label htmlFor="investigation-description">Description</Label>
											<Textarea id="investigation-description" value={newInvestigationDescription} onChange={(e) => setNewInvestigationDescription(e.target.value)} placeholder="Brief description of the investigation scope and objectives..." rows={3} />
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Advanced Drop Zone */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Evidence Upload</h2>
							<div
								{...getRootProps()}
								className={cn("relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer group", "hover:border-primary/50 hover:bg-primary/5", {
									"border-primary bg-primary/10 scale-[1.02]": isDragActive || dragActive,
									"border-border": !isDragActive && !dragActive,
									"opacity-50 cursor-not-allowed": isUploading,
								})}
							>
								<input {...getInputProps()} ref={fileInputRef} />

								<div className="flex flex-col items-center text-center space-y-4">
									<div className={cn("p-6 rounded-2xl transition-all duration-300", isDragActive || dragActive ? "bg-primary text-primary-foreground scale-110" : "bg-muted group-hover:bg-primary/10")}>
										<Upload className={cn("h-8 w-8 transition-transform duration-300", isDragActive && "scale-110")} />
									</div>

									<div className="space-y-2">
										<h3 className="text-xl font-semibold">{isDragActive || dragActive ? "Drop your files here" : "Upload Evidence Files"}</h3>
										<p className="text-muted-foreground">Drag and drop files here, or click to browse</p>
										<div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
											<span>Images</span>
											<span>•</span>
											<span>Videos</span>
											<span>•</span>
											<span>Audio</span>
											<span>•</span>
											<span>Documents</span>
											<span>•</span>
											<span>Archives</span>
										</div>
									</div>

									{!isUploading && (
										<div className="flex items-center gap-3">
											<Button variant="outline" className="gap-2">
												<Plus className="w-4 h-4" />
												Browse Files
											</Button>
											{fileQueue.length > 0 && (
												<Button
													onClick={(e) => {
														e.stopPropagation();
														startUpload();
													}}
													className="gap-2"
												>
													<Upload className="w-4 h-4" />
													Process {fileQueue.length} Files
												</Button>
											)}
										</div>
									)}

									{isUploading && (
										<div className="flex items-center gap-3 text-muted-foreground">
											<Loader2 className="h-5 w-5 animate-spin" />
											<span>Processing uploads...</span>
										</div>
									)}
								</div>

								<div className="absolute bottom-4 right-4 text-xs text-muted-foreground">Max 100MB per file</div>
							</div>
						</div>

						{/* Queue Progress Overview */}
						{fileQueue.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold">Processing Queue</h2>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground">
											{uploadStats.completed} of {fileQueue.length} completed
										</span>
										<Button variant="ghost" size="sm" onClick={clearQueue}>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="space-y-3">
									<Progress value={totalProgress} className="h-2" />
									<div className="grid grid-cols-4 gap-4 text-center">
										<div>
											<div className="text-lg font-semibold">{uploadStats.total}</div>
											<div className="text-xs text-muted-foreground">Total</div>
										</div>
										<div>
											<div className="text-lg font-semibold text-orange-600">{uploadStats.processing}</div>
											<div className="text-xs text-muted-foreground">Processing</div>
										</div>
										<div>
											<div className="text-lg font-semibold text-green-600">{uploadStats.completed}</div>
											<div className="text-xs text-muted-foreground">Complete</div>
										</div>
										<div>
											<div className="text-lg font-semibold text-red-600">{uploadStats.failed}</div>
											<div className="text-xs text-muted-foreground">Failed</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* File Queue */}
						{fileQueue.length > 0 && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold">Files ({fileQueue.length})</h3>
									<div className="flex items-center gap-2">
										<Select value={filterStatus} onValueChange={setFilterStatus}>
											<SelectTrigger className="w-32 h-8">
												<SelectValue placeholder="Filter" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All</SelectItem>
												<SelectItem value="pending">Pending</SelectItem>
												<SelectItem value="uploading">Uploading</SelectItem>
												<SelectItem value="processing">Processing</SelectItem>
												<SelectItem value="completed">Complete</SelectItem>
												<SelectItem value="failed">Failed</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2 max-h-96 overflow-y-auto">
									{filteredQueue.map((queuedFile) => (
										<div key={queuedFile.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
											<div className="flex items-start gap-3">
												<div className="flex-shrink-0 mt-0.5">{getFileIcon(queuedFile.file.type)}</div>

												<div className="flex-1 min-w-0 space-y-1">
													<div className="flex items-center gap-2">
														<p className="font-medium text-sm truncate">{queuedFile.file.name}</p>
														<div className="flex-shrink-0">
															{queuedFile.status === "processing" && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
															{queuedFile.status === "completed" && <CheckCircle className="h-3 w-3 text-green-600" />}
															{queuedFile.status === "failed" && <AlertCircle className="h-3 w-3 text-red-600" />}
														</div>
													</div>

													<div className="flex items-center justify-between">
														<span className="text-xs text-muted-foreground">{formatFileSize(queuedFile.file.size)}</span>
														<Badge variant="secondary" className="text-xs">
															{queuedFile.status}
														</Badge>
													</div>

													{queuedFile.status === "uploading" && <Progress value={queuedFile.progress} className="h-1" />}

													{queuedFile.error && <p className="text-xs text-red-600">{queuedFile.error}</p>}
												</div>

												<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeFromQueue(queuedFile.id)}>
													<X className="h-3 w-3" />
												</Button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Recent Investigations */}
						<div className="space-y-4">
							<h3 className="font-semibold">Recent Investigations</h3>
							<div className="space-y-2">
								{investigations.slice(0, 5).map((investigation) => (
									<div key={investigation.id} className="p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => router.push(`/investigation/${investigation.id}`)}>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{investigation.name}</h4>
												<Badge variant="outline" className="text-xs">
													{investigation.status}
												</Badge>
											</div>
											<div className="flex items-center justify-between text-xs text-muted-foreground">
												<span>{investigation.file_count || 0} files</span>
												<span>{new Date(investigation.created_at).toLocaleDateString()}</span>
											</div>
										</div>
									</div>
								))}

								{investigations.length === 0 && (
									<div className="text-center py-6 text-muted-foreground">
										<FolderPlus className="h-8 w-8 mx-auto mb-2" />
										<p className="text-sm">No investigations yet</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
