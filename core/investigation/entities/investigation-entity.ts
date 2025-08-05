// Investigation Entity for detected entities in evidence

import { ID, EntityType, ConfidenceScore, BoundingBox } from "../../shared/types/common";
import { ValidationError } from "../../shared/errors/domain-errors";
import { generateEntityId } from "../../shared/utils/generators";
import { validateConfidenceScore } from "../../shared/utils/validators";

export interface CreateInvestigationEntityData {
	type: EntityType;
	name: string;
	confidence: ConfidenceScore;
	evidenceFileId: string;
	boundingBox?: BoundingBox;
	metadata?: Record<string, any>;
	aliases?: string[];
}

export interface InvestigationEntityPersistenceData {
	id: string;
	type: EntityType;
	name: string;
	confidence: number;
	evidence_file_id: string;
	bounding_box?: BoundingBox;
	metadata?: Record<string, any>;
	aliases?: string[];
	first_detected_at: string;
	last_updated_at: string;
	detection_count: number;
	source_files: string[];
}

export class InvestigationEntity {
	private constructor(private readonly _id: ID, private readonly _type: EntityType, private _name: string, private _confidence: ConfidenceScore, private readonly _firstDetectedAt: Date, private _lastUpdatedAt: Date, private _detectionCount: number, private _sourceFiles: Set<string>, private _boundingBox?: BoundingBox, private _metadata: Record<string, any> = {}, private _aliases: Set<string> = new Set()) {}

	// Factory method for creation
	static create(data: CreateInvestigationEntityData): InvestigationEntity {
		// Validate input data
		if (!data.name || data.name.trim().length === 0) {
			throw new ValidationError("name", "Entity name is required");
		}

		if (data.name.length > 200) {
			throw new ValidationError("name", "Entity name cannot exceed 200 characters");
		}

		const confidenceValidation = validateConfidenceScore(data.confidence);
		if (!confidenceValidation.isValid) {
			throw new ValidationError("confidence", confidenceValidation.errors.join(", "));
		}

		// Validate bounding box if provided
		if (data.boundingBox) {
			if (data.boundingBox.x < 0 || data.boundingBox.y < 0 || data.boundingBox.width <= 0 || data.boundingBox.height <= 0) {
				throw new ValidationError("boundingBox", "Invalid bounding box coordinates");
			}
		}

		const id = generateEntityId(data.type);
		const now = new Date();

		return new InvestigationEntity(
			id,
			data.type,
			data.name.trim(),
			data.confidence,
			now,
			now,
			1, // Initial detection count
			new Set([data.evidenceFileId]),
			data.boundingBox,
			data.metadata || {},
			new Set(data.aliases || [])
		);
	}

	// Factory method for reconstruction from database
	static fromPersistence(data: InvestigationEntityPersistenceData): InvestigationEntity {
		return new InvestigationEntity(data.id, data.type, data.name, data.confidence, new Date(data.first_detected_at), new Date(data.last_updated_at), data.detection_count, new Set(data.source_files), data.bounding_box, data.metadata || {}, new Set(data.aliases || []));
	}

	// Getters
	get id(): ID {
		return this._id;
	}
	get type(): EntityType {
		return this._type;
	}
	get name(): string {
		return this._name;
	}
	get confidence(): ConfidenceScore {
		return this._confidence;
	}
	get firstDetectedAt(): Date {
		return this._firstDetectedAt;
	}
	get lastUpdatedAt(): Date {
		return this._lastUpdatedAt;
	}
	get detectionCount(): number {
		return this._detectionCount;
	}
	get sourceFiles(): ReadonlyArray<string> {
		return Array.from(this._sourceFiles);
	}
	get boundingBox(): BoundingBox | undefined {
		return this._boundingBox;
	}
	get metadata(): Readonly<Record<string, any>> {
		return this._metadata;
	}
	get aliases(): ReadonlyArray<string> {
		return Array.from(this._aliases);
	}

	// Business methods
	updateName(newName: string): void {
		if (!newName || newName.trim().length === 0) {
			throw new ValidationError("name", "Entity name is required");
		}

		if (newName.length > 200) {
			throw new ValidationError("name", "Entity name cannot exceed 200 characters");
		}

		this._name = newName.trim();
		this._lastUpdatedAt = new Date();
	}

	updateConfidence(newConfidence: ConfidenceScore): void {
		const validation = validateConfidenceScore(newConfidence);
		if (!validation.isValid) {
			throw new ValidationError("confidence", validation.errors.join(", "));
		}

		this._confidence = newConfidence;
		this._lastUpdatedAt = new Date();
	}

	addAlias(alias: string): void {
		if (!alias || alias.trim().length === 0) {
			throw new ValidationError("alias", "Alias cannot be empty");
		}

		if (alias.length > 200) {
			throw new ValidationError("alias", "Alias cannot exceed 200 characters");
		}

		this._aliases.add(alias.trim());
		this._lastUpdatedAt = new Date();
	}

	removeAlias(alias: string): void {
		this._aliases.delete(alias);
		this._lastUpdatedAt = new Date();
	}

	addSourceFile(fileId: string): void {
		if (!this._sourceFiles.has(fileId)) {
			this._sourceFiles.add(fileId);
			this._detectionCount++;
			this._lastUpdatedAt = new Date();
		}
	}

	updateMetadata(key: string, value: any): void {
		this._metadata[key] = value;
		this._lastUpdatedAt = new Date();
	}

	removeMetadata(key: string): void {
		delete this._metadata[key];
		this._lastUpdatedAt = new Date();
	}

