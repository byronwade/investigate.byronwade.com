// Evidence File Repository interface

import { EvidenceFile } from "../entities/evidence-file";
import { ProcessingStatus, EvidenceFileType, DataClassification, PaginatedResult, PaginationOptions } from "../../shared/types/common";

export interface EvidenceFileFilters {
	investigationId?: string;
	uploadedBy?: string;
	fileType?: EvidenceFileType;
	processingStatus?: ProcessingStatus;
	classification?: DataClassification;
	uploadedAfter?: Date;
	uploadedBefore?: Date;
	minFileSize?: number;
	maxFileSize?: number;
	hasGPS?: boolean;
	hasAnalysisResults?: boolean;
	keyword?: string;
}

export interface EvidenceFileSortOptions {
	field: "uploaded_at" | "file_size" | "original_name" | "processing_status" | "processed_at";
	direction: "asc" | "desc";
}

export interface EvidenceFileRepository {
	// Basic CRUD operations
	findById(id: string): Promise<EvidenceFile | null>;
	findByIdWithAnalysis(id: string): Promise<EvidenceFile | null>;
	save(evidenceFile: EvidenceFile): Promise<EvidenceFile>;
	delete(id: string): Promise<void>;
	exists(id: string): Promise<boolean>;

	// Investigation-related queries
	findByInvestigationId(investigationId: string): Promise<EvidenceFile[]>;
	findByInvestigationIdWithPagination(investigationId: string, pagination?: PaginationOptions, sort?: EvidenceFileSortOptions): Promise<PaginatedResult<EvidenceFile>>;

	countByInvestigationId(investigationId: string): Promise<number>;
	getTotalSizeByInvestigationId(investigationId: string): Promise<number>;

	// User-related queries
	findByUploadedBy(userId: string): Promise<EvidenceFile[]>;
	findRecentByUser(userId: string, limit: number, withinDays?: number): Promise<EvidenceFile[]>;

	// Processing status queries
	findByProcessingStatus(status: ProcessingStatus): Promise<EvidenceFile[]>;
	findPendingProcessing(): Promise<EvidenceFile[]>;
	findFailedProcessing(): Promise<EvidenceFile[]>;
	findProcessingInProgress(): Promise<EvidenceFile[]>;

	// File type queries
	findByFileType(fileType: EvidenceFileType): Promise<EvidenceFile[]>;
	findImageFiles(investigationId?: string): Promise<EvidenceFile[]>;
	findVideoFiles(investigationId?: string): Promise<EvidenceFile[]>;
	findDocumentFiles(investigationId?: string): Promise<EvidenceFile[]>;
	findAudioFiles(investigationId?: string): Promise<EvidenceFile[]>;

	// Advanced filtering
	findWithFilters(filters: EvidenceFileFilters, pagination?: PaginationOptions, sort?: EvidenceFileSortOptions): Promise<PaginatedResult<EvidenceFile>>;

	// Search operations
	searchByFilename(keyword: string, investigationId?: string, pagination?: PaginationOptions): Promise<PaginatedResult<EvidenceFile>>;

	searchInAnalysisResults(keyword: string, investigationId?: string, analysisType?: string): Promise<EvidenceFile[]>;

	// Duplicate detection
	findByChecksum(checksum: string): Promise<EvidenceFile[]>;
	findDuplicateFiles(investigationId?: string): Promise<EvidenceFile[][]>;
	findSimilarFiles(file: EvidenceFile, threshold?: number): Promise<EvidenceFile[]>;

	// GPS and location queries
	findFilesWithGPS(investigationId?: string): Promise<EvidenceFile[]>;
	findFilesNearLocation(latitude: number, longitude: number, radiusKm: number, investigationId?: string): Promise<EvidenceFile[]>;

	// Analysis results queries
	findWithAnalysisType(analysisType: string, investigationId?: string): Promise<EvidenceFile[]>;
	findWithHighConfidence(threshold: number, investigationId?: string): Promise<EvidenceFile[]>;
	findUnanalyzed(investigationId?: string): Promise<EvidenceFile[]>;

	// Statistics and aggregations
	getFileStats(investigationId?: string): Promise<{
		total: number;
		byType: Record<EvidenceFileType, number>;
		byStatus: Record<ProcessingStatus, number>;
		totalSize: number;
		averageSize: number;
		withGPS: number;
		withAnalysis: number;
	}>;

	getProcessingStats(): Promise<{
		pending: number;
		processing: number;
		completed: number;
		failed: number;
		averageProcessingTime: number;
	}>;

	// Bulk operations
	findMultipleById(ids: string[]): Promise<EvidenceFile[]>;
	updateMultipleProcessingStatus(ids: string[], status: ProcessingStatus): Promise<void>;
	deleteMultiple(ids: string[]): Promise<void>;

	// File access and security
	findAccessibleToUser(userId: string, permission: string): Promise<EvidenceFile[]>;
	checkUserAccess(fileId: string, userId: string, permission: string): Promise<boolean>;
	findByClassification(classification: DataClassification): Promise<EvidenceFile[]>;

	// Timeline queries
	findUploadedInTimeRange(startDate: Date, endDate: Date, investigationId?: string): Promise<EvidenceFile[]>;

	findProcessedInTimeRange(startDate: Date, endDate: Date, investigationId?: string): Promise<EvidenceFile[]>;

	// Storage management
	findLargeFiles(minSizeMB: number): Promise<EvidenceFile[]>;
	findOldFiles(olderThanDays: number): Promise<EvidenceFile[]>;
	findFilesForCleanup(): Promise<EvidenceFile[]>;

	// Analysis queue management
	getNextFilesForProcessing(limit: number): Promise<EvidenceFile[]>;
	markAsProcessing(fileId: string): Promise<void>;
	updateProcessingProgress(fileId: string, progress: number): Promise<void>;

	// File integrity
	findFilesWithMissingChecksums(): Promise<EvidenceFile[]>;
	verifyFileIntegrity(fileId: string): Promise<boolean>;
	findCorruptedFiles(): Promise<EvidenceFile[]>;
}
