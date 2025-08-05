// Base AI Processor for all analysis types

import { AIAnalysisType, ProcessingStatus } from "../../shared/types/common";
import { AIProcessingError, AIModelUnavailableError } from "../../shared/errors/domain-errors";
import { AnalysisResult } from "../models/ai-analysis-result";

export interface ProcessingContext {
	fileId: string;
	fileName: string;
	mimeType: string;
	fileSize: number;
	filePath: string;
	investigationId: string;
	userId: string;
	priority: ProcessingPriority;
	retryCount: number;
	timeout?: number;
	metadata?: Record<string, any>;
}

export enum ProcessingPriority {
	LOW = 0,
	MEDIUM = 1,
	HIGH = 2,
	CRITICAL = 3,
}

export interface ProcessingOptions {
	modelVersion?: string;
	quality?: "fast" | "balanced" | "high_quality";
	features?: string[];
	customParameters?: Record<string, any>;
}

export interface ProcessingProgress {
	fileId: string;
	stage: ProcessingStage;
	progress: number; // 0-100
	estimatedTimeRemaining?: number;
	currentOperation?: string;
	errors?: string[];
}

export enum ProcessingStage {
	QUEUED = "queued",
	INITIALIZING = "initializing",
	PREPROCESSING = "preprocessing",
	ANALYZING = "analyzing",
	POSTPROCESSING = "postprocessing",
	COMPLETED = "completed",
	FAILED = "failed",
}

export abstract class BaseAIProcessor<T extends AnalysisResult = AnalysisResult> {
	protected readonly analysisType: AIAnalysisType;
	protected readonly modelName: string;
	protected readonly modelVersion: string;
	protected readonly supportedMimeTypes: string[];
	protected readonly maxFileSize: number;
	protected readonly processingTimeoutMs: number;

	constructor(
		analysisType: AIAnalysisType,
		modelName: string,
		modelVersion: string,
		supportedMimeTypes: string[],
		maxFileSize: number = 100 * 1024 * 1024, // 100MB default
		processingTimeoutMs: number = 300000 // 5 minutes default
	) {
		this.analysisType = analysisType;
		this.modelName = modelName;
		this.modelVersion = modelVersion;
		this.supportedMimeTypes = supportedMimeTypes;
		this.maxFileSize = maxFileSize;
		this.processingTimeoutMs = processingTimeoutMs;
	}

	/**
	 * Main processing method - implements the template method pattern
	 */
	async process(context: ProcessingContext, options: ProcessingOptions = {}): Promise<T> {
		const startTime = Date.now();

		try {
			// 1. Validate input
			await this.validateInput(context);

			// 2. Check if processor can handle this file
			if (!this.canProcess(context)) {
				throw new AIProcessingError(this.analysisType, `Processor cannot handle file type: ${context.mimeType}`);
			}

			// 3. Initialize processing
			await this.onProcessingStarted(context);

			// 4. Preprocess the file
			const preprocessedData = await this.preprocess(context, options);

			// 5. Perform the actual AI analysis
			const analysisResult = await this.performAnalysis(preprocessedData, context, options);

			// 6. Post-process results
			const processedResult = await this.postprocess(analysisResult, context, options);

			// 7. Validate results
			await this.validateResults(processedResult);

			// 8. Add metadata
			const finalResult = this.enrichResults(processedResult, startTime, context);

			// 9. Notify completion
			await this.onProcessingCompleted(context, finalResult);

			return finalResult;
		} catch (error) {
			const processingError = this.handleError(error, context);
			await this.onProcessingFailed(context, processingError);
			throw processingError;
		}
	}

	/**
	 * Check if this processor can handle the given file
	 */
	canProcess(context: ProcessingContext): boolean {
		return this.supportedMimeTypes.includes(context.mimeType) && context.fileSize <= this.maxFileSize;
	}

	/**
	 * Get processor information
	 */
	getProcessorInfo() {
		return {
			analysisType: this.analysisType,
			modelName: this.modelName,
			modelVersion: this.modelVersion,
			supportedMimeTypes: this.supportedMimeTypes,
			maxFileSize: this.maxFileSize,
			processingTimeoutMs: this.processingTimeoutMs,
		};
	}

	/**
	 * Estimate processing time based on file characteristics
	 */
	estimateProcessingTime(context: ProcessingContext): number {
		// Base implementation - can be overridden by specific processors
		const baseTime = 5000; // 5 seconds base
		const sizeMultiplier = context.fileSize / (1024 * 1024); // MB
		return Math.round(baseTime + sizeMultiplier * 1000);
	}

