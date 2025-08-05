// API route for checking AI processing job status and retrieving results

import { NextRequest, NextResponse } from "next/server";
import { withAuth, withSecurityHeaders, withRateLimit } from "../../../../lib/middleware/auth";
import { processingOrchestrator } from "../../../../core/ai/pipelines/processing-orchestrator";
import { DataTransformer } from "../../../../core/ai/utils/data-transformer";
import { logAuditEvent } from "../../../../lib/audit";

const handler = withAuth(
	withSecurityHeaders(
		withRateLimit(async (req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) => {
			try {
				const user = (req as any).user;
				const { jobId } = await params;

				if (!jobId) {
					return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
				}

				// Get job status from orchestrator
				const job = processingOrchestrator.getJobStatus(jobId);

				if (!job) {
					return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
				}

				// Check authorization - user can only access their own jobs
				if (job.context.userId !== user.id) {
					return NextResponse.json({ success: false, error: "Unauthorized access to job" }, { status: 403 });
				}

				// Log audit event for job status check
				await logAuditEvent({
					userId: user.id,
					action: "processing_status_checked",
					resourceType: "processing_job",
					resourceId: jobId,
					metadata: {
						jobStatus: job.status,
						investigationId: job.investigationId,
						fileId: job.fileId,
					},
					ipAddress: req.headers.get("x-forwarded-for") || "unknown",
					userAgent: req.headers.get("user-agent") || "unknown",
				});

				// Basic job information
				const response: any = {
					success: true,
					job: {
						id: job.id,
						fileId: job.fileId,
						investigationId: job.investigationId,
						status: job.status,
						progress: job.progress,
						createdAt: job.createdAt,
						startedAt: job.startedAt,
						completedAt: job.completedAt,
						failedAt: job.failedAt,
						analysisTypes: job.analysisTypes,
						retryCount: job.retryCount,
						maxRetries: job.maxRetries,
						metadata: job.metadata,
					},
				};

				// Include errors if any
				if (job.errors.length > 0) {
					response.job.errors = job.errors;
				}

				// If job is completed, include transformed results
				if (job.status === "completed" && job.results.length > 0) {
					try {
						// Transform raw AI results into intelligent summary
						const intelligentSummary = DataTransformer.transformToIntelligentSummary(job.fileId, job.context.fileName, job.context.mimeType, job.results);

						// Create executive summary
						const executiveSummary = DataTransformer.createExecutiveSummary(intelligentSummary);

						// Extract searchable keywords
						const keywords = DataTransformer.extractSearchableKeywords(intelligentSummary);

						response.job.analysis = {
							rawResults: job.results,
							intelligentSummary,
							executiveSummary,
							keywords,
							processedAt: new Date().toISOString(),
						};

						// Log successful analysis retrieval
						await logAuditEvent({
							userId: user.id,
							action: "analysis_results_retrieved",
							resourceType: "processing_job",
							resourceId: jobId,
							metadata: {
								investigationId: job.investigationId,
								fileId: job.fileId,
								keyFindingsCount: intelligentSummary.keyFindings.length,
								entitiesCount: intelligentSummary.entities.length,
								timelineEventsCount: intelligentSummary.timeline.length,
								riskFactorsCount: intelligentSummary.riskFactors.length,
							},
							ipAddress: req.headers.get("x-forwarded-for") || "unknown",
							userAgent: req.headers.get("user-agent") || "unknown",
						});
					} catch (transformError) {
						console.error("Error transforming analysis results:", transformError);

						// Still return raw results if transformation fails
						response.job.analysis = {
							rawResults: job.results,
							transformError: "Failed to transform results into intelligent summary",
						};
					}
				}

				return NextResponse.json(response);
			} catch (error) {
				console.error("Error checking processing status:", error);
				return NextResponse.json({ success: false, error: "Failed to check processing status" }, { status: 500 });
			}
		})
	)
);

export { handler as GET };
