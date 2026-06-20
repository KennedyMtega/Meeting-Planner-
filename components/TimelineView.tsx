import React, { useState } from 'react';
import { MeetingAgenda, AgendaItem, Stakeholder } from '../types';
import { 
  Clock, Users, Calendar, User, GripVertical, Plus, Trash2, Edit2, Check, X, Mail, 
  Share2, Download, Link as LinkIcon, FileText as FileTextIcon, ChevronDown, Calendar as CalendarIcon,
  List, Target, Search
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TimelineViewProps {
  agenda: MeetingAgenda | null;
  isLoading: boolean;
  onUpdateAgenda: (agenda: MeetingAgenda) => void;
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
      <div className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
        <input 
          value={data.name} 
          onChange={e => setData({...data, name: e.target.value})} 
          className="text-sm font-semibold border-b border-slate-200 focus:outline-none focus:border-indigo-500" 
          placeholder="Name"
        />
        <input 
          value={data.role} 
          onChange={e => setData({...data, role: e.target.value})} 
          className="text-xs text-slate-500 border-b border-slate-200 focus:outline-none focus:border-indigo-500" 
          placeholder="Role"
        />
        <input 
          value={data.contact} 
          onChange={e => setData({...data, contact: e.target.value})} 
          className="text-xs text-slate-400 border-b border-slate-200 focus:outline-none focus:border-indigo-500" 
          placeholder="Contact Info"
        />
        <div className="flex justify-end gap-2 mt-2">
           <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><X size={14}/></button>
           <button onClick={handleSave} className="p-1 hover:bg-indigo-50 rounded text-indigo-600"><Check size={14}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all group">
      <div>
        <div className="flex items-center gap-2">
           <div className="font-semibold text-sm text-slate-800">{stakeholder.name}</div>
        </div>
        <div className="text-xs text-slate-500">{stakeholder.role}</div>
        {stakeholder.contact && (
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
             <Mail size={10} /> {stakeholder.contact}
          </div>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600">
          <Edit2 size={12} />
        </button>
        <button onClick={() => onDelete(stakeholder.id)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// --- Sortable Agenda Item Component ---
interface SortableItemProps {
  item: AgendaItem;
  startTime: string;
  stakeholders: Stakeholder[];
  onUpdate: (item: AgendaItem) => void;
  onRemove: (id: string) => void;
  isDragDisabled?: boolean;
}

const SortableAgendaItem: React.FC<SortableItemProps> = ({ item, startTime, stakeholders, onUpdate, onRemove, isDragDisabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: item.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(item);

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
    <div ref={setNodeRef} style={style} id={`agenda-item-${item.id}`} className="relative flex gap-4 md:gap-8 pb-8 group">
      {/* Time Column */}
      <div className="flex flex-col items-center w-16 flex-shrink-0 pt-2">
        <div className="text-sm font-bold text-slate-900">{startTime}</div>
        <div className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1">
          {item.durationMinutes}m
        </div>
      </div>

      {/* Timeline Node */}
      <div className="absolute left-[29px] md:left-[45px] top-[14px] w-3.5 h-3.5 rounded-full bg-white border-[3px] border-slate-900 shadow-sm z-10"></div>

      {/* Card */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all">
        {isEditing ? (
          <div className="p-4 space-y-3">
            <input 
              className="w-full font-bold text-lg text-slate-800 border-b border-slate-200 focus:outline-none focus:border-indigo-500 pb-1"
              value={editData.topic}
              onChange={e => setEditData({...editData, topic: e.target.value})}
              placeholder="Topic"
            />
            <textarea 
              className="w-full text-sm text-slate-600 border border-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500 min-h-[80px]"
              value={editData.description}
              onChange={e => setEditData({...editData, description: e.target.value})}
              placeholder="Description"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Key Discussion Points (one per line)</label>
                 <textarea
                   className="w-full text-sm text-slate-600 border border-slate-200 rounded p-2 focus:outline-none focus:border-indigo-500 min-h-[80px]"
                   value={editData.keyPoints?.join('\n') || ''}
                   onChange={e => setEditData({...editData, keyPoints: e.target.value.split('\n')})}
                   placeholder="• Review Q1 metrics&#10;• Discuss blocking issues"
                 />
              </div>
              <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase block mb-1">Expected Outcome</label>
                 <input
                   className="w-full text-sm text-slate-600 border-b border-slate-200 focus:outline-none focus:border-indigo-500 py-1"
                   value={editData.expectedOutcome || ''}
                   onChange={e => setEditData({...editData, expectedOutcome: e.target.value})}
                   placeholder="e.g., Approval of budget"
                 />
                 <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Duration (min)</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full text-sm border-b border-slate-200 focus:outline-none focus:border-indigo-500 py-1"
                      value={editData.durationMinutes}
                      onChange={e => setEditData({...editData, durationMinutes: parseInt(e.target.value) || 0})}
                    />
                 </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Assign Stakeholders</label>
              <div className="flex flex-wrap gap-2">
                {stakeholders.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => toggleSpeaker(s.id)}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
                      editData.speakerIds.includes(s.id) 
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                {stakeholders.length === 0 && <span className="text-xs text-slate-400 italic">No stakeholders available. Add some above.</span>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
               <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
               <button onClick={handleSave} className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-indigo-600 rounded">Save Changes</button>
            </div>
          </div>
        ) : (
          <div className="p-5 flex gap-4">
            <div 
              {...attributes} 
              {...listeners} 
              className={`text-slate-300 flex flex-col justify-center ${isDragDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:text-slate-500'}`}
            >
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-slate-800">{item.topic}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onRemove(item.id)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">
                {item.description}
              </p>
              
              {item.keyPoints && item.keyPoints.length > 0 && (
                <div className="mt-3 mb-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                    <List size={12} /> Key Points
                  </h4>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5 ml-1">
                    {item.keyPoints.map((point, idx) => (
                      point.trim() && <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.expectedOutcome && (
                <div className="mt-3 bg-green-50/50 p-2 rounded-lg border border-green-100 inline-block w-full">
                  <h4 className="text-xs font-semibold text-green-700 uppercase mb-1 flex items-center gap-1">
                    <Target size={12} /> Expected Outcome
                  </h4>
                  <p className="text-sm text-green-800">{item.expectedOutcome}</p>
                </div>
              )}
              
              {item.speakerIds && item.speakerIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-50">
                  {item.speakerIds.map(id => {
                    const speaker = stakeholders.find(s => s.id === id);
                    if (!speaker) return null;
                    return (
                      <div key={id} className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-100">
                        <User size={12} />
                        {speaker.name}
                        <span className="opacity-50 mx-0.5">|</span>
                        <span className="opacity-75 font-normal">{speaker.role}</span>
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
};

export const TimelineView: React.FC<TimelineViewProps> = ({ agenda, isLoading, onUpdateAgenda }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (agenda && over && active.id !== over.id) {
      const oldIndex = agenda.items.findIndex((item) => item.id === active.id);
      const newIndex = agenda.items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(agenda.items, oldIndex, newIndex);
      onUpdateAgenda({ ...agenda, items: newItems });
    }
  };

  const handleItemUpdate = (updatedItem: AgendaItem) => {
    if (!agenda) return;
    const newItems = agenda.items.map(item => item.id === updatedItem.id ? updatedItem : item);
    onUpdateAgenda({ ...agenda, items: newItems });
  };

  const handleItemRemove = (id: string) => {
    if (!agenda) return;
    const newItems = agenda.items.filter(item => item.id !== id);
    onUpdateAgenda({ ...agenda, items: newItems });
  };

  const handleStakeholderUpdate = (updatedStakeholder: Stakeholder) => {
    if (!agenda) return;
    const newStakeholders = agenda.stakeholders.map(s => s.id === updatedStakeholder.id ? updatedStakeholder : s);
    onUpdateAgenda({ ...agenda, stakeholders: newStakeholders });
  };

  const handleStakeholderAdd = () => {
    if (!agenda) return;
    const newStakeholder: Stakeholder = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Stakeholder",
      role: "Participant",
      contact: ""
    };
    onUpdateAgenda({ ...agenda, stakeholders: [...agenda.stakeholders, newStakeholder] });
  };

  const handleStakeholderRemove = (id: string) => {
    if (!agenda) return;
    const newStakeholders = agenda.stakeholders.filter(s => s.id !== id);
    const newItems = agenda.items.map(item => ({
      ...item,
      speakerIds: item.speakerIds.filter(sid => sid !== id)
    }));
    onUpdateAgenda({ ...agenda, stakeholders: newStakeholders, items: newItems });
  };
  
  const handleAddItem = () => {
     if (!agenda) return;
     const newItem: AgendaItem = {
         id: Math.random().toString(36).substr(2, 9),
         topic: "New Topic",
         description: "Description of the new topic",
         durationMinutes: 15,
         speakerIds: []
     };
     onUpdateAgenda({...agenda, items: [...agenda.items, newItem]});
  };

  // --- Export Handlers ---
  const handleExportPDF = () => {
    if (!agenda) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-900
    doc.text(agenda.title, 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${meetingDate} | Starts at ${agenda.startTime} | ${agenda.items.reduce((acc, i) => acc + i.durationMinutes, 0)} mins`, 14, 28);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const splitSummary = doc.splitTextToSize(agenda.summary, 180);
    doc.text(splitSummary, 14, 38);
    
    // Stakeholders
    let yPos = 38 + (splitSummary.length * 5) + 10;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Stakeholders", 14, yPos);
    
    const stakeholderRows = agenda.stakeholders.map(s => [s.name, s.role, s.contact]);
    autoTable(doc, {
        startY: yPos + 4,
        head: [['Name', 'Role', 'Contact']],
        body: stakeholderRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 }
    });
    
    // Agenda Items
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.text("Agenda Timeline", 14, finalY);
    
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
        let details = item.topic + "\n\n" + item.description;
        if (item.keyPoints && item.keyPoints.length > 0) {
            details += "\n\nKey Points:\n• " + item.keyPoints.join("\n• ");
        }
        if (item.expectedOutcome) {
            details += "\n\nOutcome: " + item.expectedOutcome;
        }

        return [start + ' - ' + end, details, item.durationMinutes + 'm', speakers];
    });

    autoTable(doc, {
        startY: finalY + 4,
        head: [['Time', 'Details', 'Dur', 'Speakers']],
        body: itemRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 15 },
            3: { cellWidth: 35 }
        }
    });

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

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-slate-50/50">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Crafting your agenda...</h2>
          <p className="text-slate-500">Reading the document, identifying stakeholders, and structuring the timeline.</p>
        </div>
      </div>
    );
  }

  if (!agenda) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50/50 p-8">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
          <Calendar size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">No Agenda Yet</h2>
        <p className="text-slate-500 max-w-sm text-center">Upload a document on the left to instantly generate a structured meeting plan.</p>
      </div>
    );
  }

  // Pre-calculate times for all items before filtering so timestamps remain accurate
  let tempTime = agenda.startTime;
  const itemsWithTimes = agenda.items.map(item => {
      const startTime = tempTime;
      tempTime = addMinutes(tempTime, item.durationMinutes);
      return { ...item, startTimeCalculated: startTime };
  });

  const totalDuration = agenda.items.reduce((acc, item) => acc + item.durationMinutes, 0);

  // Filter items based on search
  const isSearching = searchQuery.trim().length > 0;
  const filteredItems = isSearching 
    ? itemsWithTimes.filter(item => {
        const q = searchQuery.toLowerCase();
        return item.topic.toLowerCase().includes(q) || 
               item.description.toLowerCase().includes(q) ||
               item.keyPoints?.some(k => k.toLowerCase().includes(q)) ||
               item.expectedOutcome?.toLowerCase().includes(q);
      })
    : itemsWithTimes;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-50/30">
      <div className="max-w-5xl mx-auto p-3 sm:p-6 md:p-10 pb-32">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-10">
           <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-md shadow-slate-900/20 w-fit shrink-0">
                   <Clock size={12} />
                   {totalDuration} Minutes Total
                 </div>
                 
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                     {/* Search Bar */}
                     <div className="relative group flex-grow sm:flex-initial">
                         <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                         <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter topics..."
                            className="w-full sm:w-36 md:w-48 sm:focus:w-52 md:focus:w-60 transition-all pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
                         />
                         {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                <X size={12} />
                            </button>
                         )}
                     </div>
 
                     {/* Export Dropdown */}
                     <div className="relative">
                        <button 
                           onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                           className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                        >
                           <Share2 size={16} />
                           <span className="hidden min-[360px]:inline">Share</span>
                           <ChevronDown size={14} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isExportMenuOpen && (
                           <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                              <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                 <FileTextIcon size={16} className="text-red-500" /> Export as PDF
                              </button>
                              <button onClick={handleExportiCal} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                 <CalendarIcon size={16} className="text-blue-500" /> Export as iCal
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button onClick={handleShareEmail} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                 <Mail size={16} className="text-slate-500" /> Share via Email
                              </button>
                              <button onClick={handleCopyLink} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
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
              
              <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center gap-2 sm:gap-3">
                 <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                        <CalendarIcon size={12}/> Date
                    </span>
                    <input 
                      type="date" 
                      value={meetingDate} 
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none min-w-0 flex-1"
                    />
                 </div>
                 <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                        <Clock size={12}/> Start
                    </span>
                    <input 
                      type="time" 
                      value={agenda.startTime} 
                      onChange={(e) => onUpdateAgenda({...agenda, startTime: e.target.value})}
                      className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none min-w-0"
                    />
                 </div>
              </div>
           </div>

           {/* Stakeholders Panel */}
           <div className="xl:w-80 flex-shrink-0">
             <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <Users size={16} className="text-slate-500" />
                     <h3 className="font-bold text-slate-700 text-sm">Stakeholders</h3>
                   </div>
                   <button onClick={handleStakeholderAdd} className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                      <Plus size={14} />
                   </button>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                   {agenda.stakeholders.map(stakeholder => (
                     <StakeholderCard 
                       key={stakeholder.id} 
                       stakeholder={stakeholder} 
                       onUpdate={handleStakeholderUpdate} 
                       onDelete={handleStakeholderRemove}
                     />
                   ))}
                   {agenda.stakeholders.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No stakeholders yet.<br/>Click + to add.
                      </div>
                   )}
                </div>
             </div>
           </div>
        </div>

        {/* Timeline Section */}
        <div className="relative pl-4 md:pl-8">
          {/* Vertical Line */}
          <div className="absolute top-4 bottom-0 left-[35px] md:left-[51px] w-0.5 bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"></div>
          
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredItems.map(i => i.id)} 
              strategy={verticalListSortingStrategy}
            >
              {filteredItems.map((item) => (
                  <SortableAgendaItem 
                    key={item.id} 
                    item={item} 
                    startTime={item.startTimeCalculated}
                    stakeholders={agenda.stakeholders}
                    onUpdate={handleItemUpdate}
                    onRemove={handleItemRemove}
                    isDragDisabled={isSearching}
                  />
              ))}
              {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm">
                      No topics match your search.
                  </div>
              )}
            </SortableContext>
          </DndContext>
          
          {/* Add Item Button */}
          {!isSearching && (
              <div className="relative flex gap-8 pb-12">
                 <div className="w-16 flex-shrink-0"></div>
                 <div className="flex-1">
                    <button 
                      onClick={handleAddItem}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all font-medium text-sm group"
                    >
                       <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center">
                          <Plus size={14} />
                       </div>
                       Add Agenda Item
                    </button>
                 </div>
              </div>
          )}

          {/* End Node */}
          <div className="relative flex gap-8">
             <div className="flex flex-col items-center w-16 flex-shrink-0">
               <div className="text-sm font-bold text-slate-400">{tempTime}</div>
             </div>
             <div className="absolute left-[31px] md:left-[47px] top-[7px] w-2.5 h-2.5 rounded-full bg-slate-300"></div>
             <div className="text-xs font-medium text-slate-400 pt-1.5 pl-4">End of meeting</div>
          </div>
        </div>
      </div>
    </div>
  );
};