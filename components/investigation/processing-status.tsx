// Component to display real-time AI processing status and results

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock, Brain, Eye, FileText, Users, MapPin, Calendar, Target, AlertTriangle, TrendingUp, Zap, Download, RefreshCw, X } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

export interface ProcessingJob {
	id: string;
	fileId: string;
	fileName: string;
	status: "queued" | "processing" | "completed" | "failed" | "cancelled";
	progress: {
		stage: string;
		progress: number;
		currentOperation?: string;
	};
	analysisTypes: string[];
	createdAt: string;
	startedAt?: string;
	completedAt?: string;
	failedAt?: string;
	errors?: Array<{
		processorType: string;
		error: string;
		timestamp: string;
	}>;
	analysis?: ProcessingAnalysis;
}

export interface ProcessingAnalysis {
	rawResults: any[];
	intelligentSummary: IntelligentSummary;
	executiveSummary: string;
	keywords: string[];
	processedAt: string;
}

export interface IntelligentSummary {
	id: string;
	fileId: string;
	fileName: string;
	fileType: string;
	overallConfidence: number;
	processingTime: number;
	keyFindings: KeyFinding[];
	entities: EnhancedEntity[];
	timeline: TimelineEntry[];
	locations: LocationEntry[];
	relationships: EntityRelationship[];
	insights: Insight[];
	actionableItems: ActionableItem[];
	riskFactors: RiskFactor[];
}

export interface KeyFinding {
	id: string;
	type: string;
	title: string;
	description: string;
	confidence: number;
	importance: "critical" | "high" | "medium" | "low" | "info";
	tags: string[];
}

export interface EnhancedEntity {
	id: string;
	name: string;
	type: string;
	confidence: number;
	significance: string;
	riskLevel: string;
}

export interface TimelineEntry {
	id: string;
	timestamp: string;
	event: string;
	description: string;
	importance: string;
	category: string;
}

export interface LocationEntry {
	id: string;
	name: string;
	type: string;
	significance: string;
}

export interface EntityRelationship {
	id: string;
	entity1Id: string;
	entity2Id: string;
	relationshipType: string;
	description: string;
	confidence: number;
}

export interface Insight {
	id: string;
	type: string;
	title: string;
	description: string;
	confidence: number;
	implications: string[];
	recommendations: string[];
}

export interface ActionableItem {
	id: string;
	type: string;
	title: string;
	description: string;
	priority: string;
	urgency: string;
	effort: string;
}

export interface RiskFactor {
	id: string;
	type: string;
	description: string;
	severity: string;
	probability: number;
	impact: string;
	mitigation: string[];
}

interface ProcessingStatusProps {
	jobId?: string;
	investigationId?: string;
	onJobComplete?: (job: ProcessingJob) => void;
	onJobFailed?: (job: ProcessingJob) => void;
}

