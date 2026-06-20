import React, { useState } from 'react';
import { 
  GitBranch, ExternalLink, Code2, Play, Check, 
  Terminal, ArrowRight, HelpCircle, ChevronDown, ChevronUp, BookOpen 
} from 'lucide-react';

// Exported variables matching the exact requested structure
export const title = "Dropdown components";
export const description = "Free and open-source React dropdown components built for modern applications and websites. These dropdowns are built using React Aria and styled with Tailwind CSS.";
export const links = {
  github: "https://github.com/untitleduico/react/tree/main/components/base/dropdown",
  rac: "https://react-spectrum.adobe.com/react-aria/Popover.html"
};

// Import all 14 requested dropdown items
import { DropdownButtonSimple } from "./base/dropdown/dropdown-button-simple";
import { DropdownButtonAdvanced } from "./base/dropdown/dropdown-button-advanced";
import { DropdownButtonLink } from "./base/dropdown/dropdown-button-link";
import { DropdownIconSimple } from "./base/dropdown/dropdown-icon-simple";
import { DropdownIconAdvanced } from "./base/dropdown/dropdown-icon-advanced";
import { DropdownSearchSimple } from "./base/dropdown/dropdown-search-simple";
import { DropdownSearchAdvanced } from "./base/dropdown/dropdown-search-advanced";
import { DropdownIntegration } from "./base/dropdown/dropdown-integration";
import { DropdownAccountButton } from "./base/dropdown/dropdown-account-button";
import { DropdownAvatar } from "./base/dropdown/dropdown-avatar";
import { DropdownAccountCardXS } from "./base/dropdown/dropdown-account-card-xs";
import { DropdownAccountCardSM } from "./base/dropdown/dropdown-account-card-sm";
import { DropdownAccountCardMD } from "./base/dropdown/dropdown-account-card-md";
import { DropdownAccountBreadcrumb } from "./base/dropdown/dropdown-account-breadcrumb";

// Mock component raw code snippets for the "Code" tab
const CODE_SNIPPETS: Record<string, string> = {
  buttonSimple: `import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const DropdownButtonSimple = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Option 1');

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-between w-48 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 ...">
        <span>{selected}</span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50">
          {['Option 1', 'Option 2', 'Option 3'].map(opt => (
            <button key={opt} onClick={() => setSelected(opt)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 ...">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};`,
  buttonAdvanced: `import React, { useState } from 'react';
import { Eye, Edit2, Share2, Settings, Trash2 } from 'lucide-react';

export const DropdownButtonAdvanced = () => {
  // Features shortcuts, sub-descriptions, and red alert destructive color highlights
  const items = [
    { label: 'View details', desc: 'See stats', icon: Eye },
    { label: 'Delete item', desc: 'Move to trash', icon: Trash2, isDestructive: true }
  ];
  return (
    <div className="relative inline-block text-left">
      {/* Advanced triggered popover structure */}
    </div>
  );
};`,
  buttonLink: `// Anchor action link lists with external pointers
export const DropdownButtonLink = () => {
  return (
    <a href="https://github.com" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs ...">
      <Github size={14} /> GitHub Link
    </a>
  );
};`,
  iconSimple: `// More action menu button
export const DropdownIconSimple = () => {
  return (
    <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 ...">
      <MoreVertical size={16} />
    </button>
  );
};`,
  searchSimple: `// Filter option system lists with live input searching
export const DropdownSearchSimple = () => {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      {/* filtered list */}
    </div>
  );
};`
};

