// AI Processing Pipeline Orchestrator - coordinates multiple AI processors

import { BaseAIProcessor, ProcessingContext, ProcessingOptions, ProcessingPriority, ProcessingQueue, QueueStatus, ProcessingProgress, ProcessingStage } from "../processors/base-processor";
import { ImageProcessor } from "../processors/image-processor";
import { VideoProcessor } from "../processors/video-processor";
import { AudioProcessor } from "../processors/audio-processor";
import { DocumentProcessor } from "../processors/document-processor";
import { AIAnalysisType, ProcessingStatus } from "../../shared/types/common";
import { AIProcessingError, ConcurrencyError } from "../../shared/errors/domain-errors";
import { AnalysisResult, mergeAnalysisResults, calculateOverallConfidence } from "../models/ai-analysis-result";
import { generateId } from "../../shared/utils/generators";

export interface ProcessingJob {
	id: string;
	fileId: string;
	investigationId: string;
	context: ProcessingContext;
	options: ProcessingOptions;
	analysisTypes: AIAnalysisType[];
	status: ProcessingJobStatus;
	priority: ProcessingPriority;
	createdAt: Date;
	startedAt?: Date;
	completedAt?: Date;
	failedAt?: Date;
	results: AnalysisResult[];
	errors: ProcessingError[];
	progress: ProcessingProgress;
	retryCount: number;
	maxRetries: number;
	metadata?: Record<string, any>;
}

export enum ProcessingJobStatus {
	QUEUED = "queued",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
	CANCELLED = "cancelled",
	RETRYING = "retrying",
}

export interface ProcessingError {
	processorType: AIAnalysisType;
	error: string;
	timestamp: Date;
	retryable: boolean;
}

export interface ProcessingPlan {
	fileId: string;
	mimeType: string;
	analysisTypes: AIAnalysisType[];
	processors: ProcessorAssignment[];
	estimatedTime: number;
	dependencies: ProcessingDependency[];
}

export interface ProcessorAssignment {
	processor: BaseAIProcessor;
	analysisType: AIAnalysisType;
	order: number;
	canRunInParallel: boolean;
	estimatedTime: number;
	dependencies: AIAnalysisType[];
}

export interface ProcessingDependency {
	dependentType: AIAnalysisType;
	requiredType: AIAnalysisType;
	reason: string;
}

export interface OrchestratorConfig {
	maxConcurrentJobs: number;
	maxRetries: number;
	retryBackoffMs: number;
	queueCheckIntervalMs: number;
	enableParallelProcessing: boolean;
	processingTimeoutMs: number;
	enableResultCaching: boolean;
	priorityWeights: Record<ProcessingPriority, number>;
}

export interface ProcessingMetrics {
	totalJobs: number;
	completedJobs: number;
	failedJobs: number;
	averageProcessingTime: number;
	successRate: number;
	processorPerformance: Record<AIAnalysisType, ProcessorMetrics>;
	queueMetrics: QueueMetrics;
}

export interface ProcessorMetrics {
	totalProcessed: number;
	successCount: number;
	failureCount: number;
	averageProcessingTime: number;
	averageConfidence: number;
	lastProcessedAt?: Date;
}

export interface QueueMetrics {
	queuedJobs: number;
	processingJobs: number;
	averageWaitTime: number;
	throughput: number; // jobs per hour
}

export class ProcessingOrchestrator {
	private processors: Map<AIAnalysisType, BaseAIProcessor>;
	private processingQueue: ProcessingJob[];
	private activeJobs: Map<string, ProcessingJob>;
	private completedJobs: Map<string, ProcessingJob>;
	private config: OrchestratorConfig;
	private isRunning: boolean;
	private metrics: ProcessingMetrics;
	private resultCache: Map<string, AnalysisResult[]>;

