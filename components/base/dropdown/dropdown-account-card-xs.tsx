import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Briefcase, UserCheck } from 'lucide-react';

export const DropdownAccountCardXS: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const spaces = [
    { id: 'mk_pers', name: 'Personal Desk', type: 'Owner', desc: 'Indie projects' },
    { id: 'mk_corp', name: 'Advising Lab', type: 'Advisor', desc: 'Active team syncs' }
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-account-card-xs-wrapper">
      <button
        id="dropdown-account-card-xs-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 p-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-all text-left cursor-pointer"
      >
        <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
          {activeSpace.name[0]}
        </div>
        <span className="text-[11px] font-bold text-slate-800">{activeSpace.name}</span>
        <ChevronDown size={11} className="text-slate-400" />
      </button>

      {isOpen && (
        <div 
          id="dropdown-account-card-xs-menu"
          className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-lg shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {spaces.map((sp) => (
            <button
              key={sp.id}
              onClick={() => {
                setActiveSpace(sp);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-800 leading-tight">{sp.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-bold leading-none">{sp.type}</span>
                  <span className="text-[8px] text-slate-400 truncate leading-none">{sp.desc}</span>
                </div>
              </div>
              {activeSpace.id === sp.id && <Check size={11} className="text-indigo-600 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
