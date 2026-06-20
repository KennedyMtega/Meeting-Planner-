import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ShieldAlert, Award } from 'lucide-react';

export const DropdownAccountCardSM: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const orgs = [
    { id: 'dev_team', title: 'Advising Lab Devs', role: 'Technical Lead', logo: '🧬', count: '14 staff' },
    { id: 'design_team', title: 'Aesthetic Designers', role: 'Art Director', logo: '🎨', count: '8 staff' },
    { id: 'product_head', title: 'Global Product HQ', role: 'VP of Product', logo: '🌐', count: '5 staff' }
  ];

  const [activeOrg, setActiveOrg] = useState(orgs[0]);

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-account-card-sm-wrapper">
      <button
        id="dropdown-account-card-sm-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 p-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs hover:bg-slate-50 transition-all text-left cursor-pointer"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xs">
          {activeOrg.logo}
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-slate-800 leading-none">{activeOrg.title}</p>
          <span className="text-[9px] text-slate-400 font-bold block mt-0.5 leading-none">{activeOrg.role}</span>
        </div>
        <ChevronDown size={12} className="text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div 
          id="dropdown-account-card-sm-menu"
          className="absolute left-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                setActiveOrg(org);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer border-b border-slate-50 last:border-0"
            >
              <div className="flex gap-2 min-w-0">
                <span className="text-sm shrink-0 mt-0.5">{org.logo}</span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 leading-tight truncate">{org.title}</p>
                  <p className="text-[9px] text-slate-400 font-bold truncate mt-0.5">{org.role} • {org.count}</p>
                </div>
              </div>
              {activeOrg.id === org.id && <Check size={12} className="text-emerald-600 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
