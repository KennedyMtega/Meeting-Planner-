import React, { useState, useEffect, useRef } from 'react';
import { MeetingAgenda, AgendaItem, Stakeholder, UploadedFile, MEETING_TEMPLATES, SavedAgendaItem } from '../types';
import { 
  Clock, Users, Calendar, User, Plus, Trash2, Edit2, Check, X, Mail, 
  Share2, Download, Link as LinkIcon, FileText as FileTextIcon, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  List, Target, Search, Sparkles, Upload, Loader2, LayoutTemplate, UserPlus, FilePlus, ListPlus, CheckSquare, Square, History
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { suggestNextItem } from '../services/geminiService';

interface TimelineViewProps {
  agenda: MeetingAgenda | null;
  isLoading: boolean;
  onUpdateAgenda: (agenda: MeetingAgenda) => void;
  onCreateBlankAgenda?: () => void;
  files?: UploadedFile[];
  onFileUpload?: (file: File) => void;
  onRemoveFile?: (index: number) => void;
  onGenerateAgenda?: (customInstructions: string) => void;
  selectedTemplateId?: string;
  onSelectTemplate?: (id: string) => void;
  onCreateManualAgenda?: (manualData: {
    title: string;
    startTime: string;
    summary: string;
    stakeholders: Array<{ name: string; role: string; contact: string }>;
    items: Array<{ topic: string; durationMinutes: number; description: string }>;
  }) => void;
  savedAgendas?: SavedAgendaItem[];
  activeAgendaId?: string | null;
  onSelectAgenda?: (id: string) => void;
  onDeleteAgenda?: (id: string) => void;
  onClearAllHistory?: () => void;
}

// Helper to calculate time
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// --- Stakeholder Card Component ---
interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onUpdate: (s: Stakeholder) => void;
  onDelete: (id: string) => void;
}

