import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Briefcase } from "lucide-react";
import { Workspace } from "../../stores/workspaceStore";

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSwitch: (workspaceId: string) => void;
  onCreateNew: () => void;
  canCreateNew: boolean;
}

export default function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
  onSwitch,
  onCreateNew,
  canCreateNew,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSwitch = (workspaceId: string) => {
    onSwitch(workspaceId);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  if (!currentWorkspace) {
    return (
      <span className="text-slate-400 text-sm">No workspace</span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <span className="text-slate-600 font-medium">{currentWorkspace.name}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {/* Workspace list */}
          <div className="max-h-64 overflow-y-auto">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => handleSwitch(workspace.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
              >
                <Briefcase size={16} className="text-slate-400 flex-shrink-0" />
                <span className="flex-1 text-sm text-slate-700 truncate">
                  {workspace.name}
                </span>
                {workspace.id === currentWorkspace.id && (
                  <Check size={16} className="text-primary-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 my-1" />

          {/* Create new workspace button */}
          <button
            onClick={handleCreateNew}
            disabled={!canCreateNew}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <Plus size={16} className="text-primary-500 flex-shrink-0" />
            <span className="flex-1 text-sm text-primary-600 font-medium">
              New Workspace
            </span>
            {!canCreateNew && (
              <span className="text-xs text-slate-400">Upgrade</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
