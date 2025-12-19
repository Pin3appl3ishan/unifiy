import React, { useEffect } from "react";
import { useCanvasStore } from "./stores/canvasStore";
import Whiteboard from "./components/Whiteboard/Whiteboard";

export default function App() {
  const { 
    currentCanvasId, 
    canvases, 
    createCanvas, 
    setCurrentCanvas,
    deleteCanvas,
    updateCanvasName 
  } = useCanvasStore();

  // Create a default canvas if none exists
  useEffect(() => {
    if (Object.keys(canvases).length === 0) {
      createCanvas("My First Canvas");
    } else if (!currentCanvasId) {
      // Set first canvas as current if none selected
      const firstCanvasId = Object.keys(canvases)[0];
      if (firstCanvasId) {
        setCurrentCanvas(firstCanvasId);
      }
    }
  }, [canvases, currentCanvasId, createCanvas, setCurrentCanvas]);

  const canvasList = Object.values(canvases);
  const currentCanvas = currentCanvasId ? canvases[currentCanvasId] : null;

  // Simple single-page app for now (can add React Router later)
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <h1 className="text-xl font-bold text-primary-500">U&I</h1>
          
          {/* Canvas Selector */}
          <div className="flex items-center gap-2">
            <select
              value={currentCanvasId || ""}
              onChange={(e) => setCurrentCanvas(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1 bg-white"
            >
              {canvasList.map((canvas) => (
                <option key={canvas.id} value={canvas.id}>
                  {canvas.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => createCanvas()}
              className="text-sm px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600"
              title="New Canvas"
            >
              + New
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {currentCanvas && (
            <span className="text-xs text-slate-400">
              Last saved: {new Date(currentCanvas.updatedAt).toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 overflow-hidden">
        {currentCanvasId ? (
          <Whiteboard canvasId={currentCanvasId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl text-slate-600 mb-4">No canvas selected</h2>
              <button
                onClick={() => createCanvas("New Canvas")}
                className="btn btn-primary"
              >
                Create New Canvas
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