const StakeholderCard: React.FC<StakeholderCardProps> = ({ 
  stakeholder, 
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(stakeholder);

  const handleSave = () => {
    onUpdate(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <>
        {/* Mobile Backdrop Overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-50 sm:hidden animate-fade-in"
          onClick={() => setIsEditing(false)}
        />
        
        {/* Bottom Sheet Drawer on Mobile, Inline Card on Desktop */}
        <div className="fixed sm:static inset-x-0 bottom-0 z-50 sm:z-0 bg-white sm:bg-white rounded-t-3xl sm:rounded-xl border-t sm:border border-slate-200 sm:border-slate-200 p-5 sm:p-4 pb-8 sm:pb-4 space-y-3 max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible shadow-[0_-10px_40px_rgba(0,0,0,0.12)] sm:shadow-none animate-slide-up sm:animate-none">
          
          {/* Mobile Header with Handle */}
          <div className="sm:hidden flex flex-col items-center mb-1">
            <div className="w-12 h-1 bg-slate-200 rounded-full mb-4" />
            <div className="flex justify-between items-center w-full">
              <h3 className="font-extrabold text-slate-900 text-lg">Edit Stakeholder</h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          
          {/* Desktop Title Header (Hidden on Mobile) */}
          <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Edit Stakeholder
          </div>

          <input 
            value={data.name} 
            onChange={e => setData({...data, name: e.target.value})} 
            className="text-sm font-semibold border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            placeholder="Name"
          />
          <input 
            value={data.role} 
            onChange={e => setData({...data, role: e.target.value})} 
            className="text-xs text-slate-600 border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            placeholder="Role"
          />
          <input 
            value={data.contact} 
            onChange={e => setData({...data, contact: e.target.value})} 
            className="text-xs text-slate-600 border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            placeholder="Contact Info"
          />
          <div className="flex justify-end gap-2.5 pt-2">
             <button 
               onClick={() => setIsEditing(false)} 
               className="px-4 py-2 sm:py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] flex items-center justify-center transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave} 
               className="px-4 py-2 sm:py-1.5 text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl min-h-[44px] flex items-center justify-center transition-colors"
             >
               Save
             </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 sm:p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex items-center gap-2">
           <div className="font-bold text-sm text-slate-800 truncate">{stakeholder.name}</div>
        </div>
        <div className="text-xs text-slate-500 truncate">{stakeholder.role}</div>
        {stakeholder.contact && (
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
             <Mail size={10} className="shrink-0" /> <span className="truncate">{stakeholder.contact}</span>
          </div>
        )}
      </div>
      <div className="flex gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(stakeholder.id)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- Agenda Item Row Component ---
interface AgendaItemRowProps {
  item: AgendaItem;
  startTime: string;
  stakeholders: Stakeholder[];
  onUpdate: (item: AgendaItem) => void;
  onRemove: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const AgendaItemRow = React.memo<AgendaItemRowProps>(({ 
  item, 
  startTime, 
  stakeholders, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  isFirst, 
  isLast 
}) => {
  const [isEditing, setIsEditing] = useState(() => {
    return item.topic === "New Topic" && item.description === "Description of the new topic";
  });
  const [editData, setEditData] = useState(item);

  useEffect(() => {
    setEditData(item);
  }, [item]);

  const toggleSpeaker = (stakeholderId: string) => {
    const currentSpeakers = editData.speakerIds || [];
    if (currentSpeakers.includes(stakeholderId)) {
      setEditData({ ...editData, speakerIds: currentSpeakers.filter(id => id !== stakeholderId) });
    } else {
      setEditData({ ...editData, speakerIds: [...currentSpeakers, stakeholderId] });
    }
  };

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  return (
    <div id={`agenda-item-${item.id}`} className="relative flex flex-col sm:flex-row gap-0 sm:gap-4 md:gap-8 pb-6 sm:pb-8 group">
      {/* Time Column (Desktop Only) */}
      <div className="hidden sm:flex flex-col items-center w-16 flex-shrink-0 pt-2 text-center">
        <div className="text-sm font-bold text-slate-900">{startTime}</div>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md mt-1 w-full text-center">
          {item.durationMinutes}m
        </div>
      </div>

      {/* Timeline Node (Desktop Only) */}
      <div className="hidden sm:block absolute left-[29px] md:left-[45px] top-[14px] w-3.5 h-3.5 rounded-full bg-white border-[3px] border-slate-900 shadow-sm z-10"></div>

      {/* Card Body */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-full touch-pan-y">
        {isEditing ? (
          <>
            {/* Mobile Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-50 sm:hidden animate-fade-in"
              onClick={() => setIsEditing(false)}
            />
            
            {/* Bottom Sheet Drawer on Mobile, Inline Form on Desktop */}
            <div className="fixed sm:static inset-x-0 bottom-0 z-50 sm:z-0 bg-white sm:bg-transparent rounded-t-3xl sm:rounded-none border-t sm:border-t-0 border-slate-200 sm:border-transparent p-5 sm:p-5 pb-8 sm:pb-0 space-y-4 max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible shadow-[0_-10px_40px_rgba(0,0,0,0.12)] sm:shadow-none animate-slide-up sm:animate-none">
              
              {/* Mobile-Only Handle Bar & Header */}
              <div className="sm:hidden flex flex-col items-center mb-1">
                <div className="w-12 h-1 bg-slate-200 rounded-full mb-4" />
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-extrabold text-slate-900 text-lg">Edit Topic</h3>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Topic Title</label>
                <input 
                  className="w-full font-bold text-lg text-slate-800 border-b border-slate-200 focus:outline-none focus:border-indigo-500 pb-2 h-11"
                  value={editData.topic}
                  onChange={e => setEditData({...editData, topic: e.target.value})}
                  placeholder="Topic"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Description</label>
                <textarea 
                  className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 min-h-[90px]"
                  value={editData.description}
                  onChange={e => setEditData({...editData, description: e.target.value})}
                  placeholder="Description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Discussion Points (one per line)</label>
                   <textarea
                     className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 min-h-[90px]"
                     value={editData.keyPoints?.join('\n') || ''}
                     onChange={e => setEditData({...editData, keyPoints: e.target.value.split('\n')})}
                     placeholder="• Review Q1 metrics&#10;• Discuss blocking issues"
                   />
                </div>
                <div className="space-y-4">
                   <div className="space-y-1.5">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Expected Outcome</label>
                     <input
                       className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl px-3 h-11 focus:outline-none focus:border-indigo-500"
                       value={editData.expectedOutcome || ''}
                       onChange={e => setEditData({...editData, expectedOutcome: e.target.value})}
                       placeholder="e.g., Approval of budget"
                     />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Duration (minutes)</label>
                      <input 
                        type="number"
                        min="1"
                        className="w-full text-sm border border-slate-200 rounded-xl px-3 h-11 focus:outline-none focus:border-indigo-500"
                        value={editData.durationMinutes}
                        onChange={e => setEditData({...editData, durationMinutes: parseInt(e.target.value) || 0})}
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Assign Stakeholders</label>
                <div className="flex flex-wrap gap-2">
                  {stakeholders.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => toggleSpeaker(s.id)}
                      className={`px-3.5 py-2 sm:py-1 rounded-xl text-sm sm:text-xs font-semibold border transition-all min-h-[44px] sm:min-h-[32px] flex items-center justify-center ${
                        editData.speakerIds.includes(s.id) 
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm font-bold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                  {stakeholders.length === 0 && <span className="text-xs text-slate-400 italic">No stakeholders available. Add some in the Panel.</span>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
                 <button onClick={() => setIsEditing(false)} className="w-full sm:w-auto px-4 py-3 sm:py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] flex items-center justify-center transition-colors">Cancel</button>
                 <button onClick={handleSave} className="w-full sm:w-auto px-4 py-3 sm:py-1.5 text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl min-h-[44px] flex items-center justify-center transition-colors">Save Changes</button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 sm:p-5 flex gap-1 sm:gap-4 items-stretch">
            {/* Smooth Reordering Controls for flawless scrolling without event interception */}
            <div className="flex flex-col justify-center items-center gap-1.5 px-2.5 sm:px-1 min-w-[44px] sm:min-w-[28px] min-h-[44px] shrink-0 border-r border-slate-100/85 mr-1 sm:mr-2">
               <button 
                 onClick={onMoveUp}
                 disabled={isFirst}
                 className={`w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl transition-all ${isFirst ? 'text-slate-200 cursor-not-allowed bg-slate-50/50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 active:scale-90 cursor-pointer'}`}
                 title="Move Topic Up"
               >
                 <ChevronUp size={20} />
               </button>
               <button 
                 onClick={onMoveDown}
                 disabled={isLast}
                 className={`w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl transition-all ${isLast ? 'text-slate-200 cursor-not-allowed bg-slate-50/50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 active:scale-90 cursor-pointer'}`}
                 title="Move Topic Down"
               >
                 <ChevronDown size={20} />
               </button>
            </div>

            <div className="flex-1 min-w-0 pr-1 select-none">
              {/* Mobile-Only Header Row with 44px Touch Targets */}
              <div className="flex sm:hidden items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                    <Clock size={13} />
                    {startTime}
                  </span>
                  <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg shrink-0">
                    {item.durationMinutes}m
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsEditing(true)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 active:scale-95 transition-all" title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => onRemove(item.id)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-xl text-slate-500 hover:text-red-500 active:scale-95 transition-all" title="Remove">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Desktop Header Row: Topic, Edit, Delete Buttons */}
              <div className="hidden sm:flex justify-between items-start mb-2.5">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-snug">{item.topic}</h3>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setIsEditing(true)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Edit row">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onRemove(item.id)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all" title="Remove row">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Mobile-only Topic Title */}
              <h3 className="block sm:hidden text-base font-extrabold text-slate-800 mb-2 leading-snug">{item.topic}</h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                {item.description}
              </p>
              
              {item.keyPoints && item.keyPoints.length > 0 && (
                <div className="mt-3.5 mb-3.5 space-y-1.5">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <List size={12} /> Key Points
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 pl-1">
                    {item.keyPoints.map((point, idx) => (
                      point.trim() && <li key={idx} className="leading-snug">{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.expectedOutcome && (
                <div className="mt-3.5 bg-green-50/50 p-3 rounded-xl border border-green-100 inline-block w-full">
                  <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Target size={12} /> Expected Outcome
                  </h4>
                  <p className="text-sm text-green-800 font-medium leading-relaxed">{item.expectedOutcome}</p>
                </div>
              )}
              
              {item.speakerIds && item.speakerIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3.5 border-t border-slate-100">
                  {item.speakerIds.map(id => {
                    const speaker = stakeholders.find(s => s.id === id);
                    if (!speaker) return null;
                    return (
                      <div key={id} className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50/70 text-indigo-700 border border-indigo-100/50 rounded-xl text-xs font-semibold">
                        <User size={12} className="shrink-0" />
                        <span>{speaker.name}</span>
                        <span className="opacity-40 select-none">|</span>
                        <span className="opacity-80 font-normal">{speaker.role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.startTime === next.startTime &&
    prev.isFirst === next.isFirst &&
    prev.isLast === next.isLast &&
    prev.item === next.item &&
    prev.stakeholders === next.stakeholders
  );
});

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  agenda, 
  isLoading, 
  onUpdateAgenda, 
  onCreateBlankAgenda,
  files = [],
  onFileUpload,
  onRemoveFile,
  onGenerateAgenda,
  selectedTemplateId = 'auto',
  onSelectTemplate,
  onCreateManualAgenda,
  savedAgendas = [],
  activeAgendaId = null,
  onSelectAgenda,
  onDeleteAgenda,
  onClearAllHistory
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [newStakeholderData, setNewStakeholderData] = useState({
    name: '',
    role: '',
    contact: ''
  });

  // States for center planner workspace
  const [centerPlannerMode, setCenterPlannerMode] = useState<'ai' | 'manual'>('ai');
  const [centerInstructions, setCenterInstructions] = useState('');
  const [centerManualTitle, setCenterManualTitle] = useState('');
  const [centerManualStartTime, setCenterManualStartTime] = useState('09:00');
  const [centerManualSummary, setCenterManualSummary] = useState('');
  const [centerManualStakeholders, setCenterManualStakeholders] = useState<Array<{ name: string; role: string; contact: string }>>([]);
  const [centerManualItems, setCenterManualItems] = useState<Array<{ topic: string; durationMinutes: number; description: string }>>([]);

  const [centerNewStakeholderName, setCenterNewStakeholderName] = useState('');
  const [centerNewStakeholderRole, setCenterNewStakeholderRole] = useState('');
  const [centerNewTopicName, setCenterNewTopicName] = useState('');
  const [centerNewTopicDuration, setCenterNewTopicDuration] = useState(15);
  const [centerNewTopicDescription, setCenterNewTopicDescription] = useState('');
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const centerDropdownRef = useRef<HTMLDivElement>(null);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const centerFileInputRef = useRef<HTMLInputElement>(null);

  // States for inline Title and Summary editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (centerDropdownRef.current && !centerDropdownRef.current.contains(event.target as Node)) {
        setCenterDropdownOpen(false);
      }
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
        setIsHistoryDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerCenterUpload = () => {
    centerFileInputRef.current?.click();
  };

  const handleCenterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFileUpload) {
      Array.from(e.target.files).forEach(file => onFileUpload(file));
    }
    if (centerFileInputRef.current) centerFileInputRef.current.value = '';
  };

  const centerSelectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0];

  const handleStartEditTitle = () => {
    if (!agenda) return;
    setEditedTitle(agenda.title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (!agenda) return;
    if (editedTitle.trim()) {
      onUpdateAgenda({ ...agenda, title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false);
  };

  const handleStartEditSummary = () => {
    if (!agenda) return;
    setEditedSummary(agenda.summary);
    setIsEditingSummary(true);
  };

  const handleSaveSummary = () => {
    if (!agenda) return;
    onUpdateAgenda({ ...agenda, summary: editedSummary.trim() });
    setIsEditingSummary(false);
  };

  const handleCancelEditSummary = () => {
    setIsEditingSummary(false);
  };

  const handleSuggestNextItem = async () => {
    if (!agenda || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const suggestedItem = await suggestNextItem(agenda, agenda.items);
      onUpdateAgenda({
        ...agenda,
        items: [...agenda.items, suggestedItem]
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to generate suggested agenda item. Please check your Gemini API key.");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Pre-calculate times for all items before filtering so timestamps remain accurate
  // MEMOIZED calculations to prevent frame drops/delays during scroll or re-renders
  const itemsWithTimes = React.useMemo(() => {
    if (!agenda) return [];
    let tempTime = agenda.startTime;
    return agenda.items.map(item => {
      const startTime = tempTime;
      tempTime = addMinutes(tempTime, item.durationMinutes);
      return { ...item, startTimeCalculated: startTime };
    });
  }, [agenda?.items, agenda?.startTime]);

  const totalDuration = React.useMemo(() => {
    if (!agenda) return 0;
    return agenda.items.reduce((acc, item) => acc + item.durationMinutes, 0);
  }, [agenda?.items]);

  // Filter items based on search query values
  const isSearching = searchQuery.trim().length > 0;
  const filteredItems = React.useMemo(() => {
    if (!isSearching) return itemsWithTimes;
    const q = searchQuery.toLowerCase();
    return itemsWithTimes.filter(item => {
      return item.topic.toLowerCase().includes(q) || 
             item.description.toLowerCase().includes(q) ||
             item.keyPoints?.some(k => k.toLowerCase().includes(q)) ||
             item.expectedOutcome?.toLowerCase().includes(q);
    });
  }, [itemsWithTimes, searchQuery, isSearching]);

  const endingTime = React.useMemo(() => {
    if (!agenda) return '';
    let tempTime = agenda.startTime;
    agenda.items.forEach(item => {
      tempTime = addMinutes(tempTime, item.durationMinutes);
    });
    return tempTime;
  }, [agenda?.items, agenda?.startTime]);

  const handleMoveItem = React.useCallback((id: string, direction: 'up' | 'down') => {
    if (!agenda) return;
    const index = agenda.items.findIndex((item) => item.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= agenda.items.length) return;
    
    const newItems = [...agenda.items];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;
    
    onUpdateAgenda({ ...agenda, items: newItems });
  }, [agenda, onUpdateAgenda]);

  const handleItemUpdate = React.useCallback((updatedItem: AgendaItem) => {
    if (!agenda) return;
    const newItems = agenda.items.map(item => item.id === updatedItem.id ? updatedItem : item);
    onUpdateAgenda({ ...agenda, items: newItems });
  }, [agenda, onUpdateAgenda]);

  const handleItemRemove = React.useCallback((id: string) => {
    if (!agenda) return;
    const newItems = agenda.items.filter(item => item.id !== id);
    onUpdateAgenda({ ...agenda, items: newItems });
  }, [agenda, onUpdateAgenda]);

  const handleStakeholderUpdate = React.useCallback((updatedStakeholder: Stakeholder) => {
    if (!agenda) return;
    const newStakeholders = agenda.stakeholders.map(s => s.id === updatedStakeholder.id ? updatedStakeholder : s);
    onUpdateAgenda({ ...agenda, stakeholders: newStakeholders });
  }, [agenda, onUpdateAgenda]);

  const handleStakeholderAdd = React.useCallback(() => {
    setNewStakeholderData({ name: '', role: '', contact: '' });
    setIsAddingStakeholder(true);
  }, []);

  const handleSaveNewStakeholder = React.useCallback(() => {
    if (!agenda) return;
    if (!newStakeholderData.name.trim()) {
      alert("Please enter a name for the stakeholder.");
      return;
    }
    const newStakeholder: Stakeholder = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStakeholderData.name.trim(),
      role: newStakeholderData.role.trim() || "Participant",
      contact: newStakeholderData.contact.trim()
    };
    onUpdateAgenda({ ...agenda, stakeholders: [...agenda.stakeholders, newStakeholder] });
    setIsAddingStakeholder(false);
  }, [agenda, onUpdateAgenda, newStakeholderData]);

  const handleStakeholderRemove = React.useCallback((id: string) => {
    if (!agenda) return;
    const newStakeholders = agenda.stakeholders.filter(s => s.id !== id);
    const newItems = agenda.items.map(item => ({
      ...item,
      speakerIds: item.speakerIds.filter(sid => sid !== id)
    }));
    onUpdateAgenda({ ...agenda, stakeholders: newStakeholders, items: newItems });
  }, [agenda, onUpdateAgenda]);
  
  const handleAddItem = React.useCallback(() => {
     if (!agenda) return;
     const newItem: AgendaItem = {
         id: Math.random().toString(36).substr(2, 9),
         topic: "New Topic",
         description: "Description of the new topic",
         durationMinutes: 15,
         speakerIds: []
     };
     onUpdateAgenda({...agenda, items: [...agenda.items, newItem]});
  }, [agenda, onUpdateAgenda]);

  // --- Export Handlers ---
  const handleExportPDF = () => {
    if (!agenda) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // --- Colorful Header Accent Band ---
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, 210, 8, 'F');
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(agenda.title, 14, 22);
    
    // Subtitle / Date & Time details
    const totalMinutes = agenda.items.reduce((acc, i) => acc + i.durationMinutes, 0);
    const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || meetingDate;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Scheduled Date: ${formattedDate}   |   Starts: ${agenda.startTime}   |   Total Time: ${totalMinutes} minutes`, 14, 29);
    
    // Horizontal separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);

    // Purpose/Summary Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("MEETING BRIEFING & OBJECTIVE", 14, 41);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const splitSummary = doc.splitTextToSize(agenda.summary, 180);
    doc.text(splitSummary, 14, 46);
    
    // Stakeholders Section
    let yPos = 46 + (splitSummary.length * 4.5) + 8;
    
    // Check if we need to start a new page before stakeholders table to keep it neat
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("STAKEHOLDERS & ATTENDEES", 14, yPos);
    
    const stakeholderRows = agenda.stakeholders.map(s => [s.name, s.role, s.contact || 'N/A']);
    autoTable(doc, {
        startY: yPos + 3,
        head: [['Name', 'Role', 'Contact / Email']],
        body: stakeholderRows,
        theme: 'striped',
        headStyles: { 
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 8.5,
            cellPadding: 2.5,
            valign: 'middle'
        },
        margin: { left: 14, right: 14 }
    });
    
    // Agenda Items Section
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo
    doc.text("TIMELINE & AGENDA ITEMS", 14, finalY);
    
    // Calculate times for table
    let currentTime = agenda.startTime;
    const itemRows = agenda.items.map(item => {
        const start = currentTime;
        const [h, m] = currentTime.split(':').map(Number);
        const date = new Date(); date.setHours(h, m + item.durationMinutes);
        const end = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        currentTime = end;
        
        const speakers = item.speakerIds
            .map(id => agenda.stakeholders.find(s => s.id === id)?.name)
            .filter(Boolean)
            .join(', ');
            
        // Construct detailed topic description
        let details = `Topic: ${item.topic}\n\nDescription: ${item.description}`;
        if (item.keyPoints && item.keyPoints.length > 0) {
            details += "\n\nKey discussion points:\n• " + item.keyPoints.join("\n• ");
        }
        if (item.expectedOutcome) {
            details += "\n\nExpected Outcome:\n" + item.expectedOutcome;
        }

        return [
            `${start} - ${end}`, 
            details, 
            `${item.durationMinutes} min`, 
            speakers || 'Open floor'
        ];
    });

    autoTable(doc, {
        startY: finalY + 3,
        head: [['Time Frame', 'Session / Topic Details', 'Duration', 'Facilitator / Speakers']],
        body: itemRows,
        theme: 'grid',
        headStyles: { 
            fillColor: [15, 23, 42], // Slate-900 for agenda
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
        },
        styles: { 
            fontSize: 8.5,
            cellPadding: 3.5,
            valign: 'top',
            lineColor: [226, 232, 240] // slate-200
        },
        columnStyles: {
            0: { cellWidth: 26, fontStyle: 'bold', textColor: [79, 70, 229] },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 16, fontStyle: 'bold', halign: 'center' },
            3: { cellWidth: 32, fontStyle: 'normal' }
        },
        margin: { left: 14, right: 14 }
    });

    // --- Footer & Page Numbers (Loop page count) ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Page border indicator or page footers
        doc.setDrawColor(241, 245, 249); // slate-100
        doc.line(14, 280, 196, 280);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Page ${i} of ${pageCount}`, 14, 285);
        doc.text(`Generated beautifully by AI Agenda Studio`, 196, 285, { align: 'right' });
    }

    doc.save(`${agenda.title.replace(/\s+/g, '_')}_Agenda.pdf`);
    setIsExportMenuOpen(false);
  };

  const handleExportiCal = () => {
    if (!agenda) return;
    
    let icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Agenda//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    const [startH, startM] = agenda.startTime.split(':').map(Number);
    const startDate = new Date(meetingDate);
    startDate.setHours(startH, startM, 0);
    
    const totalDuration = agenda.items.reduce((sum, item) => sum + item.durationMinutes, 0);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);
    
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    icsContent += 
`BEGIN:VEVENT
UID:${Date.now()}@agenda.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${agenda.title}
DESCRIPTION:${agenda.summary}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${agenda.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
  };

  const handleShareEmail = () => {
    if (!agenda) return;
    const subject = encodeURIComponent(`Meeting Agenda: ${agenda.title}`);
    let body = `Meeting Agenda: ${agenda.title}\nDate: ${meetingDate}\nTime: ${agenda.startTime}\n\nSummary:\n${agenda.summary}\n\nStakeholders:\n${agenda.stakeholders.map(s => `- ${s.name} (${s.role})`).join('\n')}\n\nAgenda:\n`;
    
    let currentTime = agenda.startTime;
    agenda.items.forEach(item => {
        const start = currentTime;
        const [h, m] = currentTime.split(':').map(Number);
        const date = new Date(); date.setHours(h, m + item.durationMinutes);
        currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        body += `[${start} - ${currentTime}] ${item.topic} (${item.durationMinutes}m)\n${item.description}\n`;
        if (item.keyPoints && item.keyPoints.length > 0) {
           body += `Key Points:\n${item.keyPoints.map(p => '• ' + p).join('\n')}\n`;
        }
        if (item.expectedOutcome) {
           body += `Outcome: ${item.expectedOutcome}\n`;
        }
        body += `\n`;
    });
    
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
    setIsExportMenuOpen(false);
  };
  
  const handleCopyLink = () => {
      // Simulate copying link by copying a shareable text snippet
      if (!agenda) return;
      let text = `📅 ${agenda.title}\n⏰ ${meetingDate} @ ${agenda.startTime}\n\n${agenda.summary}`;
      navigator.clipboard.writeText(text);
      alert("Agenda summary copied to clipboard!");
      setIsExportMenuOpen(false);
  };

  return (
    <div id="timeline-view-container" className="flex-grow flex-1 overflow-y-auto bg-slate-50/30 min-h-0 w-full scroll-smooth [-webkit-overflow-scrolling:touch]">
      {isLoading && !agenda ? (
        <div className="flex-grow flex flex-col items-center justify-center p-8 h-full min-h-[400px]">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Crafting your agenda...</h2>
            <p className="text-slate-500">
              Reading the document, identifying stakeholders, and structuring the timeline.
            </p>
          </div>
        </div>
      ) : !agenda ? (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
          {/* Hidden File Picker */}
          <input 
            type="file" 
            ref={centerFileInputRef} 
            onChange={handleCenterFileChange} 
            className="hidden" 
            multiple
            accept=".pdf,.txt,.md,.json,.csv,.jpg,.png,.jpeg"
          />

          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Sparkles size={12} className="text-indigo-500 animate-pulse" />
              Central Planner Workspace
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight leading-tight">
              Design Your Meeting Agenda
            </h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
              Synthesize briefings using Gemini, or build a highly-detailed structured meeting timeline block-by-block.
            </p>
          </div>

          {/* Mode Switch Card */}
          <div className="bg-white border border-slate-200/85 rounded-2xl shadow-sm overflow-hidden mb-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Mode switch header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CHOOSE DESIGN APPROACH:</span>
              <div className="flex p-1 bg-slate-200/60 rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setCenterPlannerMode('ai')}
                  className={`flex-1 sm:flex-none px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    centerPlannerMode === 'ai' 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles size={13} className={centerPlannerMode === 'ai' ? 'text-indigo-500 animate-pulse' : ''} />
                  AI Co-Pilot
                </button>
                <button
                  onClick={() => setCenterPlannerMode('manual')}
                  className={`flex-1 sm:flex-none px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    centerPlannerMode === 'manual' 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Clock size={13} className={centerPlannerMode === 'manual' ? 'text-indigo-500' : ''} />
                  Manual Builder
                </button>
              </div>
            </div>

            {/* AI Setup Form */}
            {centerPlannerMode === 'ai' ? (
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Template and instructions */}
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Meeting Template</label>
                      <div className="relative" ref={centerDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setCenterDropdownOpen(!centerDropdownOpen)}
                          className="w-full flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-left cursor-pointer"
                        >
                          <span className="truncate">{centerSelectedTemplate.name}</span>
                          <ChevronDown size={16} className={`text-slate-400 transition-transform shrink-0 ml-2 ${centerDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {centerDropdownOpen && (
                          <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-1.5 max-h-60 overflow-y-auto">
                            {MEETING_TEMPLATES.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  if (onSelectTemplate) onSelectTemplate(t.id);
                                  setCenterDropdownOpen(false);
                                }}
                                className={`flex items-center justify-between w-full px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer ${t.id === selectedTemplateId ? 'text-indigo-600 bg-indigo-50/30' : ''}`}
                              >
                                <span>{t.name}</span>
                                {t.id === selectedTemplateId && <Check size={14} className="text-indigo-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        {centerSelectedTemplate.description}
                        {selectedTemplateId !== 'auto' && <span className="block text-indigo-500 font-medium mt-0.5">Expected flow: {centerSelectedTemplate.structure}</span>}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Custom Instructions & Points</label>
                        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">AI Steer Notes</span>
                      </div>
                      <textarea
                        value={centerInstructions}
                        onChange={e => setCenterInstructions(e.target.value)}
                        rows={4}
                        className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all resize-none leading-relaxed"
                        placeholder="💡 Provide direct prompts, goals, core focal areas, or schedule details here. E.g., 'Dedicate at least 15 minutes to marketing plans. Ensure Kennedy Mtega is marked as host. Budget reviews should occur first.'"
                      />
                    </div>
                  </div>

                  {/* Right Column: Source Documents Dropzone */}
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Briefings & Source Documents</label>
                    <div 
                      onClick={triggerCenterUpload}
                      className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/30 hover:bg-slate-50 transition-all min-h-[160px] group animate-pulse hover:animate-none"
                    >
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-3 text-indigo-600 group-hover:scale-110 transition-transform">
                        <Upload size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 mb-1">Click or Drag Files Here</p>
                      <p className="text-[11px] text-slate-400">Supports PDF, TXT, images, and meeting notes</p>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-2.5 animate-in slide-in-from-top-1">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileTextIcon size={14} className="text-indigo-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={file.name}>{file.name}</span>
                              <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (onRemoveFile) onRemoveFile(idx); }}
                              className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <p className="text-xs text-slate-400 text-center sm:text-left">
                    💡 Gemini will combine your uploaded briefs and instructions into an agenda instantly.
                  </p>
                  <button
                    onClick={() => onGenerateAgenda && onGenerateAgenda(centerInstructions)}
                    disabled={isLoading || (files.length === 0 && selectedTemplateId === 'auto' && !centerInstructions.trim())}
                    className="w-full sm:w-auto min-h-[46px] px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing files...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-amber-300" />
                        Generate Guided Agenda
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Manual Builder Form */
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Core Fields */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Meeting Title *</label>
                      <input
                        type="text"
                        value={centerManualTitle}
                        onChange={e => setCenterManualTitle(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3.5 h-11 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
                        placeholder="e.g., Marketing Strategy & Campaign Alignment"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Time</label>
                        <input
                          type="time"
                          value={centerManualStartTime}
                          onChange={e => setCenterManualStartTime(e.target.value)}
                          className="w-full text-sm font-semibold border border-slate-200 rounded-xl px-3.5 h-11 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Draft Topics Count</label>
                        <div className="h-11 border border-slate-200/80 bg-slate-50 text-slate-500 rounded-xl px-3.5 flex items-center font-bold text-xs uppercase tracking-wide">
                          {centerManualItems.length} Blocks Configured
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Meeting Brief / Objective</label>
                      <textarea
                        value={centerManualSummary}
                        onChange={e => setCenterManualSummary(e.target.value)}
                        rows={3}
                        className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all resize-none"
                        placeholder="Provide a quick summary of what this meeting intends to resolve..."
                      />
                    </div>
                  </div>

                  {/* Right Column: Stakeholders inline list */}
                  <div className="bg-slate-50/50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-500 mb-3 border-b border-slate-100 pb-2">
                        <UserPlus size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Stakeholders ({centerManualStakeholders.length})</h3>
                      </div>

                      {centerManualStakeholders.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-6">No stakeholders added. Add attendees below to assign them topic spots.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto mb-4 bg-white p-2 rounded-xl border border-slate-100">
                          {centerManualStakeholders.map((sh, idx) => (
                            <div key={idx} className="flex items-center gap-1 pl-2.5 pr-1 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-700">
                              <span>{sh.name}</span>
                              <span className="text-slate-400 text-[9px] font-medium">({sh.role})</span>
                              <button 
                                onClick={() => setCenterManualStakeholders(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                              >
                                <X size={9} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={centerNewStakeholderName}
                          onChange={e => setCenterNewStakeholderName(e.target.value)}
                          className="text-xs border border-slate-200 bg-white rounded-xl px-2.5 h-9 focus:outline-none"
                          placeholder="Name (e.g., Alisa)"
                        />
                        <input
                          type="text"
                          value={centerNewStakeholderRole}
                          onChange={e => setCenterNewStakeholderRole(e.target.value)}
                          className="text-xs border border-slate-200 bg-white rounded-xl px-2.5 h-9 focus:outline-none"
                          placeholder="Role (e.g., PM)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!centerNewStakeholderName.trim()) return;
                          setCenterManualStakeholders(prev => [...prev, {
                            name: centerNewStakeholderName.trim(),
                            role: centerNewStakeholderRole.trim() || 'Contributor',
                            contact: ''
                          }]);
                          setCenterNewStakeholderName('');
                          setCenterNewStakeholderRole('');
                        }}
                        className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl h-9 flex items-center justify-center font-bold text-xs cursor-pointer select-none transition-colors"
                      >
                        Add Stakeholder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Topics Builder Block */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                    <ListPlus size={14} />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Configure Meeting Topics ({centerManualItems.length})</h3>
                  </div>

                  {centerManualItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-48 overflow-y-auto p-1 bg-slate-50 border border-slate-100 rounded-2xl">
                      {centerManualItems.map((it, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/60 rounded-xl p-3 flex items-start gap-3 justify-between shadow-xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{it.durationMinutes}m</span>
                              <h4 className="text-xs font-bold text-slate-800 truncate">{it.topic}</h4>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{it.description}</p>
                          </div>
                          <button 
                            onClick={() => setCenterManualItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg w-7 h-7 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50">
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic Title *</label>
                      <input
                        type="text"
                        value={centerNewTopicName}
                        onChange={e => setCenterNewTopicName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 bg-white h-9 focus:outline-none"
                        placeholder="e.g., Introduce New Platform Features"
                      />
                    </div>
                    
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration & Brief summary</label>
                      <div className="flex gap-2">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-white px-2.5 h-9 w-20 shrink-0">
                          <input
                            type="number"
                            min="1"
                            value={centerNewTopicDuration}
                            onChange={e => setCenterNewTopicDuration(Number(e.target.value) || 15)}
                            className="w-8 text-xs font-bold text-slate-700 text-center focus:outline-none bg-transparent"
                          />
                          <span className="text-[9px] text-slate-400 font-bold ml-0.5">min</span>
                        </div>
                        <input
                          type="text"
                          value={centerNewTopicDescription}
                          onChange={e => setCenterNewTopicDescription(e.target.value)}
                          className="flex-grow text-xs border border-slate-200 rounded-xl px-3 bg-white h-9 focus:outline-none"
                          placeholder="e.g., Showcase the dynamic calendar widget"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!centerNewTopicName.trim()) return;
                          setCenterManualItems(prev => [...prev, {
                            topic: centerNewTopicName.trim(),
                            durationMinutes: Number(centerNewTopicDuration) || 15,
                            description: centerNewTopicDescription.trim() || 'General discussion block.'
                          }]);
                          setCenterNewTopicName('');
                          setCenterNewTopicDuration(15);
                          setCenterNewTopicDescription('');
                        }}
                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white rounded-xl h-9 flex items-center justify-center font-bold text-xs cursor-pointer select-none transition-colors"
                      >
                        Add Topic Block
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  {onCreateBlankAgenda && (
                    <button
                      onClick={onCreateBlankAgenda}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all h-11 flex items-center justify-center cursor-pointer"
                    >
                      💡 Skip & Start with Blank Agenda
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!centerManualTitle.trim()) {
                        alert("Please provide a Meeting Title.");
                        return;
                      }
                      if (onCreateManualAgenda) {
                        onCreateManualAgenda({
                          title: centerManualTitle.trim(),
                          startTime: centerManualStartTime || '09:00',
                          summary: centerManualSummary.trim() || 'Manual meeting session.',
                          stakeholders: centerManualStakeholders,
                          items: centerManualItems
                        });
                      }
                    }}
                    disabled={!centerManualTitle.trim()}
                    className="w-full sm:w-auto min-h-[46px] px-6 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Build Custom Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto p-3 sm:p-6 md:p-10 pb-32 relative">
          {/* AI Status Badge - visible only when processing updates in real-time */}
          {isLoading && (
            <div className="sticky top-4 left-0 right-0 z-50 flex items-center justify-center bg-indigo-50 border border-indigo-100 rounded-2xl shadow-lg p-3 gap-2.5 mb-6 animate-pulse max-w-sm mx-auto">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-indigo-900">AI is updating draft... browse active</span>
            </div>
          )}



          {/* Header Section */}
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-10">
             <div className="flex-1 min-w-0">
                <div className="flex flex-row items-center justify-between gap-2.5 mb-6 w-full">
                   {/* Left side: Time & Search */}
                   <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="inline-flex items-center justify-center gap-1.5 px-3 h-11 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm shrink-0" title={`${totalDuration} Minutes Total`}>
                         <Clock size={13} />
                         <span>{totalDuration}m</span>
                      </div>
                      
                      {/* Search Bar - Touch Optimized */}
                      <div className="relative group flex-1 max-w-xs min-w-[100px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                          <input 
                             type="text"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                             placeholder="Filter..."
                             className="w-full h-11 transition-all pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
                          />
                          {searchQuery && (
                             <button onClick={() => setSearchQuery('')} className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-slate-300 hover:text-slate-500 rounded-r-xl" title="Clear filter">
                                 <X size={12} />
                             </button>
                          )}
                      </div>
                   </div>
                   
                   {/* Right side: Actions */}
                   <div className="flex items-center gap-2 md:gap-3 shrink-0">
                       {onCreateBlankAgenda && (
                          <button 
                             onClick={onCreateBlankAgenda}
                             className="flex items-center justify-center gap-2 px-3 h-11 bg-white border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 rounded-xl text-sm font-semibold text-slate-700 transition-colors shadow-sm cursor-pointer shrink-0"
                             title="Create new meeting agenda"
                          >
                             <Plus size={15} />
                             <span className="hidden sm:inline">New Agenda</span>
                          </button>
                       )}

                       {/* Consolidated Export & Share Dropdown - 44px high targets to prevent overlapping */}
                       <div className="relative shrink-0" ref={exportDropdownRef}>
                          <button 
                             onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                             className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer shrink-0"
                             title="Export, print, or share meeting agenda"
                          >
                             <Share2 size={16} />
                          </button>
                          
                          {isExportMenuOpen && (
                             <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                   onClick={() => {
                                      handleExportPDF();
                                      setIsExportMenuOpen(false);
                                   }} 
                                   className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer"
                                >
                                   <FileTextIcon size={16} className="text-red-500" /> Export as PDF
                                </button>
                                <button 
                                   onClick={() => {
                                      handleExportiCal();
                                      setIsExportMenuOpen(false);
                                    }} 
                                   className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer"
                                >
                                   <CalendarIcon size={16} className="text-blue-500" /> Export as iCal
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button 
                                   onClick={() => {
                                      handleShareEmail();
                                      setIsExportMenuOpen(false);
                                   }} 
                                   className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer"
                                >
                                   <Mail size={16} className="text-indigo-500" /> Share via Email
                                </button>
                                <button 
                                   onClick={() => {
                                      handleCopyLink();
                                      setIsExportMenuOpen(false);
                                   }} 
                                   className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer"
                                 >
                                   <LinkIcon size={16} className="text-teal-500" /> Copy Details
                                </button>
                             </div>
                          )}
                       </div>
                    </div>
                </div>
                
                {isEditingTitle ? (
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle();
                        if (e.key === 'Escape') handleCancelEditTitle();
                      }}
                      className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight w-full bg-slate-50 border border-indigo-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer"
                      title="Save Title"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={handleCancelEditTitle}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <h1 
                    onClick={handleStartEditTitle}
                    className="group relative text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3 cursor-pointer hover:bg-slate-100/60 rounded-lg p-1 transition-all -ml-1 flex items-center justify-between gap-2"
                  >
                    <span>{agenda.title}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 p-1 hover:text-indigo-600 rounded-md bg-white border border-slate-100 shadow-sm shrink-0">
                      <Edit2 size={14} />
                    </span>
                  </h1>
                )}
                
                {isEditingSummary ? (
                  <div className="flex flex-col gap-2 mb-4">
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelEditSummary();
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          handleSaveSummary();
                        }
                      }}
                      rows={3}
                      className="w-full text-slate-600 text-sm leading-relaxed bg-slate-50 border border-indigo-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                      autoFocus
                      placeholder="Enter a brief summary of the meeting objective..."
                    />
                    <div className="flex justify-end gap-2">
                      <span className="text-[10px] text-slate-400 self-center mr-auto">Press Ctrl+Enter to save</span>
                      <button
                        onClick={handleCancelEditSummary}
                        className="px-3.5 h-9 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSummary}
                        className="px-3.5 h-9 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      >
                        Save Brief
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={handleStartEditSummary}
                    className="group relative bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm text-slate-600 text-sm leading-relaxed mb-4 cursor-pointer hover:bg-slate-50/60 transition-all flex items-start justify-between gap-4"
                  >
                    <span className="flex-1 whitespace-pre-wrap">{agenda.summary || <em className="text-slate-400">Click to add meeting brief / objective...</em>}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 p-1 hover:text-indigo-600 rounded-md bg-white border border-slate-100 shadow-sm shrink-0">
                      <Edit2 size={13} />
                    </span>
                  </div>
                )}
                <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2.5 sm:gap-3">
                   <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/60 px-3.5 py-2 rounded-xl border border-slate-200 min-h-[44px] transition-all flex-1 min-[420px]:flex-initial">
                      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 shrink-0 select-none">
                          <CalendarIcon size={13}/> Date
                      </span>
                      <input 
                        type="date" 
                        value={meetingDate} 
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none min-w-0 flex-1 h-9"
                      />
                   </div>
                   <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/60 px-3.5 py-2 rounded-xl border border-slate-200 min-h-[44px] transition-all flex-1 min-[420px]:flex-initial">
                      <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 shrink-0 select-none">
                          <Clock size={13}/> Start
                      </span>
                      <input 
                        type="time" 
                        value={agenda.startTime} 
                        onChange={(e) => {
                          if (agenda) {
                            onUpdateAgenda({...agenda, startTime: e.target.value});
                          }
                        }}
                        className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none min-w-0 h-9"
                      />
                   </div>
                </div>
             </div>
  
             {/* Stakeholders Panel */}
             <div className="xl:w-80 flex-shrink-0">
               <div className="bg-slate-55/40 border border-slate-200 rounded-2xl p-4 h-full">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <Users size={16} className="text-slate-500" />
                       <h3 className="font-bold text-slate-700 text-sm">Stakeholders</h3>
                     </div>
                     <button onClick={handleStakeholderAdd} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 transition-all hover:border-slate-300 active:scale-95 shrink-0" title="Add Stakeholder">
                        <Plus size={16} />
                     </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                     {isAddingStakeholder && (
                       <>
                         {/* Mobile Backdrop Overlay */}
                         <div 
                           className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] z-50 sm:hidden animate-fade-in"
                           onClick={() => setIsAddingStakeholder(false)}
                         />
                         
                         {/* Drawer UI on Mobile, Inline Form on Desktop */}
                         <div className="fixed sm:static inset-x-0 bottom-0 z-50 sm:z-0 bg-white sm:bg-white rounded-t-3xl sm:rounded-xl border-t sm:border border-slate-200 sm:border-slate-200 p-5 sm:p-4 pb-8 sm:pb-4 space-y-3 max-h-[85vh] sm:max-h-none overflow-y-auto sm:overflow-visible shadow-[0_-10px_40px_rgba(0,0,0,0.12)] sm:shadow-none animate-slide-up sm:animate-none">
                           
                           {/* Mobile Header with Handle */}
                           <div className="sm:hidden flex flex-col items-center mb-1">
                             <div className="w-12 h-1 bg-slate-200 rounded-full mb-4" />
                             <div className="flex justify-between items-center w-full">
                               <h3 className="font-extrabold text-slate-900 text-lg">Add Stakeholder</h3>
                               <button 
                                 onClick={() => setIsAddingStakeholder(false)} 
                                 className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                               >
                                 <X size={15} />
                               </button>
                             </div>
                           </div>
                           
                           {/* Desktop Title Header (Hidden on Mobile) */}
                           <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider">
                             New Stakeholder
                           </div>

                           <input 
                             value={newStakeholderData.name} 
                             onChange={e => setNewStakeholderData({...newStakeholderData, name: e.target.value})} 
                             className="text-sm font-semibold border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 bg-slate-50/50" 
                             placeholder="Name"
                             autoFocus
                           />
                           <input 
                             value={newStakeholderData.role} 
                             onChange={e => setNewStakeholderData({...newStakeholderData, role: e.target.value})} 
                             className="text-xs text-slate-600 border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 bg-slate-50/50" 
                             placeholder="Role"
                           />
                           <input 
                             value={newStakeholderData.contact} 
                             onChange={e => setNewStakeholderData({...newStakeholderData, contact: e.target.value})} 
                             className="text-xs text-slate-600 border border-slate-200 rounded-xl px-3 w-full h-11 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 bg-slate-50/50" 
                             placeholder="Email / Contact Info"
                           />
                           
                           <div className="flex justify-end gap-2 mt-2">
                              <button 
                                onClick={() => setIsAddingStakeholder(false)} 
                                className="px-3.5 py-2 sm:py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleSaveNewStakeholder} 
                                className="px-3.5 py-2 sm:py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-colors shrink-0"
                              >
                                Add Partner
                              </button>
                           </div>
                         </div>
                       </>
                     )}
                     {agenda.stakeholders.map(stakeholder => (
                       <StakeholderCard 
                         key={stakeholder.id} 
                         stakeholder={stakeholder} 
                         onUpdate={handleStakeholderUpdate} 
                         onDelete={handleStakeholderRemove}
                       />
                     ))}
                     {agenda.stakeholders.length === 0 && !isAddingStakeholder && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No stakeholders yet.<br/>Click + to add.
                        </div>
                     )}
                  </div>
               </div>
             </div>
          </div>
  
          {/* Timeline Section */}
          <div className="relative pl-0 sm:pl-4 md:pl-8">
            {/* Vertical Line - Hidden on small mobile screens to prevent cutting off text space */}
            <div className="hidden sm:block absolute top-4 bottom-0 left-[35px] md:left-[51px] w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"></div>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-0">
              {filteredItems.map((item, idx) => (
                  <AgendaItemRow 
                    key={item.id} 
                    item={item} 
                    startTime={item.startTimeCalculated}
                    stakeholders={agenda.stakeholders}
                    onUpdate={handleItemUpdate}
                    onRemove={handleItemRemove}
                    onMoveUp={() => handleMoveItem(item.id, 'up')}
                    onMoveDown={() => handleMoveItem(item.id, 'down')}
                    isFirst={idx === 0}
                    isLast={idx === filteredItems.length - 1}
                  />
              ))}
            </div>
            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
                    No topics matched your search filter. Try another keyword!
                </div>
            )}
            
            {/* Add Item Actions with Custom item manual build & AI Auto-expansion */}
            {!isSearching && (
                <div className="relative sm:flex sm:gap-8 pb-32 sm:pb-8 mt-4 sm:mt-1">
                   <div className="hidden sm:block w-16 flex-shrink-0"></div>
                   
                   {/* Styled Action Sheet at Bottom on Mobile, standard Flex Flow */}
                   <div className="fixed sm:static inset-x-0 bottom-0 z-40 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-200/80 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:shadow-none p-3.5 sm:p-0 rounded-t-[20px] sm:rounded-none flex flex-col min-[420px]:flex-row sm:flex-grow md:flex-row gap-2.5 sm:gap-4 w-full animate-slide-up">
                      {/* Manual Add Button */}
                      <button 
                        onClick={handleAddItem}
                        className="flex-1 min-h-[48px] sm:min-h-[52px] md:min-h-[56px] border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50/50 active:scale-[0.99] transition-all duration-300 font-bold text-[10px] min-[360px]:text-xs sm:text-xs md:text-sm uppercase tracking-wider group shadow-sm hover:shadow-md cursor-pointer select-none"
                      >
                         <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-all duration-200 group-hover:rotate-90 shrink-0">
                            <Plus size={13} className="text-slate-500 group-hover:text-indigo-600 transition-colors duration-200" />
                           </div>
                         <span>Add Custom Topic</span>
                      </button>

                      {/* AI Suggest / Generate Button */}
                      <button 
                        onClick={handleSuggestNextItem}
                        disabled={isSuggesting}
                        className="flex-1 min-h-[48px] sm:min-h-[52px] md:min-h-[56px] bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.99] transition-all duration-300 font-bold text-[10px] min-[360px]:text-xs sm:text-xs md:text-sm uppercase tracking-wider group shadow-lg shadow-indigo-200/50 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none cursor-pointer select-none"
                      >
                         {isSuggesting ? (
                           <>
                             <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin shrink-0"></div>
                             <span>AI Suggestions...</span>
                           </>
                         ) : (
                           <>
                             <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-indigo-500/20 group-hover:bg-indigo-500/30 flex items-center justify-center transition-all duration-200 group-hover:scale-110 shrink-0">
                               <Sparkles size={13} className="text-amber-300 animate-pulse" />
                             </div>
                             <span>AI Suggest Next Topic</span>
                           </>
                         )}
                      </button>
                    </div>
                </div>
            )}
  
            {/* End Node */}
            <div className="relative flex gap-4 sm:gap-8 min-h-[44px] items-center">
               <div className="hidden sm:flex flex-col items-center w-16 flex-shrink-0">
                 <div className="text-sm font-bold text-slate-400">{endingTime}</div>
               </div>
               <div className="hidden sm:block absolute left-[29px] md:left-[45px] top-[14px] w-3 h-3 rounded-full bg-slate-200 border-2 border-white"></div>
               <div className="text-xs font-semibold text-slate-400 sm:pl-4 flex items-center gap-2">
                 <span className="sm:hidden text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">End at {endingTime}</span>
                 <span className="text-slate-400">End of meeting</span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};