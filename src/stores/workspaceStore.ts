import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { logError } from "../lib/logger";
import type { Workspace, SupabaseWorkspace, UserTier } from "../types";
import { getErrorMessage } from "../types";
import { MAX_WORKSPACES_FREE, TOAST_MESSAGES } from "../constants";

// Re-export types for backward compatibility
export type { Workspace } from "../types";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  setCurrentWorkspace: (id: string) => void;
  updateWorkspace: (id: string, updates: Partial<Pick<Workspace, "name">>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Helpers
  canCreateWorkspace: (tier: UserTier) => boolean;
}

/**
 * Converts a Supabase workspace row (snake_case) to the app-level Workspace model (camelCase).
 * @param row - The raw Supabase row
 * @returns A Workspace object
 */
const toWorkspace = (row: SupabaseWorkspace): Workspace => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  /**
   * Fetches all workspaces owned by the current user.
   * Auto-selects the first workspace if none is currently selected.
   */
  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .returns<SupabaseWorkspace[]>();

      if (error) throw error;

      const workspaces = (data || []).map(toWorkspace);

      set({
        workspaces,
        isLoading: false,
      });

      // Auto-select first workspace if none selected
      if (workspaces.length > 0 && !get().currentWorkspace) {
        set({ currentWorkspace: workspaces[0] });
      }
    } catch (error: unknown) {
      logError(error, { source: "WorkspaceStore", action: "fetchWorkspaces" });
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      toast.error(TOAST_MESSAGES.WORKSPACE_FETCH_FAILED);
    }
  },

  /**
   * Creates a new workspace and sets it as the current workspace.
   * @param name - The name for the new workspace
   * @returns The created Workspace, or null on error
   */
  createWorkspace: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .insert({
          owner_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;

      const workspace = toWorkspace(data as SupabaseWorkspace);

      set((state) => ({
        workspaces: [workspace, ...state.workspaces],
        currentWorkspace: workspace,
        isLoading: false,
      }));

      return workspace;
    } catch (error: unknown) {
      logError(error, { source: "WorkspaceStore", action: "createWorkspace" });
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      toast.error(TOAST_MESSAGES.WORKSPACE_CREATE_FAILED);
      return null;
    }
  },

  /**
   * Sets the current workspace by ID from the existing workspaces list.
   * @param id - The workspace ID to select
   */
  setCurrentWorkspace: (id: string) => {
    const workspace = get().workspaces.find((w) => w.id === id);
    if (workspace) {
      set({ currentWorkspace: workspace });
    }
  },

  /**
   * Updates a workspace's name in Supabase.
   * @param id - The workspace ID to update
   * @param updates - Partial workspace fields to update (currently only name)
   */
  updateWorkspace: async (id: string, updates: Partial<Pick<Workspace, "name">>) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from("workspaces")
        .update({
          name: updates.name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
        ),
        currentWorkspace:
          state.currentWorkspace?.id === id
            ? { ...state.currentWorkspace, ...updates, updatedAt: new Date().toISOString() }
            : state.currentWorkspace,
      }));
    } catch (error: unknown) {
      logError(error, { source: "WorkspaceStore", action: "updateWorkspace" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.WORKSPACE_UPDATE_FAILED);
    }
  },

  /**
   * Permanently deletes a workspace by ID.
   * If the deleted workspace is the current one, selects the next available workspace.
   * @param id - The workspace ID to delete
   */
  deleteWorkspace: async (id: string) => {
    set({ error: null });

    try {
      const { error } = await supabase
        .from("workspaces")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => {
        const workspaces = state.workspaces.filter((w) => w.id !== id);
        return {
          workspaces,
          currentWorkspace:
            state.currentWorkspace?.id === id
              ? workspaces[0] || null
              : state.currentWorkspace,
        };
      });
    } catch (error: unknown) {
      logError(error, { source: "WorkspaceStore", action: "deleteWorkspace" });
      set({ error: getErrorMessage(error) });
      toast.error(TOAST_MESSAGES.WORKSPACE_DELETE_FAILED);
    }
  },

  /** Clears the current error state. */
  clearError: () => set({ error: null }),

  /**
   * Resets all workspace state to initial values.
   */
  reset: () => set({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null,
  }),

  /**
   * Checks whether the user can create a new workspace based on their tier.
   * Free-tier users are limited to a maximum number of workspaces.
   * @param tier - The user's subscription tier
   * @returns True if the user can create another workspace
   */
  canCreateWorkspace: (tier: UserTier) => {
    const { workspaces } = get();
    if (tier === "premium") return true;
    return workspaces.length < MAX_WORKSPACES_FREE;
  },
}));
