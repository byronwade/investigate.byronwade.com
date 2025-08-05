// File Metadata value object

import { EvidenceFileType, Coordinates } from "../../shared/types/common";
import { ValidationError } from "../../shared/errors/domain-errors";
import { validateFilename, validateFileSize, validateMimeType, validateAndThrow } from "../../shared/utils/validators";

export interface CreateFileMetadataData {
	originalName: string;
	fileName: string;
	mimeType: string;
	size: number;
	checksum: string;
	uploadedAt: Date;
	exifData?: Record<string, any>;
	gpsCoordinates?: Coordinates;
	additionalData?: Record<string, any>;
}

export interface FileMetadataPersistenceData {
	original_name: string;
	file_name: string;
	mime_type: string;
	file_size: number;
	checksum: string;
	uploaded_at: string;
	metadata?: Record<string, any>;
}

export class FileMetadata {
	private constructor(private readonly _originalName: string, private readonly _fileName: string, private readonly _mimeType: string, private readonly _size: number, private readonly _checksum: string, private readonly _uploadedAt: Date, private readonly _fileType: EvidenceFileType, private readonly _exifData?: Record<string, any>, private readonly _gpsCoordinates?: Coordinates, private readonly _additionalData: Record<string, any> = {}) {}

	// Factory method for creation
	static create(data: CreateFileMetadataData): FileMetadata {
		// Validate input data
		validateAndThrow(validateFilename(data.originalName), "originalName");
		validateAndThrow(validateFilename(data.fileName), "fileName");

		const maxSize = 100 * 1024 * 1024; // 100MB
		validateAndThrow(validateFileSize(data.size, maxSize), "size");

		if (!data.checksum || data.checksum.length !== 64) {
			throw new ValidationError("checksum", "Valid SHA-256 checksum is required");
		}

		// Validate GPS coordinates if provided
		if (data.gpsCoordinates) {
			if (data.gpsCoordinates.latitude < -90 || data.gpsCoordinates.latitude > 90) {
				throw new ValidationError("gpsCoordinates.latitude", "Latitude must be between -90 and 90");
			}
			if (data.gpsCoordinates.longitude < -180 || data.gpsCoordinates.longitude > 180) {
				throw new ValidationError("gpsCoordinates.longitude", "Longitude must be between -180 and 180");
			}
		}

		// Determine file type from MIME type
		const fileType = FileMetadata.determineFileType(data.mimeType);

		return new FileMetadata(data.originalName.trim(), data.fileName.trim(), data.mimeType, data.size, data.checksum, data.uploadedAt, fileType, data.exifData, data.gpsCoordinates, data.additionalData || {});
	}

	// Factory method for reconstruction from database
	static fromPersistence(data: FileMetadataPersistenceData): FileMetadata {
		const fileType = FileMetadata.determineFileType(data.mime_type);
		const metadata = data.metadata || {};

		return new FileMetadata(data.original_name, data.file_name, data.mime_type, data.file_size, data.checksum, new Date(data.uploaded_at), fileType, metadata.exifData, metadata.gpsCoordinates, metadata);
	}

	// Getters
	get originalName(): string {
		return this._originalName;
	}
	get fileName(): string {
		return this._fileName;
	}
	get mimeType(): string {
		return this._mimeType;
	}
	get size(): number {
		return this._size;
	}
	get checksum(): string {
		return this._checksum;
	}
	get uploadedAt(): Date {
		return this._uploadedAt;
	}
	get fileType(): EvidenceFileType {
		return this._fileType;
	}
	get exifData(): Record<string, any> | undefined {
		return this._exifData;
	}
	get gpsCoordinates(): Coordinates | undefined {
		return this._gpsCoordinates;
	}
	get additionalData(): Readonly<Record<string, any>> {
		return this._additionalData;
	}

	// Type checking methods
	isImage(): boolean {
		return this._fileType === EvidenceFileType.IMAGE;
	}

	isVideo(): boolean {
		return this._fileType === EvidenceFileType.VIDEO;
	}

	isAudio(): boolean {
		return this._fileType === EvidenceFileType.AUDIO;
	}

	isDocument(): boolean {
		return this._fileType === EvidenceFileType.DOCUMENT;
	}

	isMedia(): boolean {
		return this.isImage() || this.isVideo() || this.isAudio();
	}

	// File properties
	getFileExtension(): string {
		const parts = this._originalName.split(".");
		return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
	}

	getFileSizeInMB(): number {
		return Math.round((this._size / (1024 * 1024)) * 100) / 100;
	}

	getFileSizeInKB(): number {
		return Math.round((this._size / 1024) * 100) / 100;
	}

