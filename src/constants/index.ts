// =============================================================================
// U&I — Application Constants
// =============================================================================

// -----------------------------------------------------------------------------
// Debounce & Timeout Timings (ms)
// -----------------------------------------------------------------------------

/** Debounce delay for persisting excalidraw data to Supabase */
export const SAVE_DEBOUNCE_MS = 1000;

/** Debounce delay for the Excalidraw onChange handler */
export const CHANGE_DEBOUNCE_MS = 500;

/** Duration to show "Copied!" feedback after copying a share link */
export const COPY_FEEDBACK_TIMEOUT_MS = 2000;

// -----------------------------------------------------------------------------
// Tier-Based Limits
// -----------------------------------------------------------------------------

/** Maximum CodePads per scene for free-tier users */
export const MAX_CODEPADS_FREE = 3;

/** Maximum workspaces for free-tier users */
export const MAX_WORKSPACES_FREE = 1;

// -----------------------------------------------------------------------------
// CodePad Defaults
// -----------------------------------------------------------------------------

export const CODEPAD_DEFAULT_WIDTH = 400;
export const CODEPAD_DEFAULT_HEIGHT = 300;
export const CODEPAD_MIN_WIDTH = 250;
export const CODEPAD_MIN_HEIGHT = 150;
export const CODEPAD_DEFAULT_CODE = "// Start coding here...\n";
export const CODEPAD_DEFAULT_LANGUAGE = "javascript";

/** Supported CodePad languages with display metadata */
export const CODEPAD_LANGUAGES = {
  javascript: { label: "JavaScript", badge: "JS", badgeBg: "bg-amber-500", textColor: "text-amber-400" },
  python:     { label: "Python",     badge: "PY", badgeBg: "bg-blue-500",  textColor: "text-blue-400" },
  html:       { label: "HTML",       badge: "HTML", badgeBg: "bg-orange-500", textColor: "text-orange-400" },
  css:        { label: "CSS",        badge: "CSS", badgeBg: "bg-purple-500", textColor: "text-purple-400" },
  json:       { label: "JSON",       badge: "JSON", badgeBg: "bg-green-500", textColor: "text-green-400" },
  java:       { label: "Java",       badge: "JV", badgeBg: "bg-red-500",   textColor: "text-red-400" },
  markdown:   { label: "Markdown",   badge: "MD", badgeBg: "bg-slate-500", textColor: "text-slate-400" },
} as const;

export type CodePadLanguage = keyof typeof CODEPAD_LANGUAGES;

// -----------------------------------------------------------------------------
// ID Generation
// -----------------------------------------------------------------------------

/** nanoid length for local (anonymous) scene IDs */
export const LOCAL_SCENE_ID_LENGTH = 10;

/** nanoid length for local (anonymous) CodePad IDs */
export const LOCAL_CODEPAD_ID_LENGTH = 8;

// -----------------------------------------------------------------------------
// Storage Keys
// -----------------------------------------------------------------------------

/** Zustand persist storage key for the anonymous scene */
export const LOCAL_SCENE_STORAGE_KEY = "unifii-local-scene";

// -----------------------------------------------------------------------------
// Default Names
// -----------------------------------------------------------------------------

export const DEFAULT_SCENE_NAME = "Untitled Scene";
export const DEFAULT_LOCAL_SCENE_NAME = "Untitled";

// -----------------------------------------------------------------------------
// Supabase Error Codes
// -----------------------------------------------------------------------------

/** PostgREST error code for "no rows found" (.single() with 0 results) */
export const SUPABASE_NOT_FOUND_CODE = "PGRST116";

// -----------------------------------------------------------------------------
// Time Constants (ms)
// -----------------------------------------------------------------------------

export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY = 86_400_000;

// -----------------------------------------------------------------------------
// External Links
// -----------------------------------------------------------------------------

export const GITHUB_URL = "https://github.com";
export const DISCORD_URL = "https://discord.com";

// -----------------------------------------------------------------------------
// Toast Notifications
// -----------------------------------------------------------------------------

/** Default duration for toast notifications (ms) */
export const TOAST_DURATION_MS = 4000;

/** Toast messages for common operations */
export const TOAST_MESSAGES = {
  // Scene operations
  SCENE_SAVE_FAILED: "Failed to save scene. Your changes may not be persisted.",
  SCENE_FETCH_FAILED: "Failed to load scenes. Please try again.",
  SCENE_CREATE_FAILED: "Failed to create scene.",
  SCENE_DELETE_FAILED: "Failed to delete scene.",

  // Workspace operations
  WORKSPACE_FETCH_FAILED: "Failed to load workspaces.",
  WORKSPACE_CREATE_FAILED: "Failed to create workspace.",
  WORKSPACE_UPDATE_FAILED: "Failed to update workspace.",
  WORKSPACE_DELETE_FAILED: "Failed to delete workspace.",

  // Share operations
  SHARE_LINK_GENERATED: "Share link created!",
  SHARE_LINK_REVOKED: "Share link revoked.",
  SHARE_LINK_FAILED: "Failed to generate share link.",
  SHARE_REVOKE_FAILED: "Failed to revoke share link.",

  // Auth operations
  SIGN_OUT_FAILED: "Failed to sign out. Please try again.",
  PROFILE_UPDATE_FAILED: "Failed to update profile.",

  // Generic
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred.",
} as const;
