import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, CreditCard, Shield, LogOut, ArrowUpRight } from 'lucide-react';

export const DropdownAccountButton: React.FC = () => {
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-account-button-wrapper">
      <button
        id="dropdown-account-button-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        {/* Avatar circle */}
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          MT
        </div>
        <div className="text-left hidden xs:block">
          <p className="text-xs font-bold text-slate-800 leading-none">Mtega Kennedy</p>
          <span className="text-[9px] text-indigo-600 font-bold tracking-wider leading-none block mt-0.5">PRO ACC</span>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-account-button-menu"
          className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Account Card details inside */}
          <div className="p-3.5 bg-slate-50/50 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 leading-none">Mtega Kennedy</h4>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-1">mtegakennedy@gmail.com</p>
          </div>

          <div className="p-1 space-y-0.5">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <User size={14} className="mr-2 text-slate-400" />
              <span>Personal details</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <CreditCard size={14} className="mr-2 text-slate-400" />
              <span className="flex-grow">Billing plans</span>
              <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded font-bold">ACTIVE</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <Shield size={14} className="mr-2 text-slate-400" />
              <span>Password security</span>
            </button>

            <hr className="border-slate-100 my-1" />

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <span>Refer & earn $50</span>
              <ArrowUpRight size={12} />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut size={14} className="mr-2 text-red-500" />
              <span>Disconnect accounts</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
