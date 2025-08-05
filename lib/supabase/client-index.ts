// Re-export all client utilities for convenience
// Use specific imports based on your use case:
// - Server Components/API Routes: import from 'client-server'
// - Client Components: import from 'client-browser'
// - Shared utilities: import from 'client-shared'

// Server-side exports (for Server Components and API Routes only)
export { createSupabaseServerClient } from "./client-server";

// Client-side exports (for Client Components only)
export { createSupabaseBrowserClient, supabaseBrowser, subscribeToTable } from "./client-browser";

// Shared exports (works in both client and server)
export { supabase, uploadFile, getSignedUrl, deleteFile, listFiles, batchInsert, searchText } from "./client-shared";
