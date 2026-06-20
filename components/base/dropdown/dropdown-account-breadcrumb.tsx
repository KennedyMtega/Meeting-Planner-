import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, FolderOpen } from 'lucide-react';

export const DropdownAccountBreadcrumb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subdirectories = [
    'Q2 Board Strategy Meeting',
    'Sprint Planning Sync',
    'Design Postmortem',
    'Tech Scoping Draft'
  ];

  const [activeDir, setActiveDir] = useState(subdirectories[0]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none" id="dropdown-account-breadcrumb-wrapper">
      <span>Workspace</span>
      <ChevronRight size={12} />
      <span>Agendas</span>
      <ChevronRight size={12} />
      
      {/* Dynamic Dropdown Path Item */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          id="dropdown-account-breadcrumb-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
        >
          <FolderOpen size={12} className="text-slate-500" />
          <span>{activeDir}</span>
        </button>

        {isOpen && (
          <div 
            id="dropdown-account-breadcrumb-menu"
            className="absolute left-0 mt-1 w-52 bg-white border border-slate-100 rounded-lg shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-120"
          >
            {subdirectories.map((dir) => (
              <button
                key={dir}
                onClick={() => {
                  setActiveDir(dir);
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <span>{dir}</span>
                {activeDir === dir && <Check size={11} className="text-indigo-600 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
