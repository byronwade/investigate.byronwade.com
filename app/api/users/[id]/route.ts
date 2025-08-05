import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withRole, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents } from "@/lib/audit";
import { z } from "zod";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

const UpdateUserSchema = z.object({
	role: z.enum(["admin", "investigator", "viewer"]).optional(),
	isActive: z.boolean().optional(),
	department: z.string().max(100).optional(),
	organization: z.string().max(100).optional(),
});

// GET /api/users/[id] - Get user details
export const GET = withSecurityHeaders(
	withRateLimit(
		30,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Users can view their own profile, admins can view any profile
				if (request.user.role !== "admin" && request.user.id !== id) {
					return NextResponse.json({ error: "Access denied", code: "ACCESS_DENIED" }, { status: 403 });
				}

				const { data: user, error } = await supabase.from("user_profiles").select("*").eq("id", id).single();

				if (error || !user) {
					return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 });
				}

				// Remove sensitive information for non-admin users
				if (request.user.role !== "admin" && request.user.id !== id) {
					const { phone, last_login_at, login_count, ...publicUser } = user;
					return NextResponse.json({ user: publicUser });
				}

				return NextResponse.json({ user });
			} catch (error) {
				console.error("User details error:", error);
				return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
			}
		})
	)
);

// PUT /api/users/[id] - Update user
export const PUT = withSecurityHeaders(
	withRateLimit(
		10,
		15 * 60 * 1000
	)(
		withAuth(async (request, { params }: RouteParams) => {
			try {
				const { id } = await params;
				const body = await request.json();
				const validatedData = UpdateUserSchema.parse(body);

				if (Object.keys(validatedData).length === 0) {
					return NextResponse.json({ error: "No update data provided", code: "VALIDATION_ERROR" }, { status: 400 });
				}

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Check permissions
				const canUpdateRole = request.user.role === "admin";
				const canUpdateProfile = request.user.role === "admin" || request.user.id === id;

				if (!canUpdateProfile) {
					return NextResponse.json({ error: "Access denied", code: "ACCESS_DENIED" }, { status: 403 });
				}

				// Non-admins cannot update role or active status
				if (!canUpdateRole && (validatedData.role || validatedData.isActive !== undefined)) {
					return NextResponse.json({ error: "Insufficient permissions to update role or status", code: "INSUFFICIENT_PERMISSIONS" }, { status: 403 });
				}

				// Get current user data for audit log
				const { data: currentUser } = await supabase.from("user_profiles").select("role, is_active").eq("id", id).single();

				const { data: updatedUser, error } = await supabase.from("user_profiles").update(validatedData).eq("id", id).select().single();

				if (error) {
					console.error("Database error:", error);
					return NextResponse.json({ error: "Failed to update user", code: "DATABASE_ERROR" }, { status: 500 });
				}

				// Log audit event for role changes
				if (validatedData.role && currentUser?.role !== validatedData.role) {
					await auditEvents.userRoleChanged?.(id, {
						oldRole: currentUser.role,
						newRole: validatedData.role,
						changedBy: request.user.id,
					});
				}

				// Log audit event for status changes
				if (validatedData.isActive !== undefined && currentUser?.is_active !== validatedData.isActive) {
					await auditEvents.userStatusChanged?.(id, {
						oldStatus: currentUser.is_active,
						newStatus: validatedData.isActive,
						changedBy: request.user.id,
					});
				}

				return NextResponse.json({ user: updatedUser });
			} catch (error) {
				console.error("User update error:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid update data",
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

// DELETE /api/users/[id] - Deactivate user (admin only)
export const DELETE = withSecurityHeaders(
	withRateLimit(
		5,
		15 * 60 * 1000
	)(
		withRole("admin")(
			withAuth(async (request, { params }: RouteParams) => {
				try {
					const { id } = await params;
					// Prevent admin from deactivating themselves
					if (request.user.id === id) {
						return NextResponse.json({ error: "Cannot deactivate your own account", code: "SELF_DEACTIVATION" }, { status: 400 });
					}

					const cookieStore = cookies();
					const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

					// Get user details before deactivation
					const { data: user } = await supabase.from("user_profiles").select("email, role, first_name, last_name").eq("id", id).single();

					// Deactivate user instead of deleting
					const { error } = await supabase.from("user_profiles").update({ is_active: false }).eq("id", id);

					if (error) {
						console.error("Database error:", error);
						return NextResponse.json({ error: "Failed to deactivate user", code: "DATABASE_ERROR" }, { status: 500 });
					}

					// Log audit event
					await auditEvents.userDeactivated?.(id, {
						email: user?.email,
						role: user?.role,
						name: `${user?.first_name} ${user?.last_name}`,
						deactivatedBy: request.user.id,
					});

					return NextResponse.json({
						message: "User deactivated successfully",
						code: "USER_DEACTIVATED",
					});
				} catch (error) {
					console.error("User deactivation error:", error);
					return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 });
				}
			})
		)
	)
);
