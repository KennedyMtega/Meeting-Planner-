import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export const DropdownSearchSimple: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('Google Workspace');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const systems = [
    'Google Workspace',
    'Microsoft Teams',
    'Slack Tech Integration',
    'GitHub Repositories',
    'Atlassian Jira Project',
    'Notion Databases Docs',
    'Linear Issues board',
    'Figma Designs Prototype'
  ];

  const filtered = systems.filter(sys => sys.toLowerCase().includes(search.toLowerCase()));

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-search-simple-wrapper">
      <button
        id="dropdown-search-simple-trigger"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="inline-flex items-center justify-between w-56 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-search-simple-menu"
          className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Search bar inside */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1.5">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search platforms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold text-slate-705 bg-transparent border-none focus:outline-none placeholder-slate-400"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="text-center text-[11px] text-slate-400 py-4">No results found</div>
            ) : (
              filtered.map((sys) => (
                <button
                  key={sys}
                  onClick={() => {
                    setSelected(sys);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <span className="truncate">{sys}</span>
                  {selected === sys && <Check size={12} className="text-indigo-600 shrink-0 ml-1" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
