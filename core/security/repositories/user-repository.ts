// User Repository interface for authentication and user management

import { UserRole } from "../../shared/types/common";

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	lastLoginAt?: Date;
	passwordHash: string;
	emailVerified: boolean;
	department?: string;
	organization?: string;
}

export interface CreateUserData {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
	role?: UserRole;
	department?: string;
	organization?: string;
}

export interface UpdateUserData {
	firstName?: string;
	lastName?: string;
	role?: UserRole;
	isActive?: boolean;
	department?: string;
	organization?: string;
}

export interface UserRepository {
	// Basic CRUD operations
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	save(user: User): Promise<User>;
	create(userData: CreateUserData): Promise<User>;
	update(id: string, userData: UpdateUserData): Promise<User>;
	delete(id: string): Promise<void>;
	exists(id: string): Promise<boolean>;

	// Authentication methods
	verifyPassword(userId: string, password: string): Promise<boolean>;
	updatePassword(userId: string, newPasswordHash: string): Promise<void>;
	updateLastLogin(userId: string): Promise<void>;

	// Query methods
	findByRole(role: UserRole): Promise<User[]>;
	findActiveUsers(): Promise<User[]>;
	findInactiveUsers(): Promise<User[]>;
	findByDepartment(department: string): Promise<User[]>;
	findByOrganization(organization: string): Promise<User[]>;

	// Search methods
	searchUsers(query: string): Promise<User[]>;
	findUsersWithFilters(filters: { role?: UserRole; isActive?: boolean; department?: string; organization?: string; createdAfter?: Date; createdBefore?: Date }): Promise<User[]>;

	// Statistics
	countByRole(role: UserRole): Promise<number>;
	countActiveUsers(): Promise<number>;
	getTotalUsers(): Promise<number>;

	// Email verification
	markEmailAsVerified(userId: string): Promise<void>;
	findUnverifiedUsers(): Promise<User[]>;

	// Security methods
	findUsersWithRecentLogins(withinDays: number): Promise<User[]>;
	findUsersWithoutRecentLogins(withinDays: number): Promise<User[]>;
	lockUser(userId: string): Promise<void>;
	unlockUser(userId: string): Promise<void>;
}