export function ProcessingStatus({ jobId, investigationId, onJobComplete, onJobFailed }: ProcessingStatusProps) {
	const [job, setJob] = useState<ProcessingJob | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [autoRefresh, setAutoRefresh] = useState(true);

	// Fetch job status
	const fetchJobStatus = async () => {
		if (!jobId) return;

		try {
			const response = await fetch(`/api/processing/${jobId}`);
			const data = await response.json();

			if (data.success) {
				setJob(data.job);
				setError(null);

				// Call callbacks
				if (data.job.status === "completed" && onJobComplete) {
					onJobComplete(data.job);
				} else if (data.job.status === "failed" && onJobFailed) {
					onJobFailed(data.job);
				}

				// Stop auto-refresh if job is complete or failed
				if (data.job.status === "completed" || data.job.status === "failed") {
					setAutoRefresh(false);
				}
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError("Failed to fetch job status");
			console.error("Error fetching job status:", err);
		} finally {
			setLoading(false);
		}
	};

	// Cancel job
	const cancelJob = async () => {
		if (!jobId) return;

		try {
			const response = await fetch(`/api/processing/cancel/${jobId}`, {
				method: "POST",
			});
			const data = await response.json();

			if (data.success) {
				setJob((prev) => (prev ? { ...prev, status: "cancelled" } : null));
				setAutoRefresh(false);
			} else {
				setError(data.error);
			}
		} catch (err) {
			setError("Failed to cancel job");
			console.error("Error cancelling job:", err);
		}
	};

	// Auto-refresh effect
	useEffect(() => {
		if (!jobId) return;

		fetchJobStatus();

		const interval = autoRefresh ? setInterval(fetchJobStatus, 2000) : null;
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [jobId, autoRefresh]);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "queued":
				return <Clock className="w-4 h-4" />;
			case "processing":
				return <Loader2 className="w-4 h-4 animate-spin" />;
			case "completed":
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case "failed":
				return <XCircle className="w-4 h-4 text-red-500" />;
			case "cancelled":
				return <X className="w-4 h-4 text-gray-500" />;
			default:
				return <AlertCircle className="w-4 h-4" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "queued":
				return "bg-yellow-500";
			case "processing":
				return "bg-blue-500";
			case "completed":
				return "bg-green-500";
			case "failed":
				return "bg-red-500";
			case "cancelled":
				return "bg-gray-500";
			default:
				return "bg-gray-400";
		}
	};

	const getImportanceColor = (importance: string) => {
		switch (importance) {
			case "critical":
				return "bg-red-500";
			case "high":
				return "bg-orange-500";
			case "medium":
				return "bg-yellow-500";
			case "low":
				return "bg-blue-500";
			default:
				return "bg-gray-500";
		}
	};

	if (loading) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="w-6 h-6 animate-spin mr-2" />
					<span>Loading processing status...</span>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<AlertCircle className="w-6 h-6 text-red-500 mr-2" />
					<span className="text-red-500">{error}</span>
					<Button variant="outline" size="sm" className="ml-4" onClick={fetchJobStatus}>
						<RefreshCw className="w-4 h-4 mr-1" />
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!job) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-8">
					<span>No processing job found</span>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Job Status Overview */}
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							{getStatusIcon(job.status)}
							<CardTitle className="text-lg">AI Processing Status</CardTitle>
						</div>
						<div className="flex items-center space-x-2">
							<Badge variant="outline" className={getStatusColor(job.status)}>
								{job.status.toUpperCase()}
							</Badge>
							{(job.status === "queued" || job.status === "processing") && (
								<Button variant="outline" size="sm" onClick={cancelJob}>
									<X className="w-4 h-4 mr-1" />
									Cancel
								</Button>
							)}
						</div>
					</div>
					<CardDescription>
						Processing {job.fileName} • {job.analysisTypes.join(", ")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Progress Bar */}
					{(job.status === "processing" || job.status === "queued") && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span>{job.progress.currentOperation || job.progress.stage}</span>
								<span>{Math.round(job.progress.progress)}%</span>
							</div>
							<Progress value={job.progress.progress} className="w-full" />
						</div>
					)}

					{/* Timing Information */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Created:</span>
							<div>{formatTimestamp(job.createdAt)}</div>
						</div>
						{job.startedAt && (
							<div>
								<span className="text-muted-foreground">Started:</span>
								<div>{formatTimestamp(job.startedAt)}</div>
							</div>
						)}
						{job.completedAt && (
							<div>
								<span className="text-muted-foreground">Completed:</span>
								<div>{formatTimestamp(job.completedAt)}</div>
							</div>
						)}
						{job.failedAt && (
							<div>
								<span className="text-muted-foreground">Failed:</span>
								<div>{formatTimestamp(job.failedAt)}</div>
							</div>
						)}
					</div>

					{/* Errors */}
					{job.errors && job.errors.length > 0 && (
						<div className="space-y-2">
							<h4 className="font-medium text-red-500">Processing Errors:</h4>
							{job.errors.map((error, index) => (
								<div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
									<div className="font-medium">{error.processorType}</div>
									<div className="text-sm text-red-600">{error.error}</div>
									<div className="text-xs text-muted-foreground">{formatTimestamp(error.timestamp)}</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Analysis Results - Only show if completed */}
			{job.status === "completed" && job.analysis && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<Brain className="w-5 h-5 mr-2" />
							Analysis Results
						</CardTitle>
						<CardDescription>AI-powered insights and findings from {job.fileName}</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs defaultValue="summary" className="w-full">
							<TabsList className="grid w-full grid-cols-6">
								<TabsTrigger value="summary">Summary</TabsTrigger>
								<TabsTrigger value="findings">
									Findings
									{job.analysis.intelligentSummary.keyFindings.length > 0 && (
										<Badge variant="secondary" className="ml-1">
											{job.analysis.intelligentSummary.keyFindings.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="entities">
									Entities
									{job.analysis.intelligentSummary.entities.length > 0 && (
										<Badge variant="secondary" className="ml-1">
											{job.analysis.intelligentSummary.entities.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="timeline">
									Timeline
									{job.analysis.intelligentSummary.timeline.length > 0 && (
										<Badge variant="secondary" className="ml-1">
											{job.analysis.intelligentSummary.timeline.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="insights">
									Insights
									{job.analysis.intelligentSummary.insights.length > 0 && (
										<Badge variant="secondary" className="ml-1">
											{job.analysis.intelligentSummary.insights.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="actions">
									Actions
									{job.analysis.intelligentSummary.actionableItems.length > 0 && (
										<Badge variant="secondary" className="ml-1">
											{job.analysis.intelligentSummary.actionableItems.length}
										</Badge>
									)}
								</TabsTrigger>
							</TabsList>

							{/* Executive Summary */}
							<TabsContent value="summary" className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<TrendingUp className="w-4 h-4 text-blue-500" />
												<span className="text-sm font-medium">Confidence</span>
											</div>
											<div className="text-2xl font-bold">{Math.round(job.analysis.intelligentSummary.overallConfidence * 100)}%</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<Clock className="w-4 h-4 text-green-500" />
												<span className="text-sm font-medium">Processing Time</span>
											</div>
											<div className="text-2xl font-bold">{Math.round(job.analysis.intelligentSummary.processingTime / 1000)}s</div>
										</CardContent>
									</Card>
									<Card>
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<Target className="w-4 h-4 text-purple-500" />
												<span className="text-sm font-medium">Key Findings</span>
											</div>
											<div className="text-2xl font-bold">{job.analysis.intelligentSummary.keyFindings.length}</div>
										</CardContent>
									</Card>
								</div>

								<div className="p-4 bg-gray-50 rounded-md">
									<h4 className="font-medium mb-2">Executive Summary</h4>
									<div className="text-sm whitespace-pre-wrap">{job.analysis.executiveSummary}</div>
								</div>

								{job.analysis.keywords.length > 0 && (
									<div>
										<h4 className="font-medium mb-2">Key Terms</h4>
										<div className="flex flex-wrap gap-1">
											{job.analysis.keywords.slice(0, 20).map((keyword) => (
												<Badge key={keyword} variant="outline" className="text-xs">
													{keyword}
												</Badge>
											))}
										</div>
									</div>
								)}
							</TabsContent>

							{/* Key Findings */}
							<TabsContent value="findings" className="space-y-4">
								<ScrollArea className="h-96">
									{job.analysis.intelligentSummary.keyFindings.map((finding) => (
										<Card key={finding.id} className="mb-3">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center space-x-2">
														<Badge className={getImportanceColor(finding.importance)}>{finding.importance}</Badge>
														<Badge variant="outline">{finding.type}</Badge>
													</div>
													<Badge variant="secondary">{Math.round(finding.confidence * 100)}% confidence</Badge>
												</div>
												<h4 className="font-medium mb-1">{finding.title}</h4>
												<p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
												<div className="flex flex-wrap gap-1">
													{finding.tags.map((tag) => (
														<Badge key={tag} variant="outline" className="text-xs">
															{tag}
														</Badge>
													))}
												</div>
											</CardContent>
										</Card>
									))}
								</ScrollArea>
							</TabsContent>

							{/* Entities */}
							<TabsContent value="entities" className="space-y-4">
								<ScrollArea className="h-96">
									{job.analysis.intelligentSummary.entities.map((entity) => (
										<Card key={entity.id} className="mb-3">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center space-x-2">
														<Users className="w-4 h-4" />
														<span className="font-medium">{entity.name}</span>
													</div>
													<div className="flex space-x-1">
														<Badge variant="outline">{entity.type}</Badge>
														<Badge variant="secondary">{Math.round(entity.confidence * 100)}%</Badge>
													</div>
												</div>
												<div className="flex items-center space-x-4 text-sm text-muted-foreground">
													<span>Risk: {entity.riskLevel}</span>
													<span>Significance: {entity.significance}</span>
												</div>
											</CardContent>
										</Card>
									))}
								</ScrollArea>
							</TabsContent>

							{/* Timeline */}
							<TabsContent value="timeline" className="space-y-4">
								<ScrollArea className="h-96">
									{job.analysis.intelligentSummary.timeline.map((event) => (
										<Card key={event.id} className="mb-3">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center space-x-2">
														<Calendar className="w-4 h-4" />
														<span className="font-medium">{event.event}</span>
													</div>
													<div className="flex space-x-1">
														<Badge variant="outline">{event.category}</Badge>
														<Badge className={getImportanceColor(event.importance)}>{event.importance}</Badge>
													</div>
												</div>
												<p className="text-sm text-muted-foreground mb-1">{event.description}</p>
												<div className="text-xs text-muted-foreground">{formatTimestamp(event.timestamp)}</div>
											</CardContent>
										</Card>
									))}
								</ScrollArea>
							</TabsContent>

							{/* Insights */}
							<TabsContent value="insights" className="space-y-4">
								<ScrollArea className="h-96">
									{job.analysis.intelligentSummary.insights.map((insight) => (
										<Card key={insight.id} className="mb-3">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center space-x-2">
														<Eye className="w-4 h-4" />
														<span className="font-medium">{insight.title}</span>
													</div>
													<div className="flex space-x-1">
														<Badge variant="outline">{insight.type}</Badge>
														<Badge variant="secondary">{Math.round(insight.confidence * 100)}%</Badge>
													</div>
												</div>
												<p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

												{insight.implications.length > 0 && (
													<div className="mb-2">
														<h5 className="text-sm font-medium mb-1">Implications:</h5>
														<ul className="text-xs text-muted-foreground list-disc list-inside">
															{insight.implications.map((implication, index) => (
																<li key={index}>{implication}</li>
															))}
														</ul>
													</div>
												)}

												{insight.recommendations.length > 0 && (
													<div>
														<h5 className="text-sm font-medium mb-1">Recommendations:</h5>
														<ul className="text-xs text-muted-foreground list-disc list-inside">
															{insight.recommendations.map((recommendation, index) => (
																<li key={index}>{recommendation}</li>
															))}
														</ul>
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</ScrollArea>
							</TabsContent>

							{/* Actionable Items */}
							<TabsContent value="actions" className="space-y-4">
								<ScrollArea className="h-96">
									{job.analysis.intelligentSummary.actionableItems.map((action) => (
										<Card key={action.id} className="mb-3">
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center space-x-2">
														<Zap className="w-4 h-4" />
														<span className="font-medium">{action.title}</span>
													</div>
													<div className="flex space-x-1">
														<Badge variant="outline">{action.type}</Badge>
														<Badge className={getImportanceColor(action.priority)}>{action.priority}</Badge>
														<Badge variant="secondary">{action.urgency}</Badge>
													</div>
												</div>
												<p className="text-sm text-muted-foreground mb-2">{action.description}</p>
												<div className="flex items-center space-x-4 text-xs text-muted-foreground">
													<span>Effort: {action.effort}</span>
												</div>
											</CardContent>
										</Card>
									))}
								</ScrollArea>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
