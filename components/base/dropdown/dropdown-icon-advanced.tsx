import React, { useState, useRef, useEffect } from 'react';
import { Sliders, Bell, Sparkles, LogOut, Check, Pin } from 'lucide-react';

export const DropdownIconAdvanced: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState(true);
  const [quickAI, setQuickAI] = useState(false);
  
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-icon-advanced-wrapper">
      <button
        id="dropdown-icon-advanced-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center"
        title="Settings Menu"
      >
        <Sliders size={16} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-icon-advanced-menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 rounded-t-xl mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workspace system</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">Control Preferences</span>
          </div>

          <div className="p-1 space-y-0.5">
            {/* Toggle 1 */}
            <button
              onClick={() => setActiveNotification(!activeNotification)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-400" />
                <span>Live Notifications</span>
              </div>
              <div className={`w-7 h-4 rounded-full transition-colors relative ${activeNotification ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${activeNotification ? 'translate-x-[14px]' : 'translate-x-[2px]'}`} />
              </div>
            </button>

            {/* Toggle 2 */}
            <button
              onClick={() => setQuickAI(!quickAI)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-500" />
                <span>Immediate AI response</span>
              </div>
              <div className={`w-7 h-4 rounded-full transition-colors relative ${quickAI ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${quickAI ? 'translate-x-[14px]' : 'translate-x-[2px]'}`} />
              </div>
            </button>

            <hr className="border-slate-100 my-1" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Pin size={14} className="mr-2 text-slate-400" />
              <span>Pin to System Desktop</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut size={14} className="mr-2 text-red-500" />
              <span>Log out session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