	updateBoundingBox(boundingBox: BoundingBox): void {
		if (boundingBox.x < 0 || boundingBox.y < 0 || boundingBox.width <= 0 || boundingBox.height <= 0) {
			throw new ValidationError("boundingBox", "Invalid bounding box coordinates");
		}

		this._boundingBox = boundingBox;
		this._lastUpdatedAt = new Date();
	}

	// Merge with another entity (for consolidating duplicate detections)
	mergeWith(otherEntity: InvestigationEntity): void {
		if (this._type !== otherEntity.type) {
			throw new ValidationError("merge", "Cannot merge entities of different types");
		}

		// Update confidence with weighted average based on detection count
		const totalDetections = this._detectionCount + otherEntity.detectionCount;
		const weightedConfidence = (this._confidence * this._detectionCount + otherEntity.confidence * otherEntity.detectionCount) / totalDetections;

		this._confidence = weightedConfidence;

		// Merge source files
		otherEntity.sourceFiles.forEach((fileId) => {
			this._sourceFiles.add(fileId);
		});

		// Update detection count
		this._detectionCount = this._sourceFiles.size;

		// Merge aliases
		otherEntity.aliases.forEach((alias) => {
			this._aliases.add(alias);
		});

		// Merge metadata
		Object.assign(this._metadata, otherEntity.metadata);

		// Update bounding box if other has more recent or better one
		if (otherEntity.boundingBox && (!this._boundingBox || otherEntity.confidence > this._confidence)) {
			this._boundingBox = otherEntity.boundingBox;
		}

		this._lastUpdatedAt = new Date();
	}

	// Query methods
	isPerson(): boolean {
		return this._type === EntityType.PERSON;
	}

	isLocation(): boolean {
		return this._type === EntityType.LOCATION;
	}

	isOrganization(): boolean {
		return this._type === EntityType.ORGANIZATION;
	}

	isVehicle(): boolean {
		return this._type === EntityType.VEHICLE;
	}

	hasHighConfidence(threshold: number = 0.8): boolean {
		return this._confidence >= threshold;
	}

	hasMultipleDetections(): boolean {
		return this._detectionCount > 1;
	}

	isRecentlyDetected(withinDays: number = 7): boolean {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - withinDays);
		return this._lastUpdatedAt >= cutoffDate;
	}

	hasAlias(alias: string): boolean {
		return this._aliases.has(alias) || this._name.toLowerCase() === alias.toLowerCase();
	}

	isDetectedInFile(fileId: string): boolean {
		return this._sourceFiles.has(fileId);
	}

	getConfidenceLevel(): "low" | "medium" | "high" {
		if (this._confidence >= 0.8) return "high";
		if (this._confidence >= 0.6) return "medium";
		return "low";
	}

	// Similarity comparison with another entity
	calculateSimilarity(otherEntity: InvestigationEntity): number {
		if (this._type !== otherEntity.type) return 0;

		let similarity = 0;
		let factors = 0;

		// Name similarity (basic string comparison)
		const nameSimilarity = this.stringSimilarity(this._name, otherEntity.name);
		similarity += nameSimilarity * 0.4;
		factors += 0.4;

		// Alias matching
		const hasCommonAlias = this._aliases.size > 0 && otherEntity.aliases.some((alias) => this.hasAlias(alias));
		if (hasCommonAlias) {
			similarity += 0.3;
		}
		factors += 0.3;

		// Common source files
		const commonFiles = this.sourceFiles.filter((fileId) => otherEntity.isDetectedInFile(fileId));
		const fileOverlap = commonFiles.length / Math.max(this._sourceFiles.size, otherEntity.sourceFiles.length);
		similarity += fileOverlap * 0.3;
		factors += 0.3;

		return similarity / factors;
	}

	private stringSimilarity(str1: string, str2: string): number {
		const longer = str1.length > str2.length ? str1 : str2;
		const shorter = str1.length > str2.length ? str2 : str1;

		if (longer.length === 0) return 1.0;

		const distance = this.levenshteinDistance(longer, shorter);
		return (longer.length - distance) / longer.length;
	}

	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = [];

		for (let i = 0; i <= str2.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= str1.length; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= str2.length; i++) {
			for (let j = 1; j <= str1.length; j++) {
				if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
				}
			}
		}

		return matrix[str2.length][str1.length];
	}

	// Convert to persistence format
	toPersistence(): InvestigationEntityPersistenceData {
		return {
			id: this._id,
			type: this._type,
			name: this._name,
			confidence: this._confidence,
			evidence_file_id: Array.from(this._sourceFiles)[0], // Primary source file
			bounding_box: this._boundingBox,
			metadata: this._metadata,
			aliases: Array.from(this._aliases),
			first_detected_at: this._firstDetectedAt.toISOString(),
			last_updated_at: this._lastUpdatedAt.toISOString(),
			detection_count: this._detectionCount,
			source_files: Array.from(this._sourceFiles),
		};
	}

	// Create summary for API responses
	toSummary() {
		return {
			id: this._id,
			type: this._type,
			name: this._name,
			confidence: this._confidence,
			confidenceLevel: this.getConfidenceLevel(),
			detectionCount: this._detectionCount,
			sourceFileCount: this._sourceFiles.size,
			aliasCount: this._aliases.size,
			hasMultipleDetections: this.hasMultipleDetections(),
			firstDetectedAt: this._firstDetectedAt.toISOString(),
			lastUpdatedAt: this._lastUpdatedAt.toISOString(),
		};
	}
}
