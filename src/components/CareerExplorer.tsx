import React, { useState, useEffect } from "react";
import { allCareers, CATEGORY_LABELS, WORK_TYPE_LABELS, STREAMS, TAG_LABELS, getCareer, CompiledCareer } from "../data";
import { Search, SlidersHorizontal, BarChart3, Grid, Bookmark, RefreshCw, X, HelpCircle, CheckSquare, Sparkles, Printer, Share2 } from "lucide-react";
import { User } from "../types";

interface CareerExplorerProps {
  user: User | null;
  savedCareers: string[];
  onToggleSave: (id: string) => void;
  onOpenQuiz: () => void;
  onOpenAiGuide: (initialPrompt?: string) => void;
  compareList: string[];
  onToggleCompare: (id: string) => void;
  onClearCompare: () => void;
  onOpenCompare: () => void;
}

export default function CareerExplorer({
  user,
  savedCareers,
  onToggleSave,
  onOpenQuiz,
  onOpenAiGuide,
  compareList,
  onToggleCompare,
  onClearCompare,
  onOpenCompare
}: CareerExplorerProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "chart">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"fit" | "gap" | "roadmap" | "learning">("fit");

  // Filters State
  const [fStream, setFStream] = useState("all");
  const [fField, setFField] = useState("all");
  const [fSector, setFSector] = useState("all");
  const [fSalary, setFSalary] = useState("all");
  const [fInterest, setFInterest] = useState("all");
  const [fWork, setFWork] = useState("all");
  const [fGrowth, setFGrowth] = useState("all");
  const [sortBy, setSortBy] = useState("important");

  // Load Quiz Vector for Match Percentage calculation
  const [quizVector, setQuizVector] = useState<Record<string, number> | null>(null);

  // Pagination state for Careers
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [fStream, fField, fSector, fSalary, fInterest, fWork, fGrowth, sortBy, search]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("newedu_quiz_vector");
      if (v) setQuizVector(JSON.parse(v));
    } catch (e) {}
  }, []);

  const handleClearFilters = () => {
    setFStream("all");
    setFField("all");
    setFSector("all");
    setFSalary("all");
    setFInterest("all");
    setFWork("all");
    setFGrowth("all");
    setSearch("");
  };

  const getSector = (c: CompiledCareer) => {
    const govCategories = ["defence_uniform", "law_civil_service"];
    if (govCategories.includes(c.category) || c.streams.includes("govt")) return "Government";
    return "Private";
  };

  const getWorkType = (c: CompiledCareer) => {
    return WORK_TYPE_LABELS[c.category] || "General";
  };

  // Cosine-like scoring matching logic
  const getMatchScore = (c: CompiledCareer) => {
    if (!quizVector) return 0;
    let score = 0;
    let maxPossible = 0;

    // Static max vector weights estimation
    const MAX_WEIGHTS: Record<string, number> = {
      coding: 6, design: 5, business: 5, science: 6, "helping-people": 5,
      government: 4, analytics: 5, engineering: 5, biology: 4, research: 5
    };

    Object.entries(c.tags || {}).forEach(([t, w]) => {
      score += (quizVector[t] || 0) * w;
      maxPossible += (MAX_WEIGHTS[t] || 2) * w;
    });

    if (maxPossible === 0) return 0;
    return Math.max(10, Math.min(98, Math.round((score / maxPossible) * 100)));
  };

  // Compile and filter career list
  let careers = allCareers().filter((c) => {
    if (fStream !== "all" && !c.streams.includes(fStream)) return false;
    if (fField !== "all" && c.category !== fField) return false;
    if (fSector !== "all" && getSector(c) !== fSector) return false;
    if (fInterest !== "all" && !(c.tags && fInterest in c.tags)) return false;
    if (fWork !== "all" && getWorkType(c) !== fWork) return false;
    if (fGrowth !== "all" && c.growth !== fGrowth) return false;
    
    if (fSalary !== "all") {
      const [lo, hi] = fSalary.split("-").map(Number);
      if (Array.isArray(c.salary)) {
        const maxSal = c.salary[1];
        if (!(maxSal >= lo && (hi === 999 || c.salary[0] <= hi))) return false;
      } else {
        return false; // non-standard or missing salaries
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = [c.title, c.short, c.degree, c.skills.join(" ")].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const getImportanceScore = (c: CompiledCareer) => {
    let score = 0;
    // Salary Upper Limit weight (Indicative premium market index)
    const maxSal = Array.isArray(c.salary) ? c.salary[1] : 0;
    score += maxSal * 2;

    // Growth Tier priority weight
    if (c.growth === "Very High Growth") score += 50;
    else if (c.growth === "High Growth") score += 35;
    else if (c.growth === "Growing") score += 20;
    else score += 10;

    // Stream Priority (Future readiness weighting)
    if (c.streams.includes("tech") || c.streams.includes("emerging") || c.streams.includes("business") || c.streams.includes("design")) {
      score += 25;
    }
    return score;
  };

  // Sort career list
  careers.sort((a, b) => {
    if (sortBy === "important") {
      return getImportanceScore(b) - getImportanceScore(a);
    } else if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "salary") {
      const maxA = Array.isArray(a.salary) ? a.salary[1] : 0;
      const maxB = Array.isArray(b.salary) ? b.salary[1] : 0;
      return maxB - maxA;
    } else if (sortBy === "recommended" && quizVector) {
      return getMatchScore(b) - getMatchScore(a);
    }
    return 0;
  });

  const userClass = user?.classLevel || "Class 10";
  let limit = 110;
  if (userClass === "Class 10") {
    limit = 15;
  } else if (userClass === "Class 11") {
    limit = 50;
  }

  const limitedCareers = careers.slice(0, limit);
  const activeCareer = selectedCareerId ? getCareer(selectedCareerId) : null;

  const handlePrint = (c: CompiledCareer) => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>${c.title} Guide</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
            .subtitle { font-size: 1.1em; color: #64748b; font-style: italic; margin-bottom: 30px; }
            h2 { color: #0f172a; margin-top: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>${c.title}</h1>
          <p class="subtitle">${c.short}</p>
          <p>${c.jobdesc}</p>
          
          <h2>Required Degree & Path</h2>
          <p><strong>Eligible criteria:</strong> ${c.eligibility}</p>
          <p><strong>Primary qualification:</strong> ${c.degree}</p>
          
          <h2>Skills</h2>
          <ul>${c.skills.map(sk => `<li>${sk}</li>`).join("")}</ul>
          
          <h2>Target Entrance Exams</h2>
          <ul>${c.exams.map(e => `<li>${e}</li>`).join("")}</ul>
          
          <h2>Top Recruiters</h2>
          <ul>${c.recruiters.map(r => `<li>${r}</li>`).join("")}</ul>
          
          <h2>Top Colleges</h2>
          <ul>${c.colleges.map(col => `<li>${col}</li>`).join("")}</ul>
          
          <h2>Development Roadmap</h2>
          <ol>${c.roadmap.map(step => `<li>${step}</li>`).join("")}</ol>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  const handleShare = (c: CompiledCareer) => {
    const text = `${c.title} — ${c.short} (via Edu Carrier)`;
    if (navigator.share) {
      navigator.share({ title: c.title, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("Career summary copied to clipboard!");
      });
    }
  };

  // Active filter count calculation
  const activeFilterCount = [fStream, fField, fSector, fSalary, fInterest, fWork, fGrowth].filter((v) => v !== "all").length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Career Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover detailed roadmaps, colleges, exams, and matching indicators for over 110 careers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-sm">
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition-colors ${view === "grid" ? "bg-indigo-50 text-indigo-600 hover:text-indigo-600" : ""}`}
              title="Card View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("chart")}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition-colors ${view === "chart" ? "bg-indigo-50 text-indigo-600 hover:text-indigo-600" : ""}`}
              title="Salary Chart View"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${showFilters ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {activeFilterCount > 0 && <span className="bg-indigo-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px]">{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      {/* Class Level Access Status Banner */}
      {userClass === "Class 10" && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 block">Class 10 - Limited Access Mode Active</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal max-w-xl">
                You are currently exploring a curated catalog of the top 15 core recommended career options for Class 10. To unlock the full 110+ premium professional paths, upgrade your profile class level to Class 12.
              </p>
            </div>
          </div>
          <span className="text-[9.5px] font-extrabold text-amber-700 bg-amber-100/60 border border-amber-200/30 px-3 py-1 rounded-xl uppercase tracking-wider whitespace-nowrap self-stretch sm:self-auto text-center">
            15 Careers Unlocked
          </span>
        </div>
      )}

      {userClass === "Class 11" && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/60 p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 block">Class 11 - Medium Access Mode Active</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal max-w-xl">
                You are currently exploring the top 50 main career trajectories for Class 11. Complete subject stream exploration or upgrade your profile class level to Class 12 to unlock the full 110+ paths.
              </p>
            </div>
          </div>
          <span className="text-[9.5px] font-extrabold text-indigo-700 bg-indigo-100/60 border border-indigo-200/30 px-3 py-1 rounded-xl uppercase tracking-wider whitespace-nowrap self-stretch sm:self-auto text-center">
            50 Careers Unlocked
          </span>
        </div>
      )}

      {userClass === "Class 12" && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4.5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-800 block">Class 12 - Unlimited All-Access Unlocked</span>
              <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal max-w-xl">
                Congratulations! You have unrestricted access to all 110+ advanced technical, academic, and creative pathways, including detailed entrance exam syllabi and roadmaps.
              </p>
            </div>
          </div>
          <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-100/60 border border-emerald-200/30 px-3 py-1 rounded-xl uppercase tracking-wider whitespace-nowrap self-stretch sm:self-auto text-center">
            Full Pass Unlocked
          </span>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 items-end animate-in fade-in slide-in-from-top-4 duration-200 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stream</label>
            <select
              value={fStream}
              onChange={(e) => setFStream(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">All streams</option>
              {Object.values(STREAMS).map((s) => (
                <option key={s.key} value={s.key}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category / Field</label>
            <select
              value={fField}
              onChange={(e) => setFField(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">All fields</option>
              {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sector</label>
            <select
              value={fSector}
              onChange={(e) => setFSector(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Government & Private</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary Range</label>
            <select
              value={fSalary}
              onChange={(e) => setFSalary(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Any Salary</option>
              <option value="0-5">Up to ₹5L /yr</option>
              <option value="5-15">₹5L – ₹15L /yr</option>
              <option value="15-25">₹15L – ₹25L /yr</option>
              <option value="25-999">₹25L+ /yr</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interest</label>
            <select
              value={fInterest}
              onChange={(e) => setFInterest(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Any Interest</option>
              {Object.entries(TAG_LABELS).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work style</label>
            <select
              value={fWork}
              onChange={(e) => setFWork(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Any Work Style</option>
              {Object.values(WORK_TYPE_LABELS).filter((v, i, self) => self.indexOf(v) === i).map((lbl) => (
                <option key={lbl} value={lbl}>{lbl}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demand growth</label>
            <select
              value={fGrowth}
              onChange={(e) => setFGrowth(e.target.value)}
              className="w-full text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            >
              <option value="all">Any Growth Rate</option>
              <option value="Steady">Steady</option>
              <option value="Growing">Growing</option>
              <option value="High Growth">High Growth</option>
              <option value="Very High Growth">Very High Growth</option>
            </select>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 rounded-xl transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search careers, degrees, or skills..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all w-full sm:w-44"
          >
            <option value="important">Important & Trending</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="salary">Highest Salary</option>
            {quizVector && <option value="recommended">Recommended Fits</option>}
          </select>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {limitedCareers.slice(0, visibleCount).map((c) => {
              const isSaved = savedCareers.includes(c.id);
              const isInCompare = compareList.includes(c.id);
              const score = quizVector ? getMatchScore(c) : 0;

              return (
                <div
                  key={c.id}
                  className="group bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 hover:shadow-xl hover:shadow-slate-100 hover:border-slate-200/50 transition-all relative overflow-hidden"
                >
                  {score > 0 && (
                    <div className="absolute top-4 right-14 bg-gradient-to-r from-emerald-500 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm">
                      {score}% FIT
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3
                          onClick={() => setSelectedCareerId(c.id)}
                          className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {c.title}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                          {CATEGORY_LABELS[c.category]}
                        </span>
                      </div>

                      <button
                        onClick={() => onToggleSave(c.id)}
                        className={`p-2 rounded-xl border transition-all ${isSaved ? "bg-amber-50 border-amber-200 text-amber-500" : "bg-white border-slate-100 text-slate-400 hover:text-slate-600"}`}
                        aria-label="Save Career"
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                      {c.short}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                        {Array.isArray(c.salary) ? `\u20B9${c.salary[0]}L - \u20B9${c.salary[1]}L /yr` : c.salary}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-full">
                        {c.growth}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedCareerId(c.id)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all flex-1 text-center"
                    >
                      View Details
                    </button>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isInCompare}
                        onChange={() => onToggleCompare(c.id)}
                        className="rounded text-indigo-600 border-slate-200 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      Compare
                    </label>
                  </div>
                </div>
              );
            })}

            {limitedCareers.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 text-sm">
                No matching careers found. Try adjusting searches or filters.
              </div>
            )}
          </div>

          {limitedCareers.length > visibleCount && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="px-6 py-3 bg-white border border-slate-200 text-xs font-extrabold text-slate-700 hover:text-indigo-600 hover:border-indigo-400 rounded-2xl transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
              >
                <span>See More Careers</span>
                <span className="text-slate-400 font-bold">({limitedCareers.length - visibleCount} remaining)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Salary Chart View */}
      {view === "chart" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Salary Comparative Analysis (Upper Indicative Range)</h3>
            <span className="text-xs text-slate-400">Values in Lakhs per annum (INR)</span>
          </div>

          <div className="space-y-4">
            {limitedCareers.slice(0, 15).map((c) => {
              const maxSal = Array.isArray(c.salary) ? c.salary[1] : 5;
              const pct = Math.min(100, Math.max(10, (maxSal / 40) * 100));
              return (
                <div key={c.id} className="grid grid-cols-12 gap-4 items-center">
                  <span
                    onClick={() => setSelectedCareerId(c.id)}
                    className="col-span-3 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer truncate"
                    title={c.title}
                  >
                    {c.title}
                  </span>
                  <div className="col-span-8 bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100 flex items-center">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="col-span-1 text-right text-xs font-mono font-bold text-slate-500">
                    ₹{maxSal}L
                  </span>
                </div>
              );
            })}

            {limitedCareers.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">
                No data available for the chosen filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison Drawer */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-xl px-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Compare Careers</span>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {compareList.length}/3
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto flex-1 justify-end max-w-xs py-1">
              {compareList.map((id) => (
                <div key={id} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 whitespace-nowrap">
                  {getCareer(id)?.title}
                  <button onClick={() => onToggleCompare(id)} className="text-slate-400 hover:text-slate-600 ml-1">×</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                disabled={compareList.length < 2}
                onClick={onOpenCompare}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Compare Now
              </button>
              <button onClick={onClearCompare} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600" title="Clear">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Career Detail Modal */}
      {activeCareer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCareerId(null)}></div>

          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto p-8 z-10 space-y-6 animate-in fade-in zoom-in duration-250">
            <button onClick={() => setSelectedCareerId(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            {/* Modal Head */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">
                  {CATEGORY_LABELS[activeCareer.category]} • {activeCareer.streams.map((s) => STREAMS[s]?.name || s).join(", ")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{activeCareer.title}</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {activeCareer.short}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center">
                <button
                  onClick={() => handlePrint(activeCareer)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare(activeCareer)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Custom Interactive Matching Section inside the Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-gradient-to-r from-indigo-50/50 to-emerald-50/50 border border-indigo-100/50 rounded-2xl">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Personalized Match Indicator</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyze compatibility vectors based on educational level and preference scores.
                </p>
              </div>
              {quizVector ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-lg font-bold text-indigo-600">{getMatchScore(activeCareer)}% Fit</span>
                    <span className="text-[10px] text-slate-400">Based on recent Quiz</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {getMatchScore(activeCareer)}%
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCareerId(null);
                    onOpenQuiz();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg shadow-md shadow-indigo-100 transition-all"
                >
                  Analyze compatibility
                </button>
              )}
            </div>

            {/* Content Tabs */}
            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Profile</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {activeCareer.jobdesc}
                  </p>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Requirements</h4>
                  <ul className="text-xs text-slate-600 space-y-2 font-semibold">
                    <li><strong className="text-slate-800">Eligible Criterion:</strong> {activeCareer.eligibility}</li>
                    <li><strong className="text-slate-800">Primary Qualification:</strong> {activeCareer.degree}</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills to Develop</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeCareer.skills.map((sk) => (
                      <span key={sk} className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {activeCareer.languages && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prerequisite Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCareer.languages.map((lang) => (
                        <span key={lang} className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional details */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Exams</span>
                <span className="block text-xs font-bold text-slate-800 mt-1 leading-tight">{activeCareer.exams[0] || "Standard Entrance"}</span>
              </div>
              <div className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Recruiter</span>
                <span className="block text-xs font-bold text-slate-800 mt-1 leading-tight">{activeCareer.recruiters[0] || "Global Tech Firm"}</span>
              </div>
              <div className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Salary Range</span>
                <span className="block text-xs font-bold text-slate-800 mt-1 leading-tight">₹{Array.isArray(activeCareer.salary) ? `${activeCareer.salary[0]}L - ₹${activeCareer.salary[1]}L` : activeCareer.salary} /yr</span>
              </div>
              <div className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Indicative Colleges</span>
                <span className="block text-xs font-bold text-slate-800 mt-1 leading-tight truncate">{activeCareer.colleges[0] || "Top Institutes"}</span>
              </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Career Development Roadmap</h4>
              <div className="relative border-l-2 border-indigo-100 pl-6 ml-3 space-y-5">
                {activeCareer.roadmap.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Phase {idx + 1}</h5>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ADVANCED ANALYTICS & AI-DRIVEN TOOLS */}
            <div className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/25 shadow-sm mt-6">
              {/* Tab Selector Headers */}
              <div className="bg-slate-50 border-b border-slate-100 p-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab("fit")}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeAnalysisTab === "fit" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40"}`}
                >
                  <span>📊 Fit Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab("gap")}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeAnalysisTab === "gap" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40"}`}
                >
                  <span>🧩 Skill Gap Analyzer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab("roadmap")}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeAnalysisTab === "roadmap" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40"}`}
                >
                  <span>🗺️ Personalized Roadmap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnalysisTab("learning")}
                  className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${activeAnalysisTab === "learning" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-white/40"}`}
                >
                  <span>📚 AI Learning Path</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 bg-white space-y-4">
                {/* 1. Career Fit Analysis */}
                {activeAnalysisTab === "fit" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Why this matches your Profile</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Our matching algorithm mapped your operational vectors against the functional demands of a <strong>{activeCareer.title}</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Subject Compatibility</span>
                        <div className="mt-2 space-y-1">
                          <span className="text-xs font-bold text-slate-700 block">
                            {user?.preferredSubjects && user.preferredSubjects.length > 0 
                              ? `${user.preferredSubjects.filter(sub => activeCareer.short.toLowerCase().includes(sub.toLowerCase()) || activeCareer.jobdesc.toLowerCase().includes(sub.toLowerCase())).length} Matches`
                              : "No subject pref. set"}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Preferred: {user?.preferredSubjects?.join(", ") || "None selected"}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Growth Alignment</span>
                        <div className="mt-2 space-y-1">
                          <span className="text-xs font-bold text-emerald-600 block">{activeCareer.growth}</span>
                          <span className="text-[10px] text-slate-500 block">Excellent long-term market demand</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Aptitude Fit</span>
                        <div className="mt-2 space-y-1">
                          <span className="text-xs font-bold text-indigo-600 block">
                            {quizVector ? `${getMatchScore(activeCareer)}% compatibility` : "Take Career Quiz"}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Based on interest mapping indicators</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4.5 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl">
                      <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider">AI Compatibility Insights Summary</span>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        A career in {activeCareer.title} calls for strong foundations in {activeCareer.skills.slice(0, 3).join(", ") || "domain specific principles"}. Your academic profile demonstrates {user?.skills?.length ? "active skill alignment" : "room for strategic skill building"} which matches {activeCareer.title}'s professional expectations.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Skill Gap Analyzer */}
                {activeAnalysisTab === "gap" && (() => {
                  const userSkills = user?.skills || [];
                  const reqSkills = activeCareer.skills;
                  const matchedSkills = reqSkills.filter(sk => userSkills.includes(sk));
                  const missingSkills = reqSkills.filter(sk => !userSkills.includes(sk));
                  
                  return (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Skill Gap Analysis & Assessment</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                          We mapped your specified skills directly to the required operational skills of a {activeCareer.title}.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4.5 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-2">
                          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Matched Skills ({matchedSkills.length})</span>
                          {matchedSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {matchedSkills.map(sk => (
                                <span key={sk} className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                                  ✓ {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic block">No exact skills matches yet. Add skills to your profile to find matches.</span>
                          )}
                        </div>

                        <div className="p-4.5 bg-rose-50/40 border border-rose-100 rounded-2xl space-y-2">
                          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">Gaps to Bridge ({missingSkills.length})</span>
                          {missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {missingSkills.map(sk => (
                                <span key={sk} className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                                  + {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 block">✓ All prerequisite skills matched! You are highly job-ready.</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 flex items-center gap-3">
                        <span className="text-lg">💡</span>
                        <span>
                          <strong>Strategic Advice:</strong> Select the <strong>AI Learning Path</strong> tab to access curated courses, practice resources, and projects for your missing skills.
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Personalized Career Roadmap */}
                {activeAnalysisTab === "roadmap" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">Your Personalized Timeline Path</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        A dynamic academic and career preparation track customized for your current level: <strong>{userClass}</strong>.
                      </p>
                    </div>

                    <div className="relative border-l-2 border-dashed border-indigo-100 pl-6 ml-3 space-y-5">
                      {/* Class Level Stage */}
                      <div className="relative">
                        <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-extrabold">
                          1
                        </span>
                        <h5 className="text-xs font-black text-indigo-600 uppercase tracking-wider">Stage 1: {userClass} Prep Phase</h5>
                        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                          {userClass === "Class 10" 
                            ? "Focus on laying strong mathematical, science, and computer logic foundations. Prepare well for Board Exams to unlock optimal stream selection for higher secondary education."
                            : userClass === "Class 11"
                            ? "Deep dive into your chosen stream subjects (e.g., PCM, PCB, Commerce, Arts). Start identifying target university programs and matching entry requirements."
                            : "Accelerated preparation for national competitive entrance exams (JEE, NEET, CUET) and high secondary aggregate management."}
                        </p>
                      </div>

                      {/* Entrance / University Phase */}
                      <div className="relative">
                        <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-extrabold">
                          2
                        </span>
                        <h5 className="text-xs font-black text-indigo-600 uppercase tracking-wider">Stage 2: Entrance & Admission Timeline</h5>
                        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                          Take specific exams: <strong>{activeCareer.exams.join(", ") || "Direct University Admission"}</strong>. Focus preparation on mock question banks, key core test components, and university selection procedures.
                        </p>
                      </div>

                      {/* Professional Graduation Phase */}
                      <div className="relative">
                        <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xs font-extrabold">
                          3
                        </span>
                        <h5 className="text-xs font-black text-indigo-600 uppercase tracking-wider">Stage 3: {activeCareer.degree} Degree Milestone</h5>
                        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                          Acquire deep conceptual understanding, take active specialization courses, and learn the prerequisite languages: <strong>{activeCareer.languages?.join(", ") || "Industry Standard Frameworks"}</strong>.
                        </p>
                      </div>

                      {/* Industry Readiness */}
                      <div className="relative">
                        <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold">
                          ✓
                        </span>
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Stage 4: Portfolio & Professional Entry</h5>
                        <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                          Build real-world application portfolios, target internships with <strong>{activeCareer.recruiters[0] || "Global Tier-1 recruiters"}</strong>, and establish community presence to achieve elite career placement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AI Learning Path */}
                {activeAnalysisTab === "learning" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-sm font-black text-slate-800">AI learning Track & Resource Recommendations</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        High-quality recommended courses, topics, and practical projects to build missing competencies.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Recommended Curriculums & Topics</span>
                        <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc leading-relaxed font-semibold">
                          <li>Foundational Principles of {activeCareer.skills[0] || "domain engineering"}</li>
                          <li>Intermediate & Advanced {activeCareer.skills[1] || "system design"}</li>
                          <li>Practical Implementation of {activeCareer.skills[2] || "logical reasoning"}</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Suggested DIY Capstone Project</span>
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 block">"Dynamic {activeCareer.title} Portfolio"</span>
                          <p className="text-[11px] text-slate-500 leading-normal">
                            Build a comprehensive hands-on prototype demonstrating full-scale {activeCareer.skills.slice(0, 2).join(" & ")} skills to showcase to top tech recruiters.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4.5 bg-indigo-50/40 border border-indigo-100/50 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-800 block">Need a fully customized syllabus?</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Ask our interactive AI Career Guide to generate an exhaustive learning path for you.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCareerId(null);
                          onOpenAiGuide(`Generate a step-by-step custom curriculum and weekly study syllabus to master the required skills for a career as a ${activeCareer.title}.`);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Syllabus</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3 justify-between items-center">
              <button
                onClick={() => onToggleSave(activeCareer.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${savedCareers.includes(activeCareer.id) ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                {savedCareers.includes(activeCareer.id) ? "Saved to Profile" : "Save Career"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedCareerId(null);
                    onOpenAiGuide(`Help me understand what I need to do to prepare for a career as a ${activeCareer.title}.`);
                  }}
                  className="px-5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all"
                >
                  Consult AI Guide
                </button>
                <button
                  onClick={() => setSelectedCareerId(null)}
                  className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
