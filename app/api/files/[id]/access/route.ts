import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { logFileAccess } from "@/lib/audit";
import { z } from "zod";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

const AccessTypeSchema = z.object({
	type: z.enum(["view", "download", "analyze"]),
	expiresIn: z.number().min(60).max(86400).optional(), // 1 minute to 24 hours
});

// POST /api/files/[id]/access - Generate signed URL for file access
export const POST = withSecurityHeaders(
	withRateLimit(
		30,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
				const body = await request.json();
				const { type, expiresIn = 3600 } = AccessTypeSchema.parse(body);

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Get file information and verify access
				const { data: file, error: fileError } = await supabase
					.from("evidence_files")
					.select(
						`
						*,
						investigations!inner(
							id,
							created_by,
							status
						)
					`
					)
					.eq("id", id)
					.single();

				if (fileError || !file) {
					return NextResponse.json({ error: "File not found", code: "FILE_NOT_FOUND" }, { status: 404 });
				}

				// Check investigation access
				const { data: hasAccess } = await supabase.rpc("check_investigation_permission", {
					p_investigation_id: file.investigation_id,
					p_user_id: request.user.id,
					p_required_level: "viewer",
				});

				if (!hasAccess) {
					return NextResponse.json({ error: "Access denied to file", code: "ACCESS_DENIED" }, { status: 403 });
				}

				// Check if file processing is complete for analysis requests
				if (type === "analyze" && file.processing_status !== "completed") {
					return NextResponse.json(
						{
							error: "File processing not complete",
							code: "PROCESSING_INCOMPLETE",
							status: file.processing_status,
						},
						{ status: 409 }
					);
				}

				// Generate signed URL
				const { data: signedUrl, error: urlError } = await supabase.storage.from("evidence-files").createSignedUrl(file.file_path, expiresIn);

				if (urlError || !signedUrl) {
					console.error("Failed to generate signed URL:", urlError);
					return NextResponse.json({ error: "Failed to generate access URL", code: "URL_GENERATION_FAILED" }, { status: 500 });
				}

				// Log file access
				await logFileAccess(id, type, request.user.id);

				// Increment access count for analytics
				await supabase
					.from("evidence_files")
					.update({
						metadata: {
							...file.metadata,
							access_count: (file.metadata?.access_count || 0) + 1,
							last_accessed: new Date().toISOString(),
							last_accessed_by: request.user.id,
						},
					})
					.eq("id", id);

				return NextResponse.json({
					url: signedUrl.signedUrl,
					expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
					file: {
						id: file.id,
						name: file.original_name,
						size: file.file_size,
						type: file.file_type,
						uploadStatus: file.upload_status,
						processingStatus: file.processing_status,
					},
				});
			} catch (error) {
				console.error("File access error:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid access request",
							details: error.errors,
							code: "VALIDATION_ERROR",
						},
						{ status: 400 }
					);
				}

				return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);

// GET /api/files/[id]/access - Get file access logs (admin only)
export const GET = withSecurityHeaders(
	withRateLimit(
		20,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
				// Only allow file owners or admins to view access logs
				if (request.user.role !== "admin") {
					return NextResponse.json({ error: "Admin access required", code: "INSUFFICIENT_PERMISSIONS" }, { status: 403 });
				}

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				const { data: accessLogs, error } = await supabase
					.from("file_access_logs")
					.select(
						`
						*,
						user_profiles!file_access_logs_user_id_fkey(
							first_name,
							last_name,
							email
						)
					`
					)
					.eq("file_id", id)
					.order("created_at", { ascending: false });

				if (error) {
					console.error("Database error:", error);
					return NextResponse.json({ error: "Failed to fetch access logs", code: "DATABASE_ERROR" }, { status: 500 });
				}

				return NextResponse.json({
					accessLogs: accessLogs || [],
				});
			} catch (error) {
				console.error("Access logs error:", error);
				return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);
