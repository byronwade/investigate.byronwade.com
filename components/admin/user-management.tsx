"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Shield, Eye, Edit, Trash2, Search, Filter, MoreHorizontal, CheckCircle, XCircle, Crown, User, UserCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { formatTimestamp } from "@/lib/utils";

interface UserProfile {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	role: "admin" | "investigator" | "viewer";
	department?: string;
	organization?: string;
	is_active: boolean;
	last_login_at?: string;
	login_count: number;
	created_at: string;
}

interface UserFilters {
	role?: string;
	organization?: string;
	isActive?: boolean;
	search?: string;
}

export function UserManagement() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<UserFilters>({});
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const queryParams = new URLSearchParams();

			if (filters.role) queryParams.append("role", filters.role);
			if (filters.organization) queryParams.append("organization", filters.organization);
			if (filters.isActive !== undefined) queryParams.append("isActive", filters.isActive.toString());

			const response = await fetch(`/api/users?${queryParams.toString()}`);

			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}

			const data = await response.json();
			setUsers(data.users || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (currentUser?.role === "admin") {
			fetchUsers();
		}
	}, [filters, currentUser]);

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "admin":
				return <Crown className="h-4 w-4" />;
			case "investigator":
				return <UserCheck className="h-4 w-4" />;
			case "viewer":
				return <Eye className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "destructive";
			case "investigator":
				return "default";
			case "viewer":
				return "secondary";
			default:
				return "outline";
		}
	};

	const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update user");
			}

			await fetchUsers(); // Refresh the list
			setEditingUser(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update user");
		}
	};

	const handleDeactivateUser = async (userId: string) => {
		if (!confirm("Are you sure you want to deactivate this user?")) return;

		try {
			const response = await fetch(`/api/users/${userId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to deactivate user");
			}

			await fetchUsers(); // Refresh the list
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to deactivate user");
		}
	};

	if (currentUser?.role !== "admin") {
		return (
			<Alert>
				<Shield className="h-4 w-4" />
				<AlertDescription>Admin access required to view user management.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">User Management</h1>
					<p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
				</div>
				<Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<UserPlus className="h-4 w-4 mr-2" />
							Invite User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Invite New User</DialogTitle>
							<DialogDescription>Send an invitation to a new user to join the platform</DialogDescription>
						</DialogHeader>
						<InviteUserForm
							onSuccess={() => {
								setInviteDialogOpen(false);
								fetchUsers();
							}}
						/>
					</DialogContent>
				</Dialog>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-4">
					<div className="space-y-2">
						<Label htmlFor="search">Search</Label>
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="search" placeholder="Search users..." className="pl-10" value={filters.search || ""} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">Role</Label>
						<Select value={filters.role || ""} onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value || undefined }))}>
							<SelectTrigger>
								<SelectValue placeholder="All roles" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All roles</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="investigator">Investigator</SelectItem>
								<SelectItem value="viewer">Viewer</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="status">Status</Label>
						<Select
							value={filters.isActive?.toString() || ""}
							onValueChange={(value) =>
								setFilters((prev) => ({
									...prev,
									isActive: value === "" ? undefined : value === "true",
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All statuses</SelectItem>
								<SelectItem value="true">Active</SelectItem>
								<SelectItem value="false">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-end">
						<Button variant="outline" onClick={() => setFilters({})} className="w-full">
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Users List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Users ({users.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-6">Loading users...</div>
					) : users.length === 0 ? (
						<div className="text-center py-6 text-muted-foreground">No users found</div>
					) : (
						<div className="space-y-4">
							{users
								.filter((user) => !filters.search || user.email.toLowerCase().includes(filters.search.toLowerCase()) || `${user.first_name} ${user.last_name}`.toLowerCase().includes(filters.search.toLowerCase()))
								.map((user) => (
									<div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className="p-2 bg-muted rounded-full">{getRoleIcon(user.role)}</div>
											<div>
												<div className="flex items-center space-x-2">
													<span className="font-medium">
														{user.first_name} {user.last_name}
													</span>
													<Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
													{user.is_active ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
												</div>
												<div className="text-sm text-muted-foreground">
													{user.email}
													{user.department && ` • ${user.department}`}
													{user.organization && ` • ${user.organization}`}
												</div>
												<div className="text-xs text-muted-foreground">
													Joined {formatTimestamp(user.created_at)}
													{user.last_login_at && ` • Last login ${formatTimestamp(user.last_login_at)}`}
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
												<Edit className="h-4 w-4" />
											</Button>
											{user.id !== currentUser?.id && (
												<Button variant="ghost" size="sm" onClick={() => handleDeactivateUser(user.id)}>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</div>
								))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit User Dialog */}
			{editingUser && (
				<Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit User</DialogTitle>
							<DialogDescription>Update user role and permissions</DialogDescription>
						</DialogHeader>
						<EditUserForm user={editingUser} onSave={(updates) => handleUpdateUser(editingUser.id, updates)} onCancel={() => setEditingUser(null)} />
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}

function InviteUserForm({ onSuccess }: { onSuccess: () => void }) {
	const [formData, setFormData] = useState({
		email: "",
		role: "investigator" as const,
		department: "",
		organization: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to send invitation");
			}

			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send invitation");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="role">Role</Label>
				<Select value={formData.role} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, role: value }))}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="viewer">Viewer</SelectItem>
						<SelectItem value="investigator">Investigator</SelectItem>
						<SelectItem value="admin">Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="department">Department</Label>
					<Input id="department" value={formData.department} onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="organization">Organization</Label>
					<Input id="organization" value={formData.organization} onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))} />
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="flex justify-end space-x-2">
				<Button type="submit" disabled={loading}>
					{loading ? "Sending..." : "Send Invitation"}
				</Button>
			</div>
		</form>
	);
}

function EditUserForm({ user, onSave, onCancel }: { user: UserProfile; onSave: (updates: Partial<UserProfile>) => void; onCancel: () => void }) {
	const [formData, setFormData] = useState({
		role: user.role,
		isActive: user.is_active,
		department: user.department || "",
		organization: user.organization || "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="role">Role</Label>
				<Select value={formData.role} onValueChange={(value: any) => setFormData((prev) => ({ ...prev, role: value }))}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="viewer">Viewer</SelectItem>
						<SelectItem value="investigator">Investigator</SelectItem>
						<SelectItem value="admin">Admin</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center space-x-2">
				<input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} />
				<Label htmlFor="isActive">Active</Label>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="department">Department</Label>
					<Input id="department" value={formData.department} onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="organization">Organization</Label>
					<Input id="organization" value={formData.organization} onChange={(e) => setFormData((prev) => ({ ...prev, organization: e.target.value }))} />
				</div>
			</div>

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit">Save Changes</Button>
			</div>
		</form>
	);
}
