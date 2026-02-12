import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, AlertCircle, Eye, UserPlus } from "lucide-react";
import { useSceneStore, Scene } from "../stores/sceneStore";
import { logError } from "../lib/logger";
import Whiteboard from "../components/Whiteboard/Whiteboard";

export default function SharedScene() {
  const { sceneId, token } = useParams<{ sceneId: string; token: string }>();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [permission, setPermission] = useState<"view" | "edit" | null>(null);

  const { validateShareToken } = useSceneStore();

  useEffect(() => {
    const validate = async () => {
      if (!sceneId || !token) {
        setError("Invalid share link");
        setIsValidating(false);
        return;
      }

      try {
        const result = await validateShareToken(sceneId, token);

        if (result.valid && result.scene) {
          setScene(result.scene);
          setPermission(result.permission);
        } else {
          setError("This share link is invalid or has been revoked");
        }
      } catch (err) {
        logError(err, { source: "SharedScene", action: "validateShareToken" });
        setError("Failed to validate share link");
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [sceneId, token, validateShareToken]);

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Validating share link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !scene) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Unable to Access Scene
          </h1>
          <p className="text-slate-500 mb-6">
            {error || "The scene you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <div className="space-y-3">
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              <UserPlus size={18} />
              Sign up for U&I
            </Link>
            <Link
              to="/login"
              className="block w-full px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Read-only view
  const isViewOnly = permission === "view";

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Shared view banner */}
      <div className="bg-primary-500 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={18} />
          <span className="text-sm font-medium">
            Viewing: {scene.name}
            {isViewOnly && " (Read-only)"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary-100">
            Want to collaborate?
          </span>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-primary-600 text-sm font-medium rounded-md hover:bg-primary-50 transition-colors"
          >
            <UserPlus size={14} />
            Sign up free
          </Link>
        </div>
      </div>

      {/* Whiteboard in shared view mode */}
      <div className="flex-1">
        <Whiteboard
          sceneId={sceneId}
          isAnonymous={false}
          isSharedView={true}
          sharedScene={scene}
          viewModeEnabled={isViewOnly}
        />
      </div>
    </div>
  );
}
