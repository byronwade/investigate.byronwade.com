// Domain-specific error classes for InvestigatAI

export abstract class DomainError extends Error {
	constructor(message: string, public readonly code: string, public readonly statusCode: number = 400) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

// Investigation errors
export class InvestigationNotFoundError extends DomainError {
	constructor(investigationId: string) {
		super(`Investigation with ID ${investigationId} not found`, "INVESTIGATION_NOT_FOUND", 404);
	}
}

export class InvalidInvestigationStateError extends DomainError {
	constructor(currentState: string, operation: string) {
		super(`Cannot perform ${operation} on investigation in ${currentState} state`, "INVALID_INVESTIGATION_STATE", 409);
	}
}

export class InvestigationNameConflictError extends DomainError {
	constructor(name: string) {
		super(`Investigation name '${name}' already exists`, "INVESTIGATION_NAME_CONFLICT", 409);
	}
}

// Evidence errors
export class EvidenceFileNotFoundError extends DomainError {
	constructor(fileId: string) {
		super(`Evidence file with ID ${fileId} not found`, "EVIDENCE_FILE_NOT_FOUND", 404);
	}
}

export class InvalidFileTypeError extends DomainError {
	constructor(fileType: string, allowedTypes: string[]) {
		super(`File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(", ")}`, "INVALID_FILE_TYPE", 400);
	}
}

export class FileSizeExceedsLimitError extends DomainError {
	constructor(size: number, limit: number) {
		super(`File size ${size} bytes exceeds limit of ${limit} bytes`, "FILE_SIZE_EXCEEDS_LIMIT", 413);
	}
}

export class FileProcessingError extends DomainError {
	constructor(fileName: string, reason: string) {
		super(`Failed to process file '${fileName}': ${reason}`, "FILE_PROCESSING_ERROR", 422);
	}
}

// Security errors
export class UnauthorizedAccessError extends DomainError {
	constructor(userId: string, resource: string) {
		super(`User ${userId} does not have access to ${resource}`, "UNAUTHORIZED_ACCESS", 403);
	}
}

export class InsufficientPermissionsError extends DomainError {
	constructor(requiredPermission: string, userRole: string) {
		super(`User role '${userRole}' does not have permission '${requiredPermission}'`, "INSUFFICIENT_PERMISSIONS", 403);
	}
}

export class AuthenticationError extends DomainError {
	constructor(message: string = "Authentication failed") {
		super(message, "AUTHENTICATION_ERROR", 401);
	}
}

export class SecurityViolationError extends DomainError {
	constructor(violation: string) {
		super(`Security violation detected: ${violation}`, "SECURITY_VIOLATION", 403);
	}
}

// User errors
export class UserNotFoundError extends DomainError {
	constructor(userId: string) {
		super(`User with ID ${userId} not found`, "USER_NOT_FOUND", 404);
	}
}

export class UserAccountDeactivatedError extends DomainError {
	constructor(userId: string) {
		super(`User account ${userId} is deactivated`, "USER_ACCOUNT_DEACTIVATED", 403);
	}
}

// Validation errors
export class ValidationError extends DomainError {
	constructor(field: string, reason: string) {
		super(`Validation failed for field '${field}': ${reason}`, "VALIDATION_ERROR", 400);
	}
}

export class BusinessRuleViolationError extends DomainError {
	constructor(rule: string, context?: any) {
		super(`Business rule violation: ${rule}`, "BUSINESS_RULE_VIOLATION", 422);
		this.context = context;
	}

	public readonly context?: any;
}

// AI Processing errors
export class AIProcessingError extends DomainError {
	constructor(analysisType: string, reason: string) {
		super(`AI processing failed for ${analysisType}: ${reason}`, "AI_PROCESSING_ERROR", 422);
	}
}

export class AIModelUnavailableError extends DomainError {
	constructor(modelName: string) {
		super(`AI model '${modelName}' is currently unavailable`, "AI_MODEL_UNAVAILABLE", 503);
	}
}

// Database errors
export class DatabaseError extends DomainError {
	constructor(operation: string, reason: string) {
		super(`Database operation '${operation}' failed: ${reason}`, "DATABASE_ERROR", 500);
	}
}

export class ConcurrencyError extends DomainError {
	constructor(resource: string) {
		super(`Concurrency conflict detected for resource: ${resource}`, "CONCURRENCY_ERROR", 409);
	}
}

// Network/External service errors
export class ExternalServiceError extends DomainError {
	constructor(serviceName: string, reason: string) {
		super(`External service '${serviceName}' error: ${reason}`, "EXTERNAL_SERVICE_ERROR", 502);
	}
}

export class RateLimitExceededError extends DomainError {
	constructor(limit: number, window: string) {
		super(`Rate limit of ${limit} requests per ${window} exceeded`, "RATE_LIMIT_EXCEEDED", 429);
	}
}

// Utility function to determine if error is a domain error
export function isDomainError(error: unknown): error is DomainError {
	return error instanceof DomainError;
}

// Error mapping for API responses
export function mapDomainErrorToAPI(error: DomainError) {
	return {
		error: error.message,
		code: error.code,
		statusCode: error.statusCode,
	};
}
