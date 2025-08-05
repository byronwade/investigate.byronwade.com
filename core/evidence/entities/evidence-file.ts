// Evidence File domain entity

import { ID, EvidenceFileType, ProcessingStatus, Coordinates, DataClassification } from "../../shared/types/common";
import { ValidationError, FileSizeExceedsLimitError, InvalidFileTypeError } from "../../shared/errors/domain-errors";
import { validateFilename, validateFileSize, validateMimeType, validateAndThrow } from "../../shared/utils/validators";
import { generateEvidenceFileId } from "../../shared/utils/generators";
import { FileMetadata } from "../value-objects/file-metadata";

export interface CreateEvidenceFileData {
	originalName: string;
	fileName: string;
	filePath: string;
	fileSize: number;
	mimeType: string;
	investigationId: string;
	uploadedBy: string;
	checksum: string;
	classification?: DataClassification;
	metadata?: Record<string, any>;
}

export interface EvidenceFilePersistenceData {
	id: string;
	investigation_id: string;
	original_name: string;
	file_name: string;
	file_path: string;
	file_size: number;
	file_type: string;
	mime_type: string;
	checksum: string;
	upload_status: string;
	processing_status: string;
	uploaded_by: string;
	uploaded_at: string;
	processed_at?: string;
	classification: DataClassification;
	metadata?: Record<string, any>;
	analysis_results?: any[];
}

export class EvidenceFile {
	private constructor(
		private readonly _id: ID,
		private readonly _investigationId: string,
		private readonly _metadata: FileMetadata,
		private readonly _filePath: string,
		private readonly _uploadedBy: string,
		private readonly _uploadedAt: Date,
		private _uploadStatus: "uploaded" | "failed",
		private _processingStatus: ProcessingStatus,
		private _processedAt?: Date,
		private _classification: DataClassification = DataClassification.INTERNAL,
		private _analysisResults: any[] = [],
		private _additionalMetadata: Record<string, any> = {}
	) {}

	// Factory method for creation
	static create(data: CreateEvidenceFileData): EvidenceFile {
		// Validate input data
		validateAndThrow(validateFilename(data.originalName), "originalName");
		validateAndThrow(validateFilename(data.fileName), "fileName");

		const maxSize = 100 * 1024 * 1024; // 100MB
		validateAndThrow(validateFileSize(data.fileSize, maxSize), "fileSize");

		const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/json", "text/csv"];
		validateAndThrow(validateMimeType(data.mimeType, allowedTypes), "mimeType");

		if (!data.investigationId || data.investigationId.trim().length === 0) {
			throw new ValidationError("investigationId", "Investigation ID is required");
		}

		if (!data.uploadedBy || data.uploadedBy.trim().length === 0) {
			throw new ValidationError("uploadedBy", "Uploaded by user ID is required");
		}

		if (!data.checksum || data.checksum.length !== 64) {
			throw new ValidationError("checksum", "Valid SHA-256 checksum is required");
		}

		// Create file metadata
		const fileMetadata = FileMetadata.create({
			originalName: data.originalName,
			fileName: data.fileName,
			mimeType: data.mimeType,
			size: data.fileSize,
			checksum: data.checksum,
			uploadedAt: new Date(),
			additionalData: data.metadata,
		});

		const id = generateEvidenceFileId();
		const now = new Date();

		return new EvidenceFile(id, data.investigationId, fileMetadata, data.filePath, data.uploadedBy, now, "uploaded", ProcessingStatus.PENDING, undefined, data.classification || DataClassification.INTERNAL, [], data.metadata || {});
	}

	// Factory method for reconstruction from database
	static fromPersistence(data: EvidenceFilePersistenceData): EvidenceFile {
		const fileMetadata = FileMetadata.fromPersistence({
			original_name: data.original_name,
			file_name: data.file_name,
			mime_type: data.mime_type,
			file_size: data.file_size,
			checksum: data.checksum,
			uploaded_at: data.uploaded_at,
			metadata: data.metadata,
		});

		return new EvidenceFile(data.id, data.investigation_id, fileMetadata, data.file_path, data.uploaded_by, new Date(data.uploaded_at), data.upload_status as "uploaded" | "failed", data.processing_status as ProcessingStatus, data.processed_at ? new Date(data.processed_at) : undefined, data.classification, data.analysis_results || [], data.metadata || {});
	}

