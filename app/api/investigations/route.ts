import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";
import { auditEvents } from "@/lib/audit";
import { generateInvestigationId } from "@/lib/utils";
import { z } from "zod";

// Validation schemas
const CreateInvestigationSchema = z.object({
	name: z.string().min(1, "Investigation name is required").max(255, "Name too long"),
	description: z.string().max(1000, "Description too long").optional(),
	access_level: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
});

const InvestigationQuerySchema = z.object({
	status: z.enum(["draft", "active", "completed", "archived"]).optional(),
	limit: z.number().min(1).max(100).optional(),
	offset: z.number().min(0).optional(),
});

// POST /api/investigations - Create new investigation
export const POST = withSecurityHeaders(
	withRateLimit(
		10,
		15 * 60 * 1000
	)(
		withAuth(async (request) => {
			try {
				const body = await request.json();
				const validatedData = CreateInvestigationSchema.parse(body);

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Create investigation in database
				const investigation = {
					id: generateInvestigationId(),
					name: validatedData.name,
					description: validatedData.description || null,
					status: "draft" as const,
					created_by: request.user.id,
					total_files: 0,
					processed_files: 0,
					total_size: 0,
				};

				const { data, error } = await supabase.from("investigations").insert([investigation]).select().single();

				if (error) {
					console.error("Database error:", error);
					return NextResponse.json({ error: "Failed to create investigation", code: "DATABASE_ERROR" }, { status: 500 });
				}

				// Log audit event
				await auditEvents.investigationCreated(data.id, {
					name: data.name,
					description: data.description,
				});

				return NextResponse.json({ data }, { status: 201 });
			} catch (error) {
				console.error("API error:", error);

				if (error instanceof z.ZodError) {
					return NextResponse.json(
						{
							error: "Invalid investigation data",
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

// GET /api/investigations - List investigations for authenticated user
export const GET = withSecurityHeaders(
	withRateLimit(
		30,
		15 * 60 * 1000
	)(
		withAuth(async (request) => {
			try {
				const url = new URL(request.url);
				const queryParams = Object.fromEntries(url.searchParams.entries());

				const validatedQuery = InvestigationQuerySchema.parse({
					...queryParams,
					limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
					offset: queryParams.offset ? parseInt(queryParams.offset) : undefined,
				});

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				let query = supabase
					.from("investigations")
					.select(
						`
						*,
						user_profiles!investigations_created_by_fkey(
							first_name,
							last_name,
							email
						)
					`
					)
					.eq("created_by", request.user.id) // Filter by current user
					.order("created_at", { ascending: false });

				// Apply filters
				if (validatedQuery.status) {
					query = query.eq("status", validatedQuery.status);
				}

				// Apply pagination
				const limit = validatedQuery.limit || 20;
				const offset = validatedQuery.offset || 0;
				query = query.range(offset, offset + limit - 1);

				const { data, error, count } = await query;

				if (error) {
					console.error("Database error:", error);
					return NextResponse.json({ error: "Failed to fetch investigations", code: "DATABASE_ERROR" }, { status: 500 });
				}

				return NextResponse.json({
					data: data || [],
					pagination: {
						limit,
						offset,
						total: count || 0,
					},
				});
			} catch (error) {
				console.error("API error:", error);

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
);
