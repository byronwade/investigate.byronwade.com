import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withRole, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents } from "@/lib/audit";
import { z } from "zod";

// Validation schemas
const UserQuerySchema = z.object({
	role: z.enum(["admin", "investigator", "viewer"]).optional(),
	organization: z.string().optional(),
	isActive: z.boolean().optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
});

const UpdateUserSchema = z.object({
	role: z.enum(["admin", "investigator", "viewer"]).optional(),
	isActive: z.boolean().optional(),
	department: z.string().max(100).optional(),
	organization: z.string().max(100).optional(),
});

// GET /api/users - List users (admin only)
export const GET = withSecurityHeaders(
	withRateLimit(
		20,
		15 * 60 * 1000
	)(
		withRole("admin")(
			withAuth(async (request) => {
				try {
					const url = new URL(request.url);
					const queryParams = Object.fromEntries(url.searchParams.entries());

					const validatedQuery = UserQuerySchema.parse({
						...queryParams,
						isActive: queryParams.isActive ? queryParams.isActive === "true" : undefined,
						limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
						offset: queryParams.offset ? parseInt(queryParams.offset) : undefined,
					});

					const cookieStore = cookies();
					const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

					let query = supabase.from("user_profiles").select("*").order("created_at", { ascending: false });

					// Apply filters
					if (validatedQuery.role) {
						query = query.eq("role", validatedQuery.role);
					}

					if (validatedQuery.organization) {
						query = query.eq("organization", validatedQuery.organization);
					}

					if (validatedQuery.isActive !== undefined) {
						query = query.eq("is_active", validatedQuery.isActive);
					}

					// Apply pagination
					const limit = validatedQuery.limit || 20;
					const offset = validatedQuery.offset || 0;
					query = query.range(offset, offset + limit - 1);

					const { data: users, error, count } = await query;

					if (error) {
						console.error("Database error:", error);
						return NextResponse.json({ error: "Failed to fetch users", code: "DATABASE_ERROR" }, { status: 500 });
					}

					// Log admin access
					await auditEvents.adminAction?.("users_list_accessed", {
						adminId: request.user.id,
						filters: validatedQuery,
					});

					return NextResponse.json({
						users: users || [],
						pagination: {
							limit,
							offset,
							total: count || 0,
						},
					});
				} catch (error) {
					console.error("Users API error:", error);

					if (error instanceof z.ZodError) {
						return NextResponse.json(
							{
								error: "Invalid query parameters",
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
	)
);

// POST /api/users - Create user invitation (admin only)
export const POST = withSecurityHeaders(
	withRateLimit(
		5,
		15 * 60 * 1000
	)(
		withRole("admin")(
			withAuth(async (request) => {
				try {
					const body = await request.json();
					const { email, role, department, organization } = z
						.object({
							email: z.string().email(),
							role: z.enum(["admin", "investigator", "viewer"]),
							department: z.string().optional(),
							organization: z.string().optional(),
						})
						.parse(body);

					const cookieStore = cookies();
					const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

					// Check if user already exists
					const { data: existingUser } = await supabase.from("user_profiles").select("email").eq("email", email).single();

					if (existingUser) {
						return NextResponse.json({ error: "User already exists", code: "USER_EXISTS" }, { status: 409 });
					}

					// In a real implementation, you would send an invitation email
					// For now, we'll just log the invitation request
					await auditEvents.userInvitationSent?.(email, {
						role,
						department,
						organization,
						invitedBy: request.user.id,
					});

					return NextResponse.json({
						message: "User invitation sent",
						email,
						role,
						code: "INVITATION_SENT",
					});
				} catch (error) {
					console.error("User creation error:", error);

					if (error instanceof z.ZodError) {
						return NextResponse.json(
							{
								error: "Invalid user data",
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
	)
);
