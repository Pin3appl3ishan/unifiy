import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { CodePad } from "./localSceneStore";

// Types
export interface Scene {
  id: string;
  workspaceId: string;
  name: string;
  excalidrawData: any;
  codePads: CodePad[];
  shareToken: string | null;
  sharePermission: "none" | "view" | "edit";
  createdAt: string;
  updatedAt: string;
}

// Supabase row type
interface SupabaseScene {
  id: string;
  workspace_id: string;
  name: string;
  excalidraw_data: any;
  codepads: CodePad[] | null;
  share_token: string | null;
  share_permission: "none" | "view" | "edit";
  created_at: string;
  updated_at: string;
}

interface SceneState {
  scenes: Scene[];
  currentScene: Scene | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  fetchScenes: (workspaceId: string) => Promise<void>;
  fetchScene: (id: string) => Promise<Scene | null>;
  createScene: (
    workspaceId: string,
    name?: string,
    data?: { excalidrawData?: any; codePads?: CodePad[] }
  ) => Promise<Scene | null>;
  updateScene: (id: string, updates: Partial<Pick<Scene, "name" | "excalidrawData" | "codePads">>) => Promise<void>;
  deleteScene: (id: string) => Promise<void>;
  setCurrentScene: (id: string | null) => void;

  // Debounced save for real-time editing
  saveSceneData: (id: string, data: { excalidrawData?: any; codePads?: CodePad[] }) => void;

  // Share functionality
  generateShareLink: (sceneId: string, permission?: "view" | "edit") => Promise<string | null>;
  validateShareToken: (sceneId: string, token: string) => Promise<{ valid: boolean; permission: "view" | "edit" | null; scene: Scene | null }>;
  revokeShareLink: (sceneId: string) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

// Convert Supabase row to Scene
const toScene = (row: SupabaseScene): Scene => {
  // Handle codepads - might be string (text column) or array (jsonb column)
  let codePads: CodePad[] = [];
  if (row.codepads) {
    if (typeof row.codepads === "string") {
      try {
        codePads = JSON.parse(row.codepads);
      } catch (e) {
        console.error("[SceneStore] Failed to parse codepads:", e);
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
const SAVE_DEBOUNCE = 1000;

export const useSceneStore = create<SceneState>((set, get) => ({
  scenes: [],
  currentScene: null,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchScenes: async (workspaceId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const scenes = (data || []).map(toScene);
      set({ scenes, isLoading: false });
    } catch (error: any) {
      console.error("[SceneStore] fetchScenes error:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to fetch scenes",
      });
    }
  },

  fetchScene: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const scene = toScene(data);
      set((state) => ({
        currentScene: scene,
        scenes: state.scenes.some((s) => s.id === id)
          ? state.scenes.map((s) => (s.id === id ? scene : s))
          : [...state.scenes, scene],
        isLoading: false,
      }));

      return scene;
    } catch (error: any) {
      console.error("[SceneStore] fetchScene error:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to fetch scene",
      });
      return null;
    }
  },

  createScene: async (workspaceId, name, data) => {
    set({ isLoading: true, error: null });

    try {
      const { data: insertData, error } = await supabase
        .from("scenes")
        .insert({
          workspace_id: workspaceId,
          name: name || "Untitled Scene",
          excalidraw_data: data?.excalidrawData || null,
          codepads: data?.codePads || [],
          share_permission: "none",
        })
        .select()
        .single();

      if (error) throw error;

      const scene = toScene(insertData);

      set((state) => ({
        scenes: [scene, ...state.scenes],
        currentScene: scene,
        isLoading: false,
      }));

      return scene;
    } catch (error: any) {
      console.error("[SceneStore] createScene error:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to create scene",
      });
      return null;
    }
  },

  updateScene: async (id, updates) => {
    set({ error: null });

    try {
      const updatePayload: any = {
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
    } catch (error: any) {
      console.error("[SceneStore] updateScene error:", error);
      set({ error: error.message || "Failed to update scene" });
    }
  },

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
    } catch (error: any) {
      console.error("[SceneStore] deleteScene error:", error);
      set({ error: error.message || "Failed to delete scene" });
    }
  },

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

  // Debounced save for real-time editing
  saveSceneData: (id: string, data: { excalidrawData?: any; codePads?: CodePad[] }) => {
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
        } catch (error: any) {
          console.error("[SceneStore] Failed to save codePads:", error);
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
        const updatePayload: any = {
          updated_at: new Date().toISOString(),
        };

        if (data.excalidrawData !== undefined) updatePayload.excalidraw_data = data.excalidrawData;

        const { error } = await supabase
          .from("scenes")
          .update(updatePayload)
          .eq("id", id);

        if (error) throw error;

        set({ isSaving: false });
      } catch (error: any) {
        console.error("[SceneStore] saveSceneData error:", error);
        set({
          isSaving: false,
          error: error.message || "Failed to save scene",
        });
      }
    }, SAVE_DEBOUNCE);
  },

  // Generate a share link for a scene
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
      return `${baseUrl}/scene/${sceneId}/shared/${shareToken}`;
    } catch (error: any) {
      console.error("[SceneStore] generateShareLink error:", error);
      set({ error: error.message || "Failed to generate share link" });
      return null;
    }
  },

  // Validate a share token and return the scene if valid
  validateShareToken: async (sceneId: string, token: string) => {
    try {
      const { data, error } = await supabase
        .from("scenes")
        .select("*")
        .eq("id", sceneId)
        .single();

      if (error) throw error;

      const scene = toScene(data);

      // Check if token matches and sharing is enabled
      if (scene.shareToken === token && scene.sharePermission !== "none") {
        return {
          valid: true,
          permission: scene.sharePermission as "view" | "edit",
          scene,
        };
      }

      return { valid: false, permission: null, scene: null };
    } catch (error: any) {
      console.error("[SceneStore] validateShareToken error:", error);
      return { valid: false, permission: null, scene: null };
    }
  },

  // Revoke share link (disable sharing)
  revokeShareLink: async (sceneId: string) => {
    try {
      const { error } = await supabase
        .from("scenes")
        .update({
          share_token: null,
          share_permission: "none",
          updated_at: new Date().toISOString(),
        })
        .eq("id", sceneId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === sceneId ? { ...s, shareToken: null, sharePermission: "none" } : s
        ),
        currentScene:
          state.currentScene?.id === sceneId
            ? { ...state.currentScene, shareToken: null, sharePermission: "none" }
            : state.currentScene,
      }));
    } catch (error: any) {
      console.error("[SceneStore] revokeShareLink error:", error);
      set({ error: error.message || "Failed to revoke share link" });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    set({
      scenes: [],
      currentScene: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  },
}));
