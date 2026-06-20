import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const DropdownButtonSimple: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Option 1');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-btn-simple-wrapper">
      <button
        id="dropdown-btn-simple-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-48 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span>{selected}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-btn-simple-menu"
          className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setSelected(opt);
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
            >
              <span>{opt}</span>
              {selected === opt && <Check size={14} className="text-indigo-600 font-bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
