import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ExternalLink, Github, BookOpen } from 'lucide-react';

export const DropdownButtonLink: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const links = [
    { label: 'Official GitHub', href: 'https://github.com/untitleduico/react', icon: Github },
    { label: 'Adobe React Aria', href: 'https://react-spectrum.adobe.com/react-aria/Popover.html', icon: BookOpen },
    { label: 'Documentation Home', href: 'https://ai.studio/build', icon: ExternalLink }
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
    <div className="relative inline-block text-left" ref={dropdownRef} id="dropdown-btn-link-wrapper">
      <button
        id="dropdown-btn-link-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-52 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
      >
        <span>External Links</span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="dropdown-btn-link-menu"
          className="absolute left-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3.5 py-1 border-b border-slate-100 mb-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resources</span>
          </div>
          <div className="p-1 space-y-0.5">
            {links.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Icon size={14} className="mr-2 text-slate-400 group-hover:text-indigo-600" />
                  <span className="flex-1">{link.label}</span>
                  <ExternalLink size={10} className="text-slate-300" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
