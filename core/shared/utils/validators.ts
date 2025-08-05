// Validation utilities for InvestigatAI

import { ValidationError } from "../errors/domain-errors";
import { ValidationResult } from "../types/common";

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
	const errors: string[] = [];

	if (!email || email.trim().length === 0) {
		errors.push("Email is required");
	} else {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			errors.push("Invalid email format");
		}

		if (email.length > 254) {
			errors.push("Email is too long");
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
	const errors: string[] = [];

	if (!password) {
		errors.push("Password is required");
		return { isValid: false, errors };
	}

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
	}

	if (password.length > 128) {
		errors.push("Password is too long");
	}

	if (!/[A-Z]/.test(password)) {
		errors.push("Password must contain at least one uppercase letter");
	}

	if (!/[a-z]/.test(password)) {
		errors.push("Password must contain at least one lowercase letter");
	}

	if (!/\d/.test(password)) {
		errors.push("Password must contain at least one number");
	}

	if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push("Password must contain at least one special character");
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate investigation name
 */
export function validateInvestigationName(name: string): ValidationResult {
	const errors: string[] = [];

	if (!name || name.trim().length === 0) {
		errors.push("Investigation name is required");
	} else {
		if (name.length > 100) {
			errors.push("Investigation name cannot exceed 100 characters");
		}

		if (!/^[a-zA-Z0-9\s._-]+$/.test(name)) {
			errors.push("Investigation name contains invalid characters");
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate filename for security
 */
export function validateFilename(filename: string): ValidationResult {
	const errors: string[] = [];

	if (!filename || filename.trim().length === 0) {
		errors.push("Filename is required");
	} else {
		if (filename.length > 255) {
			errors.push("Filename is too long");
		}

		// Check for path traversal attempts
		if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
			errors.push("Filename contains invalid path characters");
		}

		// Check for reserved names (Windows)
		const reservedNames = ["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"];
		const nameWithoutExt = filename.split(".")[0].toUpperCase();
		if (reservedNames.includes(nameWithoutExt)) {
			errors.push("Filename uses a reserved system name");
		}

		// Check for dangerous characters
		const dangerousChars = /[<>:"|?*\x00-\x1f]/;
		if (dangerousChars.test(filename)) {
			errors.push("Filename contains dangerous characters");
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number): ValidationResult {
	const errors: string[] = [];

	if (size <= 0) {
		errors.push("File size must be greater than 0");
	}

	if (size > maxSize) {
		errors.push(`File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`);
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate MIME type against allowed types
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): ValidationResult {
	const errors: string[] = [];

	if (!mimeType) {
		errors.push("MIME type is required");
	} else if (!allowedTypes.includes(mimeType)) {
		errors.push(`File type '${mimeType}' is not allowed`);
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate GPS coordinates
 */
export function validateCoordinates(latitude: number, longitude: number): ValidationResult {
	const errors: string[] = [];

	if (latitude < -90 || latitude > 90) {
		errors.push("Latitude must be between -90 and 90 degrees");
	}

	if (longitude < -180 || longitude > 180) {
		errors.push("Longitude must be between -180 and 180 degrees");
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): ValidationResult {
	const errors: string[] = [];

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	if (!uuid) {
		errors.push("UUID is required");
	} else if (!uuidRegex.test(uuid)) {
		errors.push("Invalid UUID format");
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate IP address
 */
export function validateIPAddress(ip: string): ValidationResult {
	const errors: string[] = [];

	if (!ip) {
		errors.push("IP address is required");
	} else {
		// IPv4 validation
		const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		// IPv6 validation (simplified)
		const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

		if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
			errors.push("Invalid IP address format");
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: number, limit: number): ValidationResult {
	const errors: string[] = [];

	if (page < 1) {
		errors.push("Page must be greater than 0");
	}

	if (limit < 1) {
		errors.push("Limit must be greater than 0");
	}

	if (limit > 100) {
		errors.push("Limit cannot exceed 100");
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validate confidence score (0-1)
 */
export function validateConfidenceScore(score: number): ValidationResult {
	const errors: string[] = [];

	if (score < 0 || score > 1) {
		errors.push("Confidence score must be between 0 and 1");
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(text: string): string {
	return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}

/**
 * Validate and throw on error (utility for cleaner code)
 */
export function validateAndThrow(validation: ValidationResult, context: string): void {
	if (!validation.isValid) {
		throw new ValidationError(context, validation.errors.join(", "));
	}
}
