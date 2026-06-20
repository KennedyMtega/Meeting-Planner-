import React from 'react';
import { BarChart3, AlertCircle, Clock, ShieldAlert, BadgeCheck, Users, HelpCircle, Flame, Hourglass } from 'lucide-react';
import { MeetingAgenda } from '../types';

interface AgendaAnalyticsProps {
  agenda: MeetingAgenda | null;
  onSwitchToCreate: () => void;
}

export const AgendaAnalytics: React.FC<AgendaAnalyticsProps> = ({
  agenda,
  onSwitchToCreate
}) => {
  if (!agenda) {
    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50 min-w-0">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 border border-slate-100">
            <BarChart3 size={20} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Analytics Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
            Generate or open an agenda first to view detailed structural analysis.
          </p>
          <button
            onClick={onSwitchToCreate}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Create Agenda
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalDuration = agenda.items.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const averageItemDuration = agenda.items.length > 0 
    ? Math.round(totalDuration / agenda.items.length) 
    : 0;

  // Speaker times
  const speakerTimeMap: Record<string, number> = {};
  
  // Find Speaker Names
  const getSpeakerName = (id: string) => {
    const sh = agenda.stakeholders.find(s => s.id === id);
    return sh ? sh.name : id;
  };

  agenda.items.forEach(item => {
    if (item.speakerIds && item.speakerIds.length > 0) {
      // Divide duration evenly among speakers of the item
      const share = item.durationMinutes / item.speakerIds.length;
      item.speakerIds.forEach(id => {
        speakerTimeMap[id] = (speakerTimeMap[id] || 0) + share;
      });
    } else {
      speakerTimeMap["Unassigned"] = (speakerTimeMap["Unassigned"] || 0) + item.durationMinutes;
    }
  });

  const speakerStats = Object.entries(speakerTimeMap)
    .map(([id, mins]) => ({
      name: id === "Unassigned" ? "Unassigned" : getSpeakerName(id),
      mins: Math.round(mins),
      percentage: Math.round((mins / totalDuration) * 100)
    }))
    .sort((a, b) => b.mins - a.mins);

  // Health Audit Checklist
  interface AuditRule {
    name: string;
    description: string;
    passed: boolean;
    severity: 'success' | 'warn' | 'error';
    feedback: string;
  }

  const auditRules: AuditRule[] = [
    {
      name: "Timebox Viability",
      description: "Checks if total meeting duration is highly exhausting",
      passed: totalDuration <= 60,
      severity: totalDuration <= 60 ? 'success' : (totalDuration <= 90 ? 'warn' : 'error'),
      feedback: totalDuration <= 60 
        ? "Excellent! Under 60 mins keeps audience attention fresh." 
        : `Meeting is ${totalDuration} mins. Consider splitting or embedding short stretch breaks.`
    },
    {
      name: "Interaction Density",
      description: "Evaluates if agenda includes multiple active participants",
      passed: agenda.stakeholders.length >= 2,
      severity: agenda.stakeholders.length >= 2 ? 'success' : 'warn',
      feedback: agenda.stakeholders.length >= 2 
        ? `Great! ${agenda.stakeholders.length} speakers promote robust alignment.` 
        : "Only 1 speaker. This risks becoming an informational lecture instead of a workshop."
    },
    {
      name: "Item Focus Limit",
      description: "Average duration should not exceed 25 minutes per topic",
      passed: averageItemDuration <= 25,
      severity: averageItemDuration <= 20 ? 'success' : (averageItemDuration <= 30 ? 'warn' : 'error'),
      feedback: averageItemDuration <= 25 
        ? "Perfect chunk sizing. Items are well-scoped for high focus." 
        : `Topics average ${averageItemDuration}m. We recommend breaking them into modular sub-topics.`
    },
    {
      name: "Commitment Clarity",
      description: "Looks for expected outcomes or items mapping defined goals",
      passed: agenda.items.filter(i => !!i.expectedOutcome).length >= (agenda.items.length * 0.75),
      severity: agenda.items.filter(i => !!i.expectedOutcome).length >= (agenda.items.length * 0.75) ? 'success' : 'warn',
      feedback: agenda.items.filter(i => !!i.expectedOutcome).length >= (agenda.items.length * 0.75)
        ? "Great clarity! Almost all topics contain an expected tangible outcome."
        : "Some items lack expected outcomes. Add explicitly defined closures to avoid open-ended loops."
    }
  ];

  // Topic classification
  const getTopicTypeRatio = () => {
    let alignmentNum = 0;
    let strategyNum = 0;
    let collabNum = 0;

    agenda.items.forEach(item => {
      const text = (item.topic + " " + item.description).toLowerCase();
      if (text.includes("intro") || text.includes("outro") || text.includes("kickoff") || text.includes("open") || text.includes("welcome") || text.includes("wrap") || text.includes("closing") || text.includes("status")) {
        alignmentNum += item.durationMinutes;
      } else if (text.includes("brainstorm") || text.includes("idea") || text.includes("priorit") || text.includes("vote") || text.includes("workshop") || text.includes("discuss")) {
        collabNum += item.durationMinutes;
      } else {
        strategyNum += item.durationMinutes;
      }
    });

    const alignPct = Math.round((alignmentNum / totalDuration) * 100) || 0;
    const collabPct = Math.round((collabNum / totalDuration) * 100) || 0;
    const stratPct = 100 - alignPct - collabPct;

    return { alignPct, collabPct, stratPct };
  };

  const { alignPct, collabPct, stratPct } = getTopicTypeRatio();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 min-w-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Hourglass size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Duration</p>
              <p className="text-sm font-bold text-slate-800">{totalDuration}m</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 shrink-0">
              <Flame size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Topic Count</p>
              <p className="text-sm font-bold text-slate-800">{agenda.items.length} segments</p>
            </div>
          </div>
        </div>

        {/* Dynamic Categorization */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Category Balance</h3>
          
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${alignPct}%` }} className="bg-sky-400 h-full" title={`Alignment: ${alignPct}%`} />
            <div style={{ width: `${collabPct}%` }} className="bg-indigo-500 h-full" title={`Collaboration: ${collabPct}%`} />
            <div style={{ width: `${stratPct}%` }} className="bg-emerald-500 h-full" title={`Strategy: ${stratPct}%`} />
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>Alignment ({alignPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Creative ({collabPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Execution ({stratPct}%)</span>
            </div>
          </div>
        </div>

        {/* Health Checklist Auditing */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Meeting Health Index</h3>
          
          <div className="space-y-3">
            {auditRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2.5 items-start">
                {rule.severity === 'success' && (
                  <BadgeCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                )}
                {rule.severity === 'warn' && (
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                )}
                {rule.severity === 'error' && (
                  <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                )}

                <div className="text-xs">
                  <p className="font-bold text-slate-800">{rule.name}</p>
                  <p className="text-[11px] text-slate-500">{rule.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speaker Speaking Time Balance */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
            <span>Speaker Air-time</span>
            <span className="text-[9px] lowercase text-slate-400 font-normal">calculated by allocation</span>
          </h3>

          <div className="space-y-2.5">
            {speakerStats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No speakers listed.</p>
            ) : (
              speakerStats.map((sp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[120px]">{sp.name}</span>
                    <span className="font-bold text-slate-500">{sp.mins}m ({sp.percentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${sp.percentage}%` }} className="bg-indigo-500 h-full rounded-full" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