	constructor(config: Partial<OrchestratorConfig> = {}) {
		this.config = {
			maxConcurrentJobs: 5,
			maxRetries: 3,
			retryBackoffMs: 5000,
			queueCheckIntervalMs: 1000,
			enableParallelProcessing: true,
			processingTimeoutMs: 300000, // 5 minutes
			enableResultCaching: true,
			priorityWeights: {
				[ProcessingPriority.LOW]: 1,
				[ProcessingPriority.MEDIUM]: 2,
				[ProcessingPriority.HIGH]: 3,
				[ProcessingPriority.CRITICAL]: 5,
			},
			...config,
		};

		this.processors = new Map();
		this.processingQueue = [];
		this.activeJobs = new Map();
		this.completedJobs = new Map();
		this.isRunning = false;
		this.resultCache = new Map();
		this.metrics = this.initializeMetrics();

		this.initializeProcessors();
	}

	/**
	 * Start the processing orchestrator
	 */
	async start(): Promise<void> {
		if (this.isRunning) {
			throw new Error("Orchestrator is already running");
		}

		this.isRunning = true;
		console.log("AI Processing Orchestrator started");

		// Start the main processing loop
		this.processQueue();
	}

	/**
	 * Stop the processing orchestrator
	 */
	async stop(): Promise<void> {
		this.isRunning = false;

		// Wait for active jobs to complete or timeout
		const activeJobPromises = Array.from(this.activeJobs.values()).map(
			(job) => this.waitForJobCompletion(job.id, 30000) // 30 second timeout
		);

		await Promise.allSettled(activeJobPromises);
		console.log("AI Processing Orchestrator stopped");
	}

	/**
	 * Queue a file for AI processing
	 */
	async queueProcessing(context: ProcessingContext, options: ProcessingOptions = {}, customAnalysisTypes?: AIAnalysisType[]): Promise<string> {
		// Create processing plan
		const plan = await this.createProcessingPlan(context, customAnalysisTypes);

		// Check cache if enabled
		if (this.config.enableResultCaching) {
			const cacheKey = this.generateCacheKey(context, plan.analysisTypes);
			if (this.resultCache.has(cacheKey)) {
				console.log(`Cache hit for file ${context.fileId}`);
				// Return cached results immediately
				return this.createCompletedJob(context, this.resultCache.get(cacheKey)!);
			}
		}

		// Create processing job
		const job: ProcessingJob = {
			id: generateId(),
			fileId: context.fileId,
			investigationId: context.investigationId,
			context,
			options,
			analysisTypes: plan.analysisTypes,
			status: ProcessingJobStatus.QUEUED,
			priority: context.priority,
			createdAt: new Date(),
			results: [],
			errors: [],
			progress: {
				fileId: context.fileId,
				stage: ProcessingStage.QUEUED,
				progress: 0,
			},
			retryCount: 0,
			maxRetries: this.config.maxRetries,
			metadata: {
				estimatedTime: plan.estimatedTime,
				processorCount: plan.processors.length,
			},
		};

		// Add to queue
		this.addToQueue(job);

		console.log(`Queued processing job ${job.id} for file ${context.fileId} with ${plan.analysisTypes.length} analysis types`);

		return job.id;
	}

	/**
	 * Get job status and progress
	 */
	getJobStatus(jobId: string): ProcessingJob | null {
		return this.activeJobs.get(jobId) || this.completedJobs.get(jobId) || this.processingQueue.find((job) => job.id === jobId) || null;
	}

	/**
	 * Cancel a processing job
	 */
	async cancelJob(jobId: string): Promise<boolean> {
		const job = this.getJobStatus(jobId);
		if (!job) return false;

		if (job.status === ProcessingJobStatus.QUEUED) {
			// Remove from queue
			const queueIndex = this.processingQueue.findIndex((j) => j.id === jobId);
			if (queueIndex >= 0) {
				this.processingQueue.splice(queueIndex, 1);
				job.status = ProcessingJobStatus.CANCELLED;
				return true;
			}
		} else if (job.status === ProcessingJobStatus.PROCESSING) {
			// Mark for cancellation - actual cancellation depends on processor implementation
			job.status = ProcessingJobStatus.CANCELLED;
			this.activeJobs.delete(jobId);
			return true;
		}

		return false;
	}

