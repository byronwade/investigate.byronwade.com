// Core shared types for InvestigatAI platform

export type ID = string;
export type Timestamp = string; // ISO 8601 format

// Pagination types
export interface PaginationOptions {
	page: number;
	limit: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
	items: T[];
	totalCount: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

// Result wrapper types
export interface Result<T, E = Error> {
	success: boolean;
	data?: T;
	error?: E;
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

// User roles and permissions
export enum UserRole {
	ADMIN = "admin",
	INVESTIGATOR = "investigator",
	VIEWER = "viewer",
}

export type Permission = "investigation:create" | "investigation:read:own" | "investigation:read:shared" | "investigation:update:own" | "investigation:delete:own" | "evidence:upload" | "evidence:view:own" | "evidence:view:shared" | "evidence:analyze" | "evidence:delete" | "user:manage" | "audit:view" | "*"; // Admin wildcard

// Data classification for security
export enum DataClassification {
	PUBLIC = "public",
	INTERNAL = "internal",
	CONFIDENTIAL = "confidential",
	RESTRICTED = "restricted",
}

// Processing status types
export enum ProcessingStatus {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

// Investigation status
export enum InvestigationStatus {
	DRAFT = "draft",
	ACTIVE = "active",
	COMPLETED = "completed",
	ARCHIVED = "archived",
	SUSPENDED = "suspended",
}

// Evidence file types
export enum EvidenceFileType {
	IMAGE = "image",
	VIDEO = "video",
	AUDIO = "audio",
	DOCUMENT = "document",
	OTHER = "other",
}

// AI Analysis types
export enum AIAnalysisType {
	OCR = "ocr",
	OBJECT_DETECTION = "object_detection",
	FACE_RECOGNITION = "face_recognition",
	TEXT_EXTRACTION = "text_extraction",
	METADATA_EXTRACTION = "metadata_extraction",
	VIDEO_ANALYSIS = "video_analysis",
	AUDIO_TRANSCRIPTION = "audio_transcription",
}

// Risk levels for audit
export enum RiskLevel {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
}

// Entity types for investigation
export enum EntityType {
	PERSON = "person",
	ORGANIZATION = "organization",
	LOCATION = "location",
	VEHICLE = "vehicle",
	OBJECT = "object",
	EVENT = "event",
	DOCUMENT = "document",
}

// Confidence score (0-1)
export type ConfidenceScore = number;

// Coordinate types
export interface Coordinates {
	latitude: number;
	longitude: number;
	altitude?: number;
}

export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

// API Response formats
export interface APIResponse<T> {
	data: T;
	meta?: Record<string, any>;
	pagination?: Omit<PaginatedResult<any>, "items">;
}

export interface APIError {
	error: string;
	code: string;
	details?: any;
}
