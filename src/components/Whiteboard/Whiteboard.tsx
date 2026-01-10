import { useEffect, useState, useCallback, useRef } from "react";
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
} from "lucide-react";
import { useCanvasStore } from "../../stores/canvasStore";
import { useAuthStore } from "../../stores/authStore";
import CodePad from "../CodePad/CodePad";

interface WhiteboardProps {
  canvasId: string;
}

export default function Whiteboard({ canvasId }: WhiteboardProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const { canvases, saveExcalidrawData, addCodePad, updateCanvasName } = useCanvasStore();
  const { user, signOut } = useAuthStore();

  const canvas = canvases[canvasId];

  // Auto-save with debounce
  const handleChange = useCallback(
    (elements: readonly any[], appState: any) => {
      // Track dark mode from Excalidraw
      if (appState.theme) {
        setIsDarkMode(appState.theme === "dark");
      }

      // Debounce saves to prevent too many writes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveExcalidrawData(canvasId, {
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
    [canvasId, saveExcalidrawData]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Handle adding a CodePad
  const handleAddCodePad = useCallback(() => {
    const centerX = window.innerWidth / 2 - 200;
    const centerY = window.innerHeight / 2 - 150;
    addCodePad(canvasId, centerX, centerY);
  }, [canvasId, addCodePad]);

  // Keyboard shortcut for adding CodePad (Ctrl/Cmd + Shift + C)
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

  // Canvas name editing handlers
  const handleNameDoubleClick = () => {
    setEditedName(canvas?.name || "");
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editedName.trim() && editedName !== canvas?.name) {
      updateCanvasName(canvasId, editedName.trim());
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

  // Check if user is free (not logged in) with only one canvas
  const canvasCount = Object.keys(canvases).length;
  const isFreeUserWithOneCanvas = !user && canvasCount <= 1;

  if (!canvas) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Canvas not found</p>
      </div>
    );
  }

  const iconSize = 16;

  return (
    <div className="relative w-full h-full">
      {/* Canvas Name - positioned next to the sidebar menu */}
      {!isFreeUserWithOneCanvas && (
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
              className={`text-sm font-bold px-3 py-2 rounded cursor-pointer transition-colors ${
                isDarkMode
                  ? "text-slate-300 hover:bg-slate-700/50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              style={{ fontFamily: "'SF Pro Display', 'SF Pro', system-ui, sans-serif" }}
              title="Double-click to rename"
            >
              {canvas.name}
            </span>
          )}
        </div>
      )}

      {/* Last Saved Status - bottom right, left of FAB */}
      <div className="absolute bottom-7 right-24 z-50 pointer-events-none">
        <span className="text-xs text-slate-400">
          Last saved: {new Date(canvas.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Excalidraw Canvas */}
      <div className="excalidraw-wrapper">
        <Excalidraw
          initialData={canvas.excalidrawData || undefined}
          onChange={handleChange}
          theme={isDarkMode ? "dark" : "light"}
          UIOptions={{
            canvasActions: {
              loadScene: true,
              export: { saveFileToDisk: true },
              toggleTheme: true,
            },
          }}
        >
          <MainMenu>
            {/* Section 1: File operations */}
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.Export />
            <MainMenu.Item
              onSelect={() => {
                /* TODO: Live collaboration */
              }}
              icon={<Users size={iconSize} />}
            >
              Live collaboration...
            </MainMenu.Item>
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />

            <MainMenu.Separator />

            {/* Section 2: U&I links */}
            <MainMenu.Item
              onSelect={() => {
                /* TODO: U&I Plus */
              }}
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

            {/* Section 3: Theme */}
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

      {/* CodePads Layer */}
      {canvas.codePads.map((codePad) => (
        <CodePad
          key={codePad.id}
          codePad={codePad}
          canvasId={canvasId}
          isDarkMode={isDarkMode}
        />
      ))}

      {/* Floating Action Button for CodePad */}
      <button
        onClick={handleAddCodePad}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105 z-50"
        title="Add CodePad (Ctrl+Shift+C)"
      >
        {"</>"}
      </button>
    </div>
  );
}
