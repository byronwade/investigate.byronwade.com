import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents, logFileAccess } from "@/lib/audit";
import { extractFileMetadata, sanitizeFilename, generateUniqueId } from "@/lib/utils";
import { processOCR, processObjectDetection, processMetadataExtraction } from "@/lib/ai/processors";
import { z } from "zod";

// Validation schema
const UploadSchema = z.object({
	investigationId: z.string().uuid("Invalid investigation ID"),
});

// File validation constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB per file
const MAX_TOTAL_SIZE = 1024 * 1024 * 1024; // 1GB total per upload
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/json", "text/csv"];

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
				const files = formData.getAll("files") as File[];

				// Validate input
				const validatedData = UploadSchema.parse({ investigationId });

				if (!files || files.length === 0) {
					return NextResponse.json({ error: "No files provided", code: "NO_FILES" }, { status: 400 });
				}

				// Validate file constraints
				const totalSize = files.reduce((sum, file) => sum + file.size, 0);

				if (totalSize > MAX_TOTAL_SIZE) {
					return NextResponse.json(
						{
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
								error: "Invalid file name",
								code: "INVALID_FILE_NAME",
								fileName: file.name,
							},
							{ status: 400 }
						);
					}
				}

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Verify investigation access
				const { data: hasAccess } = await supabase.rpc("check_investigation_permission", {
					p_investigation_id: validatedData.investigationId,
					p_user_id: request.user.id,
					p_required_level: "editor",
				});

				if (!hasAccess) {
					return NextResponse.json({ error: "Access denied to investigation", code: "ACCESS_DENIED" }, { status: 403 });
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
							checksum: await generateChecksum(file),
							upload_status: "uploaded" as const,
							processing_status: "pending" as const,
							access_level: "restricted" as const,
							metadata: {
								lastModified: metadata.lastModified,
								extension: metadata.extension,
								uploadTimestamp: new Date().toISOString(),
								uploadedBy: request.user.id,
							},
						};

						const { data: fileRecord, error: dbError } = await supabase.from("evidence_files").insert([evidenceFile]).select().single();

						if (dbError) {
							console.error("Database error:", dbError);
							throw new Error("Failed to save file record");
						}

						uploadResults.push({
							fileId,
							fileName: file.name,
							status: "uploaded",
							path: filePath,
						});

						// Log file upload
						await auditEvents.fileUploaded(fileId, file.name, file.size);

						// Queue AI processing (fire and forget)
						queueFileProcessing(fileId, file, filePath, supabase).catch((error) => {
							console.error(`Processing failed for file ${fileId}:`, error);
						});
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

				return NextResponse.json({
					message: "Upload completed",
					results: uploadResults,
					investigation: validatedData.investigationId,
				});
			} catch (error) {
				console.error("Upload API error:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid upload data",
							details: error.errors,
							code: "VALIDATION_ERROR",
						},
						{ status: 400 }
					);
				}

				return NextResponse.json({ error: "Upload failed", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);

async function generateChecksum(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function queueFileProcessing(fileId: string, file: File, filePath: string, supabase: any) {
	try {
		// Update processing status
		await supabase.from("evidence_files").update({ processing_status: "processing" }).eq("id", fileId);

		const analyses = [];

		// Process based on file type
		if (file.type.startsWith("image/")) {
			// Convert file to base64 for AI processing
			const base64 = await fileToBase64(file);

			// OCR Analysis
			try {
				const ocrResult = await processOCR(base64);
				analyses.push({
					file_id: fileId,
					analysis_type: "ocr" as const,
					status: "completed" as const,
					results: ocrResult,
					confidence_scores: { overall: ocrResult.confidence },
				});
			} catch (error) {
				console.error("OCR processing failed:", error);
			}

			// Object Detection
			try {
				const objectResult = await processObjectDetection(base64);
				analyses.push({
					file_id: fileId,
					analysis_type: "object_detection" as const,
					status: "completed" as const,
					results: objectResult,
					confidence_scores: objectResult.objects.reduce((acc, obj, index) => {
						acc[`object_${index}`] = obj.confidence;
						return acc;
					}, {} as Record<string, number>),
				});
			} catch (error) {
				console.error("Object detection failed:", error);
			}
		}

		if (file.type === "application/pdf" || file.type.startsWith("text/")) {
			// Text extraction and metadata analysis
			try {
				const text = await extractTextFromFile(file);
				const metadataResult = await processMetadataExtraction(text, file.type);

				analyses.push({
					file_id: fileId,
					analysis_type: "metadata_extraction" as const,
					status: "completed" as const,
					results: metadataResult,
					confidence_scores: metadataResult.entities.reduce((acc, entity, index) => {
						acc[`entity_${index}`] = entity.confidence;
						return acc;
					}, {} as Record<string, number>),
				});
			} catch (error) {
				console.error("Metadata extraction failed:", error);
			}
		}

		// Save analysis results
		if (analyses.length > 0) {
			const { error } = await supabase.from("ai_analysis").insert(analyses);

			if (error) {
				console.error("Failed to save analysis results:", error);
			}
		}

		// Update processing status
		await supabase.from("evidence_files").update({ processing_status: "completed" }).eq("id", fileId);
	} catch (error) {
		console.error("File processing error:", error);

		// Mark as failed
		await supabase.from("evidence_files").update({ processing_status: "failed" }).eq("id", fileId);
	}
}

async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const result = reader.result as string;
			const base64 = result.split(",")[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
	});
}

async function extractTextFromFile(file: File): Promise<string> {
	if (file.type.startsWith("text/")) {
		return await file.text();
	}

	// For PDFs and other documents, you would use a library like pdf-parse
	// For now, return empty string
	return "";
}

async function updateInvestigationStats(investigationId: string, supabase: any) {
	const { data: files } = await supabase.from("evidence_files").select("file_size, processing_status").eq("investigation_id", investigationId);

	if (files) {
		const totalFiles = files.length;
		const processedFiles = files.filter((f) => f.processing_status === "completed").length;
		const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);

		await supabase
			.from("investigations")
			.update({
				total_files: totalFiles,
				processed_files: processedFiles,
				total_size: totalSize,
			})
			.eq("id", investigationId);
	}
}
