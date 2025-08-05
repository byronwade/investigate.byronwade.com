import { NextRequest, NextResponse } from "next/server";
import { withAuth, withRole, withRateLimit, withSecurityHeaders } from "@/lib/middleware/auth";
import { logServerAuditEvent, getAuditLogs } from "@/lib/audit";
import { z } from "zod";

// Validation schemas
const AuditLogSchema = z.object({
	action: z.string().min(1, "Action is required"),
	resourceType: z.string().optional(),
	resourceId: z.string().uuid().optional(),
	details: z.record(z.any()).optional(),
	riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
});

const AuditQuerySchema = z.object({
	userId: z.string().uuid().optional(),
	investigationId: z.string().uuid().optional(),
	action: z.string().optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
});

// POST /api/audit - Create audit log entry
export const POST = withSecurityHeaders(
	withRateLimit(
		50,
		15 * 60 * 1000
	)(
		withAuth(async (request) => {
			try {
				const body = await request.json();
				const validatedData = AuditLogSchema.parse(body);

				const auditId = await logServerAuditEvent(request.user.id, {
					action: validatedData.action,
					resourceType: validatedData.resourceType,
					resourceId: validatedData.resourceId,
					details: validatedData.details,
					riskLevel: validatedData.riskLevel || "low",
					ipAddress: getClientIP(request),
					userAgent: request.headers.get("user-agent") || undefined,
				});

				return NextResponse.json(
					{
						success: true,
						auditId,
					},
					{ status: 201 }
				);
			} catch (error) {
				console.error("Error creating audit log:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid audit data",
							details: error.errors,
						},
						{ status: 400 }
					);
				}

				return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
			}
		})
	)
);

// GET /api/audit - Retrieve audit logs
export const GET = withSecurityHeaders(
	withRateLimit(
		20,
		15 * 60 * 1000
	)(
		withAuth(async (request) => {
			try {
				const url = new URL(request.url);
				const queryParams = Object.fromEntries(url.searchParams.entries());

				// Parse and validate query parameters
				const validatedQuery = AuditQuerySchema.parse({
					...queryParams,
					startDate: queryParams.startDate ? queryParams.startDate : undefined,
					endDate: queryParams.endDate ? queryParams.endDate : undefined,
					limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
					offset: queryParams.offset ? parseInt(queryParams.offset) : undefined,
				});

				// Non-admin users can only see their own audit logs
				let finalUserId = validatedQuery.userId;
				if (request.user.role !== "admin") {
					finalUserId = request.user.id;
				}

				const filters = {
					userId: finalUserId,
					investigationId: validatedQuery.investigationId,
					action: validatedQuery.action,
					startDate: validatedQuery.startDate ? new Date(validatedQuery.startDate) : undefined,
					endDate: validatedQuery.endDate ? new Date(validatedQuery.endDate) : undefined,
					limit: validatedQuery.limit || 50,
					offset: validatedQuery.offset || 0,
				};

				const auditLogs = await getAuditLogs(filters);

				// Log the audit query for security monitoring
				await logServerAuditEvent(request.user.id, {
					action: "audit_logs_accessed",
					resourceType: "audit",
					details: { filters },
					riskLevel: "low",
					ipAddress: getClientIP(request),
				});

				return NextResponse.json({
					auditLogs,
					pagination: {
						limit: filters.limit,
						offset: filters.offset,
						total: auditLogs.length,
					},
				});
			} catch (error) {
				console.error("Error retrieving audit logs:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid query parameters",
							details: error.errors,
						},
						{ status: 400 }
					);
				}

				return NextResponse.json({ error: "Failed to retrieve audit logs" }, { status: 500 });
			}
		})
	)
);

// DELETE /api/audit - Admin-only endpoint to clean up old audit logs
export const DELETE = withSecurityHeaders(
	withRole("admin")(
		withAuth(async (request) => {
			try {
				const url = new URL(request.url);
				const daysToKeep = parseInt(url.searchParams.get("daysToKeep") || "365");

				if (daysToKeep < 30) {
					return NextResponse.json({ error: "Cannot delete audit logs newer than 30 days" }, { status: 400 });
				}

				const cutoffDate = new Date();
				cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

				// This would typically be implemented as a stored procedure
				// For security, we'll just log the request without actually deleting
				await logServerAuditEvent(request.user.id, {
					action: "audit_cleanup_requested",
					resourceType: "audit",
					details: { daysToKeep, cutoffDate: cutoffDate.toISOString() },
					riskLevel: "high",
					ipAddress: getClientIP(request),
				});

				return NextResponse.json({
					message: "Audit cleanup request logged",
					note: "Actual cleanup requires database administrator action",
				});
			} catch (error) {
				console.error("Error processing audit cleanup:", error);
				return NextResponse.json({ error: "Failed to process audit cleanup" }, { status: 500 });
			}
		})
	)
);

// Utility function to get client IP
function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIP = request.headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIP) {
		return realIP;
	}

	return request.ip || "unknown";
}
