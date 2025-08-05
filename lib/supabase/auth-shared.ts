import { supabase } from "./client-shared";

// Shared utilities that work on both client and server

// User role management
export async function getUserRole(userId: string) {
	const { data, error } = await supabase.from("user_profiles").select("role").eq("id", userId).single();

	if (error) {
		console.error("Error fetching user role:", error);
		return null;
	}

	return data?.role || "investigator";
}

// Check if user has permission for specific action
export async function hasPermission(userId: string, action: string, resource?: string): Promise<boolean> {
	const role = await getUserRole(userId);

	const permissions = {
		admin: ["*"], // Admin has all permissions
		investigator: ["create_investigation", "upload_files", "view_own_investigations", "edit_own_investigations", "delete_own_investigations"],
		viewer: ["view_shared_investigations"],
	};

	const userPermissions = permissions[role as keyof typeof permissions] || [];

	return userPermissions.includes("*") || userPermissions.includes(action);
}

// Password validation
export function validatePassword(password: string): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Password must be at least 8 characters long");
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

	return {
		isValid: errors.length === 0,
		errors,
	};
}

// Email validation
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
