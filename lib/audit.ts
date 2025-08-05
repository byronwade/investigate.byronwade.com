import { supabase } from "./supabase/client-shared";

export interface AuditLogData {
	action: string;
	resourceType?: string;
	resourceId?: string;
	details?: Record<string, any>;
	riskLevel?: "low" | "medium" | "high" | "critical";
	ipAddress?: string;
	userAgent?: string;
	sessionId?: string;
}

export interface SecurityEvent {
	type: "login" | "logout" | "failed_login" | "data_access" | "data_modification" | "suspicious_activity";
	userId?: string;
	details: Record<string, any>;
	riskLevel: "low" | "medium" | "high" | "critical";
}

// Client-side audit logging
export async function logAuditEvent(data: AuditLogData): Promise<string | null> {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			console.warn("Cannot log audit event: No authenticated user");
			return null;
		}

		const auditData = {
			user_id: user.id,
			action: data.action,
			resource_type: data.resourceType,
			resource_id: data.resourceId,
			details: data.details || {},
			risk_level: data.riskLevel || "low",
			ip_address: data.ipAddress,
			user_agent: data.userAgent || navigator.userAgent,
			session_id: data.sessionId,
		};

		const { data: result, error } = await supabase.from("audit_logs").insert(auditData).select("id").single();

		if (error) {
			console.error("Failed to log audit event:", error);
			return null;
		}

		return result.id;
	} catch (error) {
		console.error("Error logging audit event:", error);
		return null;
	}
}

// Server-side audit logging (for API routes)
export async function logServerAuditEvent(userId: string, data: AuditLogData): Promise<string | null> {
	try {
		const auditData = {
			user_id: userId,
			action: data.action,
			resource_type: data.resourceType,
			resource_id: data.resourceId,
			details: data.details || {},
			risk_level: data.riskLevel || "low",
			ip_address: data.ipAddress,
			user_agent: data.userAgent,
			session_id: data.sessionId,
		};

		const { data: result, error } = await supabase.from("audit_logs").insert(auditData).select("id").single();

		if (error) {
			console.error("Failed to log server audit event:", error);
			return null;
		}

		return result.id;
	} catch (error) {
		console.error("Error logging server audit event:", error);
		return null;
	}
}

// Log security events with automatic risk assessment
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
	const auditData: AuditLogData = {
		action: `security_${event.type}`,
		resourceType: "security",
		details: event.details,
		riskLevel: event.riskLevel,
	};

	await logAuditEvent(auditData);

	// Send alerts for high-risk events
	if (event.riskLevel === "high" || event.riskLevel === "critical") {
		await sendSecurityAlert(event);
	}
}

// Send security alerts for high-risk events
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
	try {
		// In a real implementation, this would integrate with your alerting system
		console.warn("Security Alert:", {
			type: event.type,
			riskLevel: event.riskLevel,
			details: event.details,
			timestamp: new Date().toISOString(),
		});

		// You could integrate with services like:
		// - Email notifications
		// - Slack/Teams webhooks
		// - PagerDuty
		// - Custom alerting systems
	} catch (error) {
		console.error("Failed to send security alert:", error);
	}
}

// Track file access for audit purposes
export async function logFileAccess(fileId: string, accessType: "view" | "download" | "analyze" | "delete", userId?: string): Promise<void> {
	try {
		let currentUserId = userId;

		if (!currentUserId) {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			currentUserId = user?.id;
		}

		if (!currentUserId) {
			console.warn("Cannot log file access: No user ID available");
			return;
		}

		const { error } = await supabase.from("file_access_logs").insert({
			file_id: fileId,
			user_id: currentUserId,
			access_type: accessType,
			user_agent: navigator.userAgent,
		});

		if (error) {
			console.error("Failed to log file access:", error);
		}

		// Also log as audit event
		await logAuditEvent({
			action: `file_${accessType}`,
			resourceType: "evidence_file",
			resourceId: fileId,
			details: { accessType },
			riskLevel: accessType === "delete" ? "high" : "low",
		});
	} catch (error) {
		console.error("Error logging file access:", error);
	}
}

// Get audit logs for a user or investigation
export async function getAuditLogs(filters: { userId?: string; investigationId?: string; action?: string; startDate?: Date; endDate?: Date; limit?: number; offset?: number }) {
	try {
		let query = supabase.from("audit_logs").select("*");

		if (filters.userId) {
			query = query.eq("user_id", filters.userId);
		}

		if (filters.investigationId) {
			query = query.eq("resource_id", filters.investigationId);
		}

		if (filters.action) {
			query = query.eq("action", filters.action);
		}

		if (filters.startDate) {
			query = query.gte("created_at", filters.startDate.toISOString());
		}

		if (filters.endDate) {
			query = query.lte("created_at", filters.endDate.toISOString());
		}

		query = query.order("created_at", { ascending: false });

		if (filters.limit) {
			query = query.limit(filters.limit);
		}

		if (filters.offset) {
			query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
		}

		const { data, error } = await query;

		if (error) {
			console.error("Failed to fetch audit logs:", error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error("Error fetching audit logs:", error);
		return [];
	}
}

// Built-in audit events for common actions
export const auditEvents = {
	userLogin: (userId: string, details?: Record<string, any>) =>
		logAuditEvent({
			action: "user_login",
			resourceType: "user",
			resourceId: userId,
			details,
			riskLevel: "low",
		}),

	userLogout: (userId: string) =>
		logAuditEvent({
			action: "user_logout",
			resourceType: "user",
			resourceId: userId,
			riskLevel: "low",
		}),

	investigationCreated: (investigationId: string, details?: Record<string, any>) =>
		logAuditEvent({
			action: "investigation_created",
			resourceType: "investigation",
			resourceId: investigationId,
			details,
			riskLevel: "medium",
		}),

	investigationDeleted: (investigationId: string, details?: Record<string, any>) =>
		logAuditEvent({
			action: "investigation_deleted",
			resourceType: "investigation",
			resourceId: investigationId,
			details,
			riskLevel: "high",
		}),

	fileUploaded: (fileId: string, fileName: string, fileSize: number) =>
		logAuditEvent({
			action: "file_uploaded",
			resourceType: "evidence_file",
			resourceId: fileId,
			details: { fileName, fileSize },
			riskLevel: "medium",
		}),

	fileDeleted: (fileId: string, fileName: string) =>
		logAuditEvent({
			action: "file_deleted",
			resourceType: "evidence_file",
			resourceId: fileId,
			details: { fileName },
			riskLevel: "high",
		}),

	aiAnalysisStarted: (fileId: string, analysisType: string) =>
		logAuditEvent({
			action: "ai_analysis_started",
			resourceType: "evidence_file",
			resourceId: fileId,
			details: { analysisType },
			riskLevel: "low",
		}),

	suspiciousActivity: (details: Record<string, any>) =>
		logAuditEvent({
			action: "suspicious_activity",
			resourceType: "security",
			details,
			riskLevel: "critical",
		}),
};
