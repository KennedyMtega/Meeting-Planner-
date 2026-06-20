import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Settings, Shield, Plus } from 'lucide-react';

export const DropdownAccountCardMD: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const spaces = [
    { id: 'env_staging', title: 'Antigravity Workspace', type: 'Enterprise Space', status: 'Staging Server', members: 142, quota: '84% Full' },
    { id: 'env_prod', title: 'Production Main Cluster', type: 'Direct Portal', status: 'Online Active', members: 1548, quota: '21% Full' }
  ];

  const [activeSpace, setActiveSpace] = useState(spaces[0]);

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-account-card-md-wrapper">
      <button
        id="dropdown-account-card-md-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-3 p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs hover:bg-slate-50 transition-all text-left cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
          ⚙️
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800 leading-none">{activeSpace.title}</p>
          <span className="text-[10px] text-indigo-600 font-bold block mt-1 leading-none">{activeSpace.type}</span>
        </div>
        <ChevronDown size={14} className="text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div 
          id="dropdown-account-card-md-menu"
          className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Switch Workspaces
          </div>
          
          {spaces.map((sp) => (
            <button
              key={sp.id}
              onClick={() => {
                setActiveSpace(sp);
                setIsOpen(false);
              }}
              className="flex items-start justify-between w-full p-3 hover:bg-indigo-50/40 transition-colors text-left cursor-pointer border-b border-slate-50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{sp.title}</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[9px] font-semibold text-slate-400 w-max">
                  <span>Members: {sp.members}</span>
                  <span className="text-indigo-600">{sp.status}</span>
                  <span>Usage: {sp.quota}</span>
                </div>
              </div>
              {activeSpace.id === sp.id && <Check size={13} className="text-indigo-600 shrink-0 ml-1 mt-0.5" />}
            </button>
          ))}

          <div className="p-1 border-t border-slate-50 bg-slate-50/50 mt-1 flex items-center gap-1">
            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-800 font-bold hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={11} /> Create Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
