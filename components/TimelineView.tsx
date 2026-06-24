import React, { useState, useEffect, useRef } from 'react';
import { MeetingAgenda, AgendaItem, Stakeholder } from '../types';
import { 
  Clock, Users, Calendar, User, Plus, Trash2, Edit2, Check, X, Mail, 
  Share2, Download, Link as LinkIcon, FileText as FileTextIcon, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  List, Target, Search, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { suggestNextItem } from '../services/geminiService';

interface TimelineViewProps {
  agenda: MeetingAgenda | null;
  isLoading: boolean;
  onUpdateAgenda: (agenda: MeetingAgenda) => void;
  onCreateBlankAgenda?: () => void;
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

export const TimelineView: React.FC<TimelineViewProps> = ({ agenda, isLoading, onUpdateAgenda, onCreateBlankAgenda }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [newStakeholderData, setNewStakeholderData] = useState({
    name: '',
    role: '',
    contact: ''
  });

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
        <div className="flex-grow flex flex-col items-center justify-center p-8 h-full min-h-[440px]">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-500 animate-bounce duration-1000">
            <Calendar size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Design New Agenda</h2>
          <p className="text-slate-500 text-sm max-w-sm text-center mb-6 leading-relaxed">
            Upload document briefings or build a perfectly structured meeting timeline instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
             {onCreateBlankAgenda && (
               <button 
                 onClick={onCreateBlankAgenda}
                 className="px-6 py-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
               >
                 Create Blank Agenda
               </button>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                   <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-md shadow-slate-900/20 w-fit shrink-0">
                      <Clock size={12} />
                      {totalDuration} Minutes Total
                   </div>
                   
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                       {/* Search Bar - Touch Optimized */}
                       <div className="relative group flex-grow sm:flex-initial">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                           <input 
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Filter topics..."
                              className="w-full sm:w-36 md:w-48 sm:focus:w-52 md:focus:w-60 h-11 transition-all pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
                           />
                           {searchQuery && (
                              <button onClick={() => setSearchQuery('')} className="absolute right-0 top-0 w-11 h-11 flex items-center justify-center text-slate-300 hover:text-slate-500 rounded-r-xl" title="Clear filter">
                                  <X size={12} />
                              </button>
                           )}
                       </div>
   
                       {/* Export PDF Quick Action */}
                       <button 
                          onClick={handleExportPDF}
                          className="flex items-center gap-2 px-3.5 h-11 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                          title="Export and print agenda as beautifully formatted PDF"
                       >
                          <Download size={15} />
                          <span className="hidden sm:inline">Export PDF</span>
                       </button>

                       {/* Export Dropdown - 44px high targets */}
                       <div className="relative">
                          <button 
                             onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                             className="flex items-center gap-2 px-3.5 h-11 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
                          >
                             <Share2 size={16} />
                             <span className="hidden min-[360px]:inline">Share</span>
                             <ChevronDown size={14} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isExportMenuOpen && (
                             <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer">
                                   <FileTextIcon size={16} className="text-red-500" /> Export as PDF
                                </button>
                                <button onClick={handleExportiCal} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer">
                                   <CalendarIcon size={16} className="text-blue-500" /> Export as iCal
                                </button>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <button onClick={handleShareEmail} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer">
                                   <Mail size={16} className="text-slate-500" /> Share via Email
                                </button>
                                <button onClick={handleCopyLink} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 min-h-[44px] cursor-pointer">
                                   <LinkIcon size={16} className="text-slate-500" /> Copy Details
                                </button>
                             </div>
                          )}
                       </div>
                    </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                  {agenda.title}
                </h1>
                <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm text-slate-600 text-sm leading-relaxed mb-4">
                   {agenda.summary}
                </div>
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