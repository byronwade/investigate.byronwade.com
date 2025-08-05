// Re-export all auth utilities for convenience
// Use specific imports based on your use case:
// - Server Components: import from 'auth-server'
// - Client Components: import from 'auth-client'
// - Shared utilities: import from 'auth-shared'

// Server-side exports (for Server Components only)
export { getServerSession, getServerUser, requireAuth, withAuth } from "./auth-server";

// Client-side exports (for Client Components only)
export { useSupabaseSession, signOut, refreshSession } from "./auth-client";

// Shared exports (works in both client and server)
export { getUserRole, hasPermission, validatePassword, validateEmail } from "./auth-shared";
