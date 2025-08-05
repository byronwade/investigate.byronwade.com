"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/ui/header";
import { Search, Brain, Shield, Clock, Users, Zap, Eye, FileText, MapPin, Network, ChevronRight, Play, Activity, TrendingUp, Database, Scan } from "lucide-react";

export default function HomePage() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "InvestigatAI",
		description: "AI-powered digital investigation platform for law enforcement and security professionals. Advanced evidence analysis, timeline generation, and investigation management.",
		applicationCategory: "Security Software",
		operatingSystem: "Web",
		offers: {
			"@type": "Offer",
			priceCurrency: "USD",
			description: "Professional digital investigation platform with AI analysis capabilities",
		},
		provider: {
			"@type": "Organization",
			name: "InvestigatAI",
			description: "Leading provider of AI-powered investigation tools",
		},
		featureList: ["AI Evidence Analysis", "Facial Recognition", "OCR Text Extraction", "Timeline Generation", "Relationship Mapping", "Mass Data Processing", "Secure Evidence Storage", "Investigation Reports"],
		audience: {
			"@type": "Audience",
			audienceType: "Law Enforcement, Private Investigators, Security Professionals",
		},
	};

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<div className="min-h-screen bg-background">
				{/* Navigation */}
				<Header variant="home" transparent />

				{/* Hero Section */}
				<section className="relative py-24">
					<div className="container mx-auto max-w-7xl px-6 text-center">
						<Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
							<Zap className="h-3 w-3 mr-1" />
							AI-Powered Investigation Platform
						</Badge>
						<h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
							Uncover Truth with
							<br />
							<span className="text-primary">Artificial Intelligence</span>
						</h1>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">InvestigatAI transforms digital investigation through advanced AI analysis. Process massive evidence datasets, extract insights, and build comprehensive investigation portfolios with unprecedented speed and accuracy.</p>
						<div className="flex items-center justify-center gap-4">
							<Link href="/auth/register">
								<Button size="lg" className="h-12 px-8">
									Start Investigation
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</Link>
							<Button variant="outline" size="lg" className="h-12 px-8">
								<Play className="h-4 w-4 mr-2" />
								Watch Demo
							</Button>
						</div>
					</div>
				</section>

				{/* Core Capabilities */}
				<section className="py-20 bg-muted/30">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold mb-4">Comprehensive Investigation Suite</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Everything you need to conduct thorough digital investigations, powered by cutting-edge AI technology.</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<CapabilityCard icon={Brain} title="AI Evidence Analysis" description="Advanced OCR, facial recognition, object detection, and entity extraction across all media types" features={["Text Extraction", "Face Recognition", "Object Detection", "Metadata Analysis"]} />
							<CapabilityCard icon={Clock} title="Timeline Generation" description="Automatically create chronological sequences of events from evidence timestamps and metadata" features={["Event Sequencing", "Timeline Visualization", "Pattern Recognition", "Gap Analysis"]} />
							<CapabilityCard icon={Network} title="Relationship Mapping" description="Build connection networks between people, places, and objects across all evidence" features={["Entity Linking", "Network Analysis", "Pattern Detection", "Cross-referencing"]} />
							<CapabilityCard icon={Database} title="Mass Data Processing" description="Handle terabytes of evidence data with parallel AI processing and intelligent categorization" features={["Bulk Processing", "Smart Categorization", "Duplicate Detection", "Content Similarity"]} />
							<CapabilityCard icon={Shield} title="Secure & Compliant" description="Enterprise-grade security with encryption, audit trails, and law enforcement compliance" features={["End-to-end Encryption", "Audit Logging", "Access Controls", "Evidence Chain"]} />
							<CapabilityCard icon={FileText} title="Investigation Reports" description="Generate comprehensive reports with visualizations, timelines, and AI-extracted insights" features={["Automated Reports", "Visual Analytics", "Export Formats", "Collaboration"]} />
						</div>
					</div>
				</section>

				{/* AI Processing Pipeline */}
				<section className="py-20">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="text-center mb-16">
							<h2 className="text-4xl font-bold mb-4">Intelligent Processing Pipeline</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our AI-driven pipeline automatically processes and analyzes evidence to extract actionable insights.</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
							<ProcessStep step="1" icon={Database} title="Evidence Ingestion" description="Secure upload and validation of files with metadata extraction and virus scanning" />
							<ProcessStep step="2" icon={Scan} title="AI Analysis" description="OCR, facial recognition, object detection, and content extraction across all media" />
							<ProcessStep step="3" icon={Network} title="Entity Mapping" description="Identify and link people, places, objects, and events across all evidence" />
							<ProcessStep step="4" icon={Activity} title="Insights & Reports" description="Generate timelines, relationship maps, and comprehensive investigation reports" />
						</div>
					</div>
				</section>

				{/* Statistics */}
				<section className="py-20 bg-muted/30">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
							<StatCard number="99.9%" label="Analysis Accuracy" icon={TrendingUp} />
							<StatCard number="50TB+" label="Evidence Processed" icon={Database} />
							<StatCard number="10x" label="Faster Than Manual" icon={Zap} />
							<StatCard number="24/7" label="Processing Available" icon={Clock} />
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="py-20">
					<div className="container mx-auto max-w-7xl px-6 text-center">
						<h2 className="text-4xl font-bold mb-6">Ready to Transform Your Investigations?</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Join law enforcement agencies, private investigators, and security professionals using InvestigatAI to solve cases faster and more effectively.</p>
						<div className="flex items-center justify-center gap-4">
							<Link href="/auth/register">
								<Button size="lg" className="h-12 px-8">
									Start Free Trial
									<ChevronRight className="h-4 w-4 ml-2" />
								</Button>
							</Link>
							<Link href="/techniques">
								<Button variant="outline" size="lg" className="h-12 px-8">
									Explore Techniques
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Footer */}
				<footer className="border-t border-border/40 py-12">
					<div className="container mx-auto max-w-7xl px-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
										<Search className="h-4 w-4 text-primary-foreground" />
									</div>
									<span className="font-bold">InvestigatAI</span>
								</div>
								<p className="text-sm text-muted-foreground">AI-powered digital investigation platform for law enforcement and security professionals.</p>
							</div>
							<div>
								<h4 className="font-semibold mb-3">Platform</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<Link href="/dashboard" className="block hover:text-foreground transition-colors">
										Dashboard
									</Link>
									<Link href="/techniques" className="block hover:text-foreground transition-colors">
										Techniques
									</Link>
									<Link href="/forensics" className="block hover:text-foreground transition-colors">
										Forensics
									</Link>
									<Link href="/intelligence" className="block hover:text-foreground transition-colors">
										Intelligence
									</Link>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-3">Resources</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<a href="#" className="block hover:text-foreground transition-colors">
										Documentation
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										API Reference
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										Case Studies
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										Training
									</a>
								</div>
							</div>
							<div>
								<h4 className="font-semibold mb-3">Legal</h4>
								<div className="space-y-2 text-sm text-muted-foreground">
									<a href="#" className="block hover:text-foreground transition-colors">
										Privacy Policy
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										Terms of Service
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										Compliance
									</a>
									<a href="#" className="block hover:text-foreground transition-colors">
										Security
									</a>
								</div>
							</div>
						</div>
						<div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
							<p>&copy; 2024 InvestigatAI. All rights reserved. | Designed for legitimate investigative purposes only.</p>
						</div>
					</div>
				</footer>
			</div>
		</>
	);
}

function CapabilityCard({ icon: Icon, title, description, features }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; features: string[] }) {
	return (
		<Card className="h-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 border-border/50">
			<CardContent className="p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
						<Icon className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-lg">{title}</h3>
					</div>
				</div>
				<p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
				<div className="flex flex-wrap gap-2">
					{features.map((feature) => (
						<Badge key={feature} variant="secondary" className="text-xs">
							{feature}
						</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

function ProcessStep({ step, icon: Icon, title, description }: { step: string; icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
	return (
		<div className="text-center space-y-4">
			<div className="relative">
				<div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
					<Icon className="h-8 w-8 text-primary" />
				</div>
				<div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{step}</div>
			</div>
			<div>
				<h3 className="font-semibold text-lg mb-2">{title}</h3>
				<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
			</div>
		</div>
	);
}

function StatCard({ number, label, icon: Icon }: { number: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
	return (
		<div className="text-center space-y-3">
			<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
				<Icon className="h-6 w-6 text-primary" />
			</div>
			<div>
				<div className="text-3xl font-bold">{number}</div>
				<div className="text-muted-foreground text-sm">{label}</div>
			</div>
		</div>
	);
}
