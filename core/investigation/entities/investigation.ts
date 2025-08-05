// Investigation domain entity following DDD patterns

import { InvestigationStatus, ID, Timestamp } from "../../shared/types/common";
import { BusinessRuleViolationError, InvalidInvestigationStateError, ValidationError } from "../../shared/errors/domain-errors";
import { validateInvestigationName, validateAndThrow } from "../../shared/utils/validators";
import { generateInvestigationId } from "../../shared/utils/generators";
import { EvidenceFile } from "../../evidence/entities/evidence-file";
import { TimelineEvent } from "./timeline-event";
import { InvestigationEntity } from "./investigation-entity";

export interface CreateInvestigationData {
	name: string;
	description?: string;
	createdBy: string;
	classification?: string;
}

export interface InvestigationPersistenceData {
	id: string;
	name: string;
	description: string | null;
	status: InvestigationStatus;
	created_by: string;
	created_at: string;
	updated_at: string;
	total_files?: number;
	processed_files?: number;
	total_size?: number;
	evidence_files?: any[];
	timeline_events?: any[];
	entities?: any[];
}

export class Investigation {
	private constructor(private readonly _id: ID, private _name: string, private _description: string | null, private _status: InvestigationStatus, private readonly _createdBy: string, private readonly _createdAt: Date, private _updatedAt: Date, private _totalFiles: number = 0, private _processedFiles: number = 0, private _totalSize: number = 0, private _evidenceFiles: EvidenceFile[] = [], private _timelineEvents: TimelineEvent[] = [], private _entities: InvestigationEntity[] = []) {}

	// Factory method for creation
	static create(data: CreateInvestigationData): Investigation {
		// Validate input data
		validateAndThrow(validateInvestigationName(data.name), "name");

		if (data.description && data.description.length > 1000) {
			throw new ValidationError("description", "Description cannot exceed 1000 characters");
		}

		const id = generateInvestigationId();
		const now = new Date();

		return new Investigation(id, data.name.trim(), data.description?.trim() || null, InvestigationStatus.DRAFT, data.createdBy, now, now);
	}

	// Factory method for reconstruction from database
	static fromPersistence(data: InvestigationPersistenceData): Investigation {
		const evidenceFiles = data.evidence_files?.map(EvidenceFile.fromPersistence) || [];
		const timelineEvents = data.timeline_events?.map(TimelineEvent.fromPersistence) || [];
		const entities = data.entities?.map(InvestigationEntity.fromPersistence) || [];

		return new Investigation(data.id, data.name, data.description, data.status, data.created_by, new Date(data.created_at), new Date(data.updated_at), data.total_files || 0, data.processed_files || 0, data.total_size || 0, evidenceFiles, timelineEvents, entities);
	}

	// Getters for immutable access
	get id(): ID {
		return this._id;
	}
	get name(): string {
		return this._name;
	}
	get description(): string | null {
		return this._description;
	}
	get status(): InvestigationStatus {
		return this._status;
	}
	get createdBy(): string {
		return this._createdBy;
	}
	get createdAt(): Date {
		return this._createdAt;
	}
	get updatedAt(): Date {
		return this._updatedAt;
	}
	get totalFiles(): number {
		return this._totalFiles;
	}
	get processedFiles(): number {
		return this._processedFiles;
	}
	get totalSize(): number {
		return this._totalSize;
	}
	get evidenceFiles(): ReadonlyArray<EvidenceFile> {
		return this._evidenceFiles;
	}
	get timelineEvents(): ReadonlyArray<TimelineEvent> {
		return this._timelineEvents;
	}
	get entities(): ReadonlyArray<InvestigationEntity> {
		return this._entities;
	}

