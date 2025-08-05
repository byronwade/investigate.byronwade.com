// Security Service for authentication and authorization

import { UserRole, Permission } from "../../shared/types/common";
import { UnauthorizedAccessError, InsufficientPermissionsError, UserNotFoundError, AuthenticationError } from "../../shared/errors/domain-errors";
import { UserRepository } from "../repositories/user-repository";
import { InvestigationRepository } from "../../investigation/repositories/investigation-repository";

export interface AuthenticatedUser {
	id: string;
	email: string;
	role: UserRole;
	isActive: boolean;
	permissions: Permission[];
}

export class SecurityService {
	constructor(private readonly userRepo: UserRepository, private readonly investigationRepo: InvestigationRepository) {}

	/**
	 * Check if user has a specific permission
	 */
	async checkPermission(userId: string, permission: Permission): Promise<void> {
		const user = await this.getAuthenticatedUser(userId);

		if (!user.isActive) {
			throw new UnauthorizedAccessError(userId, "User account is deactivated");
		}

		if (!this.hasPermission(user, permission)) {
			throw new InsufficientPermissionsError(permission, user.role);
		}
	}

	/**
	 * Check if user has access to a specific investigation
	 */
	async checkInvestigationAccess(userId: string, investigationId: string, permission: Permission): Promise<void> {
		// 1. Check base permission
		await this.checkPermission(userId, permission);

		// 2. Check investigation-specific access
		const hasAccess = await this.investigationRepo.checkUserAccess(investigationId, userId, permission);

		if (!hasAccess) {
			throw new UnauthorizedAccessError(userId, `investigation ${investigationId}`);
		}
	}

	/**
	 * Get authenticated user with permissions
	 */
	async getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
		const user = await this.userRepo.findById(userId);

		if (!user) {
			throw new UserNotFoundError(userId);
		}

		const permissions = this.getRolePermissions(user.role);

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			isActive: user.isActive,
			permissions,
		};
	}

	/**
	 * Validate user credentials
	 */
	async validateCredentials(email: string, password: string): Promise<AuthenticatedUser> {
		const user = await this.userRepo.findByEmail(email);

		if (!user) {
			throw new AuthenticationError("Invalid credentials");
		}

		if (!user.isActive) {
			throw new AuthenticationError("Account is deactivated");
		}

		const isValidPassword = await this.userRepo.verifyPassword(user.id, password);
		if (!isValidPassword) {
			throw new AuthenticationError("Invalid credentials");
		}

		// Update last login
		await this.userRepo.updateLastLogin(user.id);

		const permissions = this.getRolePermissions(user.role);

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			isActive: user.isActive,
			permissions,
		};
	}

	/**
	 * Check if user is admin
	 */
	async isAdmin(userId: string): Promise<boolean> {
		const user = await this.getAuthenticatedUser(userId);
		return user.role === UserRole.ADMIN;
	}

	/**
	 * Check if user is investigator or higher
	 */
	async isInvestigator(userId: string): Promise<boolean> {
		const user = await this.getAuthenticatedUser(userId);
		return user.role === UserRole.INVESTIGATOR || user.role === UserRole.ADMIN;
	}

	/**
	 * Get user's effective permissions
	 */
	async getUserPermissions(userId: string): Promise<Permission[]> {
		const user = await this.getAuthenticatedUser(userId);
		return this.getRolePermissions(user.role);
	}

	/**
	 * Check multiple permissions at once
	 */
	async checkMultiplePermissions(userId: string, permissions: Permission[]): Promise<{ [key: string]: boolean }> {
		const user = await this.getAuthenticatedUser(userId);

		const results: { [key: string]: boolean } = {};

		for (const permission of permissions) {
			results[permission] = this.hasPermission(user, permission);
		}

		return results;
	}

	/**
	 * Check if user can perform action on resource
	 */
	async canAccessResource(userId: string, resourceType: string, resourceId: string, action: string): Promise<boolean> {
		try {
			const user = await this.getAuthenticatedUser(userId);

			// Admin can access everything
			if (user.role === UserRole.ADMIN) {
				return true;
			}

			// Check specific resource permissions
			switch (resourceType) {
				case "investigation":
					return await this.investigationRepo.checkUserAccess(resourceId, userId, action as Permission);

				// Add more resource types as needed
				default:
					return false;
			}
		} catch {
			return false;
		}
	}

	/**
	 * Generate secure session token
	 */
	async generateSessionToken(userId: string): Promise<string> {
		const user = await this.getAuthenticatedUser(userId);

		// In a real implementation, this would generate a JWT or session token
		// For now, return a placeholder
		return `session_${user.id}_${Date.now()}`;
	}

	/**
	 * Validate session token
	 */
	async validateSessionToken(token: string): Promise<AuthenticatedUser> {
		// In a real implementation, this would validate JWT or session token
		// For now, extract user ID from placeholder token
		const parts = token.split("_");
		if (parts.length !== 3 || parts[0] !== "session") {
			throw new AuthenticationError("Invalid session token");
		}

		const userId = parts[1];
		return await this.getAuthenticatedUser(userId);
	}

	// Private helper methods

	private hasPermission(user: AuthenticatedUser, permission: Permission): boolean {
		// Admin has all permissions
		if (user.role === UserRole.ADMIN) {
			return true;
		}

		// Check if user has specific permission
		return user.permissions.includes(permission);
	}

	private getRolePermissions(role: UserRole): Permission[] {
		switch (role) {
			case UserRole.ADMIN:
				return ["*" as Permission]; // All permissions

			case UserRole.INVESTIGATOR:
				return ["investigation:create", "investigation:read:own", "investigation:update:own", "investigation:delete:own", "evidence:upload", "evidence:view:own", "evidence:analyze", "evidence:delete"];

			case UserRole.VIEWER:
				return ["investigation:read:shared", "evidence:view:shared"];

			default:
				return [];
		}
	}
}
