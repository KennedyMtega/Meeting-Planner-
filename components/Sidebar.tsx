import React, { useRef } from 'react';
import { Upload, FileText, CheckCircle, X, Plus } from 'lucide-react';
import { UploadedFile } from '../types';

interface SidebarProps {
  files: UploadedFile[];
  onFileUpload: (file: File) => void;
  onRemoveFile: (index: number) => void;
  isProcessing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ files, onFileUpload, onRemoveFile, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

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

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Source Documents</h2>
          
          {files.length === 0 ? (
            <div 
              onClick={triggerUpload}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                <Upload size={18} className="text-slate-500 group-hover:text-slate-700" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Click to upload</p>
              <p className="text-xs text-slate-400">PDF, TXT, MD, Images</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="relative bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3 group hover:shadow-md transition-all duration-200">
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
                  {isProcessing && idx === files.length - 1 && (
                     <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                  )}
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
        
        <div className="mt-8">
           <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
             <h3 className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</h3>
             <p className="text-xs text-blue-700 leading-relaxed">
               Upload project specs, email threads, or quarterly reports to auto-generate a focused agenda.
             </p>
           </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.txt,.md,.json,.csv,.jpg,.png,.jpeg"
      />
      
      <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
        <p className="text-[10px] text-slate-400">Powered by Google Gemini 2.5 & 3 Pro</p>
      </div>
    </div>
  );
};