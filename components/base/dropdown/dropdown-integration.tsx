import React, { useState, useRef, useEffect } from 'react';
import { ToggleLeft, Github, Calendar, FileText, Check, ChevronDown } from 'lucide-react';

export const DropdownIntegration: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [apps, setApps] = useState([
    { id: 'google', name: 'Google Workspace', connected: true, icon: Calendar, desc: 'Sync agenda documents' },
    { id: 'github', name: 'GitHub Sync', connected: false, icon: Github, desc: 'Track issues & codebases' },
    { id: 'notion', name: 'Notion Database', connected: true, icon: FileText, desc: 'Document wiki storage' }
  ]);

  const toggleApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, connected: !a.connected } : a));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalConnected = apps.filter(a => a.connected).length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-integration-wrapper">
      <button
        id="dropdown-integration-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-56 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <ToggleLeft className="text-emerald-500" size={16} />
          Connected ({totalConnected}/{apps.length})
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-integration-menu"
          className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Integrations</span>
            <span className="text-xs font-semibold text-slate-700 block mt-0.5">Toggle external portals</span>
          </div>

          <div className="p-1.5 space-y-1">
            {apps.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.id}
                  onClick={() => toggleApp(app.id)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">{app.name}</h4>
                      <p className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{app.desc}</p>
                    </div>
                  </div>

                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                    app.connected ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-300 text-transparent'
                  }`}>
                    {app.connected && <Check size={8} className="stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