	formatFileSize(): string {
		if (this._size >= 1024 * 1024 * 1024) {
			return `${(this._size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
		} else if (this._size >= 1024 * 1024) {
			return `${(this._size / (1024 * 1024)).toFixed(2)} MB`;
		} else if (this._size >= 1024) {
			return `${(this._size / 1024).toFixed(2)} KB`;
		} else {
			return `${this._size} B`;
		}
	}

	// GPS and location methods
	hasGPSCoordinates(): boolean {
		return !!this._gpsCoordinates;
	}

	getLocationString(): string | null {
		if (!this._gpsCoordinates) return null;

		const { latitude, longitude } = this._gpsCoordinates;
		const latDir = latitude >= 0 ? "N" : "S";
		const lonDir = longitude >= 0 ? "E" : "W";

		return `${Math.abs(latitude).toFixed(6)}°${latDir}, ${Math.abs(longitude).toFixed(6)}°${lonDir}`;
	}

	// EXIF data methods
	hasExifData(): boolean {
		return !!this._exifData && Object.keys(this._exifData).length > 0;
	}

	getExifValue(key: string): any {
		return this._exifData?.[key];
	}

	getCreationDate(): Date | null {
		// Try to get from EXIF data first
		if (this._exifData?.DateTimeOriginal) {
			try {
				return new Date(this._exifData.DateTimeOriginal);
			} catch {
				// Fall through to upload date
			}
		}

		if (this._exifData?.DateTime) {
			try {
				return new Date(this._exifData.DateTime);
			} catch {
				// Fall through to upload date
			}
		}

		// Fall back to upload date
		return this._uploadedAt;
	}

	getCameraInfo(): { make?: string; model?: string } | null {
		if (!this._exifData) return null;

		const make = this._exifData.Make;
		const model = this._exifData.Model;

		if (make || model) {
			return { make, model };
		}

		return null;
	}

	// Comparison methods
	equals(other: FileMetadata): boolean {
		return this._checksum === other._checksum;
	}

	isSimilarTo(other: FileMetadata): boolean {
		return this._originalName === other._originalName && this._mimeType === other._mimeType && this._size === other._size;
	}

	// Validation methods
	isValidImageFormat(): boolean {
		const validImageFormats = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];
		return this.isImage() && validImageFormats.includes(this._mimeType);
	}

	isValidVideoFormat(): boolean {
		const validVideoFormats = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm", "video/mkv"];
		return this.isVideo() && validVideoFormats.includes(this._mimeType);
	}

	isValidAudioFormat(): boolean {
		const validAudioFormats = ["audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "audio/flac"];
		return this.isAudio() && validAudioFormats.includes(this._mimeType);
	}

	isValidDocumentFormat(): boolean {
		const validDocumentFormats = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/json", "text/csv"];
		return this.isDocument() && validDocumentFormats.includes(this._mimeType);
	}

	// Static helper methods
	private static determineFileType(mimeType: string): EvidenceFileType {
		if (mimeType.startsWith("image/")) {
			return EvidenceFileType.IMAGE;
		} else if (mimeType.startsWith("video/")) {
			return EvidenceFileType.VIDEO;
		} else if (mimeType.startsWith("audio/")) {
			return EvidenceFileType.AUDIO;
		} else if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text/") || mimeType.includes("json") || mimeType.includes("csv")) {
			return EvidenceFileType.DOCUMENT;
		} else {
			return EvidenceFileType.OTHER;
		}
	}

	static getAllowedMimeTypes(): string[] {
		return ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/json", "text/csv"];
	}

	static getMaxFileSize(): number {
		return 100 * 1024 * 1024; // 100MB
	}

	// Distance calculation for GPS coordinates
	calculateDistanceTo(otherMetadata: FileMetadata): number | null {
		if (!this._gpsCoordinates || !otherMetadata.gpsCoordinates) {
			return null;
		}

		const R = 6371; // Earth's radius in kilometers
		const dLat = this.toRadians(otherMetadata.gpsCoordinates.latitude - this._gpsCoordinates.latitude);
		const dLon = this.toRadians(otherMetadata.gpsCoordinates.longitude - this._gpsCoordinates.longitude);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(this._gpsCoordinates.latitude)) * Math.cos(this.toRadians(otherMetadata.gpsCoordinates.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	// Convert to summary for API responses
	toSummary() {
		return {
			originalName: this._originalName,
			fileName: this._fileName,
			mimeType: this._mimeType,
			size: this._size,
			formattedSize: this.formatFileSize(),
			fileType: this._fileType,
			extension: this.getFileExtension(),
			uploadedAt: this._uploadedAt.toISOString(),
			hasGPS: this.hasGPSCoordinates(),
			hasExif: this.hasExifData(),
			locationString: this.getLocationString(),
			cameraInfo: this.getCameraInfo(),
			creationDate: this.getCreationDate()?.toISOString(),
		};
	}
}
