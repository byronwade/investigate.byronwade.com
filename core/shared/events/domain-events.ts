// Domain Events for decoupled communication between bounded contexts

import { generateId } from "../utils/generators";

export abstract class DomainEvent {
	public readonly eventId: string;
	public readonly occurredAt: Date;
	public readonly version: number;

	constructor(public readonly aggregateId: string, version: number = 1) {
		this.eventId = generateId();
		this.occurredAt = new Date();
		this.version = version;
	}

	abstract get eventType(): string;
	abstract get eventData(): Record<string, any>;
}

// Investigation Events
export class InvestigationCreatedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly name: string, public readonly createdBy: string, public readonly description?: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "investigation.created";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			name: this.name,
			createdBy: this.createdBy,
			description: this.description,
		};
	}
}

export class InvestigationStatusChangedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly oldStatus: string, public readonly newStatus: string, public readonly changedBy: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "investigation.status_changed";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			oldStatus: this.oldStatus,
			newStatus: this.newStatus,
			changedBy: this.changedBy,
		};
	}
}

export class InvestigationDeletedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly name: string, public readonly deletedBy: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "investigation.deleted";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			name: this.name,
			deletedBy: this.deletedBy,
		};
	}
}

// Evidence Events
export class EvidenceFileUploadedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly fileId: string, public readonly fileName: string, public readonly fileSize: number, public readonly uploadedBy: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "evidence.file_uploaded";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			fileId: this.fileId,
			fileName: this.fileName,
			fileSize: this.fileSize,
			uploadedBy: this.uploadedBy,
		};
	}
}

export class EvidenceFileDeletedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly fileId: string, public readonly fileName: string, public readonly deletedBy: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "evidence.file_deleted";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			fileId: this.fileId,
			fileName: this.fileName,
			deletedBy: this.deletedBy,
		};
	}
}

// AI Analysis Events
export class AnalysisRequestedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly fileId: string, public readonly analysisType: string, public readonly requestedBy: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "analysis.requested";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			fileId: this.fileId,
			analysisType: this.analysisType,
			requestedBy: this.requestedBy,
		};
	}
}

export class AnalysisCompletedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly fileId: string, public readonly analysisType: string, public readonly confidence: number, public readonly resultsCount: number, public readonly processingTimeMs: number) {
		super(investigationId);
	}

	get eventType(): string {
		return "analysis.completed";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			fileId: this.fileId,
			analysisType: this.analysisType,
			confidence: this.confidence,
			resultsCount: this.resultsCount,
			processingTimeMs: this.processingTimeMs,
		};
	}
}

export class AnalysisFailedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly fileId: string, public readonly analysisType: string, public readonly error: string, public readonly retryCount: number) {
		super(investigationId);
	}

	get eventType(): string {
		return "analysis.failed";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			fileId: this.fileId,
			analysisType: this.analysisType,
			error: this.error,
			retryCount: this.retryCount,
		};
	}
}

// Entity Events
export class EntityDetectedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly entityId: string, public readonly entityType: string, public readonly entityName: string, public readonly confidence: number, public readonly fileId: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "entity.detected";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			entityId: this.entityId,
			entityType: this.entityType,
			entityName: this.entityName,
			confidence: this.confidence,
			fileId: this.fileId,
		};
	}
}

export class TimelineEventCreatedEvent extends DomainEvent {
	constructor(investigationId: string, public readonly timelineEventId: string, public readonly title: string, public readonly occurredAt: Date, public readonly fileId?: string) {
		super(investigationId);
	}

	get eventType(): string {
		return "timeline.event_created";
	}

	get eventData(): Record<string, any> {
		return {
			investigationId: this.aggregateId,
			timelineEventId: this.timelineEventId,
			title: this.title,
			occurredAt: this.occurredAt.toISOString(),
			fileId: this.fileId,
		};
	}
}

// Security Events
export class SecurityViolationDetectedEvent extends DomainEvent {
	constructor(resourceId: string, public readonly violationType: string, public readonly userId: string, public readonly riskLevel: string, public readonly details: Record<string, any>) {
		super(resourceId);
	}

	get eventType(): string {
		return "security.violation_detected";
	}

	get eventData(): Record<string, any> {
		return {
			resourceId: this.aggregateId,
			violationType: this.violationType,
			userId: this.userId,
			riskLevel: this.riskLevel,
			details: this.details,
		};
	}
}

// System Events
export class SystemErrorEvent extends DomainEvent {
	constructor(componentId: string, public readonly errorCode: string, public readonly errorMessage: string, public readonly severity: string, public readonly stackTrace?: string) {
		super(componentId);
	}

	get eventType(): string {
		return "system.error";
	}

	get eventData(): Record<string, any> {
		return {
			componentId: this.aggregateId,
			errorCode: this.errorCode,
			errorMessage: this.errorMessage,
			severity: this.severity,
			stackTrace: this.stackTrace,
		};
	}
}

// Event Handler Interface
export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
	handle(event: T): Promise<void>;
	canHandle(eventType: string): boolean;
}

// Event Publisher Interface
export interface DomainEventPublisher {
	publish(event: DomainEvent): Promise<void>;
	publishBatch(events: DomainEvent[]): Promise<void>;
	subscribe(eventType: string, handler: DomainEventHandler): void;
	unsubscribe(eventType: string, handler: DomainEventHandler): void;
}

// Event Store Interface
export interface EventStore {
	append(event: DomainEvent): Promise<void>;
	appendBatch(events: DomainEvent[]): Promise<void>;
	getEvents(aggregateId: string): Promise<DomainEvent[]>;
	getEventsByType(eventType: string): Promise<DomainEvent[]>;
	getEventsAfter(timestamp: Date): Promise<DomainEvent[]>;
}
