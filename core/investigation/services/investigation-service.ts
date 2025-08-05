// Investigation Application Service - orchestrates business workflows

import { Investigation } from "../entities/investigation";
import { InvestigationRepository } from "../repositories/investigation-repository";
import { EvidenceFileRepository } from "../../evidence/repositories/evidence-file-repository";
import { EvidenceFile } from "../../evidence/entities/evidence-file";
import { SecurityService } from "../../security/services/security-service";
import { AuditService } from "../../security/services/audit-service";
import { InvestigationStatus, PaginatedResult, PaginationOptions, Permission } from "../../shared/types/common";
import { InvestigationNotFoundError, UnauthorizedAccessError, BusinessRuleViolationError, ValidationError } from "../../shared/errors/domain-errors";
import { InvestigationFilters } from "../repositories/investigation-repository";

export interface CreateInvestigationCommand {
	name: string;
	description?: string;
	classification?: string;
}

export interface UpdateInvestigationCommand {
	name?: string;
	description?: string;
	classification?: string;
}

export interface InvestigationSummary {
	id: string;
	name: string;
	description: string | null;
	status: InvestigationStatus;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	totalFiles: number;
	processedFiles: number;
	totalSize: number;
	processingProgress: number;
	entitiesCount: number;
	timelineEventsCount: number;
}

export class InvestigationService {
	constructor(private readonly investigationRepo: InvestigationRepository, private readonly evidenceRepo: EvidenceFileRepository, private readonly securityService: SecurityService, private readonly auditService: AuditService) {}

	/**
	 * Create a new investigation
	 */
	async createInvestigation(command: CreateInvestigationCommand, userId: string): Promise<Investigation> {
		// 1. Authorization check
		await this.securityService.checkPermission(userId, "investigation:create");

		// 2. Business rule validation
		await this.validateCreateInvestigation(command, userId);

		// 3. Create domain entity
		const investigation = Investigation.create({
			name: command.name,
			description: command.description,
			createdBy: userId,
		});

		// 4. Persist to database
		const savedInvestigation = await this.investigationRepo.save(investigation);

		// 5. Audit logging
		await this.auditService.logInvestigationCreated(savedInvestigation.id, savedInvestigation.name, userId);

		return savedInvestigation;
	}

	/**
	 * Get investigation by ID with authorization check
	 */
	async getInvestigation(investigationId: string, userId: string): Promise<Investigation> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findByIdWithDetails(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:read");

		// 3. Audit logging
		await this.auditService.logInvestigationAccessed(investigationId, userId);

		return investigation;
	}

	/**
	 * Update investigation
	 */
	async updateInvestigation(investigationId: string, command: UpdateInvestigationCommand, userId: string): Promise<Investigation> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:update");

		// 3. Business logic - update fields
		const changes: string[] = [];

		if (command.name && command.name !== investigation.name) {
			await this.validateInvestigationName(command.name, userId, investigationId);
			investigation.updateName(command.name);
			changes.push(`name: ${investigation.name} -> ${command.name}`);
		}

		if (command.description !== undefined && command.description !== investigation.description) {
			investigation.updateDescription(command.description);
			changes.push(`description updated`);
		}

		// 4. Persist changes
		const updatedInvestigation = await this.investigationRepo.save(investigation);

		// 5. Audit logging
		if (changes.length > 0) {
			await this.auditService.logInvestigationUpdated(investigationId, userId, changes.join(", "));
		}

