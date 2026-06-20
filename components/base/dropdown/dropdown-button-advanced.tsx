import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Settings, Trash2, Edit2, Share2, Eye } from 'lucide-react';

export const DropdownButtonAdvanced: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('View details');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = [
    { id: 'view', label: 'View details', description: 'See full stats and analytics', icon: Eye, shortcut: '⌘V' },
    { id: 'edit', label: 'Edit content', description: 'Modify title or details', icon: Edit2, shortcut: '⌘E' },
    { id: 'share', label: 'Share link', description: 'Invite coworkers or guests', icon: Share2, shortcut: '⌘S' },
    { id: 'settings', label: 'Preferences', description: 'Access advanced settings', icon: Settings, shortcut: '⌘P' },
    { id: 'delete', label: 'Delete item', description: 'Move to system trashbin', icon: Trash2, shortcut: '⌘D', isDestructive: true },
  ];

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-btn-advanced-wrapper">
      <button
        id="dropdown-btn-advanced-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-56 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span>{selected}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-btn-advanced-menu"
          className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-1.5 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</span>
          </div>
          <div className="p-1 space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelected(item.label);
                    setIsOpen(false);
                  }}
                  className={`flex items-start w-full px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    item.isDestructive 
                      ? 'hover:bg-red-50 text-red-600 hover:text-red-700' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon size={16} className={`mr-2.5 mt-0.5 ${item.isDestructive ? 'text-red-500' : 'text-slate-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{item.label}</span>
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1 py-0.2 rounded font-mono ml-2">
                        {item.shortcut}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${item.isDestructive ? 'text-red-400' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
