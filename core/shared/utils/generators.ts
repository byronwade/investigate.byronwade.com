// ID and unique value generators for InvestigatAI

import { randomBytes, createHash } from "crypto";

/**
 * Generate a secure unique ID
 */
export function generateId(): string {
	return randomBytes(16).toString("hex");
}

/**
 * Generate a unique investigation ID with prefix
 */
export function generateInvestigationId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(4).toString("hex");
	return `inv_${timestamp}_${random}`;
}

/**
 * Generate a unique evidence file ID with prefix
 */
export function generateEvidenceFileId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(4).toString("hex");
	return `evd_${timestamp}_${random}`;
}

/**
 * Generate a unique entity ID with type prefix
 */
export function generateEntityId(type: string): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(4).toString("hex");
	return `${type.toLowerCase()}_${timestamp}_${random}`;
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
	return randomBytes(32).toString("hex");
}

/**
 * Generate audit log ID
 */
export function generateAuditId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(6).toString("hex");
	return `audit_${timestamp}_${random}`;
}

/**
 * Calculate SHA-256 checksum for file integrity
 */
export async function calculateChecksum(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Calculate SHA-256 checksum for buffer data
 */
export function calculateBufferChecksum(buffer: Buffer): string {
	return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Generate secure filename for storage
 */
export function generateSecureFilename(originalName: string): string {
	const ext = originalName.split(".").pop() || "";
	const timestamp = Date.now().toString(36);
	const random = randomBytes(8).toString("hex");
	return `${timestamp}_${random}.${ext}`;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
	// Remove or replace dangerous characters
	return filename
		.replace(/[^a-zA-Z0-9._-]/g, "_")
		.replace(/_{2,}/g, "_")
		.replace(/^_+|_+$/g, "")
		.substring(0, 255); // Limit length
}

/**
 * Generate secure API key
 */
export function generateApiKey(): string {
	const prefix = "iai_"; // InvestigatAI prefix
	const key = randomBytes(24).toString("base64").replace(/\+/g, "").replace(/\//g, "").replace(/=/g, "");
	return `${prefix}${key}`;
}

/**
 * Generate secure token for password reset, email verification, etc.
 */
export function generateSecureToken(): string {
	return randomBytes(32).toString("hex");
}

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(6).toString("hex");
	return `corr_${timestamp}_${random}`;
}

/**
 * Generate batch ID for processing operations
 */
export function generateBatchId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(4).toString("hex");
	return `batch_${timestamp}_${random}`;
}

/**
 * Generate analysis job ID
 */
export function generateAnalysisJobId(): string {
	const timestamp = Date.now().toString(36);
	const random = randomBytes(4).toString("hex");
	return `analysis_${timestamp}_${random}`;
}
