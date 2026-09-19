import React, { useState } from "react";
import { Search, GraduationCap, Calendar, Compass, FileText, ArrowRight, Printer } from "lucide-react";

export interface ResourceItem {
  id: string;
  title: string;
  type: "exam" | "scholarship" | "guide";
  category: string;
  deadline: string;
  description: string;
  steps: string[];
}

export let RESOURCES_DATABASE: ResourceItem[] = [
  {
    id: "jee-main",
    title: "JEE Main & Advanced (Engineering)",
    type: "exam",
    category: "Science",
    deadline: "Dec - Jan / Apr (Twice a year)",
    description: "National level engineering entrance exam for admissions to IITs, NITs, and IIITs.",
    steps: [
      "Confirm eligibility: 75% in Class 12 (65% for SC/ST) with Physics, Chemistry, Mathematics",
      "Register online during Nov-Dec for Session 1",
      "Appear for Session 1 in January",
      "Register/Appear for Session 2 in April",
      "Qualify in top 2,50,000 ranks to become eligible for JEE Advanced (conducted in May/June)"
    ]
  },
  {
    id: "neet-ug",
    title: "NEET UG (Medical Entrance)",
    type: "exam",
    category: "Medical",
    deadline: "Feb - March",
    description: "Single entrance test for admissions to MBBS, BDS, and AYUSH courses in India.",
    steps: [
      "Age eligibility: Minimum 17 years as of Dec 31st of the admission year",
      "Subject criteria: Class 12 with Physics, Chemistry, Biology/Biotech, and English",
      "Apply online on the NTA NEET portal during Feb-March",
      "Download admit card in April and appear for exam in May",
      "Participate in MCC counseling for All India Quota (15%) and state counseling (85%)"
    ]
  },
  {
    id: "clat-law",
    title: "CLAT (Common Law Admission Test)",
    type: "exam",
    category: "Law",
    deadline: "October - November",
    description: "Entrance exam for admissions to 24 National Law Universities (NLUs) in India.",
    steps: [
      "Confirm eligibility: 45% in Class 12 (40% for SC/ST)",
      "Register on Consortium of NLUs portal during July-November",
      "Appear for the 120-minute multiple-choice offline exam in December",
      "Admissions allocated via centralized merit-list based seat allocation"
    ]
  },
  {
    id: "cuet-ug",
    title: "CUET UG (Common University Entrance Test)",
    type: "exam",
    category: "General Arts & Commerce",
    deadline: "Feb - March",
    description: "Common entrance test for admissions to UG programs in Central, State, and Deemed Universities.",
    steps: [
      "Verify eligible subject combinations required by your target central university",
      "Register on the CUET Samarth portal during Feb-March",
      "Choose domain-specific subjects, general test, and languages",
      "Appear for computer-based tests in May/June"
    ]
  },
  {
    id: "kvpy-insire",
    title: "INSPIRE Scholarship (DST India)",
    type: "scholarship",
    category: "Science",
    deadline: "November",
    description: "Scholarship for higher education (SHE) of ₹80,000 per year for students pursuing basic science degrees.",
    steps: [
      "Be in the top 1% of your respective Class 12 board exam results",
      "Enroll in a regular B.Sc., B.S., or Int. M.Sc. program in natural sciences",
      "Apply online on the INSPIRE DST portal by November with board marks sheets",
      "Maintain 6.0 CGPA or 60% marks in college college years to retain scholarship"
    ]
  },
  {
    id: "pmss-prime",
    title: "Prime Minister's Scholarship Scheme (PMSS)",
    type: "scholarship",
    category: "General",
    deadline: "December",
    description: "Financial assistance up to ₹36,000 annually for wards of ex-servicemen pursuing professional UG degrees.",
    steps: [
      "Be a ward of ex-servicemen, ex-coast guard personnel or police martyrs",
      "Secure minimum 60% marks in Class 12 or equivalent diploma qualification",
      "Submit application on the National Scholarship Portal (NSP) with service certificates",
      "Await selection list based on academic priority guidelines"
    ]
  },
  {
    id: "study-plan-cbse",
    title: "Class 10/12 Board Exam Preparation Strategy",
    type: "guide",
    category: "Study Guides",
    deadline: "N/A",
    description: "An expert compiled outline detailing subject-wise splits, revision times, and sample papers.",
    steps: [
      "Divide your syllabus into Core, Moderate, and High-Scoring blocks",
      "Spend September-November completing first-pass conceptual readings",
      "Dedicate December to writing structured chapter tests",
      "Solve at least 5 previous-years question papers in January under timed exam conditions",
      "Focus on formula registers and NCERT summary sheets in final revision passes"
    ]
  }
];

