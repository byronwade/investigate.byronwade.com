import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Basic Supabase client (works everywhere, but no SSR optimizations)
// Create a fallback client if environment variables are not set
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createClient("https://placeholder.supabase.co", "placeholder-key");

// File upload helper
export async function uploadFile(
	file: File,
	bucket: string,
	path: string,
	options?: {
		onProgress?: (progress: number) => void;
	}
) {
	const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
		cacheControl: "3600",
		upsert: false,
	});

	if (error) throw error;
	return data;
}

// Get signed URL for file access
export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
	const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

	if (error) throw error;
	return data.signedUrl;
}

// Delete file from storage
export async function deleteFile(bucket: string, path: string) {
	const { error } = await supabase.storage.from(bucket).remove([path]);

	if (error) throw error;
}

// List files in bucket
export async function listFiles(bucket: string, folder?: string) {
	const { data, error } = await supabase.storage.from(bucket).list(folder);

	if (error) throw error;
	return data;
}

// Batch operations helper
export async function batchInsert<T>(table: string, data: T[], chunkSize = 100) {
	const results = [];

	for (let i = 0; i < data.length; i += chunkSize) {
		const chunk = data.slice(i, i + chunkSize);
		const { data: result, error } = await supabase.from(table).insert(chunk).select();

		if (error) throw error;
		results.push(...(result || []));
	}

	return results;
}

// Text search helper
export async function searchText(
	table: string,
	column: string,
	query: string,
	options?: {
		limit?: number;
		offset?: number;
	}
) {
	let queryBuilder = supabase.from(table).select("*").textSearch(column, query);

	if (options?.limit) {
		queryBuilder = queryBuilder.limit(options.limit);
	}

	if (options?.offset) {
		queryBuilder = queryBuilder.range(options.offset, options.offset + (options.limit || 10) - 1);
	}

	const { data, error } = await queryBuilder;

	if (error) throw error;
	return data;
}
