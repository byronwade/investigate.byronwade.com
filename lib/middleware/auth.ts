import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logServerAuditEvent } from "@/lib/audit";

export interface AuthenticatedRequest extends NextRequest {
	user: {
		id: string;
		email: string;
		role?: string;
	};
}

// Middleware to authenticate API requests
export async function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
	return async (request: NextRequest) => {
		try {
			const cookieStore = cookies();
			const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

			// Get the session from Supabase
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.user) {
				return NextResponse.json({ error: "Authentication required", code: "AUTH_REQUIRED" }, { status: 401 });
			}

			// Get user profile for role information
			const { data: profile } = await supabase.from("user_profiles").select("role, is_active").eq("id", session.user.id).single();

			// Check if user is active
			if (profile && !profile.is_active) {
				return NextResponse.json({ error: "Account is deactivated", code: "ACCOUNT_INACTIVE" }, { status: 403 });
			}

			// Attach user info to request
			(request as AuthenticatedRequest).user = {
				id: session.user.id,
				email: session.user.email!,
				role: profile?.role || "investigator",
			};

			// Log API access
			await logServerAuditEvent(session.user.id, {
				action: "api_access",
				resourceType: "api",
				details: {
					endpoint: request.nextUrl.pathname,
					method: request.method,
					userAgent: request.headers.get("user-agent"),
				},
				riskLevel: "low",
				ipAddress: getClientIP(request),
				userAgent: request.headers.get("user-agent") || undefined,
			});

			return handler(request as AuthenticatedRequest);
		} catch (error) {
			console.error("Auth middleware error:", error);
			return NextResponse.json({ error: "Authentication failed", code: "AUTH_ERROR" }, { status: 500 });
		}
	};
}

// Middleware for role-based access control
export function withRole(requiredRole: string | string[]) {
	return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
		return withAuth(async (request: AuthenticatedRequest) => {
			const userRole = request.user.role;
			const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

			// Admin role has access to everything
			if (userRole === "admin" || roles.includes(userRole || "")) {
				return handler(request);
			}

			// Log unauthorized access attempt
			await logServerAuditEvent(request.user.id, {
				action: "unauthorized_access_attempt",
				resourceType: "api",
				details: {
					requiredRole: roles,
					userRole,
					endpoint: request.nextUrl.pathname,
				},
				riskLevel: "medium",
				ipAddress: getClientIP(request),
			});

			return NextResponse.json(
				{
					error: "Insufficient permissions",
					code: "INSUFFICIENT_PERMISSIONS",
					required: roles,
					current: userRole,
				},
				{ status: 403 }
			);
		});
	};
}

// Middleware for investigation ownership/permission checks
export function withInvestigationAccess(permission: "owner" | "editor" | "viewer" = "viewer") {
	return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
		return withAuth(async (request: AuthenticatedRequest) => {
			try {
				// Extract investigation ID from URL or request body
				const investigationId = getInvestigationIdFromRequest(request);

				if (!investigationId) {
					return NextResponse.json({ error: "Investigation ID required", code: "MISSING_INVESTIGATION_ID" }, { status: 400 });
				}

				const cookieStore = cookies();
				const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

				// Check permission using the database function
				const { data: hasPermission } = await supabase.rpc("check_investigation_permission", {
					p_investigation_id: investigationId,
					p_user_id: request.user.id,
					p_required_level: permission,
				});

				if (!hasPermission) {
					// Log unauthorized access attempt
					await logServerAuditEvent(request.user.id, {
						action: "unauthorized_investigation_access",
						resourceType: "investigation",
						resourceId: investigationId,
						details: {
							requiredPermission: permission,
							endpoint: request.nextUrl.pathname,
						},
						riskLevel: "high",
						ipAddress: getClientIP(request),
					});

					return NextResponse.json(
						{
							error: "Access denied to investigation",
							code: "INVESTIGATION_ACCESS_DENIED",
						},
						{ status: 403 }
					);
				}

				return handler(request);
			} catch (error) {
				console.error("Investigation access check error:", error);
				return NextResponse.json({ error: "Permission check failed", code: "PERMISSION_CHECK_ERROR" }, { status: 500 });
			}
		});
	};
}

// Rate limiting middleware
export function withRateLimit(
	requests: number = 100,
	windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
	const requests_map = new Map<string, { count: number; resetTime: number }>();

	return function (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
		return async (request: AuthenticatedRequest) => {
			const clientIP = getClientIP(request);
			const key = `${clientIP}-${request.user.id}`;
			const now = Date.now();

			// Clean up old entries
			for (const [k, v] of requests_map.entries()) {
				if (v.resetTime < now) {
					requests_map.delete(k);
				}
			}

			const current = requests_map.get(key);

			if (!current) {
				requests_map.set(key, { count: 1, resetTime: now + windowMs });
			} else if (current.resetTime < now) {
				requests_map.set(key, { count: 1, resetTime: now + windowMs });
			} else if (current.count >= requests) {
				// Log rate limit exceeded
				await logServerAuditEvent(request.user.id, {
					action: "rate_limit_exceeded",
					resourceType: "api",
					details: {
						endpoint: request.nextUrl.pathname,
						limit: requests,
						window: windowMs,
					},
					riskLevel: "medium",
					ipAddress: clientIP,
				});

				return NextResponse.json(
					{
						error: "Rate limit exceeded",
						code: "RATE_LIMIT_EXCEEDED",
						retryAfter: Math.ceil((current.resetTime - now) / 1000),
					},
					{
						status: 429,
						headers: {
							"Retry-After": Math.ceil((current.resetTime - now) / 1000).toString(),
							"X-RateLimit-Limit": requests.toString(),
							"X-RateLimit-Remaining": "0",
							"X-RateLimit-Reset": current.resetTime.toString(),
						},
					}
				);
			} else {
				current.count++;
			}

			return handler(request);
		};
	};
}

// Utility functions
function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const realIP = request.headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIP) {
		return realIP;
	}

	return request.ip || "unknown";
}

function getInvestigationIdFromRequest(request: NextRequest): string | null {
	// Try to get from URL parameters
	const url = new URL(request.url);
	const pathParts = url.pathname.split("/");

	// Look for investigation ID in common URL patterns
	const investigationIndex = pathParts.findIndex((part) => part === "investigations");
	if (investigationIndex !== -1 && pathParts[investigationIndex + 1]) {
		return pathParts[investigationIndex + 1];
	}

	// Try to get from query parameters
	const investigationId = url.searchParams.get("investigationId") || url.searchParams.get("investigation_id");

	if (investigationId) {
		return investigationId;
	}

	// For POST/PUT requests, try to get from body (would need to be implemented per route)
	return null;
}

// Helper to validate UUID format
export function isValidUUID(uuid: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(uuid);
}

// Security headers middleware
export function withSecurityHeaders(handler: (req: NextRequest) => Promise<NextResponse>) {
	return async (request: NextRequest) => {
		const response = await handler(request);

		// Add security headers
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("X-Frame-Options", "DENY");
		response.headers.set("X-XSS-Protection", "1; mode=block");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:;");

		return response;
	};
}
