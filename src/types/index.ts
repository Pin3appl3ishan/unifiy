// =============================================================================
// U&I — Centralized Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------

/**
 * Extracts a human-readable error message from an unknown caught value.
 * Safely handles Error objects, strings, and unknown types.
 * @param error - The caught error value (typically from a catch block)
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

// -----------------------------------------------------------------------------
// Enums & Union Types
// -----------------------------------------------------------------------------

/** User subscription tier */
export type UserTier = "free" | "premium";

/** Scene sharing permission level */
export type SharePermission = "none" | "view" | "edit";

// -----------------------------------------------------------------------------
// Domain Models (camelCase — used throughout the app)
// -----------------------------------------------------------------------------

/** A code editor widget embedded in a scene */
export interface CodePad {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;
  language: string;
  isMinimized: boolean;
}

/**
 * Excalidraw canvas data stored as a JSON blob.
 * Contains the drawing elements, app state (background, zoom, scroll), and optional files.
 * Typed loosely because the data is serialized to/from Supabase JSON columns.
 */
export type ExcalidrawData = Record<string, unknown>;

/** A remote scene (authenticated users, stored in Supabase) */
export interface Scene {
  id: string;
  workspaceId: string;
  name: string;
  excalidrawData: ExcalidrawData | null;
  codePads: CodePad[];
  shareToken: string | null;
  sharePermission: SharePermission;
  createdAt: string;
  updatedAt: string;
}

/** A local scene (anonymous users, stored in localStorage) */
export interface LocalScene {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  excalidrawData: ExcalidrawData | null;
  codePads: CodePad[];
}

/** A user workspace containing scenes */
export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Authenticated user profile */
export interface Profile {
  id: string;
  tier: UserTier;
  currentWorkspaceId: string | null;
  onboardingComplete: boolean;
}

// -----------------------------------------------------------------------------
// Supabase Row Types (snake_case — matching database columns)
// -----------------------------------------------------------------------------

/** Supabase `scenes` table row */
export interface SupabaseScene {
  id: string;
  workspace_id: string;
  name: string;
  excalidraw_data: ExcalidrawData | null;
  codepads: CodePad[] | null;
  share_token: string | null;
  share_permission: SharePermission;
  created_at: string;
  updated_at: string;
}

/** Supabase `workspaces` table row */
export interface SupabaseWorkspace {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Supabase `profiles` table row */
export interface SupabaseProfile {
  id: string;
  tier: UserTier;
  current_workspace_id: string | null;
  onboarding_complete: boolean;
}

// -----------------------------------------------------------------------------
// Supabase Update Payloads
// -----------------------------------------------------------------------------

/** Payload for updating a scene in Supabase */
export interface SceneUpdatePayload {
  name?: string;
  excalidraw_data?: ExcalidrawData | null;
  codepads?: CodePad[];
  updated_at: string;
}

/** Payload for updating a profile in Supabase */
export interface ProfileUpdatePayload {
  current_workspace_id?: string | null;
  onboarding_complete?: boolean;
}

// -----------------------------------------------------------------------------
// Error & API Response Types
// -----------------------------------------------------------------------------

/** Structured application error */
export interface AppError {
  message: string;
  code?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T | null;
  error: AppError | null;
}

/** Result of validating a share token */
export interface ShareValidationResult {
  valid: boolean;
  permission: "view" | "edit" | null;
  scene: Scene | null;
}
