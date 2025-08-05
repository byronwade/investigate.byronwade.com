// Audit Service for comprehensive audit logging

import { RiskLevel } from "../../shared/types/common";
import { generateAuditId } from "../../shared/utils/generators";
import { AuditRepository } from "../repositories/audit-repository";

export interface AuditLogEntry {
	id: string;
	timestamp: Date;
	userId: string;
	action: string;
	resource: string;
	resourceId?: string;
	ipAddress?: string;
	userAgent?: string;
	success: boolean;
	errorCode?: string;
	riskLevel: RiskLevel;
	metadata?: Record<string, any>;
	sessionId?: string;
}

export class AuditService {
	constructor(private readonly auditRepo: AuditRepository) {}

	/**
	 * Investigation audit events
	 */
	async logInvestigationCreated(investigationId: string, investigationName: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.created",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata: {
				investigationName,
				...metadata,
			},
		});
	}

	async logInvestigationAccessed(investigationId: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.accessed",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata,
		});
	}

	async logInvestigationUpdated(investigationId: string, userId: string, changes: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.updated",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.MEDIUM,
			metadata: {
				changes,
				...metadata,
			},
		});
	}

	async logInvestigationDeleted(investigationId: string, investigationName: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.deleted",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.HIGH,
			metadata: {
				investigationName,
				...metadata,
			},
		});
	}

	async logInvestigationAnalysisStarted(investigationId: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.analysis_started",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.MEDIUM,
			metadata,
		});
	}

	async logInvestigationCompleted(investigationId: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.completed",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.MEDIUM,
			metadata,
		});
	}

	async logInvestigationArchived(investigationId: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "investigation.archived",
			resource: "investigation",
			resourceId: investigationId,
			success: true,
			riskLevel: RiskLevel.MEDIUM,
			metadata,
		});
	}

	/**
	 * Evidence file audit events
	 */
	async logEvidenceAdded(investigationId: string, fileId: string, fileName: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "evidence.added",
			resource: "evidence_file",
			resourceId: fileId,
			success: true,
			riskLevel: RiskLevel.MEDIUM,
			metadata: {
				investigationId,
				fileName,
				...metadata,
			},
		});
	}

	async logEvidenceAccessed(fileId: string, accessType: "view" | "download", userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: `evidence.${accessType}`,
			resource: "evidence_file",
			resourceId: fileId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata,
		});
	}

	async logEvidenceDeleted(fileId: string, fileName: string, userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "evidence.deleted",
			resource: "evidence_file",
			resourceId: fileId,
			success: true,
			riskLevel: RiskLevel.HIGH,
			metadata: {
				fileName,
				...metadata,
			},
		});
	}

	async logFileQueuedForProcessing(fileId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "system",
			action: "evidence.queued_for_processing",
			resource: "evidence_file",
			resourceId: fileId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata,
		});
	}

	async logFileProcessingCompleted(fileId: string, processingTimeSeconds: number, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "system",
			action: "evidence.processing_completed",
			resource: "evidence_file",
			resourceId: fileId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata: {
				processingTimeSeconds,
				...metadata,
			},
		});
	}

	async logFileProcessingFailed(fileId: string, error: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "system",
			action: "evidence.processing_failed",
			resource: "evidence_file",
			resourceId: fileId,
			success: false,
			riskLevel: RiskLevel.MEDIUM,
			metadata: {
				error,
				...metadata,
			},
		});
	}

	/**
	 * Authentication audit events
	 */
	async logLoginSuccess(userId: string, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "auth.login_success",
			resource: "user",
			resourceId: userId,
			success: true,
			riskLevel: RiskLevel.LOW,
			ipAddress,
			userAgent,
			metadata,
		});
	}

	async logLoginFailure(email: string, reason: string, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "anonymous",
			action: "auth.login_failure",
			resource: "user",
			success: false,
			riskLevel: RiskLevel.MEDIUM,
			ipAddress,
			userAgent,
			metadata: {
				email,
				reason,
				...metadata,
			},
		});
	}

	async logLogout(userId: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "auth.logout",
			resource: "user",
			resourceId: userId,
			success: true,
			riskLevel: RiskLevel.LOW,
			metadata,
		});
	}

	/**
	 * Security audit events
	 */
	async logUnauthorizedAccess(userId: string, resource: string, action: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "security.unauthorized_access",
			resource,
			success: false,
			riskLevel: RiskLevel.HIGH,
			metadata: {
				attemptedAction: action,
				...metadata,
			},
		});
	}

	async logSuspiciousActivity(userId: string, activity: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "security.suspicious_activity",
			resource: "system",
			success: false,
			riskLevel: RiskLevel.CRITICAL,
			metadata: {
				activity,
				...metadata,
			},
		});
	}

	async logDataBreach(resource: string, resourceId: string, severity: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "system",
			action: "security.data_breach",
			resource,
			resourceId,
			success: false,
			riskLevel: RiskLevel.CRITICAL,
			metadata: {
				severity,
				...metadata,
			},
		});
	}

	/**
	 * System audit events
	 */
	async logSystemError(component: string, error: string, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId: "system",
			action: "system.error",
			resource: "system",
			success: false,
			riskLevel: RiskLevel.MEDIUM,
			metadata: {
				component,
				error,
				...metadata,
			},
		});
	}

	async logConfigurationChange(userId: string, setting: string, oldValue: any, newValue: any, metadata?: Record<string, any>): Promise<void> {
		await this.logEvent({
			userId,
			action: "system.configuration_change",
			resource: "configuration",
			success: true,
			riskLevel: RiskLevel.HIGH,
			metadata: {
				setting,
				oldValue,
				newValue,
				...metadata,
			},
		});
	}

	/**
	 * Query audit logs
	 */
	async getAuditLogs(filters: { userId?: string; action?: string; resource?: string; riskLevel?: RiskLevel; startDate?: Date; endDate?: Date; limit?: number; offset?: number }) {
		return await this.auditRepo.findWithFilters(filters);
	}

	async getHighRiskEvents(limit: number = 50) {
		return await this.auditRepo.findHighRiskEvents(limit);
	}

	async getUserActivity(userId: string, days: number = 30) {
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		return await this.auditRepo.findWithFilters({
			userId,
			startDate,
			endDate,
		});
	}

	// Private helper method
	private async logEvent(data: Partial<AuditLogEntry>): Promise<void> {
		const auditEntry: AuditLogEntry = {
			id: generateAuditId(),
			timestamp: new Date(),
			userId: data.userId || "unknown",
			action: data.action || "unknown",
			resource: data.resource || "unknown",
			resourceId: data.resourceId,
			ipAddress: data.ipAddress,
			userAgent: data.userAgent,
			success: data.success ?? true,
			errorCode: data.errorCode,
			riskLevel: data.riskLevel || RiskLevel.LOW,
			metadata: data.metadata,
			sessionId: data.sessionId,
		};

		await this.auditRepo.save(auditEntry);

		// Send high-risk events to monitoring system
		if (auditEntry.riskLevel === RiskLevel.HIGH || auditEntry.riskLevel === RiskLevel.CRITICAL) {
			await this.alertSecurityTeam(auditEntry);
		}
	}

	private async alertSecurityTeam(auditEntry: AuditLogEntry): Promise<void> {
		// In a real implementation, this would send alerts to security team
		// via email, Slack, SIEM system, etc.
		console.warn("HIGH RISK SECURITY EVENT:", auditEntry);
	}
}
