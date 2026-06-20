import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, FileText, Layout, Users } from 'lucide-react';

export const DropdownSearchAdvanced: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('All Systems');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    { type: 'Teams', items: ['Design Squad', 'Growth Marketing', 'Leadership Board'], icon: Users },
    { type: 'Layouts', items: ['Board Pitch Brief', 'Sprint Backlog v1', 'Post-Mortem Log'], icon: Layout },
    { type: 'Files', items: ['Financials_Q2.xlsx', 'ProductSpecs_V3.pdf', 'AudioBriefing_Draft.mp3'], icon: FileText }
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-search-advanced-wrapper">
      <button
        id="dropdown-search-advanced-trigger"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className="inline-flex items-center justify-between w-60 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span className="truncate">{selected}</span>
        <ChevronDown size={15} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-search-advanced-menu"
          className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Advanced Search bar */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-grow">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Type to filter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none placeholder-slate-400"
                autoFocus
              />
            </div>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto p-1 space-y-2">
            {categories.map((cat, catIdx) => {
              const matchedItems = cat.items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
              if (matchedItems.length === 0) return null;
              
              const Icon = cat.icon;
              return (
                <div key={catIdx}>
                  <div className="px-3 py-1 flex items-center gap-1.5 text-slate-400">
                    <Icon size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">{cat.type}</span>
                  </div>
                  <div className="space-y-0.5 mt-1">
                    {matchedItems.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          setSelected(item);
                          setIsOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left cursor-pointer"
                      >
                        <span className="truncate">{item}</span>
                        {selected === item && <Check size={12} className="text-indigo-600 shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {search && !categories.some(cat => cat.items.some(i => i.toLowerCase().includes(search.toLowerCase()))) && (
              <div className="text-center text-[11px] text-slate-400 py-6">
                No items match "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
