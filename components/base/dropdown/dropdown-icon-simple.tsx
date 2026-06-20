import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Copy, Share, Bookmark, Flag } from 'lucide-react';

export const DropdownIconSimple: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-icon-simple-wrapper">
      <button
        id="dropdown-icon-simple-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all cursor-pointer flex items-center justify-center"
        title="More options"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-icon-simple-menu"
          className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {[
            { label: 'Copy link', icon: Copy },
            { label: 'Share task', icon: Share },
            { label: 'Save Draft', icon: Bookmark },
            { label: 'Report issue', icon: Flag }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <Icon size={14} className="mr-2 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
