import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Simple test endpoint without middleware
export async function GET(request: NextRequest) {
	try {
		console.log("Test endpoint hit");

		// Test basic response
		return NextResponse.json({
			success: true,
			message: "Basic endpoint works",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Test endpoint error:", error);
		return NextResponse.json(
			{
				error: "Test endpoint failed",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Test with Supabase connection
export async function POST(request: NextRequest) {
	try {
		console.log("Test POST endpoint hit");

		const cookieStore = cookies();
		const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

		// Test Supabase connection
		const { data: session, error: sessionError } = await supabase.auth.getSession();

		return NextResponse.json({
			success: true,
			message: "Supabase connection works",
			hasSession: !!session?.session,
			sessionError: sessionError?.message || null,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Test POST endpoint error:", error);
		return NextResponse.json(
			{
				error: "Test POST endpoint failed",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
