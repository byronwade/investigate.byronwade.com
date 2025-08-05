export interface Investigation {
	id: string;
	name: string;
	description?: string;
	status: "draft" | "active" | "completed" | "archived";
	created_at: string;
	updated_at: string;
	created_by: string;
	total_files: number;
	processed_files: number;
	total_size: number;
}

export interface EvidenceFile {
	id: string;
	investigation_id: string;
	original_name: string;
	file_name: string;
	file_path: string;
	file_size: number;
	file_type: string;
	mime_type: string;
	checksum: string;
	upload_status: "pending" | "uploading" | "uploaded" | "processing" | "completed" | "failed";
	processing_status: "pending" | "processing" | "completed" | "failed";
	created_at: string;
	updated_at: string;
	metadata?: Record<string, any>;
}

export interface AIAnalysis {
	id: string;
	file_id: string;
	analysis_type: "ocr" | "object_detection" | "face_recognition" | "audio_transcription" | "metadata_extraction";
	status: "pending" | "processing" | "completed" | "failed";
	results: Record<string, any>;
	confidence_scores?: Record<string, number>;
	processing_time?: number;
	created_at: string;
	updated_at: string;
}

export interface Entity {
	id: string;
	investigation_id: string;
	type: "person" | "location" | "object" | "organization" | "event";
	name: string;
	description?: string;
	confidence: number;
	attributes: Record<string, any>;
	created_at: string;
	updated_at: string;
}

export interface TimelineEvent {
	id: string;
	investigation_id: string;
	file_id?: string;
	entity_id?: string;
	title: string;
	description?: string;
	event_date: string;
	event_type: "file_creation" | "file_modification" | "detected_event" | "manual_entry";
	location?: {
		latitude?: number;
		longitude?: number;
		address?: string;
	};
	created_at: string;
	updated_at: string;
}

export interface EntityRelationship {
	id: string;
	investigation_id: string;
	source_entity_id: string;
	target_entity_id: string;
	relationship_type: string;
	confidence: number;
	evidence_files: string[];
	created_at: string;
	updated_at: string;
}

export interface ProcessingJob {
	id: string;
	file_id: string;
	job_type: string;
	status: "queued" | "processing" | "completed" | "failed";
	progress: number;
	error_message?: string;
	started_at?: string;
	completed_at?: string;
	estimated_completion?: string;
}

export interface UploadProgress {
	fileId: string;
	fileName: string;
	progress: number;
	status: "uploading" | "processing" | "completed" | "failed";
	error?: string;
	estimatedTimeRemaining?: number;
}

export interface SearchFilters {
	fileTypes?: string[];
	dateRange?: {
		start: string;
		end: string;
	};
	entities?: string[];
	confidence?: {
		min: number;
		max: number;
	};
	hasAnalysis?: string[];
}

export interface SearchResult {
	file: EvidenceFile;
	analysis: AIAnalysis[];
	entities: Entity[];
	relevanceScore: number;
	highlights: string[];
}

export interface InvestigationStats {
	totalFiles: number;
	processedFiles: number;
	totalSize: number;
	entitiesFound: number;
	timelineEvents: number;
	processingTimeRemaining: number;
	fileTypeBreakdown: Record<string, number>;
	confidenceDistribution: Record<string, number>;
}
