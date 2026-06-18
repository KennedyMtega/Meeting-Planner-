import React, { useRef } from 'react';
import { Upload, FileText, X, Plus, Sparkles, Loader2, LayoutTemplate } from 'lucide-react';
import { UploadedFile, MEETING_TEMPLATES } from '../types';

interface SidebarProps {
  files: UploadedFile[];
  onFileUpload: (file: File) => void;
  onRemoveFile: (index: number) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  onFileUpload, 
  onRemoveFile, 
  onGenerate, 
  isProcessing,
  selectedTemplateId,
  onSelectTemplate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <FileText size={18} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Agenda</h1>
        </div>
        <p className="text-xs text-slate-500 ml-10">Meeting Breakdown Planner</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto flex flex-col">
        {/* Template Selector */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <LayoutTemplate size={14} />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Meeting Template</h2>
            </div>
            <div className="relative">
                <select 
                    value={selectedTemplateId}
                    onChange={(e) => onSelectTemplate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                    {MEETING_TEMPLATES.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            {/* Template Description */}
            <p className="mt-2 text-[11px] text-slate-400">
                {MEETING_TEMPLATES.find(t => t.id === selectedTemplateId)?.description}
                {selectedTemplateId !== 'auto' && <span className="block text-indigo-500 mt-1">Structure: {MEETING_TEMPLATES.find(t => t.id === selectedTemplateId)?.structure}</span>}
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
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={triggerUpload}
                disabled={isProcessing}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
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
               className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 disabled:bg-slate-300 disabled:shadow-none"
             >
               {isProcessing ? (
                 <>
                   <Loader2 size={18} className="animate-spin" />
                   {files.length > 0 ? `Analyzing ${files.length} Files...` : 'Generating Template...'}
                 </>
               ) : (
                 <>
                   <Sparkles size={18} className="text-yellow-300" />
                   {files.length > 0 ? 'Generate Agenda' : 'Create Template'}
                 </>
               )}
             </button>
             <p className="text-[10px] text-center text-slate-400 mt-2">
               {files.length > 0 
                  ? 'Synthesizes uploaded documents' 
                  : selectedTemplateId !== 'auto' 
                    ? 'Generates a blank structure'
                    : 'Upload files or select a template'}
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
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <p className="text-[10px] text-slate-400">Powered by Google Gemini 2.5 & 3 Pro</p>
      </div>
    </div>
  );
};