	// Getters
	get id(): ID {
		return this._id;
	}
	get investigationId(): string {
		return this._investigationId;
	}
	get metadata(): FileMetadata {
		return this._metadata;
	}
	get filePath(): string {
		return this._filePath;
	}
	get uploadedBy(): string {
		return this._uploadedBy;
	}
	get uploadedAt(): Date {
		return this._uploadedAt;
	}
	get uploadStatus(): "uploaded" | "failed" {
		return this._uploadStatus;
	}
	get processingStatus(): ProcessingStatus {
		return this._processingStatus;
	}
	get processedAt(): Date | undefined {
		return this._processedAt;
	}
	get classification(): DataClassification {
		return this._classification;
	}
	get analysisResults(): ReadonlyArray<any> {
		return this._analysisResults;
	}
	get additionalMetadata(): Readonly<Record<string, any>> {
		return this._additionalMetadata;
	}

	// Convenience getters from metadata
	get originalName(): string {
		return this._metadata.originalName;
	}
	get fileName(): string {
		return this._metadata.fileName;
	}
	get fileSize(): number {
		return this._metadata.size;
	}
	get mimeType(): string {
		return this._metadata.mimeType;
	}
	get checksum(): string {
		return this._metadata.checksum;
	}
	get fileType(): EvidenceFileType {
		return this._metadata.fileType;
	}

	// Business methods
	startProcessing(): void {
		if (this._processingStatus === ProcessingStatus.PROCESSING) {
			throw new ValidationError("processingStatus", "File is already being processed");
		}

		if (this._processingStatus === ProcessingStatus.COMPLETED) {
			throw new ValidationError("processingStatus", "File has already been processed");
		}

		this._processingStatus = ProcessingStatus.PROCESSING;
	}

	markProcessingCompleted(analysisResults: any[]): void {
		if (this._processingStatus !== ProcessingStatus.PROCESSING) {
			throw new ValidationError("processingStatus", "File must be in processing state");
		}

		this._processingStatus = ProcessingStatus.COMPLETED;
		this._processedAt = new Date();
		this._analysisResults = analysisResults || [];
	}

	markProcessingFailed(error?: string): void {
		if (this._processingStatus !== ProcessingStatus.PROCESSING) {
			throw new ValidationError("processingStatus", "File must be in processing state");
		}

		this._processingStatus = ProcessingStatus.FAILED;
		this._processedAt = new Date();

		if (error) {
			this._additionalMetadata.processingError = error;
		}
	}

	retryProcessing(): void {
		if (this._processingStatus !== ProcessingStatus.FAILED) {
			throw new ValidationError("processingStatus", "Can only retry failed processing");
		}

		this._processingStatus = ProcessingStatus.PENDING;
		this._processedAt = undefined;
		delete this._additionalMetadata.processingError;
	}

	updateClassification(newClassification: DataClassification): void {
		this._classification = newClassification;
	}

	addAnalysisResult(result: any): void {
		this._analysisResults.push(result);
	}

	updateMetadata(key: string, value: any): void {
		this._additionalMetadata[key] = value;
	}

	removeMetadata(key: string): void {
		delete this._additionalMetadata[key];
	}

	// Query methods
	isImage(): boolean {
		return this._metadata.isImage();
	}

	isVideo(): boolean {
		return this._metadata.isVideo();
	}

	isAudio(): boolean {
		return this._metadata.isAudio();
	}

	isDocument(): boolean {
		return this._metadata.isDocument();
	}

	isProcessed(): boolean {
		return this._processingStatus === ProcessingStatus.COMPLETED;
	}

	isProcessing(): boolean {
		return this._processingStatus === ProcessingStatus.PROCESSING;
	}

	isPending(): boolean {
		return this._processingStatus === ProcessingStatus.PENDING;
	}

	hasFailed(): boolean {
		return this._processingStatus === ProcessingStatus.FAILED;
	}

	isReadyForAnalysis(): boolean {
		return this._uploadStatus === "uploaded" && (this._processingStatus === ProcessingStatus.PENDING || this._processingStatus === ProcessingStatus.FAILED);
	}

	hasGPSData(): boolean {
		return this._metadata.hasGPSCoordinates();
	}

	hasAnalysisResults(): boolean {
		return this._analysisResults.length > 0;
	}

