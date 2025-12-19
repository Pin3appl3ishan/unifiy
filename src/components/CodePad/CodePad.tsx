import React, { useEffect, useRef, useState, useCallback } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { useCanvasStore, type CodePad as CodePadType } from "../../stores/canvasStore";

interface CodePadProps {
  codePad: CodePadType;
  canvasId: string;
  isDarkMode?: boolean;
}

export default function CodePad({ codePad, canvasId, isDarkMode = false }: CodePadProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { updateCodePad, removeCodePad } = useCanvasStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      javascript(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newCode = update.state.doc.toString();
          updateCodePad(canvasId, codePad.id, { code: newCode });
        }
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: "14px",
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        },
      }),
    ];

    if (isDarkMode) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: codePad.code,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [isDarkMode]); // Re-create on theme change

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.codepad-editor')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - codePad.x,
      y: e.clientY - codePad.y,
    });
  }, [codePad.x, codePad.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateCodePad(canvasId, codePad.id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasId, codePad.id, updateCodePad]);

  // Handle resizing
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(250, e.clientX - codePad.x);
      const newHeight = Math.max(150, e.clientY - codePad.y);
      updateCodePad(canvasId, codePad.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, codePad.x, codePad.y, canvasId, codePad.id, updateCodePad]);

  const handleClose = () => {
    removeCodePad(canvasId, codePad.id);
  };

  const handleMinimize = () => {
    updateCodePad(canvasId, codePad.id, { isMinimized: !codePad.isMinimized });
  };

  if (codePad.isMinimized) {
    return (
      <div
        className="codepad minimized"
        style={{
          position: "absolute",
          left: codePad.x,
          top: codePad.y,
          width: 200,
          cursor: "move",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="codepad-header">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-amber-500 text-white px-2 py-0.5 rounded">
              JS
            </span>
            <span className="text-sm truncate">CodePad</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleMinimize}
              className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
            >
              □
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`codepad ${isDarkMode ? "dark" : ""}`}
      style={{
        position: "absolute",
        left: codePad.x,
        top: codePad.y,
        width: codePad.width,
        height: codePad.height,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Header */}
      <div 
        className="codepad-header cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-amber-500 text-white px-2 py-0.5 rounded">
            JS
          </span>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            CodePad
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-500"
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-500 hover:text-red-500"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Editor */}
      <div 
        ref={editorRef} 
        className="codepad-editor"
        style={{ height: `calc(100% - 40px)` }}
      />

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          background: "linear-gradient(135deg, transparent 50%, #94a3b8 50%)",
        }}
      />
    </div>
  );
}
