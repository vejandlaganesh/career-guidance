import React, { useState } from "react";
import { STREAMS, getCareer, CompiledCareer } from "../data";
import { 
  Search, Compass, BookOpen, Sparkles, ChevronRight, X, Printer, 
  Calendar, Award, GraduationCap, Lightbulb, MessageSquare, 
  ArrowRight, CheckCircle, TrendingUp, HelpCircle
} from "lucide-react";

interface StreamExplorerProps {
  onOpenCareer: (id: string) => void;
  onOpenAiGuide?: (prompt?: string) => void;
}

export default function StreamExplorer({ onOpenCareer, onOpenAiGuide }: StreamExplorerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"academics" | "admissions" | "careers">("academics");

  // Stream filter mapping
  const streams = Object.values(STREAMS).filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.full.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (selectedCategory === "all") return true;
    if (selectedCategory === "science") return ["mpc", "bipc", "emerging", "pcmb"].includes(s.key);
    if (selectedCategory === "business") return ["mec", "arts", "cec"].includes(s.key);
    if (selectedCategory === "alternate") return ["diploma", "govt"].includes(s.key);
    return true;
  });

  const activeStream = selectedStream ? STREAMS[selectedStream] : null;

  // Stream badge name helper
  const getStreamBadge = (key: string) => {
    const badges: Record<string, string> = {
      mpc: "Engineering & Applied Math",
      bipc: "Medicine & Life Sciences",
      mec: "Finance, Actuarial & Commerce",
      arts: "Humanities & Liberal Arts",
      diploma: "Technical Vocational Skills",
      govt: "Civil Admin & Defense",
      emerging: "Advanced AI & Quantum Computing",
      pcmb: "Double-Science Track",
      cec: "Public Admin & Commercial Scope"
    };
    return badges[key] || "Academic Path";
  };

  // Metric ratings helper
  const getStreamMetrics = (key: string) => {
    const metrics: Record<string, { opportunity: number; preparation: string; stress: string }> = {
      mpc: { opportunity: 95, preparation: "Very High", stress: "High" },
      bipc: { opportunity: 92, preparation: "Extreme", stress: "Very High" },
      mec: { opportunity: 88, preparation: "Medium", stress: "Moderate" },
      arts: { opportunity: 80, preparation: "Medium", stress: "Low" },
      diploma: { opportunity: 85, preparation: "Low", stress: "Low" },
      govt: { opportunity: 90, preparation: "Extreme", stress: "Very High" },
      emerging: { opportunity: 98, preparation: "High", stress: "Moderate" },
      pcmb: { opportunity: 97, preparation: "Extreme", stress: "Extreme" },
      cec: { opportunity: 87, preparation: "Medium", stress: "Moderate" }
    };
    return metrics[key] || { opportunity: 80, preparation: "Medium", stress: "Moderate" };
  };

  // Stream gradient color helper
  const getGradient = (key: string) => {
    const grads: Record<string, string> = {
      mpc: "from-indigo-600 to-violet-700",
      bipc: "from-emerald-600 to-teal-700",
      mec: "from-blue-600 to-cyan-700",
      arts: "from-purple-600 to-pink-700",
      diploma: "from-amber-500 to-orange-600",
      govt: "from-slate-700 to-slate-900",
      emerging: "from-cyan-500 to-indigo-600",
      pcmb: "from-teal-600 to-indigo-700",
      cec: "from-rose-600 to-amber-700"
    };
    return grads[key] || "from-slate-600 to-slate-800";
  };

  const handlePrint = (key: string) => {
    const s = STREAMS[key];
    if (!s) return;

    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const careers = s.career_ids.map(id => getCareer(id)?.title).filter(Boolean).join(", ");

    printWin.document.write(`
      <html>
        <head>
          <title>${s.name} - Study & Career Guide</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
            .subtitle { font-size: 1.1em; color: #64748b; font-style: italic; margin-bottom: 30px; }
            h2 { color: #0f172a; margin-top: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>${s.name} — ${s.full}</h1>
          <p class="subtitle">${s.tagline}</p>
          <p>${s.description}</p>
          
          <h2>Undergraduate Courses (UG)</h2>
          <ul>${s.ug_courses.map(c => `<li>${c}</li>`).join("")}</ul>
          
          <h2>Higher Studies Options</h2>
          <ul>${s.higher_studies.map(c => `<li>${c}</li>`).join("")}</ul>
          
          <h2>Target Entrance Exams</h2>
          <ul>${s.exams.map(e => `<li>${e}</li>`).join("")}</ul>
          
          <h2>Top Target Colleges</h2>
          <ul>${s.colleges.map(c => `<li>${c}</li>`).join("")}</ul>
          
          <h2>Essential Core Skills</h2>
          <ul>${s.skills.map(sk => `<li>${sk}</li>`).join("")}</ul>
          
          <h2>Indicative Careers</h2>
          <p>${careers}</p>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const handleAiCounselBridge = () => {
    if (!activeStream || !onOpenAiGuide) return;
    const promptText = `I am researching the "${activeStream.name}" educational stream (${activeStream.full}). Please provide an advanced customized roadmap. Cover: 
1. Key elective combinations in High School.
2. An optimal preparation calendar for ${activeStream.exams[0] || "its core entrance exams"}.
3. The most secure alternative degrees to safeguard against admission bottlenecks.
4. Future corporate sectors and modern roles that are expected to surge over the next decade.`;
    
    setSelectedStream(null);
    onOpenAiGuide(promptText);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Visual Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Curriculum Navigator
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">Explore Educational Streams</h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Analyze mainstream educational paths like MPC, BiPC, commerce, and advanced vocational tracks. Track key entrance exams, target universities, and course checklists.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search streams, courses..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Category Selection Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${selectedCategory === "all" ? "bg-indigo-600 text-white shadow-indigo-100" : "bg-white text-slate-500 border border-slate-200/60 hover:text-slate-800"}`}
        >
          🌌 All Pathways
        </button>
        <button
          onClick={() => setSelectedCategory("science")}
          className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${selectedCategory === "science" ? "bg-emerald-600 text-white shadow-emerald-100" : "bg-white text-slate-500 border border-slate-200/60 hover:text-slate-800"}`}
        >
          🧪 Science & Tech (MPC/BiPC)
        </button>
        <button
          onClick={() => setSelectedCategory("business")}
          className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${selectedCategory === "business" ? "bg-blue-600 text-white shadow-blue-100" : "bg-white text-slate-500 border border-slate-200/60 hover:text-slate-800"}`}
        >
          📈 Commerce, Business & Humanities
        </button>
        <button
          onClick={() => setSelectedCategory("alternate")}
          className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${selectedCategory === "alternate" ? "bg-slate-800 text-white shadow-slate-200" : "bg-white text-slate-500 border border-slate-200/60 hover:text-slate-800"}`}
        >
          🛠️ Vocational & Public Sector
        </button>
      </div>

      {/* Streams Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((s) => {
          const grad = getGradient(s.key);
          const metrics = getStreamMetrics(s.key);
          return (
            <div
              key={s.key}
              onClick={() => {
                setSelectedStream(s.key);
                setModalTab("academics");
              }}
              className="group relative bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between gap-6 cursor-pointer hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-200/50 transform hover:-translate-y-1 transition-all"
            >
              <div className="space-y-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${grad} text-white flex items-center justify-center font-bold shadow-md`}>
                    <BookOpen className="w-5.5 h-5.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {getStreamBadge(s.key).split(" ")[0]}
                  </span>
                </div>

                {/* Stream Titles */}
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">
                    {getStreamBadge(s.key)}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-950 group-hover:text-indigo-600 transition-colors leading-tight">
                    {s.name}
                  </h3>
                  <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                    {s.full}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {s.description}
                </p>

                {/* Key Course Preview List */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Typical UG Specialty</span>
                  <div className="flex flex-wrap gap-1.5">
                    {s.ug_courses.slice(0, 2).map((course, idx) => (
                      <span key={idx} className="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-150 truncate max-w-full">
                        {course.split(" ")[0]} {course.split(" ").slice(1, 3).join(" ")}
                      </span>
                    ))}
                    {s.ug_courses.length > 2 && (
                      <span className="text-[10px] font-bold bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-150">
                        +{s.ug_courses.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Opportunity Score Indicator */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">Opportunity Index</span>
                    <span className="text-indigo-600 font-mono">{metrics.opportunity}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500" 
                      style={{ width: `${metrics.opportunity}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg">
                  {s.career_count} Careers
                </span>
                <span className="text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Analyze Pathway
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}

        {streams.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-3xl p-10 bg-white">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <span className="font-bold block text-slate-700 text-base">No educational pathways match your query</span>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Try typing a different subject keyword, or clear your search to explore all available Indian educational streams.</p>
          </div>
        )}
      </div>

      {/* Stream Detail Modal */}
      {activeStream && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedStream(null)}></div>
          
          <div className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-100 shadow-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 z-10 space-y-6 animate-in fade-in zoom-in-95 duration-250">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedStream(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-150/50 p-1.5 rounded-full transition-all" 
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center border-b border-slate-100 pb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getGradient(activeStream.key)} text-white flex items-center justify-center font-bold shadow-md`}>
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{activeStream.full}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">
                    Opportunity Ratio: {getStreamMetrics(activeStream.key).opportunity}%
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">{activeStream.name}</h2>
                <p className="text-sm text-slate-500 italic leading-relaxed">
                  "{activeStream.tagline}"
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto self-stretch sm:self-center">
                <button
                  onClick={() => handlePrint(activeStream.key)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-100 flex items-center justify-center gap-1.5 transition-all bg-white"
                >
                  <Printer className="w-4 h-4" />
                  Print Guide
                </button>
              </div>
            </div>

            {/* Split Content Layout */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (1/3 Weight) - Milestones Academic Timeline */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Academic Milestones
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-normal">
                      The recommended developmental timeline for {activeStream.name} students in the Indian curriculum.
                    </p>
                  </div>

                  <div className="relative border-l-2 border-slate-200 pl-4 ml-2 space-y-5 py-2">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50" />
                      <span className="block text-[10px] font-bold text-indigo-600 uppercase">Step 1 • Class 10 Transition</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">Stream Pick</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Secure core subject registration (Math/Sci/Comm) to satisfy tertiary pre-requisites.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-4 ring-indigo-50" />
                      <span className="block text-[10px] font-bold text-indigo-600 uppercase">Step 2 • Class 11 & 12 Prep</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">Target Coaching & Syllabus</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Master NCERT/Boards syllabus while reinforcing critical analytical skills.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50" />
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase">Step 3 • National Admissions</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">Entrance Exams</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Attempt {activeStream.exams[0] || "exams"} to unlock admission into premier institutes.</p>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      <div className="absolute -left-[23px] top-0 w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-4 ring-amber-50" />
                      <span className="block text-[10px] font-bold text-amber-600 uppercase">Step 4 • Specialization</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5">Undergraduate Degree</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">Select specialized degrees like {activeStream.ug_courses[0] || "UG options"}.</p>
                    </div>
                  </div>
                </div>

                {/* AI Counselor Quick Bridge */}
                {onOpenAiGuide && (
                  <div className="bg-gradient-to-tr from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Need a Personal Strategy?</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-normal mt-0.5">Generate a study roadmap, subject selection, and prep schedule customized by AI.</p>
                      </div>
                    </div>
                    <button
                      onClick={handleAiCounselBridge}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 transition-all group"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI Counselor about this Stream
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column (2/3 Weight) - Tabbed Stream Specs */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Segmented Tab Controls */}
                <div className="flex border-b border-slate-100 gap-6">
                  <button
                    onClick={() => setModalTab("academics")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${modalTab === "academics" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    📚 Academics & Degrees
                  </button>
                  <button
                    onClick={() => setModalTab("admissions")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${modalTab === "admissions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    🎯 Admission & Colleges
                  </button>
                  <button
                    onClick={() => setModalTab("careers")}
                    className={`pb-3 text-sm font-bold border-b-2 transition-all ${modalTab === "careers" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    💼 Associated Careers ({activeStream.career_count})
                  </button>
                </div>

                {/* Tab 1: Academics & Degrees */}
                {modalTab === "academics" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description Summary</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {activeStream.description}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                          Undergraduate Courses (UG)
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-slate-500">
                          {activeStream.ug_courses.map((course) => (
                            <li key={course} className="flex items-start gap-2.5">
                              <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-none" />
                              <span className="text-slate-700 leading-tight">{course}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          Postgrad Options
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-slate-500">
                          {activeStream.higher_studies.map((hs) => (
                            <li key={hs} className="flex items-start gap-2.5">
                              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-none" />
                              <span className="text-slate-700 leading-tight">{hs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Prerequisite Core Subject Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeStream.skills.map((skill) => (
                          <span key={skill} className="text-xs font-bold bg-white border border-slate-150 text-slate-700 px-3 py-1 rounded-xl shadow-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Admission & Colleges */}
                {modalTab === "admissions" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                          Main Entrance Exams
                        </h4>
                        <div className="space-y-2.5">
                          {activeStream.exams.map((exam) => (
                            <div key={exam} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                              <span className="text-xs font-extrabold text-slate-800 block leading-tight">{exam}</span>
                              <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block uppercase bg-slate-200/40 px-1.5 py-0.5 rounded">
                                National/State Level
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
                        <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          Elite Indian Universities
                        </h4>
                        <div className="space-y-2.5">
                          {activeStream.colleges.map((col) => (
                            <div key={col} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center text-[10px] font-bold flex-none">
                                G1
                              </div>
                              <span className="text-xs font-bold text-slate-700 leading-tight">{col}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Associated Careers */}
                {modalTab === "careers" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Indicative High-Compatibility Careers</span>
                      <span className="text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-3 py-1 rounded-xl">
                        {activeStream.career_count} Professions
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeStream.career_ids.map((id) => {
                        const career = getCareer(id);
                        if (!career) return null;
                        return (
                          <div
                            key={id}
                            onClick={() => {
                              setSelectedStream(null);
                              onOpenCareer(id);
                            }}
                            className="p-4 bg-white border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 rounded-2xl transition-all cursor-pointer flex justify-between items-center group"
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-extrabold text-slate-950 block leading-tight">{career.title}</span>
                              <div className="flex gap-2 items-center">
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-1.5 py-0.5 rounded">
                                  ₹{career.salary[0]}L - ₹{career.salary[1]}L /yr
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded">
                                  {career.growth}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
