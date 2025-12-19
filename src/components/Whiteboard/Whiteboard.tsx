import React, { useEffect, useState, useCallback, useRef } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useCanvasStore } from "../../stores/canvasStore";
import CodePad from "../CodePad/CodePad";

interface WhiteboardProps {
  canvasId: string;
}

export default function Whiteboard({ canvasId }: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    canvases, 
    saveExcalidrawData, 
    addCodePad,
    getCurrentCanvas 
  } = useCanvasStore();
  
  const canvas = canvases[canvasId];

  // Auto-save with debounce
  const handleChange = useCallback(
    (elements: any, appState: any) => {
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
      }, 500); // Save 500ms after last change
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
    // Add CodePad in the center of the viewport
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

  if (!canvas) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">Canvas not found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Excalidraw Canvas */}
      <div className="excalidraw-wrapper">
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
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
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.SaveToActiveFile />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.Separator />
            <MainMenu.Item onSelect={handleAddCodePad} icon="📝">
              Add CodePad
            </MainMenu.Item>
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
