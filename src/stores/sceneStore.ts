import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { logError } from "../lib/logger";
import type {
  CodePad,
  Scene,
  SupabaseScene,
  ExcalidrawData,
  SceneUpdatePayload,
  ShareValidationResult,
  SharePermission,
} from "../types";
import { getErrorMessage } from "../types";
import { SAVE_DEBOUNCE_MS, DEFAULT_SCENE_NAME, TOAST_MESSAGES } from "../constants";

// Re-export types for backward compatibility
export type { Scene } from "../types";

interface SceneState {
  scenes: Scene[];
  currentScene: Scene | null;
  isLoading: boolean;
  isInitialLoad: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchScenes: (workspaceId: string) => Promise<void>;
  fetchScene: (id: string) => Promise<Scene | null>;
  createScene: (
    workspaceId: string,
    name?: string,
    data?: { excalidrawData?: ExcalidrawData | null; codePads?: CodePad[] }
  ) => Promise<Scene | null>;
  updateScene: (id: string, updates: Partial<Pick<Scene, "name" | "excalidrawData" | "codePads">>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  setCurrentScene: (id: string | null) => void;

  // Debounced save for real-time editing
  saveSceneData: (id: string, data: { excalidrawData?: ExcalidrawData | null; codePads?: CodePad[] }) => void;

  // Share functionality
  generateShareLink: (sceneId: string, permission?: "view" | "edit") => Promise<string | null>;
  validateShareToken: (sceneId: string, token: string) => Promise<ShareValidationResult>;
  revokeShareLink: (sceneId: string) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

/**
 * Converts a Supabase scene row (snake_case) to the app-level Scene model (camelCase).
 * Handles codepads that may be a JSON string or an array depending on column type.
 * @param row - The raw Supabase row
 * @returns A Scene object
 */
const toScene = (row: SupabaseScene): Scene => {
  // Handle codepads - might be string (text column) or array (jsonb column)
  let codePads: CodePad[] = [];
  if (row.codepads) {
    if (typeof row.codepads === "string") {
      try {
        codePads = JSON.parse(row.codepads);
      } catch (e) {
        logError(e, { source: "SceneStore", action: "parseCodepads" });
      }
    } else if (Array.isArray(row.codepads)) {
      codePads = row.codepads;
    }
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    excalidrawData: row.excalidraw_data,
    codePads,
    shareToken: row.share_token,
    sharePermission: row.share_permission || "none",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Debounce helper
let saveTimeout: NodeJS.Timeout | null = null;

export const useSceneStore = create<SceneState>((set, get) => ({
  scenes: [],
  currentScene: null,
  isLoading: false,
  isInitialLoad: true,
  isSaving: false,
  error: null,

  /**
   * Fetches all scenes for a given workspace, ordered by most recently updated.
   * @param workspaceId - The workspace to fetch scenes for
   */
  fetchScenes: async (workspaceId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .returns<SupabaseScene[]>();

      if (error) throw error;

      const scenes = (data || []).map(toScene);
      set({ scenes, isLoading: false, isInitialLoad: false });
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "fetchScenes" });
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      toast.error(TOAST_MESSAGES.SCENE_FETCH_FAILED);
    }
  },

  /**
   * Fetches a single scene by ID and sets it as the current scene.
   * If the scene is already in the local list, it updates the existing entry.
   * @param id - The scene ID
   * @returns The fetched Scene, or null on error
   */
  fetchScene: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const scene = toScene(data as SupabaseScene);
      set((state) => ({
        currentScene: scene,
        scenes: state.scenes.some((s) => s.id === id)
          ? state.scenes.map((s) => (s.id === id ? scene : s))
          : [...state.scenes, scene],
        isLoading: false,
      }));

      return scene;
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "fetchScene" });
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      toast.error(TOAST_MESSAGES.SCENE_FETCH_FAILED);
      return null;
    }
  },

  /**
   * Creates a new scene in a workspace and sets it as the current scene.
   * @param workspaceId - The workspace to create the scene in
   * @param name - Optional scene name (defaults to "Untitled Scene")
   * @param data - Optional initial excalidraw data and codePads
   * @returns The created Scene, or null on error
   */
  createScene: async (workspaceId, name, data) => {
    set({ isLoading: true, error: null });

    try {
      const { data: insertData, error } = await supabase
        .from("scenes")
        .insert({
          workspace_id: workspaceId,
          name: name || DEFAULT_SCENE_NAME,
          excalidraw_data: data?.excalidrawData || null,
          codepads: data?.codePads || [],
          share_permission: "none" as SharePermission,
        })
        .select()
        .single();

      if (error) throw error;

      const scene = toScene(insertData as SupabaseScene);

      set((state) => ({
        scenes: [scene, ...state.scenes],
        currentScene: scene,
        isLoading: false,
      }));

      return scene;
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "createScene" });
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      toast.error(TOAST_MESSAGES.SCENE_CREATE_FAILED);
      return null;
    }
  },

  /**
   * Updates a scene's name, excalidraw data, and/or codePads.
   * @param id - The scene ID to update
   * @param updates - Partial scene fields (name, excalidrawData, codePads)
   */
  updateScene: async (id, updates) => {
    set({ error: null });

    try {
      const updatePayload: SceneUpdatePayload = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.excalidrawData !== undefined) updatePayload.excalidraw_data = updates.excalidrawData;
      if (updates.codePads !== undefined) updatePayload.codepads = updates.codePads;

      const { error } = await supabase
        .from("scenes")
        .update(updatePayload)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        ),
        currentScene:
          state.currentScene?.id === id
            ? { ...state.currentScene, ...updates, updatedAt: new Date().toISOString() }
            : state.currentScene,
      }));
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "updateScene" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.SCENE_SAVE_FAILED);
    }
  },

  /**
   * Permanently deletes a scene by ID.
   * If the deleted scene is the current scene, clears the current scene.
   * @param id - The scene ID to delete
   */
  deleteScene: async (id: string) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from("scenes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== id),
        currentScene: state.currentScene?.id === id ? null : state.currentScene,
      }));
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "deleteScene" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.SCENE_DELETE_FAILED);
    }
  },

  /**
   * Sets the current scene by ID from the existing scenes list.
   * Pass null to clear the current scene.
   * @param id - The scene ID, or null to clear
   */
  setCurrentScene: (id: string | null) => {
    if (!id) {
      set({ currentScene: null });
      return;
    }
    const scene = get().scenes.find((s) => s.id === id);
    if (scene) {
      set({ currentScene: scene });
    }
  },

  /**
   * Saves scene data with debouncing for excalidraw data and immediate saves for codePads.
   * Updates local state immediately for a responsive UI, then persists to Supabase.
   * @param id - The scene ID
   * @param data - Object containing excalidrawData and/or codePads to save
   */
  saveSceneData: (id: string, data: { excalidrawData?: ExcalidrawData | null; codePads?: CodePad[] }) => {
    // Update local state immediately
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
      ),
      currentScene:
        state.currentScene?.id === id
          ? { ...state.currentScene, ...data, updatedAt: new Date().toISOString() }
          : state.currentScene,
    }));

    // CodePad changes should save immediately (not debounced) to prevent data loss
    // Only debounce excalidrawData which changes frequently during drawing
    if (data.codePads !== undefined) {
      (async () => {
        try {
          const { error } = await supabase
            .from("scenes")
            .update({
              codepads: data.codePads,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;
        } catch (error: unknown) {
          logError(error, { source: "SceneStore", action: "saveCodePads" });
          toast.error(TOAST_MESSAGES.SCENE_SAVE_FAILED);
        }
      })();
    }

    // Debounce excalidraw data saves only
    if (data.excalidrawData === undefined) {
      return;
    }

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    set({ isSaving: true });

    saveTimeout = setTimeout(async () => {
      try {
        const updatePayload: SceneUpdatePayload = {
          updated_at: new Date().toISOString(),
        };

        if (data.excalidrawData !== undefined) updatePayload.excalidraw_data = data.excalidrawData;

        const { error } = await supabase
          .from("scenes")
          .update(updatePayload)
          .eq("id", id);

        if (error) throw error;

        set({ isSaving: false });
      } catch (error: unknown) {
        logError(error, { source: "SceneStore", action: "saveExcalidrawData" });
        set({
          isSaving: false,
          error: getErrorMessage(error),
        });
        toast.error(TOAST_MESSAGES.SCENE_SAVE_FAILED);
      }
    }, SAVE_DEBOUNCE_MS);
  },

  /**
   * Generates a shareable link for a scene by creating a share token.
   * @param sceneId - The scene ID to share
   * @param permission - Permission level for the share link (defaults to "view")
   * @returns The full share URL, or null on error
   */
  generateShareLink: async (sceneId: string, permission: "view" | "edit" = "view") => {
    try {
      const shareToken = crypto.randomUUID();

      const { error } = await supabase
        .from("scenes")
        .update({
          share_token: shareToken,
          share_permission: permission,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, shareToken, sharePermission: permission } : s
        ),
        currentScene:
          state.currentScene?.id === sceneId
            ? { ...state.currentScene, shareToken, sharePermission: permission }
            : state.currentScene,
      }));

      // Return the share URL
      const baseUrl = window.location.origin;
      toast.success(TOAST_MESSAGES.SHARE_LINK_GENERATED);
      return `${baseUrl}/scene/${sceneId}/shared/${shareToken}`;
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "generateShareLink" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.SHARE_LINK_FAILED);
      return null;
    }
  },

  /**
   * Validates a share token against a scene and returns the scene if valid.
   * @param sceneId - The scene ID to validate against
   * @param token - The share token to check
   * @returns A ShareValidationResult with validity, permission, and scene data
   */
  validateShareToken: async (sceneId: string, token: string) => {
    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("id", sceneId)
        .single();

      if (error) throw error;

      const scene = toScene(data as SupabaseScene);

      // Check if token matches and sharing is enabled
      if (scene.shareToken === token && scene.sharePermission !== "none") {
        return {
          valid: true,
          permission: scene.sharePermission as "view" | "edit",
          scene,
        };
      }

      return { valid: false, permission: null, scene: null };
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "validateShareToken" });
      return { valid: false, permission: null, scene: null };
    }
  },

  /**
   * Revokes a scene's share link by clearing the token and resetting permissions.
   * @param sceneId - The scene ID to revoke sharing for
   */
  revokeShareLink: async (sceneId: string) => {
    try {
      const { error } = await supabase
        .from("scenes")
        .update({
          share_token: null,
          share_permission: "none" as SharePermission,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, shareToken: null, sharePermission: "none" as SharePermission } : s
        ),
        currentScene:
          state.currentScene?.id === sceneId
            ? { ...state.currentScene, shareToken: null, sharePermission: "none" as SharePermission }
            : state.currentScene,
      }));

      toast.success(TOAST_MESSAGES.SHARE_LINK_REVOKED);
    } catch (error: unknown) {
      logError(error, { source: "SceneStore", action: "revokeShareLink" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.SHARE_REVOKE_FAILED);
    }
  },

  /** Clears the current error state. */
  clearError: () => set({ error: null }),

  /**
   * Resets all scene state to initial values and clears any pending save timeout.
   */
  reset: () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    set({
      scenes: [],
      currentScene: null,
      isLoading: false,
      isInitialLoad: true,
      isSaving: false,
      error: null,
    });
  },
}));