	/**
	 * Get orchestrator metrics
	 */
	getMetrics(): ProcessingMetrics {
		this.updateMetrics();
		return { ...this.metrics };
	}

	/**
	 * Get queue status
	 */
	getQueueStatus(): QueueStatus {
		return {
			pending: this.processingQueue.length,
			processing: this.activeJobs.size,
			completed: this.completedJobs.size,
			failed: Array.from(this.completedJobs.values()).filter((job) => job.status === ProcessingJobStatus.FAILED).length,
			totalCapacity: this.config.maxConcurrentJobs,
			estimatedWaitTime: this.calculateEstimatedWaitTime(),
		};
	}

	// Private implementation methods
	private initializeProcessors(): void {
		this.processors.set(AIAnalysisType.OBJECT_DETECTION, new ImageProcessor());
		this.processors.set(AIAnalysisType.OCR, new ImageProcessor());
		this.processors.set(AIAnalysisType.FACE_RECOGNITION, new ImageProcessor());
		this.processors.set(AIAnalysisType.VIDEO_ANALYSIS, new VideoProcessor());
		this.processors.set(AIAnalysisType.AUDIO_TRANSCRIPTION, new AudioProcessor());
		this.processors.set(AIAnalysisType.METADATA_EXTRACTION, new DocumentProcessor());
	}

	private async createProcessingPlan(context: ProcessingContext, customAnalysisTypes?: AIAnalysisType[]): Promise<ProcessingPlan> {
		const analysisTypes = customAnalysisTypes || this.determineAnalysisTypes(context.mimeType);
		const processors: ProcessorAssignment[] = [];
		const dependencies: ProcessingDependency[] = [];
		let totalEstimatedTime = 0;

		for (const analysisType of analysisTypes) {
			const processor = this.processors.get(analysisType);
			if (processor && processor.canProcess(context)) {
				const estimatedTime = processor.estimateProcessingTime(context);

				processors.push({
					processor,
					analysisType,
					order: this.getProcessingOrder(analysisType),
					canRunInParallel: this.canRunInParallel(analysisType, analysisTypes),
					estimatedTime,
					dependencies: this.getProcessingDependencies(analysisType),
				});

				totalEstimatedTime += estimatedTime;
			}
		}

		// Adjust for parallel processing
		if (this.config.enableParallelProcessing && processors.length > 1) {
			const parallelGroups = this.groupProcessorsForParallelExecution(processors);
			totalEstimatedTime = Math.max(...parallelGroups.map((group) => group.reduce((sum, p) => sum + p.estimatedTime, 0)));
		}

		return {
			fileId: context.fileId,
			mimeType: context.mimeType,
			analysisTypes,
			processors,
			estimatedTime: totalEstimatedTime,
			dependencies,
		};
	}

	private determineAnalysisTypes(mimeType: string): AIAnalysisType[] {
		const types: AIAnalysisType[] = [];

		if (mimeType.startsWith("image/")) {
			types.push(AIAnalysisType.OBJECT_DETECTION, AIAnalysisType.OCR, AIAnalysisType.FACE_RECOGNITION, AIAnalysisType.METADATA_EXTRACTION);
		} else if (mimeType.startsWith("video/")) {
			types.push(AIAnalysisType.VIDEO_ANALYSIS, AIAnalysisType.METADATA_EXTRACTION);
		} else if (mimeType.startsWith("audio/")) {
			types.push(AIAnalysisType.AUDIO_TRANSCRIPTION, AIAnalysisType.METADATA_EXTRACTION);
		} else {
			// Documents
			types.push(AIAnalysisType.METADATA_EXTRACTION);
		}

		return types;
	}

