import { create } from "zustand";
import { supabase } from "../lib/supabase";

// Types
export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Supabase row type
interface SupabaseWorkspace {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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
  canCreateWorkspace: (tier: "free" | "premium") => boolean;
}

// Convert Supabase row to Workspace
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

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

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
    } catch (error: any) {
      console.error("[WorkspaceStore] fetchWorkspaces error:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to fetch workspaces",
      });
    }
  },

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

      const workspace = toWorkspace(data);

      set((state) => ({
        workspaces: [workspace, ...state.workspaces],
        currentWorkspace: workspace,
        isLoading: false,
      }));

      return workspace;
    } catch (error: any) {
      console.error("[WorkspaceStore] createWorkspace error:", error);
      set({
        isLoading: false,
        error: error.message || "Failed to create workspace",
      });
      return null;
    }
  },

  setCurrentWorkspace: (id: string) => {
    const workspace = get().workspaces.find((w) => w.id === id);
    if (workspace) {
      set({ currentWorkspace: workspace });
    }
  },

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
    } catch (error: any) {
      console.error("[WorkspaceStore] updateWorkspace error:", error);
      set({ error: error.message || "Failed to update workspace" });
    }
  },

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
    } catch (error: any) {
      console.error("[WorkspaceStore] deleteWorkspace error:", error);
      set({ error: error.message || "Failed to delete workspace" });
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null,
  }),

  canCreateWorkspace: (tier: "free" | "premium") => {
    const { workspaces } = get();
    if (tier === "premium") return true;
    return workspaces.length < 1; // Free tier: max 1 workspace
  },
}));
