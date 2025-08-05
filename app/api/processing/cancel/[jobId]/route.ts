// API route for cancelling AI processing jobs

import { NextRequest, NextResponse } from "next/server";
import { withAuth, withSecurityHeaders, withRateLimit } from "../../../../../lib/middleware/auth";
import { processingOrchestrator } from "../../../../../core/ai/pipelines/processing-orchestrator";
import { logAuditEvent } from "../../../../../lib/audit";

const handler = withAuth(
	withSecurityHeaders(
		withRateLimit(async (req: NextRequest, { params }: { params: { jobId: string } }) => {
			try {
				const user = (req as any).user;
				const { jobId } = params;

				if (!jobId) {
					return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
				}

				// Get job to check authorization
				const job = processingOrchestrator.getJobStatus(jobId);

				if (!job) {
					return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
				}

				// Check authorization - user can only cancel their own jobs
				if (job.context.userId !== user.id) {
					return NextResponse.json({ success: false, error: "Unauthorized access to job" }, { status: 403 });
				}

				// Attempt to cancel the job
				const cancelled = await processingOrchestrator.cancelJob(jobId);

				if (cancelled) {
					// Log audit event
					await logAuditEvent({
						userId: user.id,
						action: "processing_job_cancelled",
						resourceType: "processing_job",
						resourceId: jobId,
						metadata: {
							investigationId: job.investigationId,
							fileId: job.fileId,
							previousStatus: job.status,
						},
						ipAddress: req.headers.get("x-forwarded-for") || "unknown",
						userAgent: req.headers.get("user-agent") || "unknown",
					});

					return NextResponse.json({
						success: true,
						message: "Job cancelled successfully",
					});
				} else {
					return NextResponse.json({
						success: false,
						error: "Job could not be cancelled (may already be completed or failed)",
					});
				}
			} catch (error) {
				console.error("Error cancelling processing job:", error);
				return NextResponse.json({ success: false, error: "Failed to cancel processing job" }, { status: 500 });
			}
		})
	)
);

export { handler as POST };
