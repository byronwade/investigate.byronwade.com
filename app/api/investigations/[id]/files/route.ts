import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
	params: Promise<{
		id: string;
	}>;
}

// GET /api/investigations/[id]/files - Get files for investigation
export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		
		// Mock data for now - replace with actual database call
		const mockFiles = [
			{
				id: "1",
				investigation_id: id,
				original_name: "bank_statements_2023.pdf",
				file_size: 2456789,
				file_type: "pdf",
				mime_type: "application/pdf",
				upload_status: "uploaded",
				processing_status: "completed",
				created_at: "2024-01-15T10:30:00Z",
				analysis_results: {
					summary: "Bank statements showing suspicious transaction patterns with 12 flagged transfers",
					confidence: 0.89,
					entities: ["John Doe", "Crypto Exchange A", "Shell Corp #1"],
					metadata: { pages: 45, transactions: 234 }
				}
			},
			{
				id: "2",
				investigation_id: id,
				original_name: "suspicious_emails.mbox",
				file_size: 8945234,
				file_type: "mbox",
				mime_type: "application/mbox",
				upload_status: "uploaded",
				processing_status: "processing",
				created_at: "2024-01-16T09:15:00Z"
			},
			{
				id: "3",
				investigation_id: id,
				original_name: "crypto_wallet_data.json",
				file_size: 1234567,
				file_type: "json",
				mime_type: "application/json",
				upload_status: "uploaded",
				processing_status: "completed",
				created_at: "2024-01-17T14:22:00Z",
				analysis_results: {
					summary: "Cryptocurrency wallet with 156 transactions totaling $450,000",
					confidence: 0.95,
					entities: ["Wallet Address ABC123", "Exchange XYZ"],
					metadata: { transactions: 156, total_value: "$450,000" }
				}
			},
			{
				id: "4",
				investigation_id: id,
				original_name: "phone_records.xlsx",
				file_size: 892345,
				file_type: "xlsx",
				mime_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				upload_status: "uploaded",
				processing_status: "pending",
				created_at: "2024-01-18T11:30:00Z"
			}
		];

		return NextResponse.json({ 
			files: mockFiles,
			success: true 
		});
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ 
				error: "Failed to fetch files", 
				success: false 
			}, 
			{ status: 500 }
		);
	}
}