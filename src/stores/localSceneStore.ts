import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { CodePad, LocalScene, ExcalidrawData } from "../types";
import {
  LOCAL_SCENE_ID_LENGTH,
  LOCAL_CODEPAD_ID_LENGTH,
  CODEPAD_DEFAULT_WIDTH,
  CODEPAD_DEFAULT_HEIGHT,
  CODEPAD_DEFAULT_CODE,
  CODEPAD_DEFAULT_LANGUAGE,
  DEFAULT_LOCAL_SCENE_NAME,
  LOCAL_SCENE_STORAGE_KEY,
} from "../constants";

// Re-export types for backward compatibility
export type { CodePad, LocalScene } from "../types";

interface LocalSceneState {
  scene: LocalScene | null;

  // Actions
  createScene: (name?: string) => string;
  updateScene: (updates: Partial<LocalScene>) => void;
  saveExcalidrawData: (data: ExcalidrawData | null) => void;

  // CodePad actions
  addCodePad: (x: number, y: number) => string;
  updateCodePad: (codePadId: string, updates: Partial<CodePad>) => void;
  removeCodePad: (codePadId: string) => void;

  // Get scene data for migration
  getSceneForMigration: () => { excalidrawData: ExcalidrawData | null; codePads: CodePad[] } | null;
  clearScene: () => void;
}

export const useLocalSceneStore = create<LocalSceneState>()(
  persist(
    (set, get) => ({
      scene: null,

      /**
       * Creates a new local scene with a generated ID and stores it in localStorage.
       * @param name - Optional scene name (defaults to "Untitled")
       * @returns The generated scene ID
       */
      createScene: (name?: string) => {
        const id = nanoid(LOCAL_SCENE_ID_LENGTH);
        const newScene: LocalScene = {
          id,
          name: name || DEFAULT_LOCAL_SCENE_NAME,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          excalidrawData: null,
          codePads: [],
        };

        set({ scene: newScene });
        return id;
      },

      /**
       * Partially updates the current local scene.
       * Automatically sets `updatedAt` to the current timestamp.
       * @param updates - Partial scene fields to merge
       */
      updateScene: (updates: Partial<LocalScene>) => {
        set((state) => {
          if (!state.scene) return state;
          return {
            scene: {
              ...state.scene,
              ...updates,
              updatedAt: Date.now(),
            },
          };
        });
      },

      /**
       * Saves Excalidraw canvas data (elements, appState) to the local scene.
       * @param data - The Excalidraw canvas data to persist
       */
      saveExcalidrawData: (data: ExcalidrawData | null) => {
        set((state) => {
          if (!state.scene) return state;
          return {
            scene: {
              ...state.scene,
              excalidrawData: data,
              updatedAt: Date.now(),
            },
          };
        });
      },

      /**
       * Adds a new CodePad widget at the specified position.
       * @param x - Horizontal position in pixels
       * @param y - Vertical position in pixels
       * @returns The generated CodePad ID
       */
      addCodePad: (x: number, y: number) => {
        const codePadId = nanoid(LOCAL_CODEPAD_ID_LENGTH);
        const newCodePad: CodePad = {
          id: codePadId,
          x,
          y,
          width: CODEPAD_DEFAULT_WIDTH,
          height: CODEPAD_DEFAULT_HEIGHT,
          code: CODEPAD_DEFAULT_CODE,
          language: CODEPAD_DEFAULT_LANGUAGE,
          isMinimized: false,
        };

        set((state) => {
          if (!state.scene) return state;
          return {
            scene: {
              ...state.scene,
              codePads: [...state.scene.codePads, newCodePad],
              updatedAt: Date.now(),
            },
          };
        });

        return codePadId;
      },

      /**
       * Partially updates a specific CodePad by ID.
       * @param codePadId - The ID of the CodePad to update
       * @param updates - Partial CodePad fields to merge
       */
      updateCodePad: (codePadId: string, updates: Partial<CodePad>) => {
        set((state) => {
          if (!state.scene) return state;
          return {
            scene: {
              ...state.scene,
              codePads: state.scene.codePads.map((cp) =>
                cp.id === codePadId ? { ...cp, ...updates } : cp
              ),
              updatedAt: Date.now(),
            },
          };
        });
      },

      /**
       * Removes a CodePad from the current scene.
       * @param codePadId - The ID of the CodePad to remove
       */
      removeCodePad: (codePadId: string) => {
        set((state) => {
          if (!state.scene) return state;
          return {
            scene: {
              ...state.scene,
              codePads: state.scene.codePads.filter((cp) => cp.id !== codePadId),
              updatedAt: Date.now(),
            },
          };
        });
      },

      /**
       * Returns the current scene's data in a format suitable for migration to Supabase.
       * @returns An object with excalidrawData and codePads, or null if no scene exists
       */
      getSceneForMigration: () => {
        const state = get();
        if (!state.scene) return null;
        return {
          excalidrawData: state.scene.excalidrawData,
          codePads: state.scene.codePads,
        };
      },

      /**
       * Clears the current local scene from state and localStorage.
       */
      clearScene: () => {
        set({ scene: null });
      },
    }),
    {
      name: LOCAL_SCENE_STORAGE_KEY,
    }
  )
);
