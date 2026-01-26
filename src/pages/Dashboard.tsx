import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, FileText, Clock, ArrowRight, Lock, Plus } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useSceneStore } from "../stores/sceneStore";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher/WorkspaceSwitcher";
import CreateWorkspaceModal from "../components/Workspace/CreateWorkspaceModal";

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);

  const { user, profile, signOut, updateProfile } = useAuthStore();
  const {
    workspaces,
    currentWorkspace,
    fetchWorkspaces,
    setCurrentWorkspace,
    canCreateWorkspace,
    isLoading: workspaceLoading,
  } = useWorkspaceStore();
  const { scenes, fetchScenes, createScene, isLoading: sceneLoading } = useSceneStore();

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Fetch scenes when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      fetchScenes(currentWorkspace.id);
    }
  }, [currentWorkspace, fetchScenes]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleOpenScene = (sceneId: string) => {
    navigate(`/scene/${sceneId}`);
  };

  const handleCreateScene = async () => {
    if (!currentWorkspace) return;
    const scene = await createScene(currentWorkspace.id, "Untitled Scene");
    if (scene) {
      navigate(`/scene/${scene.id}`);
    }
  };

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    await updateProfile({ currentWorkspaceId: workspaceId });
  };

  const handleWorkspaceCreated = async (workspace: { id: string }) => {
    setShowCreateWorkspaceModal(false);
    await handleWorkspaceSwitch(workspace.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const isLoading = workspaceLoading || sceneLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Workspace Switcher */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary-500">U&I</span>
              <span className="text-slate-300">/</span>
              <WorkspaceSwitcher
                currentWorkspace={currentWorkspace}
                workspaces={workspaces}
                onSwitch={handleWorkspaceSwitch}
                onCreateNew={() => setShowCreateWorkspaceModal(true)}
                canCreateNew={canCreateWorkspace(profile?.tier || "free")}
              />
            </div>

            {/* User info & logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Scenes</h1>
            <p className="text-slate-600 mt-1">
              Create and collaborate on whiteboards
            </p>
          </div>
          <button
            onClick={handleCreateScene}
            disabled={!currentWorkspace}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} />
            New Scene
          </button>
        </div>

        {/* Scene grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your scenes...</p>
            </div>
          </div>
        ) : scenes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                onClick={() => handleOpenScene(scene.id)}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer overflow-hidden"
              >
                {/* Scene preview placeholder */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center border-b border-slate-100">
                  <FileText
                    size={48}
                    className="text-slate-300 group-hover:text-primary-400 transition-colors"
                  />
                </div>

                {/* Scene info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {scene.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                    <Clock size={14} />
                    <span>{formatDate(scene.updatedAt)}</span>
                  </div>

                  {/* Open button */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      {scene.codePads?.length || 0} CodePad
                      {(scene.codePads?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary-500 group-hover:text-primary-600">
                      Open
                      <ArrowRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No scenes yet</h3>
            <p className="text-slate-500 mb-4">Create your first scene to get started</p>
            <button
              onClick={handleCreateScene}
              disabled={!currentWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <Plus size={18} />
              Create Scene
            </button>
          </div>
        )}
      </main>

      {/* Premium banner */}
      {profile?.tier === "free" && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Lock size={16} />
              <span>
                <strong>Free tier:</strong> Limited scenes.{" "}
                <button className="underline hover:no-underline font-medium">
                  Upgrade to Premium
                </button>{" "}
                for unlimited scenes & collaboration.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateWorkspaceModal}
        onClose={() => setShowCreateWorkspaceModal(false)}
        onCreated={handleWorkspaceCreated}
      />
    </div>
  );
}
