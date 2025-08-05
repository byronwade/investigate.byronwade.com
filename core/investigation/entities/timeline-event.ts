// Timeline Event entity for investigation chronology

import { ID } from "../../shared/types/common";
import { ValidationError } from "../../shared/errors/domain-errors";
import { generateId } from "../../shared/utils/generators";

export interface CreateTimelineEventData {
	occurredAt: Date;
	title: string;
	description: string;
	evidenceFileId?: string;
	location?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	entityIds?: string[];
	metadata?: Record<string, any>;
}

export interface TimelineEventPersistenceData {
	id: string;
	occurred_at: string;
	title: string;
	description: string;
	evidence_file_id?: string;
	location?: string;
	coordinates?: {
		latitude: number;
		longitude: number;
	};
	entity_ids?: string[];
	metadata?: Record<string, any>;
	created_at: string;
}

export class TimelineEvent {
	private constructor(private readonly _id: ID, private _occurredAt: Date, private _title: string, private _description: string, private readonly _createdAt: Date, private _evidenceFileId?: string, private _location?: string, private _coordinates?: { latitude: number; longitude: number }, private _entityIds: string[] = [], private _metadata: Record<string, any> = {}) {}

	// Factory method for creation
	static create(data: CreateTimelineEventData): TimelineEvent {
		// Validate required fields
		if (!data.title || data.title.trim().length === 0) {
			throw new ValidationError("title", "Timeline event title is required");
		}

		if (data.title.length > 200) {
			throw new ValidationError("title", "Timeline event title cannot exceed 200 characters");
		}

		if (!data.description || data.description.trim().length === 0) {
			throw new ValidationError("description", "Timeline event description is required");
		}

		if (data.description.length > 1000) {
			throw new ValidationError("description", "Timeline event description cannot exceed 1000 characters");
		}

		// Validate coordinates if provided
		if (data.coordinates) {
			if (data.coordinates.latitude < -90 || data.coordinates.latitude > 90) {
				throw new ValidationError("coordinates.latitude", "Latitude must be between -90 and 90");
			}
			if (data.coordinates.longitude < -180 || data.coordinates.longitude > 180) {
				throw new ValidationError("coordinates.longitude", "Longitude must be between -180 and 180");
			}
		}

		const id = generateId();
		const now = new Date();

		return new TimelineEvent(id, data.occurredAt, data.title.trim(), data.description.trim(), now, data.evidenceFileId, data.location?.trim(), data.coordinates, data.entityIds || [], data.metadata || {});
	}

	// Factory method for reconstruction from database
	static fromPersistence(data: TimelineEventPersistenceData): TimelineEvent {
		return new TimelineEvent(data.id, new Date(data.occurred_at), data.title, data.description, new Date(data.created_at), data.evidence_file_id, data.location, data.coordinates, data.entity_ids || [], data.metadata || {});
	}

	// Getters
	get id(): ID {
		return this._id;
	}
	get occurredAt(): Date {
		return this._occurredAt;
	}
	get title(): string {
		return this._title;
	}
	get description(): string {
		return this._description;
	}
	get createdAt(): Date {
		return this._createdAt;
	}
	get evidenceFileId(): string | undefined {
		return this._evidenceFileId;
	}
	get location(): string | undefined {
		return this._location;
	}
	get coordinates(): { latitude: number; longitude: number } | undefined {
		return this._coordinates;
	}
	get entityIds(): ReadonlyArray<string> {
		return this._entityIds;
	}
	get metadata(): Readonly<Record<string, any>> {
		return this._metadata;
	}

	// Business methods
	updateTitle(newTitle: string): void {
		if (!newTitle || newTitle.trim().length === 0) {
			throw new ValidationError("title", "Timeline event title is required");
		}

		if (newTitle.length > 200) {
			throw new ValidationError("title", "Timeline event title cannot exceed 200 characters");
		}

		this._title = newTitle.trim();
	}