		return updatedInvestigation;
	}

	/**
	 * Delete investigation
	 */
	async deleteInvestigation(investigationId: string, userId: string): Promise<void> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:delete");

		// 3. Business rules
		if (investigation.status === InvestigationStatus.ACTIVE) {
			throw new BusinessRuleViolationError("Cannot delete active investigation. Please complete or suspend it first.");
		}

		// 4. Delete evidence files first
		const evidenceFiles = await this.evidenceRepo.findByInvestigationId(investigationId);
		if (evidenceFiles.length > 0) {
			const fileIds = evidenceFiles.map((file) => file.id);
			await this.evidenceRepo.deleteMultiple(fileIds);
		}

		// 5. Delete investigation
		await this.investigationRepo.delete(investigationId);

		// 6. Audit logging
		await this.auditService.logInvestigationDeleted(investigationId, investigation.name, userId);
	}

	/**
	 * List investigations for a user
	 */
	async listInvestigations(userId: string, filters?: InvestigationFilters, pagination?: PaginationOptions): Promise<PaginatedResult<InvestigationSummary>> {
		// 1. Authorization check
		await this.securityService.checkPermission(userId, "investigation:read");

		// 2. Apply user filter
		const userFilters: InvestigationFilters = {
			...filters,
			userId: userId, // Always filter by current user
		};

		// 3. Query investigations
		const result = await this.investigationRepo.findWithFilters(userFilters, pagination);

		// 4. Convert to summaries
		const summaries: InvestigationSummary[] = result.items.map((inv) => inv.toSummary());

		return {
			...result,
			items: summaries,
		};
	}

	/**
	 * Start analysis for an investigation
	 */
	async startAnalysis(investigationId: string, userId: string): Promise<Investigation> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:update");

		// 3. Business logic
		investigation.startAnalysis();

		// 4. Persist changes
		const updatedInvestigation = await this.investigationRepo.save(investigation);

		// 5. Queue evidence files for processing
		const evidenceFiles = await this.evidenceRepo.findByInvestigationId(investigationId);
		for (const file of evidenceFiles) {
			if (file.isPending() || file.hasFailed()) {
				// Queue for AI processing
				await this.queueFileForProcessing(file);
			}
		}

		// 6. Audit logging
		await this.auditService.logInvestigationAnalysisStarted(investigationId, userId);

		return updatedInvestigation;
	}

	/**
	 * Complete an investigation
	 */
	async completeInvestigation(investigationId: string, userId: string): Promise<Investigation> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:update");

		// 3. Business logic
		investigation.complete();

		// 4. Persist changes
		const updatedInvestigation = await this.investigationRepo.save(investigation);

		// 5. Audit logging
		await this.auditService.logInvestigationCompleted(investigationId, userId);

		return updatedInvestigation;
	}

	/**
	 * Add evidence file to investigation
	 */
	async addEvidenceFile(investigationId: string, evidenceFile: EvidenceFile, userId: string): Promise<void> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "evidence:upload");

		// 3. Business logic
		investigation.addEvidenceFile(evidenceFile);

		// 4. Persist changes
		await this.investigationRepo.save(investigation);
		await this.evidenceRepo.save(evidenceFile);

		// 5. Queue for processing if investigation is active
		if (investigation.isActive()) {
			await this.queueFileForProcessing(evidenceFile);
		}

		// 6. Audit logging
		await this.auditService.logEvidenceAdded(investigationId, evidenceFile.id, evidenceFile.originalName, userId);
	}

	/**
	 * Get investigation statistics for a user
	 */
	async getInvestigationStats(userId: string) {
		// 1. Authorization check
		await this.securityService.checkPermission(userId, "investigation:read");

		// 2. Get statistics
		const stats = await this.investigationRepo.getInvestigationStats(userId);

		return stats;
	}

	/**
	 * Search investigations
	 */
	async searchInvestigations(keyword: string, userId: string, pagination?: PaginationOptions): Promise<PaginatedResult<InvestigationSummary>> {
		// 1. Authorization check
		await this.securityService.checkPermission(userId, "investigation:read");

		// 2. Search
		const result = await this.investigationRepo.searchByKeyword(keyword, userId, pagination);

		// 3. Convert to summaries
		const summaries: InvestigationSummary[] = result.items.map((inv) => inv.toSummary());

		return {
			...result,
			items: summaries,
		};
	}

	/**
	 * Archive investigation
	 */
	async archiveInvestigation(investigationId: string, userId: string): Promise<Investigation> {
		// 1. Load investigation
		const investigation = await this.investigationRepo.findById(investigationId);
		if (!investigation) {
			throw new InvestigationNotFoundError(investigationId);
		}

		// 2. Authorization check
		await this.securityService.checkInvestigationAccess(userId, investigationId, "investigation:update");

		// 3. Business logic
		investigation.archive();

		// 4. Persist changes
		const updatedInvestigation = await this.investigationRepo.save(investigation);

		// 5. Audit logging
		await this.auditService.logInvestigationArchived(investigationId, userId);

		return updatedInvestigation;
	}

	// Private helper methods

	private async validateCreateInvestigation(command: CreateInvestigationCommand, userId: string): Promise<void> {
		// Check user investigation limits
		const userInvestigations = await this.investigationRepo.findByUserId(userId);
		const activeInvestigations = userInvestigations.filter((inv) => inv.status === InvestigationStatus.ACTIVE);

		if (activeInvestigations.length >= 10) {
			throw new BusinessRuleViolationError("Maximum active investigations limit (10) reached");
		}

		// Check for duplicate names
		await this.validateInvestigationName(command.name, userId);
	}

	private async validateInvestigationName(name: string, userId: string, excludeId?: string): Promise<void> {
		const existingInvestigation = await this.investigationRepo.findDuplicateByName(name, userId, excludeId);

		if (existingInvestigation) {
			throw new BusinessRuleViolationError(`Investigation name '${name}' already exists`);
		}
	}

	private async queueFileForProcessing(evidenceFile: EvidenceFile): Promise<void> {
		// In a real implementation, this would queue the file for background processing
		// For now, we just mark it as pending
		if (evidenceFile.isPending() || evidenceFile.hasFailed()) {
			// Mark as ready for processing
			await this.auditService.logFileQueuedForProcessing(evidenceFile.id);
		}
	}
}
