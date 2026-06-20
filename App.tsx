import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TimelineView } from './components/TimelineView';
import { ChatWidget } from './components/ChatWidget';
import { TemplatesExplorer } from './components/TemplatesExplorer';
import { AgendaHistory } from './components/AgendaHistory';
import { AgendaAnalytics } from './components/AgendaAnalytics';
import { DropdownsDoc } from './components/DropdownsDoc';
import { generateAgenda, ChatSession } from './services/geminiService';
import { MeetingAgenda, UploadedFile } from './types';
import { 
  Sliders, Calendar, Sparkles, PanelLeftOpen, ChevronRight,
  CalendarPlus, Clock, History, BarChart3, LayoutTemplate,
  CheckCircle, CheckSquare, Square, Menu, X, ArrowRight, Play, Check, Code2 
} from 'lucide-react';

interface SavedAgendaItem {
  id: string;
  agenda: MeetingAgenda;
  timestamp: Date;
  templateId: string;
  files: UploadedFile[];
}

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [savedAgendas, setSavedAgendas] = useState<SavedAgendaItem[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'create' | 'active' | 'history' | 'templates' | 'analytics'>('create');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('auto');
  const [activeTab, setActiveTab] = useState<'setup' | 'agenda' | 'dropdowns'>('setup');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Completed items per agenda: record map [agendaId_itemId] -> boolean
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Active derived states
  const activeSavedItem = savedAgendas.find(item => item.id === selectedAgendaId) || null;
  const agenda = activeSavedItem ? activeSavedItem.agenda : null;

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      const newFile: UploadedFile = {
        name: file.name,
        type: file.type || 'application/octet-stream',
        data: base64Data,
        size: file.size
      };
      setFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAgenda = async () => {
    if (files.length === 0 && selectedTemplateId === 'auto') return;
    
    setIsProcessing(true);
    setActiveTab('agenda');
    setSidebarTab('active');
    
    try {
      // Generate Agenda
      const generatedAgenda = await generateAgenda(files, selectedTemplateId);
      const newId = 'session_' + Date.now();
      const newItem: SavedAgendaItem = {
        id: newId,
        agenda: generatedAgenda,
        timestamp: new Date(),
        templateId: selectedTemplateId,
        files: [...files]
      };
      
      setSavedAgendas(prev => [newItem, ...prev]);
      setSelectedAgendaId(newId);

      // Initialize Chat Session
      const session = new ChatSession(files, generatedAgenda);
      setChatSession(session);
      
    } catch (error) {
      console.error("Error generating agenda:", error);
      alert("Failed to generate agenda. Please check inputs and try again.");
      setActiveTab('setup');
      setSidebarTab('create');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleUpdateAgenda = (updatedAgenda: MeetingAgenda) => {
    if (selectedAgendaId) {
      setSavedAgendas(prev => prev.map(item => {
        if (item.id === selectedAgendaId) {
          return { ...item, agenda: updatedAgenda };
        }
        return item;
      }));
    }
  };

  const handleSelectAgenda = (id: string) => {
    const selected = savedAgendas.find(item => item.id === id);
    if (selected) {
      setSelectedAgendaId(id);
      setActiveTab('agenda');
      setSidebarTab('active');
      
      // Update session context
      const session = new ChatSession(selected.files, selected.agenda);
      setChatSession(session);
    }
  };

  const handleDeleteAgenda = (id: string) => {
    const updated = savedAgendas.filter(item => item.id !== id);
    setSavedAgendas(updated);
    if (selectedAgendaId === id) {
      if (updated.length > 0) {
        setSelectedAgendaId(updated[0].id);
        const session = new ChatSession(updated[0].files, updated[0].agenda);
        setChatSession(session);
      } else {
        setSelectedAgendaId(null);
        setChatSession(null);
        setSidebarTab('create');
        setActiveTab('setup');
      }
    }
  };

  const handleLoadTemplateInPlanner = (id: string) => {
    setSelectedTemplateId(id);
    setSidebarTab('create');
    setActiveTab('setup');
  };

  const toggleItemComplete = (itemId: string) => {
    if (!selectedAgendaId) return;
    const key = `${selectedAgendaId}_${itemId}`;
    setCompletedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper to scroll to specific agenda item
  const scrollToItem = (itemId: string) => {
    // If not in agenda view tab, switch first
    setActiveTab('agenda');
    setTimeout(() => {
      const element = document.getElementById(`agenda-item-${itemId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
        }, 1500);
      }
    }, 100);
  };

  // Helper to get timing clock
  const getAgendaItemClock = (items: any[], index: number, startClock: string) => {
    let current = startClock || "09:00";
    for (let i = 0; i < index; i++) {
      const [h, m] = current.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      date.setMinutes(date.getMinutes() + items[i].durationMinutes);
      current = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    return current;
  };

  // Calculations for Completed metrics
  const activeItems = agenda ? agenda.items : [];
  const completedCount = activeItems.filter(item => !!completedItems[`${selectedAgendaId}_${item.id}`]).length;
  const progressPct = activeItems.length > 0 ? Math.round((completedCount / activeItems.length) * 100) : 0;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-50 overflow-hidden relative font-sans">
      {/* High-density Unified Tab Header */}
      <header className="w-full bg-slate-900 text-white flex flex-col shrink-0 border-b border-slate-800 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
              <Calendar size={13} />
            </div>
            <span className="text-sm font-bold tracking-tight">Agenda Planner</span>
          </div>
          <div className="flex gap-1 p-0.5 bg-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('setup')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                activeTab === 'setup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders size={11} />
              Setup
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all relative ${
                activeTab === 'agenda'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={11} className={isProcessing ? "animate-spin text-indigo-300" : "text-amber-300"} />
              Agenda
              {agenda && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('dropdowns')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                activeTab === 'dropdowns'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 size={11} />
              Dropdowns
            </button>
          </div>
        </div>
      </header>

      {/* Floating Expand Button when Sidebar is Collapsed on Desktop */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden md:flex fixed left-4 top-4 z-40 p-2.5 bg-slate-900 text-white hover:bg-indigo-600 rounded-xl shadow-lg hover:shadow-indigo-100 border border-slate-800 hover:scale-105 transition-all cursor-pointer items-center justify-center"
          title="Expand Sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* Interactive Desktop Changeable Side Nav & Primary Sidebar wrapper */}
      <div 
        className={`h-full shrink-0 transition-all duration-300 ease-in-out flex border-r border-slate-200 bg-white ${
          isSidebarCollapsed 
            ? 'md:w-0 md:opacity-0 md:pointer-events-none md:overflow-hidden md:border-r-0' 
            : 'md:w-[400px]'
        } ${
          activeTab === 'setup' ? 'flex w-full' : 'hidden md:flex'
        } ${activeTab === 'dropdowns' ? 'hidden' : ''}`}
      >
        {/* Changeable Sidebar Component viewport with Unified Top Level Navigation */}
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
          
          {/* Master Unified Workspace Header and Navigation */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 shrink-0 select-none">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
                  <Calendar size={15} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xs font-bold text-slate-800 tracking-tight leading-none uppercase truncate">Meeting Co-Pilot</h1>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 leading-none">Workspace System</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {agenda ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    No Session
                  </span>
                )}

                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="hidden md:flex p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100/50 transition-colors cursor-pointer"
                  title="Collapse Workspace"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Premium Integrated Segmented Icon Selector Tab Bar */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/60 rounded-xl">
              <button
                onClick={() => setSidebarTab('create')}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all gap-0.5 cursor-pointer ${
                  sidebarTab === 'create' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-950 hover:bg-slate-105-0 font-medium'
                }`}
                title="Planner Setup"
              >
                <CalendarPlus size={14} />
                <span className="text-[9px] tracking-tight">Plan</span>
              </button>

              <button
                onClick={() => {
                  if (agenda) {
                    setSidebarTab('active');
                  } else {
                    alert('Please generate or select an active agenda first!');
                  }
                }}
                disabled={!agenda}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all gap-0.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  sidebarTab === 'active' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-950 font-medium'
                }`}
                title="Active Agenda Checklist"
              >
                <Clock size={14} />
                <span className="text-[9px] tracking-tight flex items-center gap-0.5">
                  Outline
                  {agenda && (
                    <span className="text-[8px] bg-indigo-50 text-indigo-600 px-0.5 rounded-full">
                      {completedCount}
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setSidebarTab('history')}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all gap-0.5 cursor-pointer ${
                  sidebarTab === 'history' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-950 font-medium'
                }`}
                title="Saved Sessions"
              >
                <History size={14} />
                <span className="text-[9px] tracking-tight flex items-center gap-0.5">
                  History
                  {savedAgendas.length > 0 && (
                    <span className="text-[8px] bg-slate-700 text-white px-1.5 rounded-full font-bold">
                      {savedAgendas.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                onClick={() => setSidebarTab('templates')}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all gap-0.5 cursor-pointer ${
                  sidebarTab === 'templates' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-950 font-medium'
                }`}
                title="Preset Library"
              >
                <LayoutTemplate size={14} />
                <span className="text-[9px] tracking-tight">Library</span>
              </button>

              <button
                onClick={() => {
                  if (agenda) {
                    setSidebarTab('analytics');
                  } else {
                    alert('Generate or select an active agenda to view Insights!');
                  }
                }}
                disabled={!agenda}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-all gap-0.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  sidebarTab === 'analytics' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-950 font-medium'
                }`}
                title="Agenda Insights"
              >
                <BarChart3 size={14} />
                <span className="text-[9px] tracking-tight">Insights</span>
              </button>
            </div>
          </div>

          {/* Sub-components container */}
          <div className="flex-grow flex flex-col min-h-0 bg-slate-50 overflow-hidden">
            {sidebarTab === 'create' && (
              <Sidebar 
                files={files} 
                onFileUpload={handleFileUpload} 
                onRemoveFile={handleRemoveFile}
                onGenerate={handleGenerateAgenda}
                isProcessing={isProcessing}
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={setSelectedTemplateId}
                onCollapse={setIsSidebarCollapsed}
              />
            )}

            {sidebarTab === 'active' && (
              <div className="flex-1 flex flex-col h-full bg-slate-50 min-w-0">
                {agenda ? (
                  <div className="flex-1 overflow-y-auto flex flex-col justify-between">
                    {/* Progress Header widget */}
                    <div className="bg-white border-b border-slate-200/60 p-4 space-y-2 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Completion Metric</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {completedCount} / {activeItems.length} Resolved
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${progressPct}%` }} 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Checklist topics container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                      {activeItems.map((item, idx) => {
                        const completedKey = `${selectedAgendaId}_${item.id}`;
                        const isCompleted = !!completedItems[completedKey];
                        const checkClock = getAgendaItemClock(activeItems, idx, agenda.startTime);
                        
                        return (
                          <div
                            key={item.id}
                            className={`bg-white border rounded-xl p-3 flex gap-3 cursor-pointer select-none transition-all duration-200 group relative ${
                              isCompleted 
                                ? 'border-slate-200 bg-slate-50/50 opacity-70' 
                                : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {/* Checked box container */}
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItemComplete(item.id);
                              }}
                              className="pt-0.5 shrink-0"
                            >
                              <button className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer">
                                {isCompleted ? (
                                  <CheckSquare size={17} className="text-indigo-600" />
                                ) : (
                                  <Square size={17} />
                                )}
                              </button>
                            </div>

                            {/* Info area - Click to Scroll */}
                            <div 
                              onClick={() => scrollToItem(item.id)}
                              className="flex-1 min-w-0"
                            >
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="text-[10px] font-bold text-indigo-600 font-mono bg-indigo-50/70 px-1.5 py-0.5 rounded">
                                  {checkClock}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  {item.durationMinutes} min
                                </span>
                              </div>
                              <h3 className={`font-bold text-xs text-slate-800 mt-1 truncate ${isCompleted ? 'line-through text-slate-400' : 'group-hover:text-indigo-600'}`}>
                                {item.topic}
                              </h3>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Running Mode Footer */}
                    <div className="p-4 border-t border-slate-100 bg-white text-center shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold mb-1 flex items-center justify-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500 animate-pulse" /> Running Live Mode Active
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-200 rounded-xl m-4">
                    <Clock size={24} className="text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500">No active meeting agenda loaded.</p>
                    <button
                      onClick={() => { setSidebarTab('create'); setActiveTab('setup'); }}
                      className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Go to Planner
                    </button>
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'history' && (
              <AgendaHistory
                agendas={savedAgendas}
                activeAgendaId={selectedAgendaId}
                onSelectAgenda={handleSelectAgenda}
                onDeleteAgenda={handleDeleteAgenda}
                onSwitchToCreate={() => { setSidebarTab('create'); setActiveTab('setup'); }}
              />
            )}

            {sidebarTab === 'templates' && (
              <TemplatesExplorer
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={setSelectedTemplateId}
                onLoadTemplate={handleLoadTemplateInPlanner}
              />
            )}

            {sidebarTab === 'analytics' && (
              <AgendaAnalytics
                agenda={agenda}
                onSwitchToCreate={() => { setSidebarTab('create'); setActiveTab('setup'); }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Agenda Timeline & Chat */}
      <main className={`flex-1 h-full min-w-0 relative overflow-hidden transition-all duration-300 ${activeTab === 'setup' ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
        {activeTab === 'dropdowns' ? (
          <DropdownsDoc />
        ) : (
          <>
            <TimelineView 
              agenda={agenda} 
              isLoading={isProcessing} 
              onUpdateAgenda={handleUpdateAgenda}
            />
            <ChatWidget chatSession={chatSession} hasFile={!!agenda} />
          </>
        )}
      </main>
    </div>
  );
}