	private getProcessingOrder(analysisType: AIAnalysisType): number {
		// Define processing order - lower numbers process first
		const order = {
			[AIAnalysisType.METADATA_EXTRACTION]: 1,
			[AIAnalysisType.OCR]: 2,
			[AIAnalysisType.OBJECT_DETECTION]: 3,
			[AIAnalysisType.FACE_RECOGNITION]: 4,
			[AIAnalysisType.VIDEO_ANALYSIS]: 5,
			[AIAnalysisType.AUDIO_TRANSCRIPTION]: 6,
		};
		return order[analysisType] || 999;
	}

	private canRunInParallel(analysisType: AIAnalysisType, allTypes: AIAnalysisType[]): boolean {
		// Most processors can run in parallel, except when they depend on each other
		const dependencies = this.getProcessingDependencies(analysisType);
		return !dependencies.some((dep) => allTypes.includes(dep));
	}

	private getProcessingDependencies(analysisType: AIAnalysisType): AIAnalysisType[] {
		// Define dependencies between analysis types
		const dependencies: Record<AIAnalysisType, AIAnalysisType[]> = {
			[AIAnalysisType.METADATA_EXTRACTION]: [],
			[AIAnalysisType.OCR]: [],
			[AIAnalysisType.OBJECT_DETECTION]: [],
			[AIAnalysisType.FACE_RECOGNITION]: [],
			[AIAnalysisType.VIDEO_ANALYSIS]: [],
			[AIAnalysisType.AUDIO_TRANSCRIPTION]: [],
		};
		return dependencies[analysisType] || [];
	}

	private groupProcessorsForParallelExecution(processors: ProcessorAssignment[]): ProcessorAssignment[][] {
		// Group processors that can run in parallel
		const groups: ProcessorAssignment[][] = [];
		const processed = new Set<AIAnalysisType>();

		// Sort by order first
		const sortedProcessors = [...processors].sort((a, b) => a.order - b.order);

		for (const processor of sortedProcessors) {
			if (processed.has(processor.analysisType)) continue;

			const group: ProcessorAssignment[] = [processor];
			processed.add(processor.analysisType);

			// Find other processors that can run in parallel with this one
			for (const otherProcessor of sortedProcessors) {
				if (processed.has(otherProcessor.analysisType)) continue;

				if (otherProcessor.canRunInParallel && !otherProcessor.dependencies.includes(processor.analysisType) && !processor.dependencies.includes(otherProcessor.analysisType)) {
					group.push(otherProcessor);
					processed.add(otherProcessor.analysisType);
				}
			}

			groups.push(group);
		}

		return groups;
	}

	private addToQueue(job: ProcessingJob): void {
		// Insert job in priority order
		const priority = this.config.priorityWeights[job.priority];
		let insertIndex = this.processingQueue.length;

		for (let i = 0; i < this.processingQueue.length; i++) {
			const queuedJobPriority = this.config.priorityWeights[this.processingQueue[i].priority];
			if (priority > queuedJobPriority) {
				insertIndex = i;
				break;
			}
		}

		this.processingQueue.splice(insertIndex, 0, job);
		this.updateMetrics();
	}

	private async processQueue(): Promise<void> {
		while (this.isRunning) {
			try {
				// Check if we can process more jobs
				if (this.activeJobs.size < this.config.maxConcurrentJobs && this.processingQueue.length > 0) {
					const job = this.processingQueue.shift()!;
					this.processJob(job);
				}

				// Wait before next check
				await this.delay(this.config.queueCheckIntervalMs);
			} catch (error) {
				console.error("Error in processing queue:", error);
			}
		}
	}

