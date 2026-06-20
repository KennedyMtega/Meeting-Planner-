import React from 'react';
import { LayoutTemplate, Play, Info, CheckCircle2, ChevronRight, Clock, Target } from 'lucide-react';
import { MEETING_TEMPLATES, MeetingTemplate } from '../types';

interface TemplatesExplorerProps {
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onLoadTemplate: (id: string) => void;
}

const TEMPLATE_DETAILS: Record<string, {
  timeline: { step: string; pct: number; focus: string }[];
  tips: string[];
  audience: string;
}> = {
  auto: {
    timeline: [
      { step: "Dynamic Structuring", pct: 100, focus: "Custom tailored to uploaded source document context" }
    ],
    tips: ["Upload transcripts or briefs for exact dynamic allocation.", "AI will balance the topics based on depth."],
    audience: "Any general team or sync"
  },
  standup: {
    timeline: [
      { step: "Opening Sync", pct: 15, focus: "Check overall mood & attendance" },
      { step: "Individual Updates", pct: 60, focus: "What I did, what I'm doing, blockers" },
      { step: "Blocker Parking Lot", pct: 25, focus: "Take offline deeper technical discussions" }
    ],
    tips: ["Keep it under 15 minutes strict.", "Speak standing up or on camera to maintain pace."],
    audience: "Engineering & Agile Product Teams"
  },
  sprint: {
    timeline: [
      { step: "Capacity & Goals Review", pct: 15, focus: "Define core sprint milestone metrics" },
      { step: "Backlog Grooming", pct: 50, focus: "Estimate and prioritize user stories" },
      { step: "Task Commitments", pct: 25, focus: "Team members volunteer and allocate" },
      { step: "Risks & Alignment", pct: 10, focus: "Check dependency issues before start" }
    ],
    tips: ["Pre-estimate stories offline before meeting.", "Keep details high level; write definitions in tickets."],
    audience: "Developers, Designers, and Product Managers"
  },
  board: {
    timeline: [
      { step: "Performance & Financial Review", pct: 30, focus: "Look at trailing metrics vs budget" },
      { step: "Strategic Deep-Dives", pct: 40, focus: "Focus on top 2 critical bottleneck questions" },
      { step: "Formal Approvals & Votes", pct: 20, focus: "Approve minutes, stock options, plans" },
      { step: "Executive Feedback", pct: 10, focus: "Align board notes and consensus" }
    ],
    tips: ["Send all reading slides 3 days beforehand.", "Do not read slides; assume everyone read them."],
    audience: "Executives, Founders, Board Directors"
  },
  sales: {
    timeline: [
      { step: "Context & Problem Definition", pct: 20, focus: "Understand customer pain-points" },
      { step: "Value Proposition", pct: 20, focus: "Map solutions to identified pains" },
      { step: "Live Product Tour", pct: 30, focus: "Show critical 3 high-impact features" },
      { step: "Pricing & Integration", pct: 15, focus: "Answer licensing and launch times" },
      { step: "Closing & Next Commitments", pct: 15, focus: "Book follow-up scoping session" }
    ],
    tips: ["Listen 70% of the time, speak 30%.", "Record session to note key client phrases."],
    audience: "Account Executives & Prospects"
  },
  retro: {
    timeline: [
      { step: "Vibe Check & Warmup", pct: 10, focus: "Create safe environment for transparency" },
      { step: "Data Review", pct: 20, focus: "Identify what went well and what went poorly" },
      { step: "Brainstorm Alternatives", pct: 40, focus: "Group and vote on recurring friction points" },
      { step: "Actionable Resolutions", pct: 30, focus: "Assign 2-3 specific process improvements" }
    ],
    tips: ["Focus on system processes, never personal blame.", "Keep tickets moving to avoid post-retro staleness."],
    audience: "Entire Engineering & Project squad"
  },
  kickoff: {
    timeline: [
      { step: "Vision Positioning", pct: 25, focus: "Why are we building this and why now" },
      { step: "Role Responsibilities", pct: 20, focus: "Who owns what delivery milestone" },
      { step: "Timeline & Milestones", pct: 25, focus: "Review project Gantt & sandboxes" },
      { step: "Risk Pre-Mortem", pct: 20, focus: "Predict what will fail and mitigate early" },
      { step: "QA/Questions", pct: 10, focus: "Address team uncertainty" }
    ],
    tips: ["Get everyone excited; establish team identity.", "Write a shared Wiki page during the call."],
    audience: "Cross-functional Project squads"
  },
  status: {
    timeline: [
      { step: "Milestone Scorecard", pct: 20, focus: "Review progress gauges against timeline" },
      { step: "Section Red Flags", pct: 50, focus: "Deep-dive exclusively into status blocks" },
      { step: "Resource Adjustments", pct: 20, focus: "Reallocate developers or scope" },
      { step: "Next Checkpoint Specs", pct: 10, focus: "Confirm next deliverable window" }
    ],
    tips: ["Skip sections that are perfectly on track.", "Don't let single status updates exceed 2 mins."],
    audience: "PMs and Stream Leads"
  },
  brainstorm: {
    timeline: [
      { step: "Problem Frame Spec", pct: 15, focus: "Narrow down scope of brainstorm" },
      { step: "Silent Ideation Outbreak", pct: 35, focus: "Everyone sticky-notes suggestions individually" },
      { step: "Affinity Clustering", pct: 25, focus: "Group notes by common theme/direction" },
      { step: "Voting & Priority Matrix", pct: 25, focus: "Vote on impact vs difficulty axis" }
    ],
    tips: ["Defer judgement entirely during ideation.", "Quantity breeds quality; go for volume first."],
    audience: "Product, Innovation, & Creative teams"
  }
};