	// Abstract methods that must be implemented by concrete processors
	protected abstract preprocess(context: ProcessingContext, options: ProcessingOptions): Promise<any>;

	protected abstract performAnalysis(preprocessedData: any, context: ProcessingContext, options: ProcessingOptions): Promise<T>;

	// Virtual methods that can be overridden
	protected async postprocess(result: T, context: ProcessingContext, options: ProcessingOptions): Promise<T> {
		return result; // Default: no post-processing
	}

	protected async validateInput(context: ProcessingContext): Promise<void> {
		if (!context.fileId) {
			throw new AIProcessingError(this.analysisType, "File ID is required");
		}

		if (!context.filePath) {
			throw new AIProcessingError(this.analysisType, "File path is required");
		}

		if (context.fileSize <= 0) {
			throw new AIProcessingError(this.analysisType, "Invalid file size");
		}

		if (context.fileSize > this.maxFileSize) {
			throw new AIProcessingError(this.analysisType, `File size ${context.fileSize} exceeds maximum ${this.maxFileSize}`);
		}
	}

	protected async validateResults(result: T): Promise<void> {
		if (!result) {
			throw new AIProcessingError(this.analysisType, "Analysis produced no results");
		}

		if (result.confidence < 0 || result.confidence > 1) {
			throw new AIProcessingError(this.analysisType, "Invalid confidence score");
		}
	}

	protected enrichResults(result: T, startTime: number, context: ProcessingContext): T {
		const processingTime = Date.now() - startTime;

		return {
			...result,
			processingTimeMs: processingTime,
			modelVersion: this.modelVersion,
			extractedAt: new Date(),
		};
	}

	protected handleError(error: unknown, context: ProcessingContext): AIProcessingError {
		if (error instanceof AIProcessingError || error instanceof AIModelUnavailableError) {
			return error;
		}

		let errorMessage = "Unknown processing error";
		if (error instanceof Error) {
			errorMessage = error.message;
		}

		return new AIProcessingError(this.analysisType, errorMessage);
	}

	// Lifecycle hooks
	protected async onProcessingStarted(context: ProcessingContext): Promise<void> {
		console.log(`Started ${this.analysisType} processing for file: ${context.fileId}`);
	}

	protected async onProcessingCompleted(context: ProcessingContext, result: T): Promise<void> {
		console.log(`Completed ${this.analysisType} processing for file: ${context.fileId} ` + `(confidence: ${result.confidence}, time: ${result.processingTimeMs}ms)`);
	}

	protected async onProcessingFailed(context: ProcessingContext, error: AIProcessingError): Promise<void> {
		console.error(`Failed ${this.analysisType} processing for file: ${context.fileId}`, error.message);
	}

	// Utility methods for concrete processors
	protected async withTimeout<R>(promise: Promise<R>, timeoutMs: number = this.processingTimeoutMs): Promise<R> {
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => {
				reject(new AIProcessingError(this.analysisType, `Processing timeout after ${timeoutMs}ms`));
			}, timeoutMs);
		});

		return Promise.race([promise, timeoutPromise]);
	}

	protected async retryOperation<R>(operation: () => Promise<R>, maxRetries: number = 3, backoffMs: number = 1000): Promise<R> {
		let lastError: Error;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				return await operation();
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt < maxRetries) {
					await this.delay(backoffMs * Math.pow(2, attempt)); // Exponential backoff
				}
			}
		}

		throw new AIProcessingError(this.analysisType, `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`);
	}

	protected async delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	protected logProcessingProgress(context: ProcessingContext, stage: ProcessingStage, progress: number, operation?: string): void {
		console.log(`[${context.fileId}] ${this.analysisType} - ${stage}: ${progress}% ${operation || ""}`);
	}
}

// Processing queue interface
export interface ProcessingQueue {
	enqueue(context: ProcessingContext, priority: ProcessingPriority): Promise<string>;
	dequeue(): Promise<ProcessingContext | null>;
	getQueueStatus(): Promise<QueueStatus>;
	cancelProcessing(jobId: string): Promise<boolean>;
	getJobStatus(jobId: string): Promise<ProcessingProgress | null>;
}

export interface QueueStatus {
	pending: number;
	processing: number;
	completed: number;
	failed: number;
	totalCapacity: number;
	estimatedWaitTime: number;
}

// Factory interface for creating processors
export interface ProcessorFactory {
	createProcessor(analysisType: AIAnalysisType): BaseAIProcessor;
	getSupportedTypes(): AIAnalysisType[];
	getProcessorForMimeType(mimeType: string): BaseAIProcessor[];
}
