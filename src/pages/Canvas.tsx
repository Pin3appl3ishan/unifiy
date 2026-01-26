import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Cloud, X } from "lucide-react";
import { useLocalSceneStore } from "../stores/localSceneStore";
import { useSceneStore } from "../stores/sceneStore";
import Whiteboard from "../components/Whiteboard/Whiteboard";

interface CanvasProps {
  isAnonymous?: boolean;
}

export default function Canvas({ isAnonymous = false }: CanvasProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showBanner, setShowBanner] = useState(true);

  // Local scene store (anonymous users)
  const localScene = useLocalSceneStore((s) => s.scene);
  const createLocalScene = useLocalSceneStore((s) => s.createScene);

  // Remote scene store (logged-in users)
  const { currentScene, fetchScene, isLoading } = useSceneStore();

  // Anonymous: ensure a local scene exists
  useEffect(() => {
    if (!isAnonymous) return;
    if (!localScene) {
      createLocalScene("My Canvas");
    }
  }, [isAnonymous, localScene, createLocalScene]);

  // Logged-in: fetch scene by ID
  useEffect(() => {
    if (isAnonymous || !id) return;
    fetchScene(id);
  }, [isAnonymous, id, fetchScene]);

  // Show loading state for remote scenes
  if (!isAnonymous && isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading your scene...</p>
        </div>
      </div>
    );
  }

  // Scene not found (logged-in users)
  if (!isAnonymous && !currentScene && !isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Scene not found
          </h2>
          <p className="text-slate-500 mb-4">
            This scene doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate("/workspace")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  // Anonymous: waiting for scene to be created
  if (isAnonymous && !localScene) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Setting up your canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Whiteboard */}
      <Whiteboard
        sceneId={isAnonymous ? undefined : id}
        isAnonymous={isAnonymous}
      />

      {/* Sign up banner (anonymous users only) */}
      {isAnonymous && showBanner && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-slate-200">
            <Cloud size={20} className="text-primary-500 flex-shrink-0" />
            <p className="text-sm text-slate-600">
              Your work is saved locally.{" "}
              <Link
                to="/signup"
                className="font-medium text-primary-500 hover:text-primary-600 underline"
              >
                Sign up
              </Link>{" "}
              to save to cloud & access anywhere.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