	private async processJob(job: ProcessingJob): Promise<void> {
		job.status = ProcessingJobStatus.PROCESSING;
		job.startedAt = new Date();
		job.progress.stage = ProcessingStage.INITIALIZING;
		this.activeJobs.set(job.id, job);

		try {
			console.log(`Starting processing job ${job.id} for file ${job.fileId}`);

			// Create processing plan
			const plan = await this.createProcessingPlan(job.context, job.analysisTypes);

			// Execute processors
			const results = await this.executeProcessors(job, plan);

			// Complete job
			job.results = results;
			job.status = ProcessingJobStatus.COMPLETED;
			job.completedAt = new Date();
			job.progress.stage = ProcessingStage.COMPLETED;
			job.progress.progress = 100;

			// Cache results if enabled
			if (this.config.enableResultCaching) {
				const cacheKey = this.generateCacheKey(job.context, job.analysisTypes);
				this.resultCache.set(cacheKey, results);
			}

			console.log(`Completed processing job ${job.id} with ${results.length} results`);
		} catch (error) {
			await this.handleJobError(job, error);
		} finally {
			this.activeJobs.delete(job.id);
			this.completedJobs.set(job.id, job);
			this.updateMetrics();
		}
	}

	private async executeProcessors(job: ProcessingJob, plan: ProcessingPlan): Promise<AnalysisResult[]> {
		const results: AnalysisResult[] = [];
		const processorGroups = this.groupProcessorsForParallelExecution(plan.processors);

		for (let groupIndex = 0; groupIndex < processorGroups.length; groupIndex++) {
			const group = processorGroups[groupIndex];

			// Update progress
			const overallProgress = (groupIndex / processorGroups.length) * 100;
			job.progress.progress = overallProgress;
			job.progress.currentOperation = `Processing group ${groupIndex + 1}/${processorGroups.length}`;

			// Execute processors in this group (potentially in parallel)
			const groupPromises = group.map(async (assignment) => {
				try {
					job.progress.stage = ProcessingStage.ANALYZING;
					job.progress.currentOperation = `Running ${assignment.analysisType}`;

					const result = await this.executeProcessor(assignment, job.context, job.options);
					return result;
				} catch (error) {
					const processingError: ProcessingError = {
						processorType: assignment.analysisType,
						error: error instanceof Error ? error.message : String(error),
						timestamp: new Date(),
						retryable: !(error instanceof AIProcessingError),
					};
					job.errors.push(processingError);
					console.error(`Processor ${assignment.analysisType} failed for job ${job.id}:`, error);
					return null;
				}
			});

			const groupResults = await Promise.all(groupPromises);
			const successfulResults = groupResults.filter((result): result is AnalysisResult => result !== null);
			results.push(...successfulResults);
		}

		return results;
	}

	private async executeProcessor(assignment: ProcessorAssignment, context: ProcessingContext, options: ProcessingOptions): Promise<AnalysisResult> {
		const processor = assignment.processor;

		// Handle different processor types and their specific methods
		if (assignment.analysisType === AIAnalysisType.OCR && processor instanceof ImageProcessor) {
			return await processor.performOCRAnalysis(context, options);
		} else if (assignment.analysisType === AIAnalysisType.FACE_RECOGNITION && processor instanceof ImageProcessor) {
			return await processor.performFaceRecognitionAnalysis(context, options);
		} else {
			// Use the main process method
			return await processor.process(context, options);
		}
	}

	private async handleJobError(job: ProcessingJob, error: unknown): Promise<void> {
		const errorMessage = error instanceof Error ? error.message : String(error);

		job.errors.push({
			processorType: "orchestrator" as AIAnalysisType,
			error: errorMessage,
			timestamp: new Date(),
			retryable: job.retryCount < job.maxRetries,
		});

		if (job.retryCount < job.maxRetries && !(error instanceof ConcurrencyError)) {
			// Retry the job
			job.retryCount++;
			job.status = ProcessingJobStatus.RETRYING;

			const backoffTime = this.config.retryBackoffMs * Math.pow(2, job.retryCount - 1);
			console.log(`Retrying job ${job.id} in ${backoffTime}ms (attempt ${job.retryCount}/${job.maxRetries})`);

			setTimeout(() => {
				job.status = ProcessingJobStatus.QUEUED;
				this.addToQueue(job);
			}, backoffTime);
		} else {
			// Mark as failed
			job.status = ProcessingJobStatus.FAILED;
			job.failedAt = new Date();
			job.progress.stage = ProcessingStage.FAILED;

			console.error(`Job ${job.id} failed after ${job.retryCount} retries:`, errorMessage);
		}
	}

