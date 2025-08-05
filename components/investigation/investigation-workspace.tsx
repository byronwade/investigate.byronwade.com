"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, Download, FileImage, FileVideo, FileText, File, Play, Pause, SkipForward, SkipBack, Volume2, Maximize, MessageSquare, StickyNote, Zap, Brain, Users, MapPin, Clock, Tag, Star, Share, Settings, Loader2, CheckCircle, AlertCircle, XCircle, Upload, Plus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { formatFileSize, formatTimestamp } from "@/lib/utils";
import { ProcessingStatus, ProcessingJob } from "./processing-status";
import { EnhancedUploadWorkspace } from "@/components/file-upload/enhanced-upload-workspace";

interface EvidenceFile {
	id: string;
	original_name: string;
	file_size: number;
	file_type: string;
	mime_type: string;
	upload_status: string;
	processing_status: string;
	created_at: string;
	thumbnail?: string;
	ai_analysis?: AIAnalysis[];
}

interface AIAnalysis {
	id: string;
	analysis_type: string;
	status: string;
	results: any;
	confidence_scores: any;
	created_at: string;
}

interface Note {
	id: string;
	content: string;
	timestamp: string;
	file_id?: string;
	position?: { x: number; y: number };
	user_name: string;
}

interface InvestigationWorkspaceProps {
	investigationId: string;
}