export const DropdownsDoc: React.FC = () => {
  const [activeInstallTab, setActiveInstallTab] = useState<'cli' | 'manual'>('cli');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Tab states for each of the 14 components ('preview' | 'code')
  const [activeTabs, setActiveTabs] = useState<Record<string, 'preview' | 'code'>>({
    buttonSimple: 'preview',
    buttonAdvanced: 'preview',
    buttonLink: 'preview',
    iconSimple: 'preview',
    iconAdvanced: 'preview',
    searchSimple: 'preview',
    searchAdvanced: 'preview',
    integration: 'preview',
    accountButton: 'preview',
    avatar: 'preview',
    accountXS: 'preview',
    accountSM: 'preview',
    accountMD: 'preview',
    breadcrumb: 'preview',
  });

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleTab = (compKey: string, tab: 'preview' | 'code') => {
    setActiveTabs(prev => ({ ...prev, [compKey]: tab }));
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const faqs = [
    {
      question: "How do I position dropdowns relative to their trigger?",
      answer: "You can control the position of dropdowns using standard CSS positioning or the `placement` prop on responsive hooks. It accepts values like 'top', 'bottom', 'left', 'right', and their variations (e.g., 'top-start', 'bottom-right'). By default we leverage absolute positioning with standard safe containment offsets."
    },
    {
      question: "Can I customize the appearance of dropdown items?",
      answer: "Yes, you can customize dropdown items using Tailwind CSS classes. You can easily pass active styles, adjust typography elements, or add beautiful dynamic badges, keyboard shortcuts, icons, and separators."
    },
    {
      question: "How do I handle selection in dropdowns?",
      answer: "Use typical state handlers (such as `onSelectionChange` or state hooks) to store and coordinate item select callbacks. The dropdown uses standard keys to match selections securely."
    },
    {
      question: "How do I organize dropdown items into sections?",
      answer: "You can group items into logical category blocks separated by horizontal rules and section header tags (`Dropdown.SectionHeader`, `Dropdown.Separator`) to support clear informational design."
    },
    {
      question: "How do I make dropdowns accessible?",
      answer: "The dropdowns are designed with keyboard routing, appropriate ARIA roles, absolute screen-reader compatibility standards, and robust click-away listener hooks."
    },
    {
      question: "Can I disable individual dropdown items?",
      answer: "Yes! Simply assign disabled properties (`isDisabled={true}`) to lock responsive selectors and show a muted visual grey state to users."
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900" id="dropdowns-doc-container">
      {/* Header Panel */}
      <div className="relative bg-white border-b border-slate-200 px-6 py-10 sm:py-14 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/50 rounded-full text-xs font-semibold text-indigo-600">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            Vite & Tailwind UI Kit Ready
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">{description}</p>
          
          <div className="flex items-center gap-3.5 pt-2">
            <a 
              href={links.github} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <GitBranch size={13} /> Official Repo Source
            </a>
            <a 
              href={links.rac} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <BookOpen size={13} /> React Aria Popover Docs
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        
        {/* CLI Installation segment */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-1">System Installation</h2>
          <p className="text-xs text-slate-400">Install the dropdown engine instantly or integrate components manually into workspace files</p>
          
          <div className="flex border-b border-slate-100 mt-5 gap-4">
            <button
              onClick={() => setActiveInstallTab('cli')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
                activeInstallTab === 'cli' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              CLI Installer
            </button>
            <button
              onClick={() => setActiveInstallTab('manual')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-all relative cursor-pointer ${
                activeInstallTab === 'manual' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Manual Copy Setup
            </button>
          </div>

          <div className="mt-5">
            {activeInstallTab === 'cli' ? (
              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between text-slate-100 font-mono text-xs shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 select-none">$</span>
                  <span>npx untitledui@latest add dropdown</span>
                </div>
                <button
                  onClick={() => handleCopy('cli', 'npx untitledui@latest add dropdown')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white rounded font-bold cursor-pointer transition-colors"
                >
                  {copiedCode === 'cli' ? 'Copied ✅' : 'Copy'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0">1</span>
                  <div>
                    <p className="font-bold text-slate-800">Provision component assets</p>
                    <p className="text-slate-400 mt-0.5">Place dropdown file structures inside `/components/base/dropdown/` workspace directories.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0">2</span>
                  <div>
                    <p className="font-bold text-slate-800">Launch & integrate components</p>
                    <p className="text-slate-400 mt-0.5">Simply import the components into any site module or dashboard layout cleanly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Dropdown Examples Showcase */}
        <section className="space-y-8">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dropdown Examples</h2>
            <p className="text-xs text-slate-500 mt-1">Fourteen advanced configurations, designed for instant deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Button Simple */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">1. Button Simple</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Standard single menu list structure</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('buttonSimple', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonSimple === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                  <button onClick={() => toggleTab('buttonSimple', 'code')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonSimple === 'code' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Code</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                {activeTabs.buttonSimple === 'preview' ? (
                  <DropdownButtonSimple />
                ) : (
                  <pre className="text-[9px] font-mono text-slate-600 bg-slate-900 text-slate-100 p-3 rounded-lg w-full h-full overflow-auto relative">
                    <button onClick={() => handleCopy('code-1', CODE_SNIPPETS.buttonSimple)} className="absolute top-2 right-2 text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded hover:text-white uppercase">{copiedCode === 'code-1' ? 'Copied' : 'Copy'}</button>
                    {CODE_SNIPPETS.buttonSimple}
                  </pre>
                )}
              </div>
            </div>

            {/* 2. Button Advanced */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">2. Button Advanced</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">With shortcut, description & system icons</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('buttonAdvanced', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonAdvanced === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                  <button onClick={() => toggleTab('buttonAdvanced', 'code')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonAdvanced === 'code' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Code</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                {activeTabs.buttonAdvanced === 'preview' ? (
                  <DropdownButtonAdvanced />
                ) : (
                  <pre className="text-[9px] font-mono text-slate-600 bg-slate-900 text-slate-100 p-3 rounded-lg w-full h-full overflow-auto relative">
                    <button onClick={() => handleCopy('code-2', CODE_SNIPPETS.buttonAdvanced)} className="absolute top-2 right-2 text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded hover:text-white uppercase">{copiedCode === 'code-2' ? 'Copied' : 'Copy'}</button>
                    {CODE_SNIPPETS.buttonAdvanced}
                  </pre>
                )}
              </div>
            </div>

            {/* 3. Button Link */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">3. Button Link</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Anchor external URLs links lists</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('buttonLink', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonLink === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                  <button onClick={() => toggleTab('buttonLink', 'code')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.buttonLink === 'code' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Code</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                {activeTabs.buttonLink === 'preview' ? (
                  <DropdownButtonLink />
                ) : (
                  <pre className="text-[9px] font-mono text-slate-600 bg-slate-900 text-slate-100 p-3 rounded-lg w-full h-full overflow-auto relative">
                    <button onClick={() => handleCopy('code-3', CODE_SNIPPETS.buttonLink)} className="absolute top-2 right-2 text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded hover:text-white uppercase">{copiedCode === 'code-3' ? 'Copied' : 'Copy'}</button>
                    {CODE_SNIPPETS.buttonLink}
                  </pre>
                )}
              </div>
            </div>

            {/* 4. Icon Simple */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">4. Icon Simple</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">More icon action-trigger structure</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('iconSimple', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.iconSimple === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                  <button onClick={() => toggleTab('iconSimple', 'code')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.iconSimple === 'code' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Code</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                {activeTabs.iconSimple === 'preview' ? (
                  <DropdownIconSimple />
                ) : (
                  <pre className="text-[9px] font-mono text-slate-600 bg-slate-900 text-slate-100 p-3 rounded-lg w-full h-full overflow-auto relative">
                    <button onClick={() => handleCopy('code-4', CODE_SNIPPETS.iconSimple)} className="absolute top-2 right-2 text-[9px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded hover:text-white uppercase">{copiedCode === 'code-4' ? 'Copied' : 'Copy'}</button>
                    {CODE_SNIPPETS.iconSimple}
                  </pre>
                )}
              </div>
            </div>

            {/* 5. Icon Advanced */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">5. Icon Advanced</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sliders trigger preference switches</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('iconAdvanced', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.iconAdvanced === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownIconAdvanced />
              </div>
            </div>

            {/* 6. Search Simple */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">6. Search Simple</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Option filtering select matching</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('searchSimple', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.searchSimple === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownSearchSimple />
              </div>
            </div>

            {/* 7. Search Advanced */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">7. Search Advanced</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Category-grouped query indexing</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('searchAdvanced', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.searchAdvanced === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownSearchAdvanced />
              </div>
            </div>

            {/* 8. Integrations */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">8. Integrations</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Connected status toggling grid</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('integration', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.integration === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownIntegration />
              </div>
            </div>

            {/* 9. Account Button */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">9. Account Button</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Elegantly displays personal profile info</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('accountButton', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.accountButton === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAccountButton />
              </div>
            </div>

            {/* 10. Avatar */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">10. Avatar</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Compact circular profile icon pop</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('avatar', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.avatar === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAvatar />
              </div>
            </div>

            {/* 11. Account Card XS */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">11. Account Card (XS)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pocket space switches layout</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('accountXS', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.accountXS === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAccountCardXS />
              </div>
            </div>

            {/* 12. Account Card SM */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">12. Account Card (SM)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Staff-count visual team indicators</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('accountSM', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.accountSM === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAccountCardSM />
              </div>
            </div>

            {/* 13. Account Card MD */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">13. Account Card (MD)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Details full-scale workspace quotas</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('accountMD', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.accountMD === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAccountCardMD />
              </div>
            </div>

            {/* 14. Account Breadcrumb */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[320px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide leading-tight">14. Account Breadcrumb</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Folder filetree routing path switchers</p>
                </div>
                <div className="flex bg-slate-200/60 rounded-lg p-0.5">
                  <button onClick={() => toggleTab('breadcrumb', 'preview')} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${activeTabs.breadcrumb === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Preview</button>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center p-6 bg-slate-50/20 overflow-auto">
                <DropdownAccountBreadcrumb />
              </div>
            </div>

          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <HelpCircle size={18} className="text-indigo-600" />
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Important details surrounding React Aria popover alignment and customize metrics</p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 pb-3.5 last:border-b-0 last:pb-0">
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex items-center justify-between w-full text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {openFaq === idx ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg leading-relaxed animate-in fade-in duration-100">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
