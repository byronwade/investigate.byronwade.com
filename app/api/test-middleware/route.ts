import { NextRequest, NextResponse } from "next/server";
import { withAuth, withSecurityHeaders, withRateLimit } from "@/lib/middleware/auth";

// Test each middleware individually

// Test 1: Just security headers
export const GET = withSecurityHeaders(async (request: NextRequest) => {
	try {
		return NextResponse.json({
			success: true,
			message: "Security headers middleware works",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Security headers test error:", error);
		return NextResponse.json(
			{
				error: "Security headers test failed",
				details: error.message,
			},
			{ status: 500 }
		);
	}
});

// Test 2: Security headers + Rate limit
export const POST = withSecurityHeaders(
	withRateLimit(
		10,
		15 * 60 * 1000
	)(async (request: NextRequest) => {
		try {
			return NextResponse.json({
				success: true,
				message: "Security headers + rate limit works",
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error("Rate limit test error:", error);
			return NextResponse.json(
				{
					error: "Rate limit test failed",
					details: error.message,
				},
				{ status: 500 }
			);
		}
	})
);

// Test 3: Full middleware chain (this will test auth)
export const PUT = withSecurityHeaders(
	withRateLimit(
		10,
		15 * 60 * 1000
	)(
		withAuth(async (request) => {
			try {
				return NextResponse.json({
					success: true,
					message: "Full middleware chain works",
					user: request.user,
					timestamp: new Date().toISOString(),
				});
			} catch (error) {
				console.error("Full middleware test error:", error);
				return NextResponse.json(
					{
						error: "Full middleware test failed",
						details: error.message,
					},
					{ status: 500 }
				);
			}
		})
	)
);
