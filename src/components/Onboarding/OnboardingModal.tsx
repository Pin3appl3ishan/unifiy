import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, FileText } from "lucide-react";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useSceneStore } from "../../stores/sceneStore";
import { useLocalSceneStore } from "../../stores/localSceneStore";
import { useAuthStore } from "../../stores/authStore";

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createWorkspace } = useWorkspaceStore();
  const { createScene } = useSceneStore();
  const { getSceneForMigration, clearScene, scene: localScene } = useLocalSceneStore();
  const { updateProfile } = useAuthStore();

  const hasLocalData = localScene !== null && (
    localScene.excalidrawData !== null || localScene.codePads.length > 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setError("Please enter a workspace name");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // 1. Create workspace
      const workspace = await createWorkspace(trimmedName);
      if (!workspace) {
        throw new Error("Failed to create workspace");
      }

      // 2. If local data exists, migrate it
      const migrationData = getSceneForMigration();
      if (migrationData && (migrationData.excalidrawData || migrationData.codePads.length > 0)) {
        const scene = await createScene(
          workspace.id,
          localScene?.name || "Imported Scene",
          {
            excalidrawData: migrationData.excalidrawData,
            codePads: migrationData.codePads,
          }
        );

        if (!scene) {
          throw new Error("Failed to import your existing work");
        }

        // Only clear localStorage after successful DB save
        clearScene();
      }

      // 3. Update profile to mark onboarding complete
      await updateProfile({
        onboardingComplete: true,
        currentWorkspaceId: workspace.id,
      });

      // 4. Complete onboarding
      onComplete();
    } catch (err: unknown) {
      console.error("[OnboardingModal] Error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
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
              disabled={isCreating}
            />
          </div>

          {/* Local data migration notice */}
          {hasLocalData && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary-800">
                    We found your existing work!
                  </p>
                  <p className="text-sm text-primary-600 mt-1">
                    Your canvas will be automatically imported into this workspace.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isCreating || !workspaceName.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
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
      </div>
    </div>
  );
}
