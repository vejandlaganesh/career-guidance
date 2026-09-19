import React, { useState, useEffect } from "react";
import { allCareers, CATEGORY_LABELS } from "../data";
import { User, QuizAttempt } from "../types";
import { BrainCircuit, Check, ArrowRight, ArrowLeft, RefreshCw, Sparkles, Award, Bookmark, ChevronDown, ChevronUp, BookOpen, Sliders } from "lucide-react";

interface CareerQuizProps {
  user: User | null;
  onQuizCompleted: () => void;
  onOpenCareer: (id: string) => void;
}

export let QUIZ_QUESTIONS = [
  {
    id: 1,
    q: "Which subjects do you enjoy studying most?",
    hint: "Pick all that apply",
    type: "multi",
    options: [
      { label: "Mathematics", tags: { engineering: 1, coding: 1, analytics: 1 } },
      { label: "Physics", tags: { engineering: 1, science: 1 } },
      { label: "Biology", tags: { biology: 2, medicine: 1 } },
      { label: "Chemistry", tags: { science: 1, medicine: 1 } },
      { label: "Economics / Business Studies", tags: { business: 2, finance: 1 } },
      { label: "History / Civics", tags: { government: 1, law: 1, writing: 1 } },
      { label: "Languages / Fine Arts", tags: { writing: 1, creative: 2, design: 1 } },
      { label: "Computer Science", tags: { coding: 2 } }
    ]
  },
  {
    id: 2,
    q: "Which of these activities sounds exciting to you?",
    hint: "Pick all that apply",
    type: "multi",
    options: [
      { label: "Building or fixing physical systems / machinery", tags: { "hands-on": 2, engineering: 1 } },
      { label: "Helping people, diagnosing, or counseling", tags: { "helping-people": 2, medicine: 1 } },
      { label: "Creating digital assets, layouts, art, or scripts", tags: { creative: 2, design: 1, writing: 1 } },
      { label: "Solving logical puzzles or querying data", tags: { analytics: 2, coding: 1 } },
      { label: "Leading teams, pitching ideas, or starting businesses", tags: { business: 1, government: 1 } },
      { label: "Exploring scientific laws, space, or nature", tags: { science: 2, agriculture: 1 } }
    ]
  },
  {
    id: 3,
    q: "Do you enjoy writing code or creating logic?",
    type: "single",
    options: [
      { label: "Yes, I really enjoy it", tags: { coding: 3 } },
      { label: "Somewhat / Interested in learning", tags: { coding: 1 } },
      { label: "No, not really", tags: {} }
    ]
  },
  {
    id: 4,
    q: "How do you feel about studying biological systems and medicines?",
    type: "single",
    options: [
      { label: "Yes, I find it fascinating", tags: { biology: 3, medicine: 2 } },
      { label: "A little bit / Open to basic biology", tags: { biology: 1 } },
      { label: "No, prefer purely numbers/art", tags: {} }
    ]
  },
  {
    id: 5,
    q: "Do you enjoy sketching, editing, or spatial designs?",
    type: "single",
    options: [
      { label: "Yes, heavily interested", tags: { design: 3, creative: 2 } },
      { label: "Occasionally / Basic interest", tags: { design: 1 } },
      { label: "No, prefer logic/systems", tags: {} }
    ]
  },
  {
    id: 6,
    q: "Which atmosphere appeals to you more?",
    type: "single",
    options: [
      { label: "In-depth scientific research & publishing", tags: { research: 3, science: 1 } },
      { label: "Commercial business operations & finance", tags: { business: 3, finance: 1 } },
      { label: "Upholding public law & administrative services", tags: { government: 3, law: 1 } }
    ]
  }
];

const RADAR_TAGS = ["coding", "design", "business", "science", "helping-people", "government"];
const RADAR_LABELS = ["Coding", "Design", "Business", "Science", "People", "Govt"];

// Maximum possible weights for each tag for score normalization
const MAX_VECTOR_WEIGHTS: Record<string, number> = {
  coding: 6, design: 5, business: 5, science: 6, "helping-people": 5,
  government: 4, analytics: 5, engineering: 5, biology: 4, research: 5,
  medicine: 4, creative: 4, writing: 2, "hands-on": 2, law: 2, finance: 2,
  agriculture: 1
};

