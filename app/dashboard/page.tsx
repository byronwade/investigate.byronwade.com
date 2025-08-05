"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, MoreHorizontal, Clock, FileText, Activity, AlertCircle, CheckCircle, Upload, Play, Pause, Users, Share, ExternalLink, Settings, ChevronRight, ChevronDown, Eye, Shield, Database, BarChart3, Brain, CalendarDays, Target, Fingerprint, Network, Zap, TrendingUp, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/stats-card";
import { InvestigationCard } from "@/components/dashboard/investigation-card";
import { NewInvestigationDialog } from "@/components/dashboard/new-investigation-dialog";
import { DebugApiTest } from "@/components/dashboard/debug-api-test";
import { SimpleDebug } from "@/components/dashboard/simple-debug";

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

export default function DashboardPage() {
	const router = useRouter();
	const [investigations, setInvestigations] = useState<Investigation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
		evidence: false,
		aiAnalysis: false,
		timeline: false,
		configuration: false,
	});

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// Load investigations from API
	const loadInvestigations = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/investigations");

			if (!response.ok) {
				throw new Error(`Failed to load investigations: ${response.status} ${response.statusText}`);
			}

			// Check if response has content before parsing JSON
			const text = await response.text();
			if (!text) {
				console.warn("Empty response from investigations API");
				setInvestigations([]);
				return;
			}

			const result = JSON.parse(text);

			// Check if result has the expected structure
			if (!result || !Array.isArray(result.data)) {
				console.warn("Unexpected API response structure:", result);
				setInvestigations([]);
				return;
			}

			// Transform API data to match interface
			const transformedInvestigations: Investigation[] = result.data.map((inv: any) => ({
				id: inv.id,
				name: inv.name,
				description: inv.description || "No description provided",
				status: inv.status,
				created_at: inv.created_at,
				updated_at: inv.updated_at,
				file_count: inv.total_files || 0,
				processing_files: Math.max(0, (inv.total_files || 0) - (inv.processed_files || 0)),
				completed_files: inv.processed_files || 0,
				total_size: inv.total_size || 0,
				processing_time: inv.status === "completed" ? "Complete" : inv.status === "draft" ? "Not started" : "In progress",
				creator: {
					name: inv.user_profiles ? `${inv.user_profiles.first_name || ""} ${inv.user_profiles.last_name || ""}`.trim() || inv.user_profiles.email || "Unknown User" : "Unknown User",
					email: inv.user_profiles?.email || "unknown@example.com",
				},
			}));

			setInvestigations(transformedInvestigations);
		} catch (error) {
			console.error("Error loading investigations:", error);
			// Fallback to empty array on any error
			setInvestigations([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadInvestigations();
	}, []);

	const handleInvestigationCreated = (newInvestigation: any) => {
		// Refresh the investigations list
		loadInvestigations();
	};

	const filteredInvestigations = investigations.filter((inv) => {
		const matchesSearch = inv.name.toLowerCase().includes(searchQuery.toLowerCase()) || inv.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Utility functions
	const getStatusBadge = (status: string) => {
		const statusConfig = {
			draft: { variant: "secondary" as const, label: "Draft", className: "" },
			active: { variant: "default" as const, label: "Active", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
			processing: { variant: "default" as const, label: "Processing", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
			completed: { variant: "default" as const, label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
			archived: { variant: "outline" as const, label: "Archived", className: "" },
		};
		const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
		return (
			<Badge variant={config.variant} className={`text-xs ${config.className}`}>
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

	if (selectedInvestigation) {
		// Detailed Investigation View (Vercel-style)
		return (
			<div className="min-h-screen bg-background">
				{/* Main Header */}
				<Header
					variant="investigation"
					transparent
					showNavigation={false}
					breadcrumbs={
						<ul className="flex items-center overflow-auto gap-2">
							{/* Organization */}
							<li className="flex items-center gap-2 min-w-12 max-w-96">
								<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
									<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
								</svg>
								<div className="flex items-center gap-0 min-w-0">
									<button onClick={() => setSelectedInvestigation(null)} className="flex items-center gap-2 min-w-0 rounded-full no-underline bg-transparent border-none cursor-pointer p-0 hover:bg-muted">
										<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
											<span className="text-xs font-bold text-primary-foreground">I</span>
										</div>
										<p className="hidden md:block text-sm font-medium text-foreground truncate">InvestigatAI</p>
										<span className="hidden md:block text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Pro</span>
									</button>
								</div>
							</li>

							{/* Project */}
							<li className="flex items-center gap-2 min-w-1 max-w-96">
								<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
									<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
								</svg>
								<div className="flex items-center gap-0 min-w-0">
									<button onClick={() => setSelectedInvestigation(null)} className="flex items-center gap-2 min-w-0 no-underline bg-transparent border-none cursor-pointer p-0 hover:bg-muted">
										<div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
											<Activity className="w-3 h-3 text-muted-foreground" />
										</div>
										<p className="hidden md:block text-sm font-medium text-foreground truncate">dashboard</p>
									</button>
								</div>
							</li>

							{/* Investigation */}
							<li className="flex items-center gap-2 min-w-0">
								<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
									<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
								</svg>
								<div className="flex items-center gap-3 min-w-0">
									<span className="inline-flex items-center" title={`Investigation ${selectedInvestigation.status}`}>
										<span className={`inline-block w-2.5 h-2.5 rounded-full ${selectedInvestigation.status === "processing" ? "bg-orange-500" : selectedInvestigation.status === "active" ? "bg-blue-500" : selectedInvestigation.status === "completed" ? "bg-green-500" : "bg-gray-400"}`}></span>
									</span>
									<p className="text-sm font-medium text-foreground truncate">{selectedInvestigation.name}</p>
								</div>
							</li>
						</ul>
					}
					actions={
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" className="gap-2 border-border hover:bg-muted/50">
								<Share className="h-4 w-4" />
								<span className="hidden sm:inline">Share</span>
							</Button>
							<Button onClick={() => router.push(`/investigation/${selectedInvestigation.id}`)} size="sm" className="gap-2">
								<ExternalLink className="h-4 w-4" />
								<span className="hidden sm:inline">Open</span>
							</Button>
							<Button variant="outline" size="sm" className="w-8 h-8 p-0 border-border hover:bg-muted/50">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</div>
					}
				/>

				{/* Sub Header Navigation */}
				<div className="sticky top-[60px] z-40 -mt-px touch-pan-x overflow-x-auto bg-background shadow-[inset_0_-1px] shadow-border scrollbar-none">
					<div className="flex h-[46px] items-center px-2 md:px-6 [&>*]:shrink-0 max-w-7xl mx-auto">
						<a href="#" className="relative inline-block select-none px-3 py-4 text-sm font-medium text-foreground no-underline transition-colors duration-200" onClick={(e) => e.preventDefault()}>
							Investigation
							<div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary"></div>
						</a>
						<a href="#" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground" onClick={(e) => e.preventDefault()}>
							Evidence
						</a>
						<a href="#" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground" onClick={(e) => e.preventDefault()}>
							Analysis
						</a>
						<a href="#" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground" onClick={(e) => e.preventDefault()}>
							Reports
						</a>
						<a href="#" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground" onClick={(e) => e.preventDefault()}>
							Activity
						</a>
					</div>
				</div>

				<div className="flex flex-col gap-4 py-6">
					<div className="container mx-auto max-w-7xl px-6 w-full">
						<div className="mt-4 flex flex-col gap-6">
							{/* Main Investigation Details Card */}
							<Card className="rounded-lg bg-card border border-border shadow-sm">
								<CardContent className="p-6">
									<div className="flex flex-col gap-6 overflow-hidden md:flex-row">
										{/* Investigation Preview */}
										<div className="flex flex-col gap-3">
											<div className="aspect-[16/10] lg:w-[400px] md:w-[320px] w-full overflow-hidden">
												<div className="size-full p-0 border border-border rounded-lg flex flex-none justify-center overflow-hidden aspect-[640/400] group bg-muted/50">
													<div className="w-full h-full flex items-center justify-center">
														<div className="text-center">
															<Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
															<p className="text-sm font-medium text-foreground">Investigation Preview</p>
															<p className="text-xs text-muted-foreground mt-1">Evidence visualization</p>
														</div>
													</div>
												</div>
											</div>
											{/* Mobile Action Buttons */}
											<div className="flex h-min gap-2 flex-wrap lg:hidden">
												<Button variant="secondary" className="min-w-[96px] flex-1 px-[10px] gap-2">
													<Share className="h-4 w-4" />
													Share
												</Button>
												<Button onClick={() => router.push(`/investigation/${selectedInvestigation.id}`)} className="min-w-[80px] flex-1">
													<ExternalLink className="h-4 w-4 mr-2" />
													Open
												</Button>
												<Button variant="secondary" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</div>
										</div>

										{/* Investigation Details */}
										<div className="flex min-w-0 flex-1 flex-col gap-4">
											{/* Metadata Grid */}
											<div className="grid grid-cols-2 gap-6 xl:grid-cols-4 [&>div]:flex-[0_1_auto]">
												<div className="flex flex-col gap-1.5">
													<span className="text-sm font-medium text-muted-foreground">Created</span>
													<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
														<div className="flex items-center gap-2">
															<div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
																<Users className="h-3 w-3 text-primary" />
															</div>
															<span className="text-sm text-foreground font-medium truncate">{selectedInvestigation.creator.name}</span>
														</div>
														<span className="text-muted-foreground">{getTimeAgo(selectedInvestigation.created_at)}</span>
													</div>
												</div>
												<div className="flex flex-col gap-1.5">
													<span className="text-sm font-medium text-muted-foreground">Status</span>
													<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
														<div className={`w-2.5 h-2.5 rounded-full ${selectedInvestigation.status === "processing" ? "bg-orange-500" : selectedInvestigation.status === "active" ? "bg-blue-500" : selectedInvestigation.status === "completed" ? "bg-green-500" : "bg-gray-400"}`}></div>
														{getStatusBadge(selectedInvestigation.status)}
														<span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Latest</span>
													</div>
												</div>
												<div className="flex flex-col gap-1.5">
													<span className="text-sm font-medium text-muted-foreground">Processing Time</span>
													<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
														<Clock className="h-4 w-4 text-muted-foreground" />
														<span className="text-foreground font-medium">{selectedInvestigation.processing_time}</span>
														<span className="text-muted-foreground">{getTimeAgo(selectedInvestigation.updated_at)}</span>
													</div>
												</div>
												<div className="flex flex-col gap-1.5">
													<span className="text-sm font-medium text-muted-foreground">Environment</span>
													<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm flex-wrap">
														<Shield className="h-4 w-4 text-muted-foreground" />
														<span className="text-foreground font-medium hover:text-primary cursor-pointer transition-colors">Production</span>
													</div>
												</div>
											</div>

											{/* Evidence & Processing Info */}
											<div className="flex flex-col gap-1.5">
												<span className="text-sm font-medium text-muted-foreground">Evidence Files</span>
												<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
													<Database className="h-4 w-4 text-muted-foreground" />
													<span className="text-foreground font-medium">
														{selectedInvestigation.file_count} files ({formatFileSize(selectedInvestigation.total_size)})
													</span>
												</div>
												{selectedInvestigation.status === "processing" && (
													<div className="mt-3">
														<Progress value={(selectedInvestigation.completed_files / selectedInvestigation.file_count) * 100} className="h-2" />
														<div className="flex justify-between text-xs text-muted-foreground mt-2">
															<span>{selectedInvestigation.processing_files} processing</span>
															<span>
																{selectedInvestigation.completed_files}/{selectedInvestigation.file_count} completed
															</span>
														</div>
													</div>
												)}
											</div>

											{/* Investigation Details */}
											<div className="flex flex-col gap-1.5">
												<span className="text-sm font-medium text-muted-foreground">Investigation Details</span>
												<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
													<Target className="h-4 w-4 text-muted-foreground" />
													<span className="font-mono text-foreground font-medium hover:text-primary cursor-pointer transition-colors text-sm">{selectedInvestigation.name}</span>
												</div>
												<div className="flex h-5 items-center gap-2 whitespace-nowrap text-sm">
													<FileText className="h-4 w-4 text-muted-foreground" />
													<span className="flex gap-1.5 truncate hover:text-primary cursor-pointer transition-colors">
														<span className="font-mono text-xs text-muted-foreground">#{selectedInvestigation.id}</span>
														<span className="text-sm text-foreground truncate" title={selectedInvestigation.description}>
															{selectedInvestigation.description}
														</span>
													</span>
												</div>
											</div>
										</div>
									</div>

									{/* Investigation Configuration Section */}
									<div className="rounded-b border-t border-border mt-6">
										<button className="flex h-12 w-full items-center justify-between border-0 bg-transparent px-4 transition-all duration-200 hover:bg-muted/50 cursor-pointer" onClick={() => toggleSection("configuration")}>
											<span className="flex items-center gap-3">
												<ChevronRight className={`h-4 w-4 transition-transform duration-200 text-muted-foreground ${expandedSections.configuration ? "rotate-90" : ""}`} />
												<span className="text-sm font-medium text-foreground">Investigation Configuration</span>
											</span>
											<span className="hidden flex-row items-center gap-4 lg:flex">
												<span className="text-sm flex flex-row items-center gap-2 whitespace-nowrap text-muted-foreground">
													<Shield className="h-4 w-4 text-green-600" />
													Security Enabled
												</span>
												<span className="text-sm flex flex-row items-center gap-2 whitespace-nowrap text-muted-foreground">
													<Database className="h-4 w-4 text-blue-600" />
													Data Protection
												</span>
												<span className="text-sm flex flex-row items-center gap-2 whitespace-nowrap text-muted-foreground">
													<Zap className="h-4 w-4 text-yellow-600" />
													AI Analysis
												</span>
											</span>
										</button>
										{expandedSections.configuration && (
											<div className="border-t border-border bg-muted/20 px-4 pb-4">
												<div className="space-y-4 pt-4">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div className="space-y-3">
															<h4 className="text-sm font-medium text-foreground">Security Settings</h4>
															<div className="space-y-2">
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">End-to-End Encryption</span>
																	<div className="w-2 h-2 rounded-full bg-green-500"></div>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">Data Retention Policy</span>
																	<span className="text-xs text-foreground">90 days</span>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">Access Control</span>
																	<span className="text-xs text-foreground">Role-based</span>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">Audit Logging</span>
																	<div className="w-2 h-2 rounded-full bg-green-500"></div>
																</div>
															</div>
														</div>
														<div className="space-y-3">
															<h4 className="text-sm font-medium text-foreground">Processing Options</h4>
															<div className="space-y-2">
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">AI Analysis Engine</span>
																	<span className="text-xs text-foreground">GPT-4 Turbo</span>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">OCR Processing</span>
																	<div className="w-2 h-2 rounded-full bg-green-500"></div>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">Metadata Extraction</span>
																	<div className="w-2 h-2 rounded-full bg-green-500"></div>
																</div>
																<div className="flex items-center justify-between">
																	<span className="text-xs text-muted-foreground">File Hash Verification</span>
																	<div className="w-2 h-2 rounded-full bg-green-500"></div>
																</div>
															</div>
														</div>
													</div>
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Investigation Parameters</h4>
														<div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
															<div className="flex flex-col gap-1">
																<span className="text-muted-foreground">Case Priority</span>
																<span className="text-red-600 font-medium">High</span>
															</div>
															<div className="flex flex-col gap-1">
																<span className="text-muted-foreground">Jurisdiction</span>
																<span className="text-foreground font-medium">Federal</span>
															</div>
															<div className="flex flex-col gap-1">
																<span className="text-muted-foreground">Evidence Chain</span>
																<span className="text-green-600 font-medium">Verified</span>
															</div>
															<div className="flex flex-col gap-1">
																<span className="text-muted-foreground">Legal Hold</span>
																<span className="text-foreground font-medium">Active</span>
															</div>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Processing Steps */}
							<div className="flex flex-col gap-3">
								{/* Evidence Processing */}
								<div className="border border-border rounded-lg bg-card">
									<div className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => toggleSection("evidence")}>
										<div className="flex items-center gap-3">
											<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.evidence ? "rotate-180" : ""}`} />
											<span className="text-sm font-medium text-foreground">Evidence Processing</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">32s</span>
											<div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
												<CheckCircle className="h-3 w-3 text-white" />
											</div>
										</div>
									</div>
									{expandedSections.evidence && (
										<div className="border-t border-border bg-muted/20 p-4">
											<div className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Files Processed</h4>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Images</span>
																<span className="text-foreground font-medium">24 files</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Documents</span>
																<span className="text-foreground font-medium">18 files</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Videos</span>
																<span className="text-foreground font-medium">5 files</span>
															</div>
														</div>
													</div>
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Processing Stats</h4>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Total Size</span>
																<span className="text-foreground font-medium">2.2 GB</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Processing Time</span>
																<span className="text-foreground font-medium">32 seconds</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Success Rate</span>
																<span className="text-green-600 font-medium">100%</span>
															</div>
														</div>
													</div>
												</div>
												<div className="space-y-2">
													<h4 className="text-sm font-medium text-foreground">Key Findings</h4>
													<div className="space-y-2">
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Extracted metadata from 47 files with geo-location data</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Detected 3 encrypted files requiring additional analysis</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Recovered 12 deleted files from unallocated disk space</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* AI Analysis */}
								<div className="border border-border rounded-lg bg-card">
									<div className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => toggleSection("aiAnalysis")}>
										<div className="flex items-center gap-3">
											<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.aiAnalysis ? "rotate-180" : ""}`} />
											<span className="text-sm font-medium text-foreground">AI Analysis & Entity Recognition</span>
										</div>
										<div className="flex items-center gap-3">
											<Button variant="secondary" size="sm" className="hidden md:flex gap-2">
												<Brain className="h-4 w-4" />
												View Results
											</Button>
											<span className="text-sm text-muted-foreground">Complete</span>
											<div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
												<CheckCircle className="h-3 w-3 text-white" />
											</div>
										</div>
									</div>
									{expandedSections.aiAnalysis && (
										<div className="border-t border-border bg-muted/20 p-4">
											<div className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Entities Detected</h4>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Persons</span>
																<span className="text-foreground font-medium">12</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Organizations</span>
																<span className="text-foreground font-medium">5</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Locations</span>
																<span className="text-foreground font-medium">8</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Financial Data</span>
																<span className="text-foreground font-medium">23</span>
															</div>
														</div>
													</div>
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Sentiment Analysis</h4>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Positive</span>
																<span className="text-green-600 font-medium">34%</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Neutral</span>
																<span className="text-blue-600 font-medium">51%</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Negative</span>
																<span className="text-red-600 font-medium">15%</span>
															</div>
														</div>
													</div>
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Confidence Scores</h4>
														<div className="space-y-1">
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">High (&gt;90%)</span>
																<span className="text-green-600 font-medium">78%</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Medium (70-90%)</span>
																<span className="text-orange-600 font-medium">18%</span>
															</div>
															<div className="flex justify-between text-xs">
																<span className="text-muted-foreground">Low (&lt;70%)</span>
																<span className="text-red-600 font-medium">4%</span>
															</div>
														</div>
													</div>
												</div>
												<div className="space-y-2">
													<h4 className="text-sm font-medium text-foreground">Key AI Insights</h4>
													<div className="space-y-2">
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Identified potential money laundering patterns in transaction data</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Detected anomalous communication patterns between 3 key individuals</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Found 7 shell companies with similar registration patterns</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Cross-referenced entities with known criminal databases (2 matches)</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>

								{/* Timeline Generation */}
								<div className="border border-border rounded-lg bg-card">
									<div className="flex items-center justify-between p-4 hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => toggleSection("timeline")}>
										<div className="flex items-center gap-3">
											<ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.timeline ? "rotate-180" : ""}`} />
											<span className="text-sm font-medium text-foreground">Timeline Generation</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">Skipped</span>
											<div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
												<AlertCircle className="h-3 w-3 text-white" />
											</div>
										</div>
									</div>
									{expandedSections.timeline && (
										<div className="border-t border-border bg-muted/20 p-4">
											<div className="space-y-4">
												<div className="flex items-start gap-3">
													<div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
														<AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
													</div>
													<div className="space-y-2">
														<h4 className="text-sm font-medium text-foreground">Timeline Generation Skipped</h4>
														<p className="text-xs text-muted-foreground">Timeline generation was skipped due to insufficient temporal data in the evidence files. Most files lack accurate timestamps required for reliable chronological ordering.</p>
													</div>
												</div>
												<div className="space-y-2">
													<h4 className="text-sm font-medium text-foreground">Requirements for Timeline Generation</h4>
													<div className="space-y-2">
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Timestamp data available in less than 30% of files</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Metadata extraction incomplete for 12 critical files</span>
														</div>
														<div className="flex items-start gap-2 text-xs">
															<div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
															<span className="text-muted-foreground">Manual timestamp verification needed for 18 documents</span>
														</div>
													</div>
												</div>
												<div className="pt-2">
													<Button size="sm" variant="outline" className="gap-2">
														<CalendarDays className="h-4 w-4" />
														Force Timeline Generation
													</Button>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Analysis Tool Cards */}
							<div className="flex w-full flex-col items-stretch gap-3 lg:flex-row">
								<Card className="flex flex-1 items-center gap-1.5 py-3 pl-4 pr-3 cursor-pointer hover:shadow-md hover:bg-muted/20 transition-all border-border rounded-lg bg-card" onClick={() => router.push(`/investigation/${selectedInvestigation.id}/forensics`)}>
									<CardContent className="p-0 flex items-center gap-3 w-full">
										<div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center flex-shrink-0 hidden lg:flex">
											<Fingerprint className="h-4 w-4 text-blue-600 dark:text-blue-400" />
										</div>
										<div className="text-muted-foreground flex size-8 items-center justify-center -ml-2 lg:hidden">
											<Fingerprint className="h-4 w-4" />
										</div>
										<div className="mb-0.5 w-full flex-1 flex-col min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-semibold text-foreground flex-1 truncate">Digital Forensics</p>
											</div>
											<p className="text-xs text-muted-foreground whitespace-normal">Deep forensic analysis & evidence extraction</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden lg:block" />
									</CardContent>
								</Card>

								<Card className="flex flex-1 items-center gap-1.5 py-3 pl-4 pr-3 cursor-pointer hover:shadow-md hover:bg-muted/20 transition-all border-border rounded-lg bg-card" onClick={() => router.push(`/investigation/${selectedInvestigation.id}/intelligence`)}>
									<CardContent className="p-0 flex items-center gap-3 w-full">
										<div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center flex-shrink-0 hidden lg:flex">
											<Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
										</div>
										<div className="text-muted-foreground flex size-8 items-center justify-center -ml-2 lg:hidden">
											<Brain className="h-4 w-4" />
										</div>
										<div className="mb-0.5 w-full flex-1 flex-col min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-semibold text-foreground flex-1 truncate">AI Intelligence</p>
											</div>
											<p className="text-xs text-muted-foreground whitespace-normal">AI-powered insights & pattern detection</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden lg:block" />
									</CardContent>
								</Card>

								<Card className="flex flex-1 items-center gap-1.5 py-3 pl-4 pr-3 cursor-pointer hover:shadow-md hover:bg-muted/20 transition-all border-border rounded-lg bg-card" onClick={() => router.push(`/investigation/${selectedInvestigation.id}/timeline`)}>
									<CardContent className="p-0 flex items-center gap-3 w-full">
										<div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center flex-shrink-0 hidden lg:flex">
											<CalendarDays className="h-4 w-4 text-green-600 dark:text-green-400" />
										</div>
										<div className="text-muted-foreground flex size-8 items-center justify-center -ml-2 lg:hidden">
											<CalendarDays className="h-4 w-4" />
										</div>
										<div className="mb-0.5 w-full flex-1 flex-col min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-semibold text-foreground flex-1 truncate">Timeline Analysis</p>
												<Badge variant="secondary" className="text-xs py-0.5 px-2 bg-muted text-muted-foreground">
													Beta
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground whitespace-normal">Interactive timeline visualization</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden lg:block" />
									</CardContent>
								</Card>

								<Card className="flex flex-1 items-center gap-1.5 py-3 pl-4 pr-3 cursor-pointer hover:shadow-md hover:bg-muted/20 transition-all border-border rounded-lg bg-card" onClick={() => router.push(`/investigation/${selectedInvestigation.id}/techniques`)}>
									<CardContent className="p-0 flex items-center gap-3 w-full">
										<div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center flex-shrink-0 hidden lg:flex">
											<Network className="h-4 w-4 text-orange-600 dark:text-orange-400" />
										</div>
										<div className="text-muted-foreground flex size-8 items-center justify-center -ml-2 lg:hidden">
											<Network className="h-4 w-4" />
										</div>
										<div className="mb-0.5 w-full flex-1 flex-col min-w-0">
											<div className="flex items-center gap-2">
												<p className="text-sm font-semibold text-foreground flex-1 truncate">Investigation Techniques</p>
											</div>
											<p className="text-xs text-muted-foreground whitespace-normal">Advanced investigation methodologies</p>
										</div>
										<ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 hidden lg:block" />
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Main Dashboard View (Investigation Cards Grid)
	return (
		<div className="min-h-screen bg-background">
			{/* Main Header */}
			<Header
				variant="dashboard"
				transparent
				showNavigation={false}
				breadcrumbs={
					<ul className="flex items-center overflow-auto gap-2">
						{/* Organization */}
						<li className="flex items-center gap-2 min-w-12 max-w-96">
							<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
								<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
							</svg>
							<div className="flex items-center gap-0 min-w-0">
								<a href="/dashboard" className="flex items-center gap-2 min-w-0 rounded-full no-underline">
									<div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
										<span className="text-xs font-bold text-primary-foreground">I</span>
									</div>
									<p className="hidden md:block text-sm font-medium text-foreground truncate">InvestigatAI</p>
									<span className="hidden md:block text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">Pro</span>
								</a>
							</div>
						</li>

						{/* Project */}
						<li className="flex items-center gap-2 min-w-1 max-w-96">
							<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
								<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
							</svg>
							<div className="flex items-center gap-0 min-w-0">
								<a href="/dashboard" className="flex items-center gap-2 min-w-0 no-underline">
									<div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
										<Activity className="w-3 h-3 text-muted-foreground" />
									</div>
									<p className="hidden md:block text-sm font-medium text-foreground truncate">dashboard</p>
								</a>
							</div>
						</li>

						{/* Status */}
						<li className="flex items-center gap-2 min-w-0">
							<svg className="hidden md:block w-4 h-4 text-muted-foreground" viewBox="0 0 16 16" fill="currentColor">
								<path fillRule="evenodd" clipRule="evenodd" d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z" />
							</svg>
							<div className="flex items-center gap-3 min-w-0">
								<span className="inline-flex items-center" title="System is operational">
									<span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
								</span>
								<p className="text-sm font-medium text-foreground truncate">Operational</p>
							</div>
						</li>
					</ul>
				}
				actions={
					<div className="flex items-center gap-2 lg:gap-3">
						<ul className="flex items-center gap-3">
							{/* Search Button */}
							<button className="relative z-50 cursor-pointer overflow-visible border-0 bg-transparent p-0 w-8 h-8 lg:w-40 xl:w-48 lg:cursor-text pointer-events-auto" type="button">
								<span className="absolute inset-0 origin-top-left rounded-full border-none bg-background outline outline-1 outline-border lg:rounded"></span>
								<span className="relative flex items-center">
									<span className="grid place-content-center text-foreground lg:text-muted-foreground w-8 h-8">
										<Search className="w-4 h-4" />
									</span>
									<span className="hidden flex-1 text-left text-muted-foreground lg:flex text-sm">Find…</span>
									<span className="hidden place-content-center lg:grid w-8 h-8">
										<kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border">F</kbd>
									</span>
								</span>
							</button>

							{/* New Investigation Button */}
							<NewInvestigationDialog onInvestigationCreated={handleInvestigationCreated} />

							{/* Feedback Button */}
							<div className="hidden md:block">
								<Button variant="secondary" size="sm">
									Feedback
								</Button>
							</div>
						</ul>
					</div>
				}
			/>

			{/* Sub Header Navigation */}
			<div className="sticky top-[60px] z-40 -mt-px touch-pan-x overflow-x-auto bg-background shadow-[inset_0_-1px] shadow-border scrollbar-none">
				<div className="container mx-auto max-w-7xl flex h-[46px] items-center px-6 [&>*]:shrink-0">
					<a href="/dashboard" className="relative inline-block select-none px-3 py-4 text-sm font-medium text-foreground no-underline transition-colors duration-200">
						Overview
						<div className="absolute bottom-0 left-0 h-[2px] w-full bg-primary"></div>
					</a>
					<a href="/dashboard/recent" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground">
						Recent
					</a>
					<a href="/dashboard/analytics" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground">
						Analytics
					</a>
					<a href="/dashboard/team" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground">
						Team
					</a>
					<a href="/dashboard/settings" className="relative inline-block select-none px-3 py-4 text-sm text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground">
						Settings
					</a>
				</div>
			</div>

			<div className="container mx-auto max-w-7xl px-6 py-8">
				{/* Search and Filter */}
				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<div className="relative flex-1 max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search investigations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Investigations</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="processing">Processing</SelectItem>
							<SelectItem value="completed">Completed</SelectItem>
							<SelectItem value="archived">Archived</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Debug Section - Remove in production */}
				<div className="mb-8 space-y-4">
					<SimpleDebug />
					<DebugApiTest />
				</div>

				{/* Stats Overview */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<StatsCard title="Total Investigations" value={investigations.length} icon={FileText} description="All investigations" trend={{ value: 12, isPositive: true }} />
					<StatsCard title="Processing" value={investigations.filter((i) => i.status === "processing").length} icon={Activity} description="Currently running" trend={{ value: 8, isPositive: true }} />
					<StatsCard title="Completed" value={investigations.filter((i) => i.status === "completed").length} icon={CheckCircle} description="Successfully finished" trend={{ value: 5, isPositive: true }} />
					<StatsCard title="Total Files" value={investigations.reduce((sum, inv) => sum + inv.file_count, 0)} icon={Upload} description="Evidence files analyzed" trend={{ value: 23, isPositive: true }} />
				</div>

				{/* Investigations Grid */}
				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading investigations...</p>
					</div>
				) : filteredInvestigations.length === 0 ? (
					<div className="text-center py-12">
						<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium mb-2">No investigations found</h3>
						<p className="text-muted-foreground mb-6">{searchQuery || statusFilter !== "all" ? "Try adjusting your search criteria or filters." : "Get started by creating your first investigation."}</p>
						<NewInvestigationDialog
							onInvestigationCreated={handleInvestigationCreated}
							trigger={
								<Button className="gap-2">
									<Plus className="h-4 w-4" />
									Create Investigation
								</Button>
							}
						/>
					</div>
				) : (
					<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{filteredInvestigations.map((investigation) => (
							<InvestigationCard key={investigation.id} investigation={investigation} onClick={() => setSelectedInvestigation(investigation)} />
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
