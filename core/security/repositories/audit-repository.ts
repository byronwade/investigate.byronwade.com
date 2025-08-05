// Audit Repository interface for audit log management

import { RiskLevel, PaginatedResult, PaginationOptions } from "../../shared/types/common";
import { AuditLogEntry } from "../services/audit-service";

export interface AuditFilters {
	userId?: string;
	action?: string;
	resource?: string;
	resourceId?: string;
	riskLevel?: RiskLevel;
	success?: boolean;
	startDate?: Date;
	endDate?: Date;
	ipAddress?: string;
	sessionId?: string;
}

export interface AuditRepository {
	// Basic CRUD operations
	save(auditEntry: AuditLogEntry): Promise<void>;
	findById(id: string): Promise<AuditLogEntry | null>;

	// Query methods
	findWithFilters(filters: AuditFilters, pagination?: PaginationOptions): Promise<PaginatedResult<AuditLogEntry>>;

	findByUserId(userId: string, limit?: number): Promise<AuditLogEntry[]>;
	findByAction(action: string, limit?: number): Promise<AuditLogEntry[]>;
	findByResource(resource: string, resourceId?: string): Promise<AuditLogEntry[]>;

	// Risk and security queries
	findHighRiskEvents(limit?: number): Promise<AuditLogEntry[]>;
	findCriticalEvents(limit?: number): Promise<AuditLogEntry[]>;
	findFailedEvents(limit?: number): Promise<AuditLogEntry[]>;
	findSuspiciousActivity(timeWindow: number): Promise<AuditLogEntry[]>;

	// Time-based queries
	findRecentEvents(withinMinutes: number): Promise<AuditLogEntry[]>;
	findEventsByTimeRange(startDate: Date, endDate: Date): Promise<AuditLogEntry[]>;

	// Statistics and analytics
	getEventCountsByAction(startDate: Date, endDate: Date): Promise<Record<string, number>>;
	getEventCountsByUser(startDate: Date, endDate: Date): Promise<Record<string, number>>;
	getEventCountsByRiskLevel(startDate: Date, endDate: Date): Promise<Record<RiskLevel, number>>;
	getFailureRate(action: string, timeWindow: number): Promise<number>;

	// Security monitoring
	findMultipleFailedLogins(withinMinutes: number, threshold: number): Promise<AuditLogEntry[]>;
	findUnusualAccessPatterns(userId: string): Promise<AuditLogEntry[]>;
	findAccessFromMultipleLocations(userId: string, withinHours: number): Promise<AuditLogEntry[]>;

	// Cleanup and maintenance
	deleteOldEntries(olderThanDays: number): Promise<number>;
	archiveOldEntries(olderThanDays: number): Promise<number>;
	getStorageUsage(): Promise<{ totalEntries: number; sizeInBytes: number }>;

	// Export and reporting
	exportAuditLogs(filters: AuditFilters, format: "json" | "csv"): Promise<string>;

	generateSecurityReport(
		startDate: Date,
		endDate: Date
	): Promise<{
		totalEvents: number;
		riskDistribution: Record<RiskLevel, number>;
		topActions: Array<{ action: string; count: number }>;
		topUsers: Array<{ userId: string; count: number }>;
		failureRate: number;
		securityIncidents: number;
	}>;
}
