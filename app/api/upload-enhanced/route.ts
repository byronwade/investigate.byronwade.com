// Enhanced upload route that integrates with the new AI processing orchestrator

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/client-server";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents } from "@/lib/audit";
import { extractFileMetadata, sanitizeFilename, generateUniqueId } from "@/lib/utils";
import { processingOrchestrator } from "@/core/ai/pipelines/processing-orchestrator";
import { ProcessingContext, ProcessingPriority } from "@/core/ai/processors/base-processor";
import { AIAnalysisType } from "@/core/shared/types/common";
import { z } from "zod";

// Validation schema
const UploadSchema = z.object({
	investigationId: z.string().uuid("Invalid investigation ID"),
	priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
	analysisTypes: z.array(z.enum(["object_detection", "ocr", "face_recognition", "video_analysis", "audio_transcription", "metadata_extraction"])).optional(),
});

// File validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024; // 1GB total per upload
const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/bmp",
	"image/tiff",
	"video/mp4",
	"video/avi",
	"video/mov",
	"video/wmv",
	"video/webm",
	"video/mkv",
	"audio/mp3",
	"audio/wav",
	"audio/m4a",
	"audio/ogg",
	"audio/flac",
	"audio/aac",
	"application/pdf",
	"text/plain",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/json",
	"text/csv",
	"application/rtf",
];

export const POST = withSecurityHeaders(
	withRateLimit(
		5,
		15 * 60 * 1000
	)(
		// 5 uploads per 15 minutes
		withAuth(async (request) => {
			try {
				const formData = await request.formData();
				const investigationId = formData.get("investigationId") as string;
				const priority = (formData.get("priority") as string) || "medium";
				const customAnalysisTypes = formData.get("analysisTypes") ? JSON.parse(formData.get("analysisTypes") as string) : undefined;
				const files = formData.getAll("files") as File[];

				// Validate input
				const validatedData = UploadSchema.parse({
					investigationId,
					priority,
					analysisTypes: customAnalysisTypes,
				});

				if (!files || files.length === 0) {
					return NextResponse.json(
						{
							success: false,
							error: "No files provided",
							code: "NO_FILES",
						},
						{ status: 400 }
					);
				}

				// Validate file constraints
				const totalSize = files.reduce((sum, file) => sum + file.size, 0);

				if (totalSize > MAX_TOTAL_SIZE) {
					return NextResponse.json(
						{
							success: false,
							error: "Total file size exceeds limit",
							code: "SIZE_LIMIT_EXCEEDED",
							maxSize: MAX_TOTAL_SIZE,
						},
						{ status: 413 }
					);
				}

				// Validate individual files
				for (const file of files) {
					if (file.size > MAX_FILE_SIZE) {
						return NextResponse.json(
							{
								success: false,
								error: `File ${file.name} exceeds size limit`,
								code: "FILE_SIZE_EXCEEDED",
								fileName: file.name,
								maxSize: MAX_FILE_SIZE,
							},
							{ status: 413 }
						);
					}

					if (!ALLOWED_TYPES.includes(file.type)) {
						return NextResponse.json(
							{
								success: false,
								error: `File type not allowed: ${file.type}`,
								code: "INVALID_FILE_TYPE",
								fileName: file.name,
								fileType: file.type,
							},
							{ status: 400 }
						);
					}

					// Check for potentially malicious files
					if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
						return NextResponse.json(
							{
								success: false,
								error: "Invalid file name",
								code: "INVALID_FILE_NAME",
								fileName: file.name,
							},
							{ status: 400 }
						);
					}
				}

				const supabase = await createSupabaseServerClient();

				// Verify investigation access
				const { data: hasAccess } = await supabase.rpc("check_investigation_permission", {
					p_investigation_id: validatedData.investigationId,
					p_user_id: (request as any).user.id,
					p_required_level: "editor",
				});

				if (!hasAccess) {
					return NextResponse.json(
						{
							success: false,
							error: "Access denied to investigation",
							code: "ACCESS_DENIED",
						},
						{ status: 403 }
					);
				}

				// Start processing orchestrator if needed
				const queueStatus = processingOrchestrator.getQueueStatus();
				if (queueStatus.processing === 0 && queueStatus.pending === 0) {
					await processingOrchestrator.start();
				}

				const uploadResults = [];

				for (const file of files) {
					try {
						// Generate unique file ID and path
						const fileId = generateUniqueId();
						const metadata = extractFileMetadata(file);
						const sanitizedName = sanitizeFilename(file.name);
						const filePath = `${validatedData.investigationId}/${fileId}_${sanitizedName}`;

						// Upload file to Supabase Storage
						const { data: uploadResult, error: uploadError } = await supabase.storage.from("evidence-files").upload(filePath, file, {
							cacheControl: "3600",
							upsert: false,
						});

						if (uploadError) {
							throw new Error(`Storage upload failed: ${uploadError.message}`);
						}

						// Calculate file checksum
						const checksum = await generateChecksum(file);

						// Create file record in database
						const evidenceFile = {
							id: fileId,
							investigation_id: validatedData.investigationId,
							original_name: file.name,
							file_name: sanitizedName,
							file_path: filePath,
							file_size: file.size,
							file_type: metadata.extension,
							mime_type: file.type,
							checksum,
							upload_status: "uploaded" as const,
							processing_status: "queued" as const,
							access_level: "restricted" as const,
							metadata: {
								lastModified: metadata.lastModified,
								extension: metadata.extension,
								uploadTimestamp: new Date().toISOString(),
								uploadedBy: (request as any).user.id,
								priority: validatedData.priority,
								customAnalysisTypes: validatedData.analysisTypes,
							},
						};

						const { data: fileRecord, error: dbError } = await supabase.from("evidence_files").insert([evidenceFile]).select().single();

						if (dbError) {
							console.error("Database error:", dbError);
							throw new Error("Failed to save file record");
						}

						// Queue for AI processing using the orchestrator
						const processingJobId = await queueEnhancedFileProcessing(fileId, file, filePath, validatedData.investigationId, (request as any).user.id, validatedData.priority as any, validatedData.analysisTypes);

						// Update file record with processing job ID
						await supabase
							.from("evidence_files")
							.update({
								metadata: {
									...evidenceFile.metadata,
									processingJobId,
								},
							})
							.eq("id", fileId);

						uploadResults.push({
							fileId,
							fileName: file.name,
							status: "uploaded",
							path: filePath,
							processingJobId,
							estimatedProcessingTime: "2-5 minutes", // TODO: Get from orchestrator
						});

						// Log file upload
						await auditEvents.fileUploaded(fileId, file.name, file.size);
					} catch (error) {
						console.error(`Upload failed for file ${file.name}:`, error);
						uploadResults.push({
							fileName: file.name,
							status: "failed",
							error: error instanceof Error ? error.message : "Upload failed",
						});
					}
				}

				// Update investigation file counts
				await updateInvestigationStats(validatedData.investigationId, supabase);

				const successfulUploads = uploadResults.filter((r) => r.status === "uploaded");
				const failedUploads = uploadResults.filter((r) => r.status === "failed");

				return NextResponse.json({
					success: true,
					message: `Upload completed: ${successfulUploads.length} successful, ${failedUploads.length} failed`,
					results: uploadResults,
					investigation: validatedData.investigationId,
					queueInfo: processingOrchestrator.getQueueStatus(),
				});
			} catch (error) {
				console.error("Enhanced upload API error:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							success: false,
							error: "Invalid upload data",
							details: error.errors,
							code: "VALIDATION_ERROR",
						},
						{ status: 400 }
					);
				}

				return NextResponse.json(
					{
						success: false,
						error: "Upload failed",
						code: "INTERNAL_ERROR",
					},
					{ status: 500 }
				);
			}
		})
	)
);