	// Business methods
	updateName(newName: string): void {
		validateAndThrow(validateInvestigationName(newName), "name");

		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "update name");
		}

		this._name = newName.trim();
		this._updatedAt = new Date();
	}

	updateDescription(newDescription: string | null): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "update description");
		}

		if (newDescription && newDescription.length > 1000) {
			throw new ValidationError("description", "Description cannot exceed 1000 characters");
		}

		this._description = newDescription?.trim() || null;
		this._updatedAt = new Date();
	}

	addEvidenceFile(file: EvidenceFile): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "add evidence");
		}

		// Check if file already exists
		const existingFile = this._evidenceFiles.find((f) => f.id === file.id);
		if (existingFile) {
			throw new BusinessRuleViolationError("Evidence file already exists in investigation");
		}

		this._evidenceFiles.push(file);
		this._totalFiles = this._evidenceFiles.length;
		this._totalSize += file.fileSize;

		// Update processed files count if file is already processed
		if (file.isProcessed()) {
			this._processedFiles++;
		}

		this._updatedAt = new Date();
	}

	removeEvidenceFile(fileId: string): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "remove evidence");
		}

		const fileIndex = this._evidenceFiles.findIndex((f) => f.id === fileId);
		if (fileIndex === -1) {
			throw new BusinessRuleViolationError("Evidence file not found in investigation");
		}

		const removedFile = this._evidenceFiles[fileIndex];
		this._evidenceFiles.splice(fileIndex, 1);
		this._totalFiles = this._evidenceFiles.length;
		this._totalSize -= removedFile.fileSize;

		if (removedFile.isProcessed()) {
			this._processedFiles--;
		}

		this._updatedAt = new Date();
	}

	addTimelineEvent(event: TimelineEvent): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "add timeline event");
		}

		this._timelineEvents.push(event);
		this._timelineEvents.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
		this._updatedAt = new Date();
	}

	addEntity(entity: InvestigationEntity): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "add entity");
		}

		// Check for existing entity with same name and type
		const existingEntity = this._entities.find((e) => e.name === entity.name && e.type === entity.type);

		if (existingEntity) {
			// Merge confidence scores and references
			existingEntity.mergeWith(entity);
		} else {
			this._entities.push(entity);
		}

		this._updatedAt = new Date();
	}

	startAnalysis(): void {
		if (this._status !== InvestigationStatus.DRAFT) {
			throw new InvalidInvestigationStateError(this._status, "start analysis");
		}

		if (this._evidenceFiles.length === 0) {
			throw new BusinessRuleViolationError("Cannot start analysis without evidence files");
		}

		this._status = InvestigationStatus.ACTIVE;
		this._updatedAt = new Date();
	}

	complete(): void {
		if (this._status !== InvestigationStatus.ACTIVE) {
			throw new InvalidInvestigationStateError(this._status, "complete");
		}

		this._status = InvestigationStatus.COMPLETED;
		this._updatedAt = new Date();
	}

	archive(): void {
		if (this._status === InvestigationStatus.ARCHIVED) {
			throw new InvalidInvestigationStateError(this._status, "archive");
		}

		this._status = InvestigationStatus.ARCHIVED;
		this._updatedAt = new Date();
	}

	suspend(): void {
		if (this._status !== InvestigationStatus.ACTIVE) {
			throw new InvalidInvestigationStateError(this._status, "suspend");
		}

		this._status = InvestigationStatus.SUSPENDED;
		this._updatedAt = new Date();
	}

	resume(): void {
		if (this._status !== InvestigationStatus.SUSPENDED) {
			throw new InvalidInvestigationStateError(this._status, "resume");
		}

		this._status = InvestigationStatus.ACTIVE;
		this._updatedAt = new Date();
	}

	updateFileProcessingStatus(fileId: string, isProcessed: boolean): void {
		const file = this._evidenceFiles.find((f) => f.id === fileId);
		if (!file) {
			throw new BusinessRuleViolationError("Evidence file not found in investigation");
		}

		const wasProcessed = file.isProcessed();

		if (isProcessed && !wasProcessed) {
			this._processedFiles++;
		} else if (!isProcessed && wasProcessed) {
			this._processedFiles--;
		}

		this._updatedAt = new Date();
	}

	// Query methods
	canAnalyzeEvidence(): boolean {
		return this._status === InvestigationStatus.ACTIVE || this._status === InvestigationStatus.DRAFT;
	}

	canAddEvidence(): boolean {
		return this._status !== InvestigationStatus.ARCHIVED;
	}

	isActive(): boolean {
		return this._status === InvestigationStatus.ACTIVE;
	}

	isCompleted(): boolean {
		return this._status === InvestigationStatus.COMPLETED;
	}

	getProcessingProgress(): number {
		if (this._totalFiles === 0) return 0;
		return Math.round((this._processedFiles / this._totalFiles) * 100);
	}

	getRecentActivity(days: number = 7): TimelineEvent[] {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);

		return this._timelineEvents.filter((event) => event.occurredAt >= cutoffDate);
	}

	findEntitiesByType(type: string): InvestigationEntity[] {
		return this._entities.filter((entity) => entity.type === type);
	}

	// Convert to persistence format
	toPersistence(): InvestigationPersistenceData {
		return {
			id: this._id,
			name: this._name,
			description: this._description,
			status: this._status,
			created_by: this._createdBy,
			created_at: this._createdAt.toISOString(),
			updated_at: this._updatedAt.toISOString(),
			total_files: this._totalFiles,
			processed_files: this._processedFiles,
			total_size: this._totalSize,
		};
	}

	// Create summary for API responses
	toSummary() {
		return {
			id: this._id,
			name: this._name,
			description: this._description,
			status: this._status,
			createdBy: this._createdBy,
			createdAt: this._createdAt.toISOString(),
			updatedAt: this._updatedAt.toISOString(),
			totalFiles: this._totalFiles,
			processedFiles: this._processedFiles,
			totalSize: this._totalSize,
			processingProgress: this.getProcessingProgress(),
			entitiesCount: this._entities.length,
			timelineEventsCount: this._timelineEvents.length,
		};
	}
}
