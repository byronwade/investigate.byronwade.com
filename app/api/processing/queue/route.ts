// API route for managing the AI processing queue

import { NextRequest, NextResponse } from "next/server";
import { withAuth, withSecurityHeaders, withRateLimit, withRole } from "../../../../lib/middleware/auth";
import { processingOrchestrator } from "../../../../core/ai/pipelines/processing-orchestrator";
import { logAuditEvent } from "../../../../lib/audit";

const handler = withAuth(
	withSecurityHeaders(
		withRateLimit(
			withRole(["admin"], async (req: NextRequest) => {
				try {
					const user = (req as any).user;

					if (req.method === "GET") {
						// Get queue status and metrics
						const queueStatus = processingOrchestrator.getQueueStatus();
						const metrics = processingOrchestrator.getMetrics();

						// Log audit event
						await logAuditEvent({
							userId: user.id,
							action: "processing_queue_viewed",
							resourceType: "processing_queue",
							resourceId: "global",
							metadata: {
								queueStatus,
								metricsSnapshot: {
									totalJobs: metrics.totalJobs,
									completedJobs: metrics.completedJobs,
									failedJobs: metrics.failedJobs,
									successRate: metrics.successRate,
								},
							},
							ipAddress: req.headers.get("x-forwarded-for") || "unknown",
							userAgent: req.headers.get("user-agent") || "unknown",
						});

						return NextResponse.json({
							success: true,
							queueStatus,
							metrics,
						});
					} else if (req.method === "POST") {
						const { action } = await req.json();

						if (action === "start") {
							await processingOrchestrator.start();

							await logAuditEvent({
								userId: user.id,
								action: "processing_queue_started",
								resourceType: "processing_queue",
								resourceId: "global",
								metadata: {},
								ipAddress: req.headers.get("x-forwarded-for") || "unknown",
								userAgent: req.headers.get("user-agent") || "unknown",
							});

							return NextResponse.json({
								success: true,
								message: "Processing queue started",
							});
						} else if (action === "stop") {
							await processingOrchestrator.stop();

							await logAuditEvent({
								userId: user.id,
								action: "processing_queue_stopped",
								resourceType: "processing_queue",
								resourceId: "global",
								metadata: {},
								ipAddress: req.headers.get("x-forwarded-for") || "unknown",
								userAgent: req.headers.get("user-agent") || "unknown",
							});

							return NextResponse.json({
								success: true,
								message: "Processing queue stopped",
							});
						} else {
							return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
						}
					} else {
						return NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
					}
				} catch (error) {
					console.error("Error managing processing queue:", error);
					return NextResponse.json({ success: false, error: "Failed to manage processing queue" }, { status: 500 });
				}
			})
		)
	)
);

export { handler as GET, handler as POST };
