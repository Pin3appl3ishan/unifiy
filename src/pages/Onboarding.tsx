import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  Download,
  RotateCcw,
} from "lucide-react";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useSceneStore } from "../stores/sceneStore";
import { useLocalSceneStore } from "../stores/localSceneStore";
import { useAuthStore } from "../stores/authStore";
import { logError } from "../lib/logger";

type Step = "workspace" | "import";

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuthStore();
  const { createWorkspace } = useWorkspaceStore();
  const { createScene } = useSceneStore();
  const { getSceneForMigration, clearScene, scene: localScene } =
    useLocalSceneStore();

  const [step, setStep] = useState<Step>("workspace");
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stash workspace ID after step 1
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(
    null
  );

  // If onboarding is already complete, redirect to workspace
  if (profile?.onboardingComplete) {
    return <Navigate to="/workspace" replace />;
  }

  const hasLocalData =
    localScene !== null &&
    (localScene.excalidrawData !== null || localScene.codePads.length > 0);

  // Step 1: Create workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setError("Please enter a workspace name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const workspace = await createWorkspace(trimmedName);
      if (!workspace) {
        throw new Error("Failed to create workspace");
      }

      setCreatedWorkspaceId(workspace.id);

      // If local data exists, go to import step; otherwise create empty scene and finish
      if (hasLocalData) {
        setStep("import");
        setIsLoading(false);
      } else {
        await createScene(workspace.id);
        await completeOnboarding(workspace.id);
      }
    } catch (err: unknown) {
      logError(err, { source: "Onboarding", action: "createWorkspace" });
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Step 2a: Import local data into a new scene
  const handleImport = async () => {
    if (!createdWorkspaceId) return;

    setIsLoading(true);
    setError(null);

    try {
      const migrationData = getSceneForMigration();
      if (
        migrationData &&
        (migrationData.excalidrawData || migrationData.codePads.length > 0)
      ) {
        const scene = await createScene(
          createdWorkspaceId,
          localScene?.name || "Imported Scene",
          {
            excalidrawData: migrationData.excalidrawData,
            codePads: migrationData.codePads,
          }
        );
        if (!scene) {
          throw new Error("Failed to import your existing work");
        }
      }

      clearScene();
      await completeOnboarding(createdWorkspaceId);
    } catch (err: unknown) {
      logError(err, { source: "Onboarding", action: "importScene" });
      setError(
        err instanceof Error
          ? err.message
          : "Failed to import your work. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Step 2b: Start fresh — create empty scene, clear local data
  const handleStartFresh = async () => {
    if (!createdWorkspaceId) return;

    setIsLoading(true);
    setError(null);

    try {
      await createScene(createdWorkspaceId);
      clearScene();
      await completeOnboarding(createdWorkspaceId);
    } catch (err: unknown) {
      logError(err, { source: "Onboarding", action: "startFresh" });
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Mark onboarding complete and redirect
  const completeOnboarding = async (workspaceId: string) => {
    await updateProfile({
      onboardingComplete: true,
      currentWorkspaceId: workspaceId,
    });
    navigate("/workspace", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "workspace" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={28} />
                  <h1 className="text-2xl font-bold">Welcome to U&I!</h1>
                </div>
                <p className="text-primary-100">
                  Let's set up your first workspace
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateWorkspace} className="p-8">
                <div className="mb-6">
                  <label
                    htmlFor="workspaceName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Workspace Name
                  </label>
                  <input
                    id="workspaceName"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g., My Projects, Work, Personal"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !workspaceName.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Workspace
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === "import" && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={28} />
                  <h1 className="text-2xl font-bold">
                    We found your work!
                  </h1>
                </div>
                <p className="text-primary-100">
                  You have an existing canvas. Would you like to import it?
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Your local canvas{" "}
                    {localScene?.name && (
                      <span className="font-medium text-slate-800">
                        "{localScene.name}"
                      </span>
                    )}{" "}
                    contains drawings and data that can be imported into your new
                    workspace.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleImport}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download size={20} />
                        Yes, import my work
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStartFresh}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw size={20} />
                    Start fresh
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
