import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

// Types for CodePad (shared with sceneStore)
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

// Local scene for anonymous users
export interface LocalScene {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  excalidrawData: any;
  codePads: CodePad[];
}

interface LocalSceneState {
  scene: LocalScene | null;

  // Actions
  createScene: (name?: string) => string;
  updateScene: (updates: Partial<LocalScene>) => void;
  saveExcalidrawData: (data: any) => void;

  // CodePad actions
  addCodePad: (x: number, y: number) => string;
  updateCodePad: (codePadId: string, updates: Partial<CodePad>) => void;
  removeCodePad: (codePadId: string) => void;

  // Get scene data for migration
  getSceneForMigration: () => { excalidrawData: any; codePads: CodePad[] } | null;
  clearScene: () => void;
}

export const useLocalSceneStore = create<LocalSceneState>()(
  persist(
    (set, get) => ({
      scene: null,

      createScene: (name?: string) => {
        const id = nanoid(10);
        const newScene: LocalScene = {
          id,
          name: name || "Untitled",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          excalidrawData: null,
          codePads: [],
        };

        set({ scene: newScene });
        return id;
      },

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

      saveExcalidrawData: (data: any) => {
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

      addCodePad: (x: number, y: number) => {
        const codePadId = nanoid(8);
        const newCodePad: CodePad = {
          id: codePadId,
          x,
          y,
          width: 400,
          height: 300,
          code: "// Start coding here...\n",
          language: "javascript",
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

      getSceneForMigration: () => {
        const state = get();
        if (!state.scene) return null;
        return {
          excalidrawData: state.scene.excalidrawData,
          codePads: state.scene.codePads,
        };
      },

      clearScene: () => {
        set({ scene: null });
      },
    }),
    {
      name: "unifii-local-scene",
    }
  )
);
