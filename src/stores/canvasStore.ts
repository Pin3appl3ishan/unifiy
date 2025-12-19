import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

// Types
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

export interface Canvas {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  excalidrawData: any; // Excalidraw scene data
  codePads: CodePad[];
}

interface CanvasState {
  // Current canvas
  currentCanvasId: string | null;
  canvases: Record<string, Canvas>;
  
  // Actions
  createCanvas: (name?: string) => string;
  deleteCanvas: (id: string) => void;
  setCurrentCanvas: (id: string) => void;
  updateCanvasName: (id: string, name: string) => void;
  
  // Excalidraw data
  saveExcalidrawData: (canvasId: string, data: any) => void;
  
  // CodePad actions
  addCodePad: (canvasId: string, x: number, y: number) => string;
  updateCodePad: (canvasId: string, codePadId: string, updates: Partial<CodePad>) => void;
  removeCodePad: (canvasId: string, codePadId: string) => void;
  
  // Get current canvas helper
  getCurrentCanvas: () => Canvas | null;
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      currentCanvasId: null,
      canvases: {},

      createCanvas: (name?: string) => {
        const id = nanoid(10);
        const newCanvas: Canvas = {
          id,
          name: name || `Untitled Canvas`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          excalidrawData: null,
          codePads: [],
        };

        set((state) => ({
          canvases: { ...state.canvases, [id]: newCanvas },
          currentCanvasId: id,
        }));

        return id;
      },

      deleteCanvas: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...rest } = state.canvases;
          const newCurrentId = state.currentCanvasId === id 
            ? Object.keys(rest)[0] || null 
            : state.currentCanvasId;
          return { canvases: rest, currentCanvasId: newCurrentId };
        });
      },

      setCurrentCanvas: (id: string) => {
        set({ currentCanvasId: id });
      },

      updateCanvasName: (id: string, name: string) => {
        set((state) => ({
          canvases: {
            ...state.canvases,
            [id]: { ...state.canvases[id], name, updatedAt: Date.now() },
          },
        }));
      },

      saveExcalidrawData: (canvasId: string, data: any) => {
        set((state) => {
          if (!state.canvases[canvasId]) return state;
          return {
            canvases: {
              ...state.canvases,
              [canvasId]: {
                ...state.canvases[canvasId],
                excalidrawData: data,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      addCodePad: (canvasId: string, x: number, y: number) => {
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
          if (!state.canvases[canvasId]) return state;
          return {
            canvases: {
              ...state.canvases,
              [canvasId]: {
                ...state.canvases[canvasId],
                codePads: [...state.canvases[canvasId].codePads, newCodePad],
                updatedAt: Date.now(),
              },
            },
          };
        });

        return codePadId;
      },

      updateCodePad: (canvasId: string, codePadId: string, updates: Partial<CodePad>) => {
        set((state) => {
          if (!state.canvases[canvasId]) return state;
          return {
            canvases: {
              ...state.canvases,
              [canvasId]: {
                ...state.canvases[canvasId],
                codePads: state.canvases[canvasId].codePads.map((cp) =>
                  cp.id === codePadId ? { ...cp, ...updates } : cp
                ),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      removeCodePad: (canvasId: string, codePadId: string) => {
        set((state) => {
          if (!state.canvases[canvasId]) return state;
          return {
            canvases: {
              ...state.canvases,
              [canvasId]: {
                ...state.canvases[canvasId],
                codePads: state.canvases[canvasId].codePads.filter(
                  (cp) => cp.id !== codePadId
                ),
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      getCurrentCanvas: () => {
        const state = get();
        if (!state.currentCanvasId) return null;
        return state.canvases[state.currentCanvasId] || null;
      },
    }),
    {
      name: "unifii-canvas-storage", // localStorage key
      partialize: (state) => ({
        canvases: state.canvases,
        currentCanvasId: state.currentCanvasId,
      }),
    }
  )
);
