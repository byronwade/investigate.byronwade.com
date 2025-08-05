// Investigation Repository interface following Repository pattern

import { Investigation } from "../entities/investigation";
import { InvestigationStatus, PaginatedResult, PaginationOptions } from "../../shared/types/common";

export interface InvestigationFilters {
	userId?: string;
	status?: InvestigationStatus;
	createdAfter?: Date;
	createdBefore?: Date;
	keyword?: string;
	classification?: string;
	hasEvidenceFiles?: boolean;
	processingProgress?: {
		min?: number;
		max?: number;
	};
}

export interface InvestigationSortOptions {
	field: "created_at" | "updated_at" | "name" | "total_files" | "processing_progress";
	direction: "asc" | "desc";
}

export interface InvestigationRepository {
	// Basic CRUD operations
	findById(id: string): Promise<Investigation | null>;
	findByIdWithDetails(id: string): Promise<Investigation | null>;
	save(investigation: Investigation): Promise<Investigation>;
	delete(id: string): Promise<void>;
	exists(id: string): Promise<boolean>;

	// Query operations
	findByUserId(userId: string): Promise<Investigation[]>;
	findByStatus(status: InvestigationStatus): Promise<Investigation[]>;
	findByUserIdAndStatus(userId: string, status: InvestigationStatus): Promise<Investigation[]>;

	// Advanced queries
	findWithFilters(filters: InvestigationFilters, pagination?: PaginationOptions, sort?: InvestigationSortOptions): Promise<PaginatedResult<Investigation>>;

	searchByKeyword(keyword: string, userId: string, pagination?: PaginationOptions): Promise<PaginatedResult<Investigation>>;

	findRecentlyUpdated(userId: string, limit: number, withinDays?: number): Promise<Investigation[]>;

	findRecentlyCreated(userId: string, limit: number, withinDays?: number): Promise<Investigation[]>;

	// Statistics and aggregations
	countByUserId(userId: string): Promise<number>;
	countByStatus(status: InvestigationStatus): Promise<number>;
	countByUserIdAndStatus(userId: string, status: InvestigationStatus): Promise<number>;

	getInvestigationStats(userId: string): Promise<{
		total: number;
		byStatus: Record<InvestigationStatus, number>;
		totalFiles: number;
		totalSize: number;
		averageProcessingTime: number;
	}>;

	// Bulk operations
	findMultipleById(ids: string[]): Promise<Investigation[]>;
	updateMultipleStatus(ids: string[], status: InvestigationStatus, updatedBy: string): Promise<void>;
	deleteMultiple(ids: string[]): Promise<void>;

	// Duplicate detection
	findDuplicateByName(name: string, userId: string, excludeId?: string): Promise<Investigation | null>;
	findSimilarInvestigations(investigation: Investigation, limit?: number): Promise<Investigation[]>;

	// Access control queries
	findAccessibleToUser(userId: string, permission: string): Promise<Investigation[]>;
	checkUserAccess(investigationId: string, userId: string, permission: string): Promise<boolean>;

	// Timeline and activity
	findInvestigationsWithActivity(userId: string, since: Date, limit?: number): Promise<Investigation[]>;

	// Processing status
	findPendingProcessing(): Promise<Investigation[]>;
	findWithProcessingErrors(): Promise<Investigation[]>;
	updateProcessingProgress(investigationId: string, progress: number): Promise<void>;

	// Cleanup operations
	findStaleInvestigations(olderThanDays: number): Promise<Investigation[]>;
	findEmptyInvestigations(): Promise<Investigation[]>;
}
