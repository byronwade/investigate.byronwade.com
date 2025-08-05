import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

// GET /api/investigations/[id] - Get investigation details
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;

		// Mock data for now - replace with actual database call
		const mockInvestigation = {
			id,
			name: "Investigation Analysis",
			description: "AI-powered evidence exploration",
			status: "active",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			file_count: 0,
			processing_files: 0,
			completed_files: 0,
			total_size: 0,
			creator: {
				name: "Current User",
				email: "user@investigatai.com",
			},
			tags: [],
			priority: "medium",
		};

		return NextResponse.json({
			data: mockInvestigation,
			success: true,
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch investigation",
				success: false,
			},
			{ status: 500 }
		);
	}
}

// PUT /api/investigations/[id] - Update investigation
export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const body = await request.json();

		// Mock response - replace with actual database update
		return NextResponse.json({
			data: { id, ...body },
			success: true,
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{
				error: "Failed to update investigation",
				success: false,
			},
			{ status: 500 }
		);
	}
}
