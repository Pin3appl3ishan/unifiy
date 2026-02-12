import React, { useEffect, useRef, useState, useCallback } from "react";
import { EditorState, Compartment, Extension } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { java } from "@codemirror/lang-java";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, history, historyKeymap, insertTab, indentLess } from "@codemirror/commands";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CodePad as CodePadType } from "../../stores/localSceneStore";
import { CODEPAD_LANGUAGES, CodePadLanguage } from "../../constants";
import { Copy, Check, ChevronDown } from "lucide-react";

function getLanguageExtension(lang: string): Extension {
  switch (lang) {
    case "python": return python();
    case "html": return html();
    case "css": return css();
    case "json": return json();
    case "java": return java();
    case "markdown": return markdown();
    default: return javascript();
  }
}

interface CodePadProps {
  codePad: CodePadType;
  isDarkMode?: boolean;
  isReadOnly?: boolean;
  scrollX: number;
  scrollY: number;
  zoom: number;
  onUpdate: (updates: Partial<CodePadType>) => void;
  onRemove: () => void;
}

export default function CodePad({ codePad, isDarkMode = false, isReadOnly = false, scrollX, scrollY, zoom, onUpdate, onRemove }: CodePadProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartment = useRef(new Compartment());

  // Keep refs in sync for use inside event handlers (avoid stale closures)
  const scrollXRef = useRef(scrollX);
  const scrollYRef = useRef(scrollY);
  const zoomRef = useRef(zoom);
  useEffect(() => {
    scrollXRef.current = scrollX;
    scrollYRef.current = scrollY;
    zoomRef.current = zoom;
  }, [scrollX, scrollY, zoom]);

  // Convert canvas coords → screen coords
  const screenX = (codePad.x + scrollX) * zoom;
  const screenY = (codePad.y + scrollY) * zoom;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  const langConfig = CODEPAD_LANGUAGES[codePad.language as CodePadLanguage] ?? CODEPAD_LANGUAGES.javascript;

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([{ key: "Tab", run: insertTab, shift: indentLess }, ...defaultKeymap, ...historyKeymap]),
      langCompartment.current.of(getLanguageExtension(codePad.language)),
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

    // Add update listener only if not read-only
    if (!isReadOnly) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            onUpdate({ code: newCode });
          }
        })
      );
    }

    // Make editor read-only if needed
    if (isReadOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

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
  }, [isDarkMode, isReadOnly]); // Re-create on theme change or read-only change

  // Hot-swap language extension via Compartment
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: langCompartment.current.reconfigure(getLanguageExtension(codePad.language)),
    });
  }, [codePad.language]);

  // Copy code to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codePad.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback ignored — clipboard API may fail in some contexts
    }
  }, [codePad.code]);

  // Handle dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.codepad-editor')) return;

    const sx = (codePad.x + scrollXRef.current) * zoomRef.current;
    const sy = (codePad.y + scrollYRef.current) * zoomRef.current;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - sx,
      y: e.clientY - sy,
    });
  }, [codePad.x, codePad.y]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Convert screen position back to canvas coordinates
      const newScreenX = e.clientX - dragOffset.x;
      const newScreenY = e.clientY - dragOffset.y;
      onUpdate({
        x: newScreenX / zoomRef.current - scrollXRef.current,
        y: newScreenY / zoomRef.current - scrollYRef.current,
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, onUpdate]);

  // Handle resizing
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use screen position of top-left corner for delta
      const sx = (codePad.x + scrollXRef.current) * zoomRef.current;
      const sy = (codePad.y + scrollYRef.current) * zoomRef.current;
      const newWidth = Math.max(250, e.clientX - sx);
      const newHeight = Math.max(150, e.clientY - sy);
      onUpdate({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, codePad.x, codePad.y, onUpdate]);

  const handleClose = () => {
    onRemove();
  };

  // Theme-aware style helpers
  const btnHoverBg = isDarkMode ? "hover:bg-slate-600" : "hover:bg-slate-200";
  const btnTextColor = isDarkMode ? "text-slate-400" : "text-slate-500";
  const readOnlyBadgeBg = isDarkMode ? "bg-slate-600 text-slate-400" : "bg-slate-200 text-slate-500";
  const titleColor = isDarkMode ? "text-slate-300" : "text-slate-600";
  const actionContainerBg = isDarkMode ? "bg-slate-700" : "bg-slate-100";
  const dropdownTriggerBg = isDarkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300";
  const dropdownMenuBg = isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200";
  const dropdownItemText = isDarkMode ? "text-slate-300" : "text-slate-700";
  const dropdownItemHover = isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100";
  const dropdownItemSelected = isDarkMode ? "bg-slate-700" : "bg-slate-100";
  const chevronColor = isDarkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className={`codepad ${isDarkMode ? "dark" : ""}`}
      style={{
        position: "absolute",
        left: screenX,
        top: screenY,
        width: codePad.width,
        height: codePad.height,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Header */}
      <div
        className={`codepad-header ${isReadOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={isReadOnly ? undefined : handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${titleColor}`}>
            CodePad
          </span>
          {isReadOnly && (
            <span className={`text-xs ${readOnlyBadgeBg} px-2 py-0.5 rounded`}>
              Read-only
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1.5 ${actionContainerBg} rounded-lg px-2 py-1`}>
          {/* Language dropdown */}
          {isReadOnly ? (
            <span className={`text-xs font-mono ${langConfig.badgeBg} text-white px-2 py-0.5 rounded`}>
              {langConfig.badge}
            </span>
          ) : (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`flex items-center gap-1 text-xs font-bold font-mono whitespace-nowrap ${dropdownTriggerBg} px-2 py-0.5 rounded cursor-pointer transition-colors`}
                >
                  <span className={langConfig.textColor}>{langConfig.label}</span>
                  <ChevronDown size={12} className={`${chevronColor} shrink-0`} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="top"
                  align="start"
                  sideOffset={4}
                  className={`${dropdownMenuBg} border rounded-lg shadow-lg overflow-hidden z-50 py-1`}
                >
                  {Object.entries(CODEPAD_LANGUAGES).map(([key, { label }]) => (
                    <DropdownMenu.Item
                      key={key}
                      onSelect={() => onUpdate({ language: key })}
                      className={`px-3 py-1.5 text-xs ${dropdownItemText} ${dropdownItemHover} cursor-pointer whitespace-nowrap outline-none transition-colors ${
                        codePad.language === key ? dropdownItemSelected : ""
                      }`}
                    >
                      {label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}

          {/* Divider */}
          {!isReadOnly && (
            <span className="text-slate-400 text-xs select-none">|</span>
          )}

          <button
            onClick={handleCopy}
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-6 h-6 flex items-center justify-center ${btnHoverBg} rounded ${btnTextColor}`}
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
          {!isReadOnly && (
            <button
              onClick={handleClose}
              onMouseDown={(e) => e.stopPropagation()}
              className={`w-6 h-6 flex items-center justify-center rounded ${btnTextColor} ${
                isDarkMode ? "hover:bg-red-900/30" : "hover:bg-red-100"
              } hover:text-red-500`}
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="codepad-editor"
        style={{ height: `calc(100% - 40px)` }}
      />

      {/* Resize Handle - hidden in read-only mode */}
      {!isReadOnly && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          style={{
            background: "linear-gradient(135deg, transparent 50%, #94a3b8 50%)",
          }}
        />
      )}
    </div>
  );
}
