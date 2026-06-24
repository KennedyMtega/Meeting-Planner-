import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileText, X, Plus, Sparkles, Loader2, LayoutTemplate, ChevronDown, Check } from 'lucide-react';
import { UploadedFile, MEETING_TEMPLATES } from '../types';

interface SidebarProps {
  files: UploadedFile[];
  onFileUpload: (file: File) => void;
  onRemoveFile: (index: number) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  onFileUpload, 
  onRemoveFile, 
  onGenerate, 
  isProcessing,
  selectedTemplateId,
  onSelectTemplate,
  onCollapse
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach(file => onFileUpload(file));
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const canGenerate = files.length > 0 || selectedTemplateId !== 'auto';
  const selectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0];

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 sm:p-6 flex-grow overflow-y-auto flex flex-col">
        {/* Template Selector */}
        <div className="mb-5 sm:mb-8" ref={dropdownRef}>
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <LayoutTemplate size={14} />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Meeting Template</h2>
            </div>
            <div className="relative">
                <button
                  type="button"
                  id="template-dropdown-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-left cursor-pointer"
                >
                  <span className="truncate">{selectedTemplate.name}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${dropdownOpen ? 'rotate-180 text-slate-600' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div 
                    id="template-dropdown-menu"
                    className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    {MEETING_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onSelectTemplate(t.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-3 min-h-[44px] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer ${t.id === selectedTemplateId ? 'text-indigo-600 bg-indigo-50/30' : ''}`}
                      >
                        <span className="truncate">{t.name}</span>
                        {t.id === selectedTemplateId && <Check size={14} className="text-indigo-600 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            {/* Template Description */}
            <p className="mt-2 text-[11px] text-slate-400">
                {selectedTemplate.description}
                {selectedTemplateId !== 'auto' && <span className="block text-indigo-500 mt-1">Structure: {selectedTemplate.structure}</span>}
            </p>
        </div>


        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source Documents</h2>
             {files.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{files.length}</span>
             )}
          </div>
          
          {files.length === 0 ? (
            <div 
              onClick={triggerUpload}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all group min-h-[120px]"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Upload size={16} className="text-slate-500 group-hover:text-slate-700" />
              </div>
              <p className="text-xs font-medium text-slate-700 mb-0.5">Click to upload</p>
              <p className="text-[10px] text-slate-400">Optional for Templates</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3 group hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-left-4">
                  <div className="min-w-[32px] h-8 bg-white border border-slate-100 rounded flex items-center justify-center text-blue-600 shadow-sm">
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveFile(idx); }}
                    className="text-slate-400 hover:text-red-500 hover:bg-slate-100 hover:border-slate-200 border border-transparent rounded-lg transition-colors w-11 h-11 flex items-center justify-center shrink-0 -my-1.5 -mr-1.5 cursor-pointer"
                    title="Remove document"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={triggerUpload}
                disabled={isProcessing}
                className="w-full min-h-[44px] py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} />
                Add another file
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 sticky bottom-0 bg-white pt-2 pb-4 border-t border-slate-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
             <button
               onClick={onGenerate}
               disabled={isProcessing || !canGenerate}
               className="w-full min-h-[44px] sm:min-h-[48px] md:min-h-[52px] py-2.5 sm:py-3 px-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200/45 flex items-center justify-center gap-2 font-bold text-xs sm:text-xs md:text-sm uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100 disabled:bg-slate-300 disabled:shadow-none cursor-pointer select-none"
             >
               {isProcessing ? (
                 <>
                   <Loader2 size={16} className="animate-spin shrink-0" />
                   <span className="truncate">{files.length > 0 ? `Analyzing ${files.length} documents...` : 'Building structure...'}</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={16} className="text-yellow-300 shrink-0" />
                   <span className="truncate">{files.length > 0 ? 'Generate Agenda' : 'Create Template'}</span>
                 </>
               )}
             </button>
             <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
               {files.length > 0 
                  ? 'Synthesizes uploaded documents with Gemini' 
                  : selectedTemplateId !== 'auto' 
                    ? 'Generates a fresh starter meeting blueprint'
                    : 'Upload files or choose a template layout'}
             </p>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple
        accept=".pdf,.txt,.md,.json,.csv,.jpg,.png,.jpeg"
      />
      
      <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 text-center select-none shrink-0">
        <p className="text-[10px] sm:text-[11px] text-slate-405 text-slate-400 font-medium tracking-tight">
          Built by <span className="font-bold text-slate-600">Digitronics</span> • Designed by <span className="font-bold text-slate-600">Kennedy Mtega</span>
        </p>
      </div>
    </div>
  );
};