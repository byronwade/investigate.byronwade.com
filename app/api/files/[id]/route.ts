import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents, logFileAccess } from "@/lib/audit";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

// GET /api/files/[id] - Get file details
export const GET = withSecurityHeaders(
	withRateLimit(
		50,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Get file with investigation access check
				const { data: file, error: fileError } = await supabase
					.from("evidence_files")
					.select(
						`
						*,
						investigations!inner(
							id,
							name,
							created_by,
							status
						),
						ai_analysis(
							id,
							analysis_type,
							status,
							results,
							confidence_scores,
							created_at
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

				// Log file view
				await logFileAccess(id, "view", request.user.id);

				return NextResponse.json({ data: file });
			} catch (error) {
				console.error("File details error:", error);
				return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);

// DELETE /api/files/[id] - Delete file
export const DELETE = withSecurityHeaders(
	withRateLimit(
		10,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
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

				// Check investigation access (need editor permission to delete files)
				const { data: hasAccess } = await supabase.rpc("check_investigation_permission", {
					p_investigation_id: file.investigation_id,
					p_user_id: request.user.id,
					p_required_level: "editor",
				});

				if (!hasAccess) {
					return NextResponse.json({ error: "Access denied to delete file", code: "ACCESS_DENIED" }, { status: 403 });
				}

				// Prevent deletion of files being processed
				if (file.processing_status === "processing") {
					return NextResponse.json(
						{
							error: "Cannot delete file while processing",
							code: "FILE_PROCESSING",
							status: file.processing_status,
						},
						{ status: 409 }
					);
				}

				// Delete from storage first
				const { error: storageError } = await supabase.storage.from("evidence-files").remove([file.file_path]);

				if (storageError) {
					console.error("Storage deletion error:", storageError);
					// Continue with database deletion even if storage fails
				}

				// Delete from database (CASCADE will handle related records)
				const { error: dbError } = await supabase.from("evidence_files").delete().eq("id", id);

				if (dbError) {
					console.error("Database deletion error:", dbError);
					return NextResponse.json({ error: "Failed to delete file", code: "DATABASE_ERROR" }, { status: 500 });
				}

				// Update investigation statistics
				await supabase.rpc("update_investigation_stats", {
					p_investigation_id: file.investigation_id,
				});

				// Log file deletion
				await auditEvents.fileDeleted(id, file.original_name);

				return NextResponse.json({
					message: "File deleted successfully",
					code: "SUCCESS",
				});
			} catch (error) {
				console.error("File deletion error:", error);
				return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);
