"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewInvestigationDialogProps {
	onInvestigationCreated?: (investigation: any) => void;
	trigger?: React.ReactNode;
}

export function NewInvestigationDialog({ onInvestigationCreated, trigger }: NewInvestigationDialogProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		classification: "internal" as "public" | "internal" | "confidential" | "restricted",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Investigation name is required";
		} else if (formData.name.length > 255) {
			newErrors.name = "Name must be less than 255 characters";
		}

		if (formData.description.length > 1000) {
			newErrors.description = "Description must be less than 1000 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear specific field error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/investigations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name.trim(),
					description: formData.description.trim() || undefined,
					access_level: formData.classification,
				}),
			});

			// Parse response text first
			const responseText = await response.text();

			if (!response.ok) {
				let errorMessage = "Failed to create investigation";
				if (responseText) {
					try {
						const errorData = JSON.parse(responseText);
						errorMessage = errorData.error || errorMessage;
					} catch {
						errorMessage = `Server error: ${response.status} ${response.statusText}`;
					}
				}
				throw new Error(errorMessage);
			}

			// Parse success response
			let result;
			if (responseText) {
				try {
					result = JSON.parse(responseText);
				} catch {
					throw new Error("Invalid response format from server");
				}
			} else {
				throw new Error("Empty response from server");
			}

			// Reset form
			setFormData({
				name: "",
				description: "",
				classification: "internal",
			});
			setErrors({});
			setOpen(false);

			// Notify parent component
			onInvestigationCreated?.(result?.data || result);
		} catch (error) {
			console.error("Error creating investigation:", error);
			setErrors({
				submit: error instanceof Error ? error.message : "Failed to create investigation. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!loading) {
			setOpen(newOpen);
			if (!newOpen) {
				// Reset form when closing
				setFormData({
					name: "",
					description: "",
					classification: "internal",
				});
				setErrors({});
			}
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{trigger || (
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						New Investigation
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Create New Investigation
					</DialogTitle>
					<DialogDescription>Start a new investigation by providing a name and description. You can add evidence files after creation.</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						{/* Investigation Name */}
						<div className="space-y-2">
							<Label htmlFor="investigation-name" className="text-sm font-medium">
								Investigation Name *
							</Label>
							<Input id="investigation-name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="e.g., Case #2024-001 - Digital Evidence Analysis" className={cn("h-11", errors.name && "border-red-500")} disabled={loading} maxLength={255} />
							{errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="investigation-description" className="text-sm font-medium">
								Description
							</Label>
							<Textarea id="investigation-description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Brief description of the investigation scope and objectives..." rows={3} className={cn("resize-none", errors.description && "border-red-500")} disabled={loading} maxLength={1000} />
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{errors.description || "Optional: Provide a brief description"}</span>
								<span>{formData.description.length}/1000</span>
							</div>
						</div>

						{/* Classification Level */}
						<div className="space-y-2">
							<Label htmlFor="classification" className="text-sm font-medium">
								Classification Level
							</Label>
							<Select value={formData.classification} onValueChange={(value) => handleInputChange("classification", value)} disabled={loading}>
								<SelectTrigger id="classification" className="h-11">
									<SelectValue placeholder="Select classification level" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="public">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-green-500" />
											<div>
												<div className="font-medium">Public</div>
												<div className="text-xs text-muted-foreground">No restrictions</div>
											</div>
										</div>
									</SelectItem>
									<SelectItem value="internal">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-blue-500" />
											<div>
												<div className="font-medium">Internal</div>
												<div className="text-xs text-muted-foreground">Organization only</div>
											</div>
										</div>
									</SelectItem>
									<SelectItem value="confidential">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-orange-500" />
											<div>
												<div className="font-medium">Confidential</div>
												<div className="text-xs text-muted-foreground">Restricted access</div>
											</div>
										</div>
									</SelectItem>
									<SelectItem value="restricted">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-red-500" />
											<div>
												<div className="font-medium">Restricted</div>
												<div className="text-xs text-muted-foreground">Highest security</div>
											</div>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Submit Error */}
					{errors.submit && (
						<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
							<p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading || !formData.name.trim()}>
							{loading ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Plus className="h-4 w-4 mr-2" />
									Create Investigation
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