	isRecentlyUploaded(withinDays: number = 7): boolean {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - withinDays);
		return this._uploadedAt >= cutoffDate;
	}

	getProcessingTimeInSeconds(): number | null {
		if (!this._processedAt) return null;
		return Math.floor((this._processedAt.getTime() - this._uploadedAt.getTime()) / 1000);
	}

	getFileExtension(): string {
		return this._metadata.getFileExtension();
	}

	// Get analysis results by type
	getAnalysisResultsByType(type: string): any[] {
		return this._analysisResults.filter((result) => result.analysis_type === type);
	}

	// Check if specific analysis type has been performed
	hasAnalysisType(type: string): boolean {
		return this._analysisResults.some((result) => result.analysis_type === type);
	}

	// Get overall confidence score from analysis results
	getOverallConfidence(): number {
		if (this._analysisResults.length === 0) return 0;

		const confidenceScores = this._analysisResults.map((result) => result.confidence || 0).filter((score) => score > 0);

		if (confidenceScores.length === 0) return 0;

		return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
	}

	// Duplicate detection
	isDuplicateOf(otherFile: EvidenceFile): boolean {
		return this._metadata.checksum === otherFile.checksum;
	}

	// File similarity based on metadata
	calculateSimilarity(otherFile: EvidenceFile): number {
		let similarity = 0;
		let factors = 0;

		// Same file type
		if (this.fileType === otherFile.fileType) {
			similarity += 0.3;
		}
		factors += 0.3;

		// Similar file size (within 10%)
		const sizeDiff = Math.abs(this.fileSize - otherFile.fileSize) / Math.max(this.fileSize, otherFile.fileSize);
		if (sizeDiff <= 0.1) {
			similarity += 0.2;
		}
		factors += 0.2;

		// Same uploader
		if (this._uploadedBy === otherFile.uploadedBy) {
			similarity += 0.1;
		}
		factors += 0.1;

		// Upload time proximity (within 1 hour)
		const timeDiff = Math.abs(this._uploadedAt.getTime() - otherFile.uploadedAt.getTime());
		if (timeDiff <= 3600000) {
			// 1 hour in milliseconds
			similarity += 0.2;
		}
		factors += 0.2;

		// GPS proximity if both have coordinates
		if (this.hasGPSData() && otherFile.hasGPSData()) {
			const coords1 = this._metadata.gpsCoordinates!;
			const coords2 = otherFile.metadata.gpsCoordinates!;
			const distance = this.calculateDistance(coords1, coords2);

			if (distance <= 1) {
				// Within 1 km
				similarity += 0.2;
			}
			factors += 0.2;
		}

		return factors > 0 ? similarity / factors : 0;
	}

	private calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
		const R = 6371; // Earth's radius in kilometers
		const dLat = this.toRadians(coords2.latitude - coords1.latitude);
		const dLon = this.toRadians(coords2.longitude - coords1.longitude);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(coords1.latitude)) * Math.cos(this.toRadians(coords2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	// Convert to persistence format
	toPersistence(): EvidenceFilePersistenceData {
		return {
			id: this._id,
			investigation_id: this._investigationId,
			original_name: this._metadata.originalName,
			file_name: this._metadata.fileName,
			file_path: this._filePath,
			file_size: this._metadata.size,
			file_type: this._metadata.fileType,
			mime_type: this._metadata.mimeType,
			checksum: this._metadata.checksum,
			upload_status: this._uploadStatus,
			processing_status: this._processingStatus,
			uploaded_by: this._uploadedBy,
			uploaded_at: this._uploadedAt.toISOString(),
			processed_at: this._processedAt?.toISOString(),
			classification: this._classification,
			metadata: { ...this._metadata.additionalData, ...this._additionalMetadata },
			analysis_results: this._analysisResults,
		};
	}

	// Create summary for API responses
	toSummary() {
		return {
			id: this._id,
			investigationId: this._investigationId,
			originalName: this._metadata.originalName,
			fileName: this._metadata.fileName,
			fileSize: this._metadata.size,
			fileType: this._metadata.fileType,
			mimeType: this._metadata.mimeType,
			uploadStatus: this._uploadStatus,
			processingStatus: this._processingStatus,
			uploadedBy: this._uploadedBy,
			uploadedAt: this._uploadedAt.toISOString(),
			processedAt: this._processedAt?.toISOString(),
			classification: this._classification,
			hasGPSData: this.hasGPSData(),
			hasAnalysisResults: this.hasAnalysisResults(),
			overallConfidence: this.getOverallConfidence(),
			processingTimeSeconds: this.getProcessingTimeInSeconds(),
		};
	}
}
