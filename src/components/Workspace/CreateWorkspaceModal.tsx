import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useWorkspaceStore, Workspace } from "../../stores/workspaceStore";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (workspace: Workspace) => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreated,
}: CreateWorkspaceModalProps) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createWorkspace } = useWorkspaceStore();

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
      const workspace = await createWorkspace(trimmedName);
      if (!workspace) {
        throw new Error("Failed to create workspace");
      }

      // Reset form and close
      setWorkspaceName("");
      onCreated(workspace);
    } catch (err: any) {
      console.error("[CreateWorkspaceModal] Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    setWorkspaceName("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">New Workspace</h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="newWorkspaceName"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Workspace Name
            </label>
            <input
              id="newWorkspaceName"
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g., Client Projects, Personal"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
              autoFocus
              disabled={isCreating}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !workspaceName.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