	updateDescription(newDescription: string): void {
		if (!newDescription || newDescription.trim().length === 0) {
			throw new ValidationError("description", "Timeline event description is required");
		}

		if (newDescription.length > 1000) {
			throw new ValidationError("description", "Timeline event description cannot exceed 1000 characters");
		}

		this._description = newDescription.trim();
	}

	updateOccurredAt(newDate: Date): void {
		if (!newDate || isNaN(newDate.getTime())) {
			throw new ValidationError("occurredAt", "Valid occurrence date is required");
		}

		this._occurredAt = newDate;
	}

	setLocation(location: string, coordinates?: { latitude: number; longitude: number }): void {
		this._location = location?.trim();

		if (coordinates) {
			if (coordinates.latitude < -90 || coordinates.latitude > 90) {
				throw new ValidationError("coordinates.latitude", "Latitude must be between -90 and 90");
			}
			if (coordinates.longitude < -180 || coordinates.longitude > 180) {
				throw new ValidationError("coordinates.longitude", "Longitude must be between -180 and 180");
			}
			this._coordinates = coordinates;
		}
	}

	addEntityReference(entityId: string): void {
		if (!this._entityIds.includes(entityId)) {
			this._entityIds.push(entityId);
		}
	}

	removeEntityReference(entityId: string): void {
		const index = this._entityIds.indexOf(entityId);
		if (index > -1) {
			this._entityIds.splice(index, 1);
		}
	}

	updateMetadata(key: string, value: any): void {
		this._metadata[key] = value;
	}

	removeMetadata(key: string): void {
		delete this._metadata[key];
	}

	// Query methods
	hasLocation(): boolean {
		return !!this._location;
	}

	hasCoordinates(): boolean {
		return !!this._coordinates;
	}

	isLinkedToEvidence(): boolean {
		return !!this._evidenceFileId;
	}

	hasEntityReferences(): boolean {
		return this._entityIds.length > 0;
	}

	isRecentEvent(withinDays: number = 7): boolean {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - withinDays);
		return this._occurredAt >= cutoffDate;
	}

	// Distance calculation if coordinates are available
	distanceToLocation(latitude: number, longitude: number): number | null {
		if (!this._coordinates) return null;

		// Haversine formula for distance calculation
		const R = 6371; // Earth's radius in kilometers
		const dLat = this.toRadians(latitude - this._coordinates.latitude);
		const dLon = this.toRadians(longitude - this._coordinates.longitude);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(this._coordinates.latitude)) * Math.cos(this.toRadians(latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	private toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	// Time difference calculations
	timeDifferenceInHours(otherEvent: TimelineEvent): number {
		const diffMs = Math.abs(this._occurredAt.getTime() - otherEvent.occurredAt.getTime());
		return diffMs / (1000 * 60 * 60);
	}

	isWithinTimeRange(startDate: Date, endDate: Date): boolean {
		return this._occurredAt >= startDate && this._occurredAt <= endDate;
	}

	// Convert to persistence format
	toPersistence(): TimelineEventPersistenceData {
		return {
			id: this._id,
			occurred_at: this._occurredAt.toISOString(),
			title: this._title,
			description: this._description,
			evidence_file_id: this._evidenceFileId,
			location: this._location,
			coordinates: this._coordinates,
			entity_ids: this._entityIds,
			metadata: this._metadata,
			created_at: this._createdAt.toISOString(),
		};
	}

	// Create summary for API responses
	toSummary() {
		return {
			id: this._id,
			occurredAt: this._occurredAt.toISOString(),
			title: this._title,
			description: this._description,
			evidenceFileId: this._evidenceFileId,
			location: this._location,
			coordinates: this._coordinates,
			entityCount: this._entityIds.length,
			hasLocation: this.hasLocation(),
			hasCoordinates: this.hasCoordinates(),
			createdAt: this._createdAt.toISOString(),
		};
	}
}
