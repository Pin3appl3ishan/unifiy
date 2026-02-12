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
