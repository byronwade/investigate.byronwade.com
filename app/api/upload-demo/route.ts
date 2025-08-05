import { NextRequest, NextResponse } from "next/server";

// Simplified upload endpoint for demo purposes
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const investigationId = formData.get("investigationId") as string;
		const files = formData.getAll("files") as File[];

		if (!files || files.length === 0) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		const uploadResults = [];

		for (const file of files) {
			// Simulate processing time
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Mock successful upload
			uploadResults.push({
				fileId: Math.random().toString(36).substr(2, 9),
				fileName: file.name,
				status: "uploaded",
				size: file.size,
				type: file.type,
				processingStatus: "pending",
			});
		}

		return NextResponse.json({
			message: "Upload completed",
			results: uploadResults,
			investigation: investigationId,
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
