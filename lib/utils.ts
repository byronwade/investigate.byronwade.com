import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) return "0 Bytes";

	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
	}
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getFileIcon(type: string): string {
	if (type.startsWith("image/")) return "🖼️";
	if (type.startsWith("video/")) return "🎥";
	if (type.startsWith("audio/")) return "🎵";
	if (type.includes("pdf")) return "📄";
	if (type.includes("word") || type.includes("document")) return "📝";
	if (type.includes("spreadsheet") || type.includes("excel")) return "📊";
	if (type.includes("presentation") || type.includes("powerpoint")) return "📈";
	if (type.includes("zip") || type.includes("rar") || type.includes("7z")) return "📦";
	return "📄";
}

export function generateUniqueId(): string {
	return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function calculateProcessingTime(fileSize: number, fileType: string): number {
	// Estimate processing time based on file size and type
	const baseTime = 2; // seconds
	const sizeFactor = fileSize / (1024 * 1024); // MB

	let typeFactor = 1;
	if (fileType.startsWith("video/")) typeFactor = 3;
	else if (fileType.startsWith("audio/")) typeFactor = 1.5;
	else if (fileType.startsWith("image/")) typeFactor = 0.5;

	return Math.max(baseTime, sizeFactor * typeFactor);
}

export function extractFileMetadata(file: File) {
	return {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: new Date(file.lastModified),
		extension: file.name.split(".").pop()?.toLowerCase() || "",
	};
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
	return allowedTypes.some((type) => {
		if (type.endsWith("/*")) {
			return file.type.startsWith(type.slice(0, -1));
		}
		return file.type === type;
	});
}

export function createTimestamp(): string {
	return new Date().toISOString();
}

export function formatTimestamp(timestamp: string): string {
	return new Date(timestamp).toLocaleString();
}

export function sanitizeFilename(filename: string): string {
	return filename.replace(/[^a-z0-9.-]/gi, "_").toLowerCase();
}

export function generateInvestigationId(): string {
	const prefix = "INV";
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 8).toUpperCase();
	return `${prefix}-${timestamp}-${random}`;
}

export function calculateProgress(completed: number, total: number): number {
	if (total === 0) return 0;
	return Math.round((completed / total) * 100);
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
}
