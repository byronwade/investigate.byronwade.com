// AI Analysis Dashboard component for displaying aggregated insights

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Brain, Users, MapPin, Calendar, Eye, AlertTriangle, TrendingUp, Target, Zap, Search, Filter, Download, Share, Settings, BarChart3, PieChart, Activity, Clock, CheckCircle, XCircle, Star, Tag } from "lucide-react";
import { ProcessingAnalysis, IntelligentSummary } from "./processing-status";

interface AIAnalysisDashboardProps {
	investigationId: string;
	analyses: ProcessingAnalysis[];
}

interface AggregatedInsights {
	totalFiles: number;
	processedFiles: number;
	totalEntities: number;
	totalFindings: number;
	criticalFindings: number;
	highRiskFactors: number;
	averageConfidence: number;
	topKeywords: Array<{ keyword: string; frequency: number }>;
	entityBreakdown: Array<{ type: string; count: number }>;
	findingTypes: Array<{ type: string; count: number }>;
	timelineEvents: number;
	locations: number;
	relationships: number;
	actionableItems: number;
}

export function AIAnalysisDashboard({ investigationId, analyses }: AIAnalysisDashboardProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [aggregatedData, setAggregatedData] = useState<AggregatedInsights | null>(null);

	// Calculate aggregated insights from all analyses
	useEffect(() => {
		if (analyses.length === 0) {
			setAggregatedData(null);
			return;
		}

		const insights: AggregatedInsights = {
			totalFiles: analyses.length,
			processedFiles: analyses.filter((a) => a.intelligentSummary).length,
			totalEntities: 0,
			totalFindings: 0,
			criticalFindings: 0,
			highRiskFactors: 0,
			averageConfidence: 0,
			topKeywords: [],
			entityBreakdown: [],
			findingTypes: [],
			timelineEvents: 0,
			locations: 0,
			relationships: 0,
			actionableItems: 0,
		};

		const keywordFreq: Record<string, number> = {};
		const entityTypes: Record<string, number> = {};
		const findingTypes: Record<string, number> = {};
		let totalConfidence = 0;

		analyses.forEach((analysis) => {
			const summary = analysis.intelligentSummary;
			if (!summary) return;

			// Aggregate basic counts
			insights.totalEntities += summary.entities.length;
			insights.totalFindings += summary.keyFindings.length;
			insights.timelineEvents += summary.timeline.length;
			insights.locations += summary.locations.length;
			insights.relationships += summary.relationships.length;
			insights.actionableItems += summary.actionableItems.length;

			// Count critical findings
			insights.criticalFindings += summary.keyFindings.filter((f) => f.importance === "critical").length;

			// Count high risk factors
			insights.highRiskFactors += summary.riskFactors.filter((r) => r.severity === "high" || r.severity === "critical").length;

			// Aggregate confidence
			totalConfidence += summary.overallConfidence;

			// Aggregate keywords
			analysis.keywords.forEach((keyword) => {
				keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
			});

			// Aggregate entity types
			summary.entities.forEach((entity) => {
				entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1;
			});

			// Aggregate finding types
			summary.keyFindings.forEach((finding) => {
				findingTypes[finding.type] = (findingTypes[finding.type] || 0) + 1;
			});
		});

		// Calculate averages
		insights.averageConfidence = totalConfidence / analyses.length;

		// Sort and limit top keywords
		insights.topKeywords = Object.entries(keywordFreq)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 20)
			.map(([keyword, frequency]) => ({ keyword, frequency }));

		// Convert entity types to array
		insights.entityBreakdown = Object.entries(entityTypes)
			.sort(([, a], [, b]) => b - a)
			.map(([type, count]) => ({ type, count }));

		// Convert finding types to array
		insights.findingTypes = Object.entries(findingTypes)
			.sort(([, a], [, b]) => b - a)
			.map(([type, count]) => ({ type, count }));

		setAggregatedData(insights);
	}, [analyses]);

	// Filter analyses based on search and filter
	const filteredAnalyses = analyses.filter((analysis) => {
		if (!analysis.intelligentSummary) return false;

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			const summary = analysis.intelligentSummary;

			const matchesKeywords = analysis.keywords.some((k) => k.toLowerCase().includes(query));
			const matchesFindings = summary.keyFindings.some((f) => f.title.toLowerCase().includes(query) || f.description.toLowerCase().includes(query) || f.tags.some((tag) => tag.toLowerCase().includes(query)));
			const matchesEntities = summary.entities.some((e) => e.name.toLowerCase().includes(query) || e.type.toLowerCase().includes(query));

			if (!matchesKeywords && !matchesFindings && !matchesEntities) {
				return false;
			}
		}

		// Type filter
		if (selectedFilter !== "all") {
			if (selectedFilter === "critical" && !analysis.intelligentSummary.keyFindings.some((f) => f.importance === "critical")) {
				return false;
			}
			if (selectedFilter === "high-risk" && !analysis.intelligentSummary.riskFactors.some((r) => r.severity === "high" || r.severity === "critical")) {
				return false;
			}
			if (selectedFilter === "low-confidence" && analysis.intelligentSummary.overallConfidence >= 0.7) {
				return false;
			}
		}

		return true;
	});

	if (!aggregatedData || analyses.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<div className="text-center space-y-2">
						<Brain className="w-12 h-12 mx-auto text-muted-foreground" />
						<h3 className="text-lg font-medium">No Analysis Data</h3>
						<p className="text-sm text-muted-foreground">Complete AI processing to see insights and analytics</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Overview Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Brain className="w-4 h-4 text-blue-500" />
							<span className="text-sm font-medium">Files</span>
						</div>
						<div className="text-2xl font-bold">
							{aggregatedData.processedFiles}/{aggregatedData.totalFiles}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Target className="w-4 h-4 text-green-500" />
							<span className="text-sm font-medium">Findings</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.totalFindings}</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<AlertTriangle className="w-4 h-4 text-red-500" />
							<span className="text-sm font-medium">Critical</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.criticalFindings}</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Users className="w-4 h-4 text-purple-500" />
							<span className="text-sm font-medium">Entities</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.totalEntities}</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Calendar className="w-4 h-4 text-orange-500" />
							<span className="text-sm font-medium">Timeline</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.timelineEvents}</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<MapPin className="w-4 h-4 text-indigo-500" />
							<span className="text-sm font-medium">Locations</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.locations}</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<TrendingUp className="w-4 h-4 text-cyan-500" />
							<span className="text-sm font-medium">Confidence</span>
						</div>
						<div className="text-2xl font-bold">{Math.round(aggregatedData.averageConfidence * 100)}%</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center space-x-2">
							<Zap className="w-4 h-4 text-yellow-500" />
							<span className="text-sm font-medium">Actions</span>
						</div>
						<div className="text-2xl font-bold">{aggregatedData.actionableItems}</div>
					</CardContent>
				</Card>
			</div>

			{/* Search and Filter */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input placeholder="Search findings, entities, keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-80" />
					</div>
					<div className="flex items-center space-x-2">
						<Filter className="w-4 h-4 text-muted-foreground" />
						<Button variant={selectedFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("all")}>
							All
						</Button>
						<Button variant={selectedFilter === "critical" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("critical")}>
							Critical
						</Button>
						<Button variant={selectedFilter === "high-risk" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("high-risk")}>
							High Risk
						</Button>
						<Button variant={selectedFilter === "low-confidence" ? "default" : "outline"} size="sm" onClick={() => setSelectedFilter("low-confidence")}>
							Low Confidence
						</Button>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm">
						<Download className="w-4 h-4 mr-1" />
						Export
					</Button>
					<Button variant="outline" size="sm">
						<Share className="w-4 h-4 mr-1" />
						Share
					</Button>
				</div>
			</div>

			{/* Main Content Tabs */}
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="grid w-full grid-cols-6">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="findings">Findings ({filteredAnalyses.reduce((sum, a) => sum + (a.intelligentSummary?.keyFindings.length || 0), 0)})</TabsTrigger>
					<TabsTrigger value="entities">Entities ({filteredAnalyses.reduce((sum, a) => sum + (a.intelligentSummary?.entities.length || 0), 0)})</TabsTrigger>
					<TabsTrigger value="insights">Insights ({filteredAnalyses.reduce((sum, a) => sum + (a.intelligentSummary?.insights.length || 0), 0)})</TabsTrigger>
					<TabsTrigger value="risks">Risks ({filteredAnalyses.reduce((sum, a) => sum + (a.intelligentSummary?.riskFactors.length || 0), 0)})</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Top Keywords */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Tag className="w-4 h-4 mr-2" />
									Top Keywords
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{aggregatedData.topKeywords.slice(0, 10).map(({ keyword, frequency }) => (
										<div key={keyword} className="flex items-center justify-between">
											<span className="text-sm">{keyword}</span>
											<Badge variant="secondary">{frequency}</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Entity Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Users className="w-4 h-4 mr-2" />
									Entity Types
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{aggregatedData.entityBreakdown.slice(0, 8).map(({ type, count }) => (
										<div key={type} className="flex items-center justify-between">
											<span className="text-sm capitalize">{type.replace("_", " ")}</span>
											<Badge variant="outline">{count}</Badge>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Finding Types Distribution */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<BarChart3 className="w-4 h-4 mr-2" />
								Finding Types Distribution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{aggregatedData.findingTypes.map(({ type, count }) => (
									<div key={type} className="text-center">
										<div className="text-2xl font-bold">{count}</div>
										<div className="text-sm text-muted-foreground capitalize">{type.replace("_", " ")}</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Other tabs would continue with detailed listings of findings, entities, etc. */}
				{/* For brevity, I'll just add the key structure for the remaining tabs */}

				<TabsContent value="findings" className="space-y-4">
					<ScrollArea className="h-96">
						{filteredAnalyses.map((analysis, analysisIndex) =>
							analysis.intelligentSummary.keyFindings.map((finding) => (
								<Card key={`${analysisIndex}-${finding.id}`} className="mb-3">
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-2">
											<div className="flex items-center space-x-2">
												<Badge className={finding.importance === "critical" ? "bg-red-500" : finding.importance === "high" ? "bg-orange-500" : finding.importance === "medium" ? "bg-yellow-500" : "bg-blue-500"}>{finding.importance}</Badge>
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
							))
						)}
					</ScrollArea>
				</TabsContent>

				{/* Similar structure for other tabs... */}
			</Tabs>
		</div>
	);
}