export function InvestigationWorkspace({ investigationId }: InvestigationWorkspaceProps) {
	const { user } = useAuth();
	const [files, setFiles] = useState<EvidenceFile[]>([]);
	const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterType, setFilterType] = useState("all");
	const [notes, setNotes] = useState<Note[]>([]);
	const [newNote, setNewNote] = useState("");
	const [loading, setLoading] = useState(true);
	const [aiQuery, setAiQuery] = useState("");
	const [aiResponse, setAiResponse] = useState("");
	const [isProcessingQuery, setIsProcessingQuery] = useState(false);
	const [showUploadWorkspace, setShowUploadWorkspace] = useState(false);

	// Fetch files for the investigation
	useEffect(() => {
		fetchFiles();
	}, [investigationId]);

	const fetchFiles = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/investigations/${investigationId}`);
			if (response.ok) {
				const data = await response.json();
				setFiles(data.data.evidence_files || []);
				if (data.data.evidence_files?.length > 0) {
					setSelectedFile(data.data.evidence_files[0]);
				}
			}
		} catch (error) {
			console.error("Failed to fetch files:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredFiles = files.filter((file) => {
		const matchesSearch = file.original_name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = filterType === "all" || (filterType === "images" && file.mime_type.startsWith("image/")) || (filterType === "videos" && file.mime_type.startsWith("video/")) || (filterType === "documents" && (file.mime_type.includes("pdf") || file.mime_type.includes("document"))) || (filterType === "audio" && file.mime_type.startsWith("audio/"));

		return matchesSearch && matchesType;
	});

	const getFileIcon = (mimeType: string) => {
		if (mimeType.startsWith("image/")) return <FileImage className="h-4 w-4" />;
		if (mimeType.startsWith("video/")) return <FileVideo className="h-4 w-4" />;
		if (mimeType.includes("pdf") || mimeType.includes("document")) return <FileText className="h-4 w-4" />;
		return <File className="h-4 w-4" />;
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "processing":
				return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
			case "failed":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
		}
	};

	const handleAiQuery = async () => {
		if (!aiQuery.trim() || !selectedFile) return;

		setIsProcessingQuery(true);
		try {
			// Simulate AI processing - in real implementation, this would call your AI analysis API
			await new Promise((resolve) => setTimeout(resolve, 2000));
			setAiResponse(`Based on the analysis of ${selectedFile.original_name}, I found relevant information related to your query: "${aiQuery}". The file contains extractable data that matches your investigation parameters.`);
		} catch (error) {
			setAiResponse("Sorry, I couldn't process your query at this time. Please try again.");
		} finally {
			setIsProcessingQuery(false);
		}
	};

	const addNote = () => {
		if (!newNote.trim()) return;

		const note: Note = {
			id: Date.now().toString(),
			content: newNote,
			timestamp: new Date().toISOString(),
			file_id: selectedFile?.id,
			user_name: user?.email || "Unknown User",
		};

		setNotes((prev) => [note, ...prev]);
		setNewNote("");
	};

	return (
		<div className="h-screen flex flex-col bg-background">
			{/* Header */}
			<Header
				variant="investigation"
				transparent
				showNavigation={false}
				showUserMenu={false}
				actions={
					<div className="flex items-center space-x-2">
						<Button variant="default" size="sm" onClick={() => setShowUploadWorkspace(true)}>
							<Upload className="h-4 w-4 mr-2" />
							Upload Files
						</Button>
						<Button variant="outline" size="sm">
							<Share className="h-4 w-4 mr-2" />
							Share
						</Button>
						<Button variant="outline" size="sm">
							<Settings className="h-4 w-4 mr-2" />
							Settings
						</Button>
					</div>
				}
			/>

			{/* Page Title Section */}
			<div className="border-b border-border/20 bg-background">
				<div className="container mx-auto max-w-7xl px-6 py-4">
					<div>
						<h1 className="text-2xl font-bold">Investigation Analysis</h1>
						<p className="text-muted-foreground">AI-powered evidence exploration</p>
					</div>
				</div>
			</div>

			{showUploadWorkspace ? (
				/* Enhanced Upload Workspace */
				<div className="flex-1 p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-xl font-semibold">Upload Evidence Files</h2>
							<p className="text-muted-foreground">Add new files to your investigation with advanced AI processing</p>
						</div>
						<Button variant="outline" onClick={() => setShowUploadWorkspace(false)}>
							← Back to Analysis
						</Button>
					</div>

					<EnhancedUploadWorkspace
						investigationId={investigationId}
						priority="high"
						enableEnhancedProcessing={true}
						onUploadComplete={(results) => {
							console.log("Upload completed:", results);
							// Refresh files list
							fetchFiles();
							// Optionally close upload workspace
							// setShowUploadWorkspace(false);
						}}
						onError={(error) => {
							console.error("Upload error:", error);
						}}
					/>
				</div>
			) : (
				<div className="flex-1 flex">
					{/* Left Sidebar - File Browser */}
					<div className="w-80 border-r bg-card/50 flex flex-col">
						{/* Search and Filters */}
						<div className="p-4 border-b space-y-3">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input placeholder="Search files..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
							</div>

							<Select value={filterType} onValueChange={setFilterType}>
								<SelectTrigger>
									<SelectValue placeholder="Filter by type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Files</SelectItem>
									<SelectItem value="images">Images</SelectItem>
									<SelectItem value="videos">Videos</SelectItem>
									<SelectItem value="documents">Documents</SelectItem>
									<SelectItem value="audio">Audio</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* File List */}
						<ScrollArea className="flex-1">
							<div className="p-2 space-y-1">
								{loading ? (
									<div className="flex items-center justify-center py-8">
										<Loader2 className="h-6 w-6 animate-spin" />
										<span className="ml-2 text-sm text-muted-foreground">Loading files...</span>
									</div>
								) : filteredFiles.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										<File className="h-12 w-12 mx-auto mb-4 opacity-50" />
										<p>No files found</p>
									</div>
								) : (
									filteredFiles.map((file) => (
										<Card key={file.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedFile?.id === file.id ? "ring-2 ring-primary bg-primary/5" : ""}`} onClick={() => setSelectedFile(file)}>
											<CardContent className="p-3">
												<div className="flex items-start space-x-3">
													<div className="flex-shrink-0">{getFileIcon(file.mime_type)}</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">{file.original_name}</p>
														<div className="flex items-center space-x-2 mt-1">
															<Badge variant="outline" className="text-xs">
																{file.file_type}
															</Badge>
															{getStatusIcon(file.processing_status)}
														</div>
														<div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
															<span>{formatFileSize(file.file_size)}</span>
															<span>{formatTimestamp(file.created_at)}</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))
								)}
							</div>
						</ScrollArea>
					</div>

					{/* Main Content Area */}
					<div className="flex-1 flex flex-col">
						{selectedFile ? (
							<>
								{/* File Header */}
								<div className="p-4 border-b bg-card/30">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											{getFileIcon(selectedFile.mime_type)}
											<div>
												<h2 className="text-lg font-semibold">{selectedFile.original_name}</h2>
												<div className="flex items-center space-x-4 text-sm text-muted-foreground">
													<span>{formatFileSize(selectedFile.file_size)}</span>
													<span>{selectedFile.file_type}</span>
													<span>Uploaded {formatTimestamp(selectedFile.created_at)}</span>
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button variant="outline" size="sm">
												<Eye className="h-4 w-4 mr-2" />
												Preview
											</Button>
											<Button variant="outline" size="sm">
												<Download className="h-4 w-4 mr-2" />
												Download
											</Button>
										</div>
									</div>
								</div>

								{/* Content Tabs */}
								<div className="flex-1 p-4">
									<Tabs defaultValue="analysis" className="h-full flex flex-col">
										<TabsList className="grid w-full grid-cols-4">
											<TabsTrigger value="analysis">
												<Brain className="h-4 w-4 mr-2" />
												AI Analysis
											</TabsTrigger>
											<TabsTrigger value="preview">
												<Eye className="h-4 w-4 mr-2" />
												Preview
											</TabsTrigger>
											<TabsTrigger value="insights">
												<Zap className="h-4 w-4 mr-2" />
												Insights
											</TabsTrigger>
											<TabsTrigger value="notes">
												<StickyNote className="h-4 w-4 mr-2" />
												Notes
											</TabsTrigger>
										</TabsList>

										{/* AI Analysis Tab */}
										<TabsContent value="analysis" className="flex-1 mt-4">
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
												{/* AI Chat Interface */}
												<AIChat investigationId={investigationId} selectedFile={selectedFile} />

												{/* Extracted Data */}
												<Card>
													<CardHeader>
														<CardTitle>Extracted Data</CardTitle>
														<CardDescription>AI-detected information from this file</CardDescription>
													</CardHeader>
													<CardContent>
														<ScrollArea className="h-64">
															<div className="space-y-4">
																{/* OCR Text */}
																<div>
																	<h4 className="font-medium mb-2 flex items-center gap-2">
																		<FileText className="h-4 w-4" />
																		Text Content
																	</h4>
																	<Card className="bg-muted/30">
																		<CardContent className="p-3">
																			<p className="text-sm text-muted-foreground">Processing text extraction...</p>
																		</CardContent>
																	</Card>
																</div>

																{/* Objects */}
																<div>
																	<h4 className="font-medium mb-2 flex items-center gap-2">
																		<Eye className="h-4 w-4" />
																		Detected Objects
																	</h4>
																	<div className="flex flex-wrap gap-2">
																		<Badge variant="secondary">Person (92%)</Badge>
																		<Badge variant="secondary">Vehicle (87%)</Badge>
																		<Badge variant="secondary">Building (95%)</Badge>
																	</div>
																</div>

																{/* People */}
																<div>
																	<h4 className="font-medium mb-2 flex items-center gap-2">
																		<Users className="h-4 w-4" />
																		People Detected
																	</h4>
																	<div className="space-y-2">
																		<div className="flex items-center justify-between text-sm">
																			<span>Person 1</span>
																			<Badge variant="outline">Face detected</Badge>
																		</div>
																		<div className="flex items-center justify-between text-sm">
																			<span>Person 2</span>
																			<Badge variant="outline">Partial view</Badge>
																		</div>
																	</div>
																</div>

																{/* Location */}
																<div>
																	<h4 className="font-medium mb-2 flex items-center gap-2">
																		<MapPin className="h-4 w-4" />
																		Location Data
																	</h4>
																	<p className="text-sm text-muted-foreground">Analyzing location metadata...</p>
																</div>

																{/* Timeline */}
																<div>
																	<h4 className="font-medium mb-2 flex items-center gap-2">
																		<Clock className="h-4 w-4" />
																		Timeline
																	</h4>
																	<p className="text-sm text-muted-foreground">Created: {formatTimestamp(selectedFile.created_at)}</p>
																</div>
															</div>
														</ScrollArea>
													</CardContent>
												</Card>
											</div>
										</TabsContent>

										{/* Preview Tab */}
										<TabsContent value="preview" className="flex-1 mt-4">
											<Card className="h-full">
												<CardContent className="p-6 h-full flex items-center justify-center">
													<div className="text-center">
														{selectedFile.mime_type.startsWith("image/") ? (
															<div className="bg-muted/30 rounded-lg p-8">
																<FileImage className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
																<p className="text-sm text-muted-foreground">Image preview will load here</p>
															</div>
														) : selectedFile.mime_type.startsWith("video/") ? (
															<div className="bg-muted/30 rounded-lg p-8">
																<FileVideo className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
																<p className="text-sm text-muted-foreground">Video player will load here</p>
																<div className="flex items-center justify-center gap-2 mt-4">
																	<Button variant="outline" size="sm">
																		<Play className="h-4 w-4" />
																	</Button>
																	<Button variant="outline" size="sm">
																		<SkipBack className="h-4 w-4" />
																	</Button>
																	<Button variant="outline" size="sm">
																		<SkipForward className="h-4 w-4" />
																	</Button>
																	<Button variant="outline" size="sm">
																		<Volume2 className="h-4 w-4" />
																	</Button>
																	<Button variant="outline" size="sm">
																		<Maximize className="h-4 w-4" />
																	</Button>
																</div>
															</div>
														) : (
															<div className="bg-muted/30 rounded-lg p-8">
																<FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
																<p className="text-sm text-muted-foreground">Document viewer will load here</p>
															</div>
														)}
													</div>
												</CardContent>
											</Card>
										</TabsContent>

										{/* Insights Tab */}
										<TabsContent value="insights" className="flex-1 mt-4">
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												<Card>
													<CardHeader className="pb-3">
														<CardTitle className="text-sm">Confidence Score</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="text-2xl font-bold text-green-600">94%</div>
														<p className="text-xs text-muted-foreground">Analysis reliability</p>
													</CardContent>
												</Card>

												<Card>
													<CardHeader className="pb-3">
														<CardTitle className="text-sm">Processing Time</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="text-2xl font-bold">2.3s</div>
														<p className="text-xs text-muted-foreground">AI analysis duration</p>
													</CardContent>
												</Card>

												<Card>
													<CardHeader className="pb-3">
														<CardTitle className="text-sm">Data Points</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="text-2xl font-bold">127</div>
														<p className="text-xs text-muted-foreground">Extracted elements</p>
													</CardContent>
												</Card>

												<Card className="md:col-span-2 lg:col-span-3">
													<CardHeader>
														<CardTitle>Key Findings</CardTitle>
													</CardHeader>
													<CardContent>
														<div className="space-y-3">
															<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
																<Users className="h-5 w-5 text-blue-500" />
																<div>
																	<p className="font-medium">2 people identified</p>
																	<p className="text-sm text-muted-foreground">High confidence facial recognition</p>
																</div>
															</div>
															<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
																<MapPin className="h-5 w-5 text-green-500" />
																<div>
																	<p className="font-medium">Location metadata found</p>
																	<p className="text-sm text-muted-foreground">GPS coordinates extracted</p>
																</div>
															</div>
															<div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
																<Clock className="h-5 w-5 text-orange-500" />
																<div>
																	<p className="font-medium">Timestamp verified</p>
																	<p className="text-sm text-muted-foreground">Creation time authenticated</p>
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											</div>
										</TabsContent>

										{/* Notes Tab */}
										<TabsContent value="notes" className="flex-1 mt-4">
											<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
												{/* Add Note */}
												<Card>
													<CardHeader>
														<CardTitle className="flex items-center gap-2">
															<MessageSquare className="h-5 w-5" />
															Add Investigation Note
														</CardTitle>
													</CardHeader>
													<CardContent className="space-y-4">
														<Textarea placeholder="Document your findings, observations, or questions about this evidence..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="min-h-32" />
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																<Tag className="h-4 w-4 text-muted-foreground" />
																<span className="text-sm text-muted-foreground">Auto-tagged to file</span>
															</div>
															<Button onClick={addNote} disabled={!newNote.trim()}>
																<StickyNote className="h-4 w-4 mr-2" />
																Add Note
															</Button>
														</div>
													</CardContent>
												</Card>

												{/* Notes List */}
												<Card>
													<CardHeader>
														<CardTitle>Investigation Notes</CardTitle>
														<CardDescription>
															{notes.length} note{notes.length !== 1 ? "s" : ""} recorded
														</CardDescription>
													</CardHeader>
													<CardContent>
														<ScrollArea className="h-64">
															{notes.length === 0 ? (
																<div className="text-center py-8 text-muted-foreground">
																	<StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
																	<p>No notes yet</p>
																	<p className="text-sm">Add your first investigation note</p>
																</div>
															) : (
																<div className="space-y-3">
																	{notes.map((note) => (
																		<Card key={note.id} className="bg-muted/30">
																			<CardContent className="p-3">
																				<div className="space-y-2">
																					<p className="text-sm">{note.content}</p>
																					<div className="flex items-center justify-between text-xs text-muted-foreground">
																						<span>{note.user_name}</span>
																						<span>{formatTimestamp(note.timestamp)}</span>
																					</div>
																				</div>
																			</CardContent>
																		</Card>
																	))}
																</div>
															)}
														</ScrollArea>
													</CardContent>
												</Card>
											</div>
										</TabsContent>
									</Tabs>
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center">
								<div className="text-center">
									<Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
									<h3 className="text-lg font-medium mb-2">Select Evidence to Analyze</h3>
									<p className="text-muted-foreground">Choose a file from the left panel to start AI-powered investigation</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
