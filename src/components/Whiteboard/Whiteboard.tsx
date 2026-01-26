import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import {
  Users,
  Sparkles,
  Github,
  MessageCircle,
  LogIn,
  LogOut,
  User,
  Code,
  Lock,
} from "lucide-react";
import { useLocalSceneStore, CodePad as CodePadType } from "../../stores/localSceneStore";
import { useSceneStore, Scene } from "../../stores/sceneStore";
import { useAuthStore } from "../../stores/authStore";
import CodePad from "../CodePad/CodePad";
import ShareModal from "../ShareModal/ShareModal";

// Tier-based CodePad limits
const MAX_CODEPADS_FREE = 3;

interface WhiteboardProps {
  sceneId?: string; // For logged-in users with remote scenes
  isAnonymous?: boolean; // True for anonymous users using localStorage
  isSharedView?: boolean; // True when viewing via share link
  sharedScene?: Scene; // Pre-loaded scene for shared view (avoids auth fetch)
  viewModeEnabled?: boolean; // True to disable editing (view-only mode)
}

export default function Whiteboard({
  sceneId,
  isAnonymous = false,
  isSharedView = false,
  sharedScene,
  viewModeEnabled = false,
}: WhiteboardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const excalidrawAPIRef = useRef<any>(null);
  const navigate = useNavigate();

  // Local scene store (anonymous users)
  const localScene = useLocalSceneStore((s) => s.scene);
  const localSaveExcalidrawData = useLocalSceneStore((s) => s.saveExcalidrawData);
  const localAddCodePad = useLocalSceneStore((s) => s.addCodePad);
  const localUpdateCodePad = useLocalSceneStore((s) => s.updateCodePad);
  const localRemoveCodePad = useLocalSceneStore((s) => s.removeCodePad);
  const localUpdateScene = useLocalSceneStore((s) => s.updateScene);

  // Remote scene store (logged-in users)
  const remoteScene = useSceneStore((s) => s.currentScene);
  const remoteSaveSceneData = useSceneStore((s) => s.saveSceneData);
  const remoteUpdateScene = useSceneStore((s) => s.updateScene);

  // Auth
  const { user, profile, signOut } = useAuthStore();

  // Determine which scene to use
  // Priority: sharedScene (for shared view) > localScene (anonymous) > remoteScene (authenticated)
  const scene = sharedScene || (isAnonymous ? localScene : remoteScene);
  const sceneName = scene?.name || "Untitled";
  const sceneExcalidrawData = scene?.excalidrawData;
  const sceneCodePads = scene?.codePads || [];
  const sceneUpdatedAt = isAnonymous
    ? (localScene?.updatedAt || Date.now())
    : (remoteScene?.updatedAt ? new Date(remoteScene.updatedAt).getTime() : Date.now());

  // Tier-based limit check
  const canAddCodePad = !profile || profile.tier === "premium" || sceneCodePads.length < MAX_CODEPADS_FREE;

  // Save handler based on mode
  const handleSaveExcalidrawData = useCallback(
    (data: any) => {
      if (isAnonymous) {
        localSaveExcalidrawData(data);
      } else if (sceneId) {
        remoteSaveSceneData(sceneId, { excalidrawData: data });
      }
    },
    [isAnonymous, sceneId, localSaveExcalidrawData, remoteSaveSceneData]
  );

  // CodePad handlers - read from store state directly to avoid stale closures
  const handleAddCodePad = useCallback(() => {
    if (!canAddCodePad) return;

    const centerX = window.innerWidth / 2 - 200;
    const centerY = window.innerHeight / 2 - 150;

    if (isAnonymous) {
      localAddCodePad(centerX, centerY);
    } else if (sceneId) {
      // Read current CodePads from store to avoid stale closure
      const currentCodePads = useSceneStore.getState().currentScene?.codePads || [];
      const newCodePad: CodePadType = {
        id: crypto.randomUUID(),
        x: centerX,
        y: centerY,
        width: 400,
        height: 300,
        code: "// Start coding here...\n",
        language: "javascript",
        isMinimized: false,
      };
      remoteSaveSceneData(sceneId, {
        codePads: [...currentCodePads, newCodePad],
      });
    }
  }, [isAnonymous, sceneId, canAddCodePad, localAddCodePad, remoteSaveSceneData]);

  const handleUpdateCodePad = useCallback(
    (codePadId: string, updates: Partial<CodePadType>) => {
      // Clamp resize values at state level to prevent invalid sizes
      const clampedUpdates = { ...updates };
      if (clampedUpdates.width !== undefined) {
        clampedUpdates.width = Math.max(250, Math.min(clampedUpdates.width, window.innerWidth - 40));
      }
      if (clampedUpdates.height !== undefined) {
        clampedUpdates.height = Math.max(150, Math.min(clampedUpdates.height, window.innerHeight - 40));
      }

      if (isAnonymous) {
        localUpdateCodePad(codePadId, clampedUpdates);
      } else if (sceneId) {
        // Read current CodePads from store to avoid stale closure
        const currentCodePads = useSceneStore.getState().currentScene?.codePads || [];
        const updatedCodePads = currentCodePads.map((cp) =>
          cp.id === codePadId ? { ...cp, ...clampedUpdates } : cp
        );
        remoteSaveSceneData(sceneId, { codePads: updatedCodePads });
      }
    },
    [isAnonymous, sceneId, localUpdateCodePad, remoteSaveSceneData]
  );

  const handleRemoveCodePad = useCallback(
    (codePadId: string) => {
      if (isAnonymous) {
        localRemoveCodePad(codePadId);
      } else if (sceneId) {
        // Read current CodePads from store to avoid stale closure
        const currentCodePads = useSceneStore.getState().currentScene?.codePads || [];
        const updatedCodePads = currentCodePads.filter((cp) => cp.id !== codePadId);
        remoteSaveSceneData(sceneId, { codePads: updatedCodePads });
      }
    },
    [isAnonymous, sceneId, localRemoveCodePad, remoteSaveSceneData]
  );

  // Name update handler
  const handleUpdateName = useCallback(
    (name: string) => {
      if (isAnonymous) {
        localUpdateScene({ name });
      } else if (sceneId) {
        remoteUpdateScene(sceneId, { name });
      }
    },
    [isAnonymous, sceneId, localUpdateScene, remoteUpdateScene]
  );

  // Auto-save with debounce
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback(
    (elements: readonly any[], appState: any) => {
      // Track dark mode from Excalidraw
      if (appState.theme) {
        setIsDarkMode(appState.theme === "dark");
      }

      // Debounce saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSaveExcalidrawData({
          elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            currentItemFontFamily: appState.currentItemFontFamily,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
          },
        });
      }, 500);
    },
    [handleSaveExcalidrawData]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcut for adding CodePad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        handleAddCodePad();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAddCodePad]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  // Name editing handlers
  const handleNameDoubleClick = () => {
    setEditedName(sceneName);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== sceneName) {
      handleUpdateName(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Show name for logged-in users only
  const showSceneName = !isAnonymous && user;

  // Memoize CodePad handlers to prevent inline function re-creation on every render
  // This fixes the re-centering bug caused by unstable callback references
  const codePadHandlers = useMemo(() => {
    const handlers: Record<string, { onUpdate: (updates: Partial<CodePadType>) => void; onRemove: () => void }> = {};
    for (const cp of sceneCodePads) {
      handlers[cp.id] = {
        onUpdate: (updates) => handleUpdateCodePad(cp.id, updates),
        onRemove: () => handleRemoveCodePad(cp.id),
      };
    }
    return handlers;
  }, [sceneCodePads, handleUpdateCodePad, handleRemoveCodePad]);

  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Scene not found</p>
      </div>
    );
  }

  const iconSize = 16;

  return (
    <div className="relative w-full h-full">
      {/* Scene Name - positioned next to the sidebar menu */}
      {showSceneName && (
        <div className="absolute top-[13px] left-[52px] z-50 flex items-center">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className={`text-sm font-bold px-2 py-0.5 rounded border outline-none ${
                isDarkMode
                  ? "bg-slate-800 text-slate-200 border-slate-600 focus:border-primary-500"
                  : "bg-white text-slate-700 border-slate-300 focus:border-primary-500"
              }`}
              style={{ fontFamily: "'SF Pro Display', 'SF Pro', system-ui, sans-serif", minWidth: "120px" }}
            />
          ) : (
            <span
              onDoubleClick={handleNameDoubleClick}
              className={`text-sm font-bold px-3.5 py-3.5 rounded cursor-pointer transition-colors ${
                isDarkMode
                  ? "text-slate-300 hover:bg-slate-700/50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              style={{ fontFamily: "'SF Pro Display', 'SF Pro', system-ui, sans-serif" }}
              title="Double-click to rename"
            >
              {sceneName}
            </span>
          )}
        </div>
      )}

      {/* Last Saved Status */}
      <div className="absolute bottom-7 right-24 z-50 pointer-events-none">
        <span className="text-xs text-slate-400">
          Last saved: {new Date(sceneUpdatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Excalidraw Canvas */}
      <div className="excalidraw-wrapper">
        <Excalidraw
          initialData={sceneExcalidrawData || undefined}
          onChange={viewModeEnabled ? undefined : handleChange}
          theme={isDarkMode ? "dark" : "light"}
          viewModeEnabled={viewModeEnabled}
          excalidrawAPI={(api) => { excalidrawAPIRef.current = api; }}
          UIOptions={{
            canvasActions: {
              loadScene: !viewModeEnabled,
              export: { saveFileToDisk: true },
              toggleTheme: true,
            },
          }}
          renderTopRightUI={() => {
            return (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {/* Share button - only for logged-in users with a scene, not in shared view */}
                {user && sceneId && !isSharedView && (
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="flex items-center justify-center rounded-md font-medium transition-colors"
                    style={{
                      height: 36,
                      padding: "0 16px",
                      backgroundColor: "#6366f1",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: 500,
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#4f46e5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#6366f1";
                    }}
                    title="Share scene"
                  >
                    Share
                  </button>
                )}

              </div>
            );
          }}
        >
          <MainMenu>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.Export />
{/* Share button - only for logged-in users with a scene */}
            {user && sceneId && (
              <MainMenu.Item
                onSelect={() => setShareModalOpen(true)}
                icon={<Users size={iconSize} />}
              >
                Share scene...
              </MainMenu.Item>
            )}
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />

            <MainMenu.Separator />

            <MainMenu.Item
              onSelect={() => {}}
              icon={<Sparkles size={iconSize} />}
            >
              U&I Plus
            </MainMenu.Item>
            <MainMenu.ItemLink
              href="https://github.com"
              icon={<Github size={iconSize} />}
            >
              GitHub
            </MainMenu.ItemLink>
            <MainMenu.ItemLink
              href="https://discord.com"
              icon={<MessageCircle size={iconSize} />}
            >
              Discord
            </MainMenu.ItemLink>
            {user ? (
              <>
                <MainMenu.Item onSelect={() => {}} icon={<User size={iconSize} />}>
                  {user.email}
                </MainMenu.Item>
                <MainMenu.Item
                  onSelect={handleSignOut}
                  icon={<LogOut size={iconSize} />}
                >
                  Sign out
                </MainMenu.Item>
              </>
            ) : (
              <MainMenu.Item
                onSelect={handleSignIn}
                icon={<LogIn size={iconSize} />}
              >
                Sign in
              </MainMenu.Item>
            )}

            <MainMenu.Separator />

            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu>
          <WelcomeScreen>
            <WelcomeScreen.Hints.MenuHint />
            <WelcomeScreen.Hints.ToolbarHint />
            <WelcomeScreen.Center>
              <WelcomeScreen.Center.Logo>
                <div className="text-2xl font-bold text-primary-500">U&I</div>
              </WelcomeScreen.Center.Logo>
              <WelcomeScreen.Center.Heading>
                Ideate. Code. Create.
              </WelcomeScreen.Center.Heading>
              <WelcomeScreen.Center.Menu>
                <WelcomeScreen.Center.MenuItemLoadScene />
                <WelcomeScreen.Center.MenuItemHelp />
              </WelcomeScreen.Center.Menu>
            </WelcomeScreen.Center>
          </WelcomeScreen>
        </Excalidraw>
      </div>

      {/* CodePads Layer - using memoized handlers to prevent re-centering */}
      {sceneCodePads.map((codePad) => (
        <CodePad
          key={codePad.id}
          codePad={codePad}
          isDarkMode={isDarkMode}
          isReadOnly={isSharedView || viewModeEnabled}
          onUpdate={codePadHandlers[codePad.id]?.onUpdate}
          onRemove={codePadHandlers[codePad.id]?.onRemove}
        />
      ))}

      {/* CodePad Button - positioned to RIGHT of top toolbar (hidden in shared view) */}
      {!isSharedView && (
        <div
          className="absolute"
          style={{
            top: "17px",
            left: "54.5%",
            transform: "translateX(calc(50% + 200px))",
            zIndex: 100,
          }}
        >
        <div
          className="flex items-center justify-center rounded-lg shadow-md"
          style={{
            backgroundColor: isDarkMode ? "#232329" : "#ffffff",
            border: isDarkMode ? "1px solid #3d3d4a" : "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={handleAddCodePad}
            disabled={!canAddCodePad}
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors"
            style={{
              color: isDarkMode ? "#a0a0a8" : "#4b5563",
              cursor: canAddCodePad ? "pointer" : "not-allowed",
              opacity: canAddCodePad ? 1 : 0.5,
            }}
            onMouseEnter={(e) => {
              if (canAddCodePad) {
                e.currentTarget.style.backgroundColor = isDarkMode ? "#3d3d4a" : "#f1f5f9";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            title={canAddCodePad ? "CodePad (Ctrl+Shift+C)" : `Upgrade for more CodePads (${MAX_CODEPADS_FREE} max)`}
          >
            {canAddCodePad ? (
              <Code size={20} strokeWidth={1.5} />
            ) : (
              <Lock size={18} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
      )}

      {/* Share Modal */}
      {sceneId && (
        <ShareModal
          sceneId={sceneId}
          sceneName={sceneName}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
