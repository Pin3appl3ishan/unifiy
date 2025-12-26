import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useCanvasStore } from "./stores/canvasStore";
import { useAuthStore } from "./stores/authStore";
import Whiteboard from "./components/Whiteboard/Whiteboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function Canvas() {
  const {
    currentCanvasId,
    canvases,
    createCanvas,
    setCurrentCanvas,
  } = useCanvasStore();

  // Create a default canvas if none exists
  useEffect(() => {
    if (Object.keys(canvases).length === 0) {
      createCanvas("My First Canvas");
    } else if (!currentCanvasId) {
      const firstCanvasId = Object.keys(canvases)[0];
      if (firstCanvasId) {
        setCurrentCanvas(firstCanvasId);
      }
    }
  }, [canvases, currentCanvasId, createCanvas, setCurrentCanvas]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentCanvasId ? (
        <Whiteboard canvasId={currentCanvasId} />
      ) : (
        <div className="flex items-center justify-center h-full bg-slate-50">
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
    </div>
  );
}

export default function App() {
  const { initialize, loading } = useAuthStore();

  // Initialize auth on app mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading state while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-500 mb-2">U&I</h1>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Canvas />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}