export default function CareerQuiz({ user, onQuizCompleted, onOpenCareer }: CareerQuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setLoading] = useState(false);
  const [results, setResults] = useState<{ c: any; score: number }[]>([]);
  const [interestVector, setInterestVector] = useState<Record<string, number> | null>(null);
  const [expandedCareerId, setExpandedCareerId] = useState<string | null>(null);
  const [localBookmarks, setLocalBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/bookmarks/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.bookmarks) {
            setLocalBookmarks(data.bookmarks);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleToggleBookmarkInQuiz = async (careerId: string) => {
    if (!user) {
      alert("Please sign in to save career bookmarks!");
      return;
    }
    try {
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, careerId })
      });
      const data = await res.json();
      if (data && data.bookmarks) {
        setLocalBookmarks(data.bookmarks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const q = QUIZ_QUESTIONS[step];

  // Helper to check if current step is answered
  const isStepAnswered = () => {
    const ans = answers[q.id];
    if (q.type === "multi") {
      return Array.isArray(ans) && ans.length > 0;
    }
    return ans !== undefined && ans !== null;
  };

  const handleSelect = (idx: number) => {
    if (q.type === "multi") {
      const current = (answers[q.id] as number[]) || [];
      if (current.includes(idx)) {
        setAnswers({ ...answers, [q.id]: current.filter((val) => val !== idx) });
      } else {
        setAnswers({ ...answers, [q.id]: [...current, idx] });
      }
    } else {
      setAnswers({ ...answers, [q.id]: idx });
    }
  };

  const handleNext = () => {
    if (step < QUIZ_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateResults = async () => {
    setLoading(true);
    // Build Interest Vector based on answers
    const vector: Record<string, number> = {};
    
    QUIZ_QUESTIONS.forEach((question) => {
      const ans = answers[question.id];
      const selectedOpts = question.type === "multi"
        ? ((ans as number[]) || []).map((idx) => question.options[idx])
        : ans !== undefined ? [question.options[ans as number]] : [];

      selectedOpts.forEach((opt) => {
        if (opt && opt.tags) {
          Object.entries(opt.tags).forEach(([tag, weight]) => {
            vector[tag] = (vector[tag] || 0) + weight;
          });
        }
      });
    });

    setInterestVector(vector);

    // Score all careers using Cosine similarity estimation
    const scored = allCareers().map((career) => {
      let score = 0;
      let maxPossible = 0;

      Object.entries(career.tags || {}).forEach(([t, w]) => {
        score += (vector[t] || 0) * w;
        maxPossible += (MAX_VECTOR_WEIGHTS[t] || 2) * w;
      });

      const pct = maxPossible === 0 ? 0 : Math.max(10, Math.min(98, Math.round((score / maxPossible) * 100)));
      return { c: career, score: pct };
    }).sort((a, b) => b.score - a.score);

    setResults(scored.slice(0, 5));

    // Save Vector to LocalStorage for offline use
    try {
      localStorage.setItem("newedu_quiz_vector", JSON.stringify(vector));
    } catch (e) {}

    // Save Attempt to fullstack backend if user is authenticated
    if (user) {
      try {
        await fetch(`/api/quiz/${user.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, vector })
        });
      } catch (err) {
        console.error("Failed to sync quiz with server:", err);
      }
    }

    setSubmitted(true);
    setLoading(false);
    onQuizCompleted();
  };

  const handleRestart = () => {
    setAnswers({});
    setStep(0);
    setSubmitted(false);
    setResults([]);
    setInterestVector(null);
  };

  // Generate SVG Radar Chart Points
  const renderRadarSvg = () => {
    if (!interestVector) return null;
    const cx = 110, cy = 110, R = 80;
    
    // Normalize weights
    const points = RADAR_TAGS.map((tag, idx) => {
      const maxVal = MAX_VECTOR_WEIGHTS[tag] || 5;
      const scoreVal = interestVector[tag] || 0;
      const ratio = Math.min(1, scoreVal / maxVal);
      const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / RADAR_TAGS.length;
      const r = 20 + ratio * (R - 20);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        labelX: cx + (R + 15) * Math.cos(angle),
        labelY: cy + (R + 15) * Math.sin(angle),
        axisX: cx + R * Math.cos(angle),
        axisY: cy + R * Math.sin(angle)
      };
    });

    const polygonPath = points.map(p => `${p.x},${p.y}`).join(" ");

    return (
      <svg viewBox="0 0 220 220" className="w-56 h-56 mx-auto">
        <defs>
          <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* Axis lines */}
        {points.map((p, idx) => (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={p.axisX}
            y2={p.axisY}
            stroke="#f1f5f9"
            strokeWidth="1.5"
          />
        ))}
        {/* Radar boundary grid circles */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R / 1.5} fill="none" stroke="#f8fafc" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={R / 3} fill="none" stroke="#f8fafc" strokeWidth="1" />

        {/* Filled polygon */}
        <polygon
          points={polygonPath}
          fill="url(#radarGrad)"
          fillOpacity="0.25"
          stroke="#4f46e5"
          strokeWidth="2"
        />

        {/* Dots */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#10b981" />
        ))}

        {/* Text Labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            className="fill-slate-500 font-bold"
          >
            {RADAR_LABELS[idx]}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-md relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100 flex">
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((submitted ? QUIZ_QUESTIONS.length : step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        ></div>
      </div>

      {!submitted ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BrainCircuit className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question {step + 1} of {QUIZ_QUESTIONS.length}</span>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Career Assessment</h2>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">{q.q}</h3>
            {q.hint && <p className="text-xs text-slate-400 italic">({q.hint})</p>}
          </div>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              const isSelected = q.type === "multi"
                ? (answers[q.id] as number[])?.includes(idx)
                : answers[q.id] === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-sm font-semibold flex items-center justify-between transition-all ${isSelected ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"}`}>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepAnswered() || submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {step === QUIZ_QUESTIONS.length - 1 ? (
                submitting ? "Calculating..." : "Submit Answers"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in zoom-in duration-200">
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center text-indigo-600">
              <Award className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Compatibility Vectors Mapped!</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Our matching engine evaluated your subject preferences and operational choices.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            {/* Left Column: SVG Radar Chart */}
            <div className="space-y-4 md:sticky md:top-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Interest Profile Radar</h4>
              {renderRadarSvg()}
            </div>

            {/* Right Column: Key Recommendations Accordion */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Recommended Career Fields</h4>
              
              <div className="space-y-3">
                {results.map(({ c, score }) => {
                  const isExpanded = expandedCareerId === c.id;
                  const isSaved = localBookmarks.includes(c.id);

                  return (
                    <div
                      key={c.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${isExpanded ? "border-indigo-500 shadow-lg" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      {/* Accordion Trigger Header */}
                      <div
                        onClick={() => setExpandedCareerId(isExpanded ? null : c.id)}
                        className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{CATEGORY_LABELS[c.category]}</span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-0.5">{c.title}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/50">
                            {score}% Fit
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Accordion Collapsible Detail Drawer */}
                      {isExpanded && (
                        <div className="px-4 pb-4.5 pt-1.5 border-t border-slate-50 space-y-4 bg-slate-50/20 text-xs text-slate-600 animate-in slide-in-from-top-1 duration-150">
                          <p className="text-slate-500 leading-relaxed text-xs">{c.short}</p>

                          {/* Stat badges */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Median Salary</span>
                              <span className="text-xs font-bold text-indigo-600 mt-0.5 block">₹{c.salary[0]}L - ₹{c.salary[1]}L /yr</span>
                            </div>
                            <div className="bg-white border border-slate-100 p-2.5 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Growth outlook</span>
                              <span className="text-xs font-bold text-emerald-600 mt-0.5 block">{c.growth}</span>
                            </div>
                          </div>

                          {/* Eligibility & Qualifications */}
                          <div className="space-y-2">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Degree & Qualification</span>
                              <p className="text-slate-700 font-bold mt-0.5">{c.degree}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Entrance Exams</span>
                              <p className="text-slate-700 font-bold mt-0.5">{c.exams.join(", ") || "Direct Admission"}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Top Universities</span>
                              <p className="text-slate-700 font-bold mt-0.5">{c.colleges.join(", ") || "Top Academic Institutes"}</p>
                            </div>
                          </div>

                          {/* Quick Roadmap Milestones block */}
                          <div className="space-y-2 bg-indigo-50/30 border border-indigo-50 p-3 rounded-xl">
                            <span className="text-[9px] font-bold text-indigo-600 block uppercase tracking-wider">Suggested Phase Milestones</span>
                            <ul className="space-y-1.5 text-[11px] list-disc pl-4 text-slate-600">
                              {c.roadmap?.map((phase: string, idx: number) => (
                                <li key={idx} className="leading-relaxed">
                                  <span className="font-semibold text-slate-700">{phase}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Bookmark and explore actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            <button
                              onClick={() => handleToggleBookmarkInQuiz(c.id)}
                              className={`px-3 py-2 border rounded-xl flex items-center gap-1.5 font-bold text-xs transition-all ${isSaved ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                            >
                              <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                              <span>{isSaved ? "Saved" : "Save Pathway"}</span>
                            </button>

                            <button
                              onClick={() => onOpenCareer(c.id)}
                              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex-1 text-center transition-all cursor-pointer"
                            >
                              Explore Full Guide
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Quiz
            </button>
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function updateQuizQuestions(customQuizQuestions: any[]) {
  if (Array.isArray(customQuizQuestions)) {
    customQuizQuestions.forEach((q) => {
      if (q && q.id) {
        const idx = QUIZ_QUESTIONS.findIndex(item => item.id === q.id);
        if (idx !== -1) {
          QUIZ_QUESTIONS[idx] = q;
        } else {
          QUIZ_QUESTIONS.push(q);
        }
      }
    });
  }
}