export default function Resources() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "exam" | "scholarship" | "guide">("all");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const items = RESOURCES_DATABASE.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handlePrintGuide = (item: ResourceItem) => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>${item.title} Prep Guide</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
            .subtitle { font-size: 1.1em; color: #64748b; font-style: italic; margin-bottom: 30px; }
            h2 { color: #0f172a; margin-top: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
            ol { padding-left: 20px; }
            li { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>${item.title}</h1>
          <p class="subtitle">Category: ${item.category} | Timeline: ${item.deadline}</p>
          <p>${item.description}</p>
          <h2>Application & Preparation Checklist</h2>
          <ol>${item.steps.map(step => `<li>${step}</li>`).join("")}</ol>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Resources & Guides</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stay informed on national entrance exams, prestigious scholarship timelines, and compiled board exam study planners.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white border border-slate-200 p-4 rounded-3xl shadow-sm justify-between">
        <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "all" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            All Resources
          </button>
          <button
            onClick={() => setFilterType("exam")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "exam" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            Entrance Exams
          </button>
          <button
            onClick={() => setFilterType("scholarship")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "scholarship" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            Scholarships
          </button>
          <button
            onClick={() => setFilterType("guide")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterType === "guide" ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
          >
            Study Guides
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dates, names or content..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs"
          />
        </div>
      </div>

      {/* Grid of Resource Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-5 hover:shadow-xl hover:shadow-slate-100 hover:border-slate-200/50 transition-all cursor-pointer"
            onClick={() => setSelectedResource(item)}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${item.type === "exam" ? "bg-indigo-50 border-indigo-100 text-indigo-600" : item.type === "scholarship" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-amber-50 border-amber-100 text-amber-600"}`}>
                  {item.type}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.deadline !== "N/A" ? `Deadline: ${item.deadline.split(" ")[0]}` : "Resource guide"}
              </span>

              <span className="text-indigo-600 flex items-center gap-1 text-[11px] font-bold">
                Check checklist
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedResource(null)}></div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 z-10 space-y-6 animate-in fade-in zoom-in duration-250">
            <button onClick={() => setSelectedResource(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${selectedResource.type === "exam" ? "bg-indigo-600" : selectedResource.type === "scholarship" ? "bg-emerald-500" : "bg-amber-500"}`}>
                <GraduationCap className="w-6 h-6" />
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">{selectedResource.category} • {selectedResource.type}</span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedResource.title}</h2>
              </div>

              <button
                onClick={() => handlePrintGuide(selectedResource)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-100 flex items-center gap-1.5 transition-all self-start"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Guide
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overview</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedResource.description}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Application & Preparation Timeline</h4>
              <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-4">
                {selectedResource.steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-9 top-0 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedResource.deadline !== "N/A" && (
              <div className="p-4 bg-amber-50 border border-amber-100/50 rounded-2xl text-xs font-semibold text-amber-700 flex items-center justify-between">
                <span>Indicative Registration Timeline</span>
                <span className="font-mono bg-white px-2 py-0.5 border border-amber-200 rounded">{selectedResource.deadline}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline missing X icon definition if needed
function X({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function updateResources(customResources: any[]) {
  if (Array.isArray(customResources)) {
    customResources.forEach((cr) => {
      if (cr && cr.id) {
        const idx = RESOURCES_DATABASE.findIndex(r => r.id === cr.id);
        if (idx !== -1) {
          RESOURCES_DATABASE[idx] = cr;
        } else {
          RESOURCES_DATABASE.push(cr);
        }
      }
    });
  }
}

