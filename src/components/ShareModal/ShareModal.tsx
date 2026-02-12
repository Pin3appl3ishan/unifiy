import { useState, useEffect } from "react";
import { X, Link2, Copy, Check, Globe, Loader2 } from "lucide-react";
import { useSceneStore } from "../../stores/sceneStore";
import { logError } from "../../lib/logger";
import { getErrorMessage } from "../../types";
import { COPY_FEEDBACK_TIMEOUT_MS } from "../../constants";

interface ShareModalProps {
  sceneId: string;
  sceneName: string;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function ShareModal({
  sceneId,
  sceneName,
  isOpen,
  onClose,
  isDarkMode = false,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { generateShareLink, currentScene, revokeShareLink } = useSceneStore();

  // Check if scene already has a share link
  useEffect(() => {
    if (isOpen && currentScene?.shareToken && currentScene.sharePermission !== "none") {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/scene/${sceneId}/shared/${currentScene.shareToken}`);
    } else {
      setShareUrl(null);
    }
  }, [isOpen, currentScene, sceneId]);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const url = await generateShareLink(sceneId, "view");
      if (url) {
        setShareUrl(url);
      } else {
        throw new Error("Failed to generate link");
      }
    } catch (err: unknown) {
      logError(err, { source: "ShareModal", action: "generateShareLink" });
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_TIMEOUT_MS);
    } catch (err) {
      logError(err, { source: "ShareModal", action: "copyLink" });
      setError("Failed to copy to clipboard");
    }
  };

  const handleRevokeLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await revokeShareLink(sceneId);
      setShareUrl(null);
    } catch (err: unknown) {
      logError(err, { source: "ShareModal", action: "revokeShareLink" });
      setError(getErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (isGenerating) return;
    setError(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-primary-900/30" : "bg-primary-100"}`}>
              <Link2 size={20} className={isDarkMode ? "text-primary-400" : "text-primary-600"} />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Share Scene
              </h2>
              <p className={`text-sm truncate max-w-[200px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                {sceneName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className={`p-1 rounded-lg transition-colors disabled:opacity-50 ${
              isDarkMode
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!shareUrl ? (
            // No share link yet
            <div className="text-center py-4">
              <div className={`p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                <Globe size={28} className="text-slate-400" />
              </div>
              <h3 className={`text-base font-medium mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                Share with anyone
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Generate a link to let anyone view this scene. They won't be able to edit.
              </p>
              <button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 size={16} />
                    Create Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            // Share link exists
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className={`text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                  Anyone with the link can view
                </span>
              </div>

              {/* Link input */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className={`flex-1 px-3 py-2 text-sm rounded-lg truncate ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-300"
                      : "bg-slate-100 border-slate-200 text-slate-700"
                  } border`}
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Revoke link */}
              <button
                onClick={handleRevokeLink}
                disabled={isGenerating}
                className={`text-sm hover:underline disabled:opacity-50 ${
                  isDarkMode
                    ? "text-red-400 hover:text-red-300"
                    : "text-red-600 hover:text-red-700"
                }`}
              >
                {isGenerating ? "Revoking..." : "Revoke share link"}
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={`mt-4 p-3 rounded-lg border ${
              isDarkMode
                ? "bg-red-900/20 border-red-800"
                : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-700"}`}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className={`px-6 py-4 border-t ${
          isDarkMode
            ? "bg-slate-700/50 border-slate-700"
            : "bg-slate-50 border-slate-200"
        }`}>
          <p className={`text-xs text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            Real-time collaboration coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
