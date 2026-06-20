import React from 'react';
import { History, Calendar, Trash2, Clock, Users, CheckCircle, Eye, Sparkles } from 'lucide-react';
import { MeetingAgenda } from '../types';

interface AgendaHistoryProps {
  agendas: { id: string; agenda: MeetingAgenda; timestamp: Date; templateId: string }[];
  activeAgendaId: string | null;
  onSelectAgenda: (id: string) => void;
  onDeleteAgenda: (id: string) => void;
  onSwitchToCreate: () => void;
}

export const AgendaHistory: React.FC<AgendaHistoryProps> = ({
  agendas,
  activeAgendaId,
  onSelectAgenda,
  onDeleteAgenda,
  onSwitchToCreate
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 min-w-0">
      <div className="flex-1 overflow-y-auto p-4">
        {agendas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white border border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
              <History size={20} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Agendas Generated</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
              You haven't generated any agendas yet. Let's create your first meeting structure!
            </p>
            <button
              onClick={onSwitchToCreate}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Start Generating
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {agendas.map(({ id, agenda, timestamp, templateId }) => {
              const isActive = activeAgendaId === id;
              const totalDuration = agenda.items.reduce((acc, curr) => acc + curr.durationMinutes, 0);
              
              return (
                <div 
                  key={id}
                  onClick={() => onSelectAgenda(id)}
                  className={`bg-white border rounded-xl p-3.5 relative group transition-all duration-200 cursor-pointer shadow-sm ${
                    isActive 
                      ? 'border-indigo-500 ring-1 ring-indigo-100' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 pr-6">
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {agenda.title}
                    </h3>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAgenda(id);
                      }}
                      className="absolute right-3 top-3.5 text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete Agenda"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-slate-500 text-xs line-clamp-2 mb-3.5">
                    {agenda.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Clock size={11} className="text-slate-400" />
                      <span>{totalDuration} mins</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Users size={11} className="text-slate-400" />
                      <span>{agenda.stakeholders.length} speakers</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 ml-auto">
                      <span className="capitalize px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md">
                        {templateId === 'auto' ? 'AI Auto' : templateId}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute top-3.5 right-3 text-indigo-600 flex items-center gap-1 text-[10px] font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md self-start border border-indigo-100">
                      <CheckCircle size={10} /> Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