// Enhanced AI processing queue function using the orchestrator
async function queueEnhancedFileProcessing(fileId: string, file: File, filePath: string, investigationId: string, userId: string, priority: "low" | "medium" | "high" | "critical" = "medium", customAnalysisTypes?: string[]): Promise<string> {
	try {
		// Map priority string to enum
		const priorityMap: Record<string, ProcessingPriority> = {
			low: ProcessingPriority.LOW,
			medium: ProcessingPriority.MEDIUM,
			high: ProcessingPriority.HIGH,
			critical: ProcessingPriority.CRITICAL,
		};

		// Map analysis type strings to enums
		const analysisTypeMap: Record<string, AIAnalysisType> = {
			object_detection: AIAnalysisType.OBJECT_DETECTION,
			ocr: AIAnalysisType.OCR,
			face_recognition: AIAnalysisType.FACE_RECOGNITION,
			video_analysis: AIAnalysisType.VIDEO_ANALYSIS,
			audio_transcription: AIAnalysisType.AUDIO_TRANSCRIPTION,
			metadata_extraction: AIAnalysisType.METADATA_EXTRACTION,
		};

		// Create processing context
		const context: ProcessingContext = {
			fileId,
			fileName: file.name,
			filePath,
			mimeType: file.type,
			fileSize: file.size,
			investigationId,
			userId,
			priority: priorityMap[priority],
			retryCount: 0,
		};

		// Map custom analysis types if provided
		let mappedAnalysisTypes: AIAnalysisType[] | undefined;
		if (customAnalysisTypes) {
			mappedAnalysisTypes = customAnalysisTypes.map((type) => analysisTypeMap[type]).filter(Boolean);
		}

		// Determine processing options based on file type and priority
		const processingOptions = {
			quality: priority === "critical" ? "high_quality" : priority === "high" ? "balanced" : "fast",
			enableParallelProcessing: true,
			analysisDepth: priority === "critical" ? "comprehensive" : "standard",
		};

		// Queue for processing
		const jobId = await processingOrchestrator.queueProcessing(context, processingOptions, mappedAnalysisTypes);

		console.log(`Queued file ${fileId} for enhanced AI processing with job ID: ${jobId}`);
		return jobId;
	} catch (error) {
		console.error(`Failed to queue file ${fileId} for enhanced processing:`, error);
		throw new Error("Failed to queue file for AI processing");
	}
}

async function updateInvestigationStats(investigationId: string, supabase: any) {
	const { data: files } = await supabase.from("evidence_files").select("file_size, processing_status").eq("investigation_id", investigationId);

	if (files) {
		const totalFiles = files.length;
		const processedFiles = files.filter((f: any) => f.processing_status === "completed").length;
		const queuedFiles = files.filter((f: any) => f.processing_status === "queued").length;
		const processingFiles = files.filter((f: any) => f.processing_status === "processing").length;
		const totalSize = files.reduce((sum: number, file: any) => sum + file.file_size, 0);

		await supabase
			.from("investigations")
			.update({
				total_files: totalFiles,
				processed_files: processedFiles,
				queued_files: queuedFiles,
				processing_files: processingFiles,
				total_size: totalSize,
				last_updated: new Date().toISOString(),
			})
			.eq("id", investigationId);
	}
}

async function generateChecksum(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
