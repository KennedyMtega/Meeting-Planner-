import React, { useState, useRef, useEffect } from 'react';
import { User, Activity, Settings, HelpCircle, LogOut } from 'lucide-react';

export const DropdownAvatar: React.FC = () => {
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-avatar-wrapper">
      <button
        id="dropdown-avatar-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-slate-900 border border-slate-200 hover:border-slate-300 flex items-center justify-center text-white font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md shrink-0"
        title="Account menu"
      >
        MK
      </button>

      {isOpen && (
        <div 
          id="dropdown-avatar-menu"
          className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Currently signed in</span>
            <span className="text-xs font-bold text-slate-800 block mt-0.5">mtegakennedy@gmail.com</span>
          </div>

          <div className="p-1 space-y-0.5">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <User size={13} className="mr-2 text-slate-400" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Activity size={13} className="mr-2 text-slate-400" />
              <span>Activity Log</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Settings size={13} className="mr-2 text-slate-400" />
              <span>System Settings</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <HelpCircle size={13} className="mr-2 text-slate-400" />
              <span>Contact Tech Support</span>
            </button>

            <hr className="border-slate-100 my-1" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut size={13} className="mr-2 text-red-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