	private generateCacheKey(context: ProcessingContext, analysisTypes: AIAnalysisType[]): string {
		return `${context.fileId}_${context.filePath}_${analysisTypes.sort().join("_")}`;
	}

	private createCompletedJob(context: ProcessingContext, results: AnalysisResult[]): string {
		const job: ProcessingJob = {
			id: generateId(),
			fileId: context.fileId,
			investigationId: context.investigationId,
			context,
			options: {},
			analysisTypes: results.map((r) => r.analysisType),
			status: ProcessingJobStatus.COMPLETED,
			priority: context.priority,
			createdAt: new Date(),
			completedAt: new Date(),
			results,
			errors: [],
			progress: {
				fileId: context.fileId,
				stage: ProcessingStage.COMPLETED,
				progress: 100,
			},
			retryCount: 0,
			maxRetries: 0,
			metadata: { fromCache: true },
		};

		this.completedJobs.set(job.id, job);
		return job.id;
	}

	private calculateEstimatedWaitTime(): number {
		if (this.processingQueue.length === 0) return 0;

		const avgProcessingTime = this.metrics.averageProcessingTime || 30000; // 30 seconds default
		const jobsAhead = this.processingQueue.length;
		const availableSlots = Math.max(0, this.config.maxConcurrentJobs - this.activeJobs.size);

		if (availableSlots > 0) return 0;

		return (jobsAhead / this.config.maxConcurrentJobs) * avgProcessingTime;
	}

	private async waitForJobCompletion(jobId: string, timeoutMs: number): Promise<ProcessingJob | null> {
		const startTime = Date.now();

		while (Date.now() - startTime < timeoutMs) {
			const job = this.getJobStatus(jobId);
			if (job && (job.status === ProcessingJobStatus.COMPLETED || job.status === ProcessingJobStatus.FAILED || job.status === ProcessingJobStatus.CANCELLED)) {
				return job;
			}
			await this.delay(100);
		}

		return null;
	}

	private initializeMetrics(): ProcessingMetrics {
		return {
			totalJobs: 0,
			completedJobs: 0,
			failedJobs: 0,
			averageProcessingTime: 0,
			successRate: 0,
			processorPerformance: {},
			queueMetrics: {
				queuedJobs: 0,
				processingJobs: 0,
				averageWaitTime: 0,
				throughput: 0,
			},
		};
	}

	private updateMetrics(): void {
		const completedJobs = Array.from(this.completedJobs.values()).filter((job) => job.status === ProcessingJobStatus.COMPLETED);
		const failedJobs = Array.from(this.completedJobs.values()).filter((job) => job.status === ProcessingJobStatus.FAILED);

		this.metrics.totalJobs = this.completedJobs.size;
		this.metrics.completedJobs = completedJobs.length;
		this.metrics.failedJobs = failedJobs.length;
		this.metrics.successRate = this.metrics.totalJobs > 0 ? this.metrics.completedJobs / this.metrics.totalJobs : 0;

		// Calculate average processing time
		if (completedJobs.length > 0) {
			const totalTime = completedJobs.reduce((sum, job) => {
				const processingTime = job.completedAt && job.startedAt ? job.completedAt.getTime() - job.startedAt.getTime() : 0;
				return sum + processingTime;
			}, 0);
			this.metrics.averageProcessingTime = totalTime / completedJobs.length;
		}

		// Update queue metrics
		this.metrics.queueMetrics.queuedJobs = this.processingQueue.length;
		this.metrics.queueMetrics.processingJobs = this.activeJobs.size;
		this.metrics.queueMetrics.averageWaitTime = this.calculateEstimatedWaitTime();
	}

	private async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export singleton instance
export const processingOrchestrator = new ProcessingOrchestrator();
