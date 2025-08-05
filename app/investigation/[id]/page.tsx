"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Upload, Share, Settings, Search, FileText, Clock, CheckCircle, AlertCircle, Activity, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnhancedFileUploadZone } from "@/components/file-upload/enhanced-file-upload-zone";

interface EvidenceFile {
	id: string;
	original_name: string;
	file_size: number;
	file_type: string;
	mime_type: string;
	upload_status: "uploading" | "uploaded" | "failed";
	processing_status: "pending" | "processing" | "completed" | "failed";
	created_at: string;
	analysis_results?: {
		summary: string;
		confidence: number;
		entities: string[];
		metadata: Record<string, any>;
	};
}

export default function InvestigationDetailPage() {
	const params = useParams();
	const investigationId = params?.id as string;
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [files, setFiles] = useState<EvidenceFile[]>([]);
	const [showUploadZone, setShowUploadZone] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch files on component mount and set up real-time updates
	useEffect(() => {
		fetchFiles();

		// Set up polling for real-time updates
		const interval = setInterval(fetchFiles, 2000); // Poll every 2 seconds

		return () => clearInterval(interval);
	}, [investigationId]);

	const fetchFiles = async () => {
		try {
			const response = await fetch(`/api/investigations/${investigationId}/files`);
			if (response.ok) {
				const data = await response.json();
				setFiles(data.files || []);
			}
		} catch (error) {
			console.error("Failed to fetch files:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFilesSelected = async (selectedFiles: File[]) => {
		// Add files to state immediately with uploading status
		const newFiles: EvidenceFile[] = selectedFiles.map((file) => ({
			id: `temp-${Math.random().toString(36).substr(2, 9)}`,
			original_name: file.name,
			file_size: file.size,
			file_type: file.name.split(".").pop() || "unknown",
			mime_type: file.type,
			upload_status: "uploading",
			processing_status: "pending",
			created_at: new Date().toISOString(),
		}));

		setFiles((prev) => [...prev, ...newFiles]);

		const formData = new FormData();
		formData.append("investigationId", investigationId);

		selectedFiles.forEach((file) => {
			formData.append("files", file);
		});

		try {
			const response = await fetch("/api/upload-demo", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				const result = await response.json();

				// Update files with successful upload status
				setFiles((prev) =>
					prev.map((file) => {
						if (file.upload_status === "uploading") {
							return {
								...file,
								upload_status: "uploaded" as const,
								processing_status: "processing" as const,
							};
						}
						return file;
					})
				);

				// Simulate processing completion after 3 seconds
				setTimeout(() => {
					setFiles((prev) =>
						prev.map((file) => {
							if (file.processing_status === "processing") {
								return {
									...file,
									processing_status: "completed" as const,
									analysis_results: {
										summary: `Analysis complete for ${file.original_name}`,
										confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
										entities: ["Auto-detected entity"],
										metadata: { processed_at: new Date().toISOString() },
									},
								};
							}
							return file;
						})
					);
				}, 3000);

				setShowUploadZone(false);
			} else {
				const error = await response.json();
				console.error("Upload failed:", error);

				// Update files with failed status
				setFiles((prev) =>
					prev.map((file) => {
						if (file.upload_status === "uploading") {
							return {
								...file,
								upload_status: "failed" as const,
								processing_status: "failed" as const,
							};
						}
						return file;
					})
				);
			}
		} catch (error) {
			console.error("Upload error:", error);

			// Update files with failed status
			setFiles((prev) =>
				prev.map((file) => {
					if (file.upload_status === "uploading") {
						return {
							...file,
							upload_status: "failed" as const,
							processing_status: "failed" as const,
						};
					}
					return file;
				})
			);
		}
	};

	const getStatusIcon = (status: string, uploadStatus?: string) => {
		if (uploadStatus === "uploading") {
			return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
		}

		switch (status) {
			case "pending":
				return <Clock className="h-4 w-4 text-orange-500" />;
			case "processing":
				return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "failed":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return <FileText className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusBadge = (status: string, uploadStatus?: string) => {
		if (uploadStatus === "uploading") {
			return (
				<Badge variant="default" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
					Uploading
				</Badge>
			);
		}

		const variants = {
			pending: { variant: "secondary" as const, label: "Pending" },
			processing: { variant: "default" as const, label: "Processing", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
			completed: { variant: "default" as const, label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
			failed: { variant: "destructive" as const, label: "Failed" },
		};
		const config = variants[status as keyof typeof variants] || variants.pending;
		return (
			<Badge variant={config.variant} className={`text-xs ${config.className || ""}`}>
				{config.label}
			</Badge>
		);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const filteredFiles = files.filter((file) => {
		const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase());
		let matchesStatus = true;

		if (statusFilter !== "all") {
			if (statusFilter === "uploading") {
				matchesStatus = file.upload_status === "uploading";
			} else {
				matchesStatus = file.processing_status === statusFilter;
			}
		}

		return matchesSearch && matchesStatus;
	});

	const uploadingFiles = files.filter((f) => f.upload_status === "uploading").length;
	const processingFiles = files.filter((f) => f.processing_status === "processing").length;
	const completedFiles = files.filter((f) => f.processing_status === "completed").length;

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b bg-background/95 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-foreground">Investigation Analysis</h1>
							<p className="text-sm text-muted-foreground mt-1">AI-powered evidence exploration</p>
							{files.length > 0 && (
								<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
									<span>{files.length} files</span>
									{uploadingFiles > 0 && <span className="text-blue-600">{uploadingFiles} uploading</span>}
									{processingFiles > 0 && <span className="text-blue-600">{processingFiles} processing</span>}
									<span className="text-green-600">{completedFiles} analyzed</span>
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button size="sm" className="gap-2" onClick={() => setShowUploadZone(true)}>
								<Upload className="h-4 w-4" />
								Upload Files
							</Button>
							<Button variant="outline" size="sm" className="gap-2">
								<Share className="h-4 w-4" />
								Share
							</Button>
							<Button variant="outline" size="sm">
								<Settings className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-6 py-8">
				{/* Upload Zone */}
				{showUploadZone && (
					<div className="mb-8">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold">Upload Evidence Files</h3>
									<Button variant="ghost" size="sm" onClick={() => setShowUploadZone(false)}>
										×
									</Button>
								</div>
								<EnhancedFileUploadZone
									onFilesSelected={handleFilesSelected}
									investigationId={investigationId}
									priority="medium"
									enableEnhancedProcessing={true}
									multiple={true}
									maxFileSize={100 * 1024 * 1024} // 100MB
									acceptedFileTypes={["image/*", "video/*", "audio/*", "application/pdf", "text/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]}
								/>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Search and Filter */}
				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="All Files" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Files</SelectItem>
							<SelectItem value="uploading">Uploading</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="processing">Processing</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Files List */}
				{isLoading ? (
					<Card>
						<CardContent className="py-16">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
								<p className="text-muted-foreground">Loading files...</p>
							</div>
						</CardContent>
					</Card>
				) : filteredFiles.length === 0 ? (
					<Card>
						<CardContent className="py-16">
							<div className="text-center">
								<div className="w-16 h-16 bg-muted rounded-sm flex items-center justify-center mx-auto mb-4">
									<Upload className="h-8 w-8 text-muted-foreground" />
								</div>
								<h3 className="text-lg font-medium mb-2">{files.length === 0 ? "No files found" : "No matching files"}</h3>
								<p className="text-muted-foreground mb-6">{files.length === 0 ? "Upload evidence files to start your investigation analysis." : "Try adjusting your search criteria or filters."}</p>
								{files.length === 0 && (
									<Button className="gap-2" onClick={() => setShowUploadZone(true)}>
										<Upload className="h-4 w-4" />
										Upload Your First File
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{filteredFiles.map((file) => (
							<Card key={file.id} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-4 flex-1 min-w-0">
											{/* File Icon */}
											<div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center flex-shrink-0">
												<FileText className="h-5 w-5 text-muted-foreground" />
											</div>

											{/* File Info */}
											<div className="flex-1 min-w-0">
												<h4 className="font-medium text-sm truncate">{file.original_name}</h4>
												<div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
													<span>{formatFileSize(file.file_size)}</span>
													<span>•</span>
													<span>{file.file_type.toUpperCase()}</span>
													<span>•</span>
													<span>{new Date(file.created_at).toLocaleDateString()}</span>
												</div>

												{/* Analysis Results */}
												{file.analysis_results && <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{file.analysis_results.summary}</p>}
											</div>
										</div>

										{/* Status and Actions */}
										<div className="flex items-center gap-3 flex-shrink-0">
											{/* Processing Status */}
											<div className="flex items-center gap-2">
												{getStatusIcon(file.processing_status, file.upload_status)}
												{getStatusBadge(file.processing_status, file.upload_status)}
											</div>

											{/* Confidence Score */}
											{file.analysis_results && (
												<Badge variant="outline" className="text-xs">
													{Math.round(file.analysis_results.confidence * 100)}% confidence
												</Badge>
											)}

											{/* Actions */}
											<div className="flex items-center gap-1">
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
													<Eye className="h-4 w-4" />
												</Button>
												<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
													<Download className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>

									{/* Upload/Processing Progress */}
									{(file.upload_status === "uploading" || file.processing_status === "processing") && (
										<div className="mt-4 space-y-2">
											<div className="flex justify-between text-xs text-muted-foreground">
												<span>{file.upload_status === "uploading" ? "Uploading file..." : "Analyzing file..."}</span>
												<span>{file.upload_status === "uploading" ? "Uploading" : "Processing"}</span>
											</div>
											<Progress value={file.upload_status === "uploading" ? 33 : 66} className="h-2" />
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
