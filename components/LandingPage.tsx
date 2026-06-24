import React, { useState } from 'react';
import { 
  ArrowRight, Sparkles, Clock, Sliders, Star, Play, 
  CheckCircle, Calendar, Users, Check, Zap, ChevronDown, 
  Search, Menu, X, ArrowUpRight, BarChart3, HelpCircle, Mail
} from 'lucide-react';
const dashboardImg = "/src/assets/images/agenda_dashboard_1782247110640.jpg";
const collabImg = "/src/assets/images/meeting_collaboration_1782247125861.jpg";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoadPreset: (templateId: string) => void;
}

export function LandingPage({ onGetStarted, onLoadPreset }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPopularTab, setSelectedPopularTab] = useState('Productivity');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  const templates = [
    {
      id: 'scrum',
      title: 'Daily Agile Standup',
      subtitle: 'Engage & Align',
      desc: '15-minute quick alignment sync for modern development sprints. Tracks blocks and progress.',
      tag: 'Productivity'
    },
    {
      id: 'strategic',
      title: 'Strategic Sync',
      subtitle: 'Quarterly Planning',
      desc: 'Deep dive focus blueprint with vision checkpoints and core objective alignments.',
      tag: 'Strategy'
    },
    {
      id: 'pitch',
      title: 'Product Pitch & Review',
      subtitle: 'Pitch Deck Sync',
      desc: 'Customer success alignment, stakeholder feedback loops, and value-metric presentation.',
      tag: 'Sales'
    },
    {
      id: 'board',
      title: 'Board of Directors Advisory',
      subtitle: 'Governance & Alignment',
      desc: 'Formal timing layout for major advisory panels, voting blocks, and regulatory metrics.',
      tag: 'Governance'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 selection:bg-indigo-500 selection:text-white flex flex-col overflow-y-auto">
      
      {/* 1. HEADER SECTION */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Calendar size={17} className="text-white" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-950 block">Agenda Planner</span>
            <span className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase -mt-1 block">Digitronics</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
          <a href="#templates" className="hover:text-slate-950 transition-colors">Frameworks</a>
          <a href="#capabilities" className="hover:text-slate-950 transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-slate-950 transition-colors">Impact</a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onGetStarted}
            className="hidden sm:flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-indigo-600 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm select-none"
          >
            Open Planner
            <ArrowRight size={14} />
          </button>
          
          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-slate-950 transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[69px] z-40 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 shadow-lg animate-fade-in">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-600 hover:text-slate-950 py-1"
          >
            Features
          </a>
          <a 
            href="#templates" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-600 hover:text-slate-950 py-1"
          >
            Frameworks
          </a>
          <a 
            href="#capabilities" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-600 hover:text-slate-950 py-1"
          >
            How It Works
          </a>
          <a 
            href="#testimonials" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-600 hover:text-slate-950 py-1"
          >
            Impact
          </a>
          <button 
            onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
            className="w-full py-3 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Open Planner
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section className="relative px-6 sm:px-12 md:px-20 py-12 md:py-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left copy column */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={11} className="animate-pulse" />
            AI-Engineered Workspaces
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[56px] font-extrabold tracking-tight text-slate-950 leading-[1.1]">
            Discover the Perfect Flow of Every Meeting
          </h1>
          <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            Ditch loose minutes, unguided rants, and manual checklists. Import documents, synthesize highly strategic timelines in seconds, and run meeting checkpoints in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-indigo-600 hover:bg-slate-950 hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              Start Planning Free
              <ArrowRight size={14} />
            </button>
            <a 
              href="#templates"
              className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Explore Frameworks
            </a>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-bold text-slate-400 select-none">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              Instant Synthesis
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              Interactive timers
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />
              Zero config needed
            </div>
          </div>
        </div>

        {/* Right illustrative column - Beautiful mosaic layout exactly mimicking reference */}
        <div className="lg:col-span-7 relative flex justify-center items-center">
          <div className="w-full max-w-[580px] grid grid-cols-12 gap-4 items-center">
            {/* Primary Left Big Card */}
            <div className="col-span-7 rounded-[24px] overflow-hidden border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white p-2.5 hover:rotate-[-1deg] transition-transform duration-500 select-none">
              <img 
                src={dashboardImg} 
                alt="AI Meeting Agenda Cockpit" 
                className="w-full h-auto object-cover rounded-[18px]" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Side Cascading Small Cards */}
            <div className="col-span-5 flex flex-col gap-4">
              <div className="rounded-[20px] overflow-hidden border border-slate-200/60 shadow-md bg-white p-2 hover:translate-x-2 transition-transform duration-300 select-none">
                <img 
                  src={collabImg} 
                  alt="Team Collaborative Alignment illustration" 
                  className="w-full h-auto object-cover rounded-[14px]" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="bg-slate-950 text-white rounded-[20px] p-5 shadow-lg space-y-2 select-none hover:rotate-[1deg] transition-transform">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Zap size={15} className="text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-xs tracking-wider uppercase text-slate-200">AI Suggest Option</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Intelligently suggests next topic items matching participants, times, and agendas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROVEN FRAMEWORKS (Top Destinations equivalent) */}
      <section id="templates" className="bg-white py-16 md:py-24 border-y border-slate-100 select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">Featured Core Templates</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                Top Meeting Frameworks
              </h2>
            </div>
            
            {/* Custom dropdown matching Popular selectors in Reference UI */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Sort Category:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['Productivity', 'Strategy', 'Sales'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => setSelectedPopularTab(tag)}
                    className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                      selectedPopularTab === tag 
                        ? 'bg-white text-slate-950 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((tmpl) => (
              <div 
                key={tmpl.id} 
                className={`group border border-slate-200 hover:border-indigo-200 bg-[#f8fafc]/50 hover:bg-white rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                  selectedPopularTab === tmpl.tag ? 'ring-2 ring-indigo-500/10 bg-white border-indigo-100' : ''
                }`}
              >
                <div>
                  <span className="text-[9px] font-extrabold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-md inline-block mb-4">
                    {tmpl.subtitle}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {tmpl.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                    {tmpl.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Layout</span>
                  <button 
                    onClick={() => onLoadPreset(tmpl.id)}
                    className="w-8 h-8 rounded-full bg-slate-950 text-white hover:bg-indigo-600 flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover:scale-105"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2"
            >
              Explore all meeting presets
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. LATEST STORIES EQUIVALENT (Aesthetic Workflows & Core Capabilities) */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto w-full px-6 sm:px-12 md:px-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-2">Designed for High Performance</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Aesthetic Workflows & Core Capabilities
          </h2>
          <p className="text-slate-500 text-sm mt-3 font-semibold">
            Everything you need to formulate, structure, and direct professional meetings without the friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Large Highlight Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-[24px] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="rounded-xl overflow-hidden bg-slate-100 mb-6 border border-slate-200/40 select-none">
              <img 
                src={collabImg} 
                alt="Structured Meeting Timeline Display" 
                className="w-full h-auto object-cover max-h-[300px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block mb-1">Interactive Board</span>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Structured Timeline Navigation</h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
              The central meeting planner divides meeting segments visually. Adjust times dynamically, re-sequence blocks, assign individual participants, and write key target objectives per agenda topic item.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-[9px] font-extrabold tracking-wide text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase">Dynamic timing</span>
              <span className="text-[9px] font-extrabold tracking-wide text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase">Stakeholders mapping</span>
              <span className="text-[9px] font-extrabold tracking-wide text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase">Editable details</span>
            </div>
          </div>

          {/* Right Small List Section */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Feature Item 1 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 flex gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 select-none">
                <Sparkles size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">AI Co-pilot</h4>
                <h3 className="font-bold text-sm text-slate-950">AI suggestions of next agenda items</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Stuck on next steps? Let Gemini recommend relevant follow-up actions and topics based on current agenda content.
                </p>
              </div>
            </div>

            {/* Feature Item 2 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 flex gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 select-none">
                <Clock size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Timing engine</h4>
                <h3 className="font-bold text-sm text-slate-950">Real-time Clock & Progress Meters</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Track elapsed minutes visually. Complete topics in sequence with checkable task boxes and view overall session stats.
                </p>
              </div>
            </div>

            {/* Feature Item 3 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-5 flex gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 select-none">
                <Sliders size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">Workspace Synthesis</h4>
                <h3 className="font-bold text-sm text-slate-950">Detailed Document Synthesis</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Upload pitch decks, briefings, or CSVs. Our AI engine extracts and formulates beautiful, ready-to-run agendas immediately.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section id="testimonials" className="bg-slate-950 text-white py-16 md:py-24 select-none">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left review card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex gap-1 text-amber-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight leading-snug">
              "An Absolute Game Changer for Executive Alignments"
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed font-semibold">
              Before Agenda Co-Pilot, our corporate strategy reviews were chaotic, often exceeding deadlines by an hour. The real-time interactive checklist and calculated timelines forced our team to maintain strict alignment while the AI recommendations helped outline next steps.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold font-mono">
                MA
              </div>
              <div>
                <span className="text-sm font-bold block text-white">Maria Angelica</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chief Operating Officer, Horizon Tech</span>
              </div>
            </div>
          </div>

          {/* Right creative showcase layout mimicking video card in reference */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-8 hover:border-slate-700 transition-colors">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Real-time metric</span>
                <h4 className="text-3xl font-extrabold text-white">45%</h4>
                <p className="text-xs text-slate-400 font-semibold">
                  Average reduction in meeting spillover times reported by synchronized corporate divisions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <span>View studies</span>
                <ArrowRight size={13} />
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 p-6 flex flex-col justify-between space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Live interactive view</span>
                <h4 className="text-3xl font-extrabold text-white">12k+</h4>
                <p className="text-xs text-slate-400 font-semibold">
                  Meeting agendas compiled, structured, and customized dynamically by modern teams.
                </p>
              </div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
                <Play size={11} fill="currentColor" />
                <span>See demo preview</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. CALL TO ACTION & NEWSLETTER BANNER */}
      <section className="bg-slate-100 py-16 px-6 sm:px-12 md:px-20 text-center select-none border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">
            Get Premium Agenda Planning Straight to Your Workspace
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Subscribe to our weekly productivity digests for exclusive framework layouts, AI prompting guides, and modern team alignment strategies.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your professional email"
              className="flex-grow px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-slate-950 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-4 inline-block animate-fade-in">
              ✓ Successfully subscribed! Check your inbox for our productivity starters.
            </div>
          )}

          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            NO CREDIT CARD REQUIRED • SECURE TRANSFERS WITH GEMINI
          </p>
        </div>
      </section>

      {/* 7. FOOTER SECTION */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 px-6 sm:px-12 md:px-20 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">
                A
              </div>
              <span className="text-base font-black text-white tracking-tight">Agenda Planner</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
              Automated high-fidelity planning dashboards designed for high-performing teams, scrums, and corporate governance.
            </p>
            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              © 2026 Digitronics Group Ltd.
            </div>
          </div>

          {/* Quick links Col 1 */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">About Us</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Product Roadmap</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Workspace Integration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Custom Consulting</a></li>
            </ul>
          </div>

          {/* Quick links Col 2 */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Core Frameworks</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><button onClick={() => onLoadPreset('scrum')} className="text-left hover:text-white transition-colors">Daily Scrums</button></li>
              <li><button onClick={() => onLoadPreset('strategic')} className="text-left hover:text-white transition-colors">Strategic Planning</button></li>
              <li><button onClick={() => onLoadPreset('pitch')} className="text-left hover:text-white transition-colors">Product Reviews</button></li>
              <li><button onClick={() => onLoadPreset('board')} className="text-left hover:text-white transition-colors">Advisory Synclists</button></li>
            </ul>
          </div>

          {/* Quick links Col 3 */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Security & Legal</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Work</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Keys Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Rate Limiting details</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 text-center">
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
            Built by <span className="text-slate-400">Digitronics</span> • Designed by <span className="text-slate-400">Kennedy Mtega</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