export const TemplatesExplorer: React.FC<TemplatesExplorerProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  onLoadTemplate
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 min-w-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {MEETING_TEMPLATES.map((tpl) => {
          const detail = TEMPLATE_DETAILS[tpl.id] || TEMPLATE_DETAILS.auto;
          const isSelected = selectedTemplateId === tpl.id;

          return (
            <div 
              key={tpl.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 shadow-sm ${
                isSelected 
                  ? 'border-indigo-500 ring-1 ring-indigo-100' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Box */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                    {tpl.name}
                    {isSelected && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                        Selected
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{tpl.description}</p>
                </div>
                
                <button
                  onClick={() => onLoadTemplate(tpl.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
                      : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200'
                  }`}
                  title="Load template parameters to start building"
                >
                  <Play size={10} fill="currentColor" />
                  Apply
                </button>
              </div>

              {/* Sub Details Content */}
              <div className="p-4 space-y-3 bg-slate-50/50">
                {/* Structural Steps Progress Segment */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock size={11} /> Recommended Time Allocation
                  </p>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    {detail.timeline.map((step, idx) => {
                      const colors = [
                        'bg-indigo-500', 'bg-sky-500', 'bg-violet-500', 
                        'bg-blue-500', 'bg-pink-500'
                      ];
                      return (
                        <div 
                          key={idx} 
                          style={{ width: `${step.pct}%` }} 
                          className={`${colors[idx % colors.length]} h-full transition-all`}
                          title={`${step.step}: ${step.pct}%`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Detailed Step List */}
                  <div className="mt-2.5 space-y-2">
                    {detail.timeline.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-xs text-slate-600 leading-tight">
                        <span className="w-8 shrink-0 font-bold text-slate-400 text-right">{step.pct}%</span>
                        <div className="flex-1">
                          <span className="font-semibold text-slate-800">{step.step}</span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">{step.focus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best For Audit */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Target size={11} className="text-slate-400 shrink-0" />
                  <span><strong>Ideal Audience:</strong> {detail.audience}</span>
                </div>

                {/* Hot Pro-Tips bullets */}
                <div className="bg-indigo-50/40 rounded-lg p-2.5 border border-indigo-100/50">
                  <p className="text-[10px] font-bold text-indigo-800 flex items-center gap-1 mb-1">
                    <Info size={11} /> Pro-Tip
                  </p>
                  <ul className="list-disc pl-3.5 space-y-0.5 text-[11px] text-indigo-900/80">
                    {detail.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
