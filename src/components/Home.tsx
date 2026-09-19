import React from "react";
import { BookOpen, HelpCircle, Compass, BrainCircuit, ArrowRight, UserPlus, LogIn, Star, Award, GraduationCap, Sparkles, TrendingUp, Map, Search, Database } from "lucide-react";

interface HomeProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: (mode: "login" | "register" | "admin") => void;
}

export default function Home({ onNavigate, onOpenAuth }: HomeProps) {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">Edu Carrier</span>
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">AI Career Guidance</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => {
              const el = document.getElementById("streams");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Explore Streams</button>
            <button onClick={() => {
              const el = document.getElementById("careers");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Explore Careers</button>
            <button onClick={() => {
              const el = document.getElementById("resources");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">Resources</button>
            <button onClick={() => {
              const el = document.getElementById("faq");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer">FAQ</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth("login")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Login
            </button>
            <button
              onClick={() => onOpenAuth("register")}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
                <Award className="w-3.5 h-3.5" />
                AI-Powered Mentorship • Class 10, 11 & 12
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
                Discover Your Career. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">Build Your Future.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                Edu Carrier acts as your personalized career guidance counselor. We help you explore educational streams, map courses, identify gap skills, and navigate future paths using advanced AI recommendations.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth("register")}
                  className="px-8 py-4 font-bold text-white bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full shadow-xl shadow-indigo-100 hover:shadow-indigo-200/50 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("careers");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-full shadow-sm flex items-center gap-2 transform hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Explore Careers
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              {/* Visual Orbit Effect representing career paths */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-80 flex items-center justify-center">
                <div className="absolute w-72 h-72 border border-slate-200 rounded-full animate-[spin_40s_linear_infinite]">
                  <div className="absolute -top-3 left-1/2 w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold"><BookOpen className="w-3 h-3" /></div>
                </div>
                <div className="absolute w-56 h-56 border border-dashed border-slate-200 rounded-full animate-[spin_25s_linear_infinite_reverse]">
                  <div className="absolute -top-2.5 left-1/4 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold"><Compass className="w-3 h-3" /></div>
                </div>
                <div className="absolute w-36 h-36 border border-slate-200 rounded-full animate-[spin_15s_linear_infinite]">
                  <div className="absolute -top-2 left-3/4 w-4.5 h-4.5 rounded-full bg-amber-500 flex items-center justify-center text-white text-[8px] font-bold"><BrainCircuit className="w-2.5 h-2.5" /></div>
                </div>
                <div className="relative w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-xl shadow-indigo-100">
                  <GraduationCap className="w-12 h-12 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Block */}
      <section className="bg-white border-y border-slate-100 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <span className="block text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">112+</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Careers Mapped</span>
            </div>
            <div className="space-y-1">
              <span className="block text-4xl font-extrabold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">28+</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Major Streams</span>
            </div>
            <div className="space-y-1">
              <span className="block text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">350+</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Courses Detailed</span>
            </div>
            <div className="space-y-1">
              <span className="block text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">500+</span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Top Indian Colleges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Streams Section */}
      <section id="streams" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              High School Stream Framework
            </div>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight leading-tight">Explore Educational Streams</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Choose your ideal secondary school track. Learn about specific course selections, entrance examinations, and respective long-term placement salaries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* MPC Stream Card */}
            <div className="p-7 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-sm">PCM</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">MPC (Maths, Physics, Chemistry)</h3>
                  <p className="text-slate-500 leading-relaxed text-xs mt-1">
                    The premium route for engineering, computer science, and core technology pathways.
                  </p>
                </div>
                <div className="space-y-2 border-t border-slate-200/50 pt-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between"><span>Core Exams:</span><span className="font-bold text-indigo-600">JEE Main, BITSAT</span></div>
                  <div className="flex justify-between"><span>Key Careers:</span><span className="font-bold">Software, Aerospace, Robotics</span></div>
                  <div className="flex justify-between"><span>Indicative Salary:</span><span className="font-bold text-emerald-600">₹8L - ₹42L /yr</span></div>
                </div>
              </div>
              <button onClick={() => onOpenAuth("register")} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all">Unlock Track Roadmap</button>
            </div>

            {/* BiPC Stream Card */}
            <div className="p-7 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-extrabold text-sm">PCB</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">BiPC (Biology, Physics, Chemistry)</h3>
                  <p className="text-slate-500 leading-relaxed text-xs mt-1">
                    Ideal for medical practitioners, biomedical researchers, and genetic experts.
                  </p>
                </div>
                <div className="space-y-2 border-t border-slate-200/50 pt-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between"><span>Core Exams:</span><span className="font-bold text-emerald-600">NEET, CUET</span></div>
                  <div className="flex justify-between"><span>Key Careers:</span><span className="font-bold">Surgery, Biotech, Pharmacy</span></div>
                  <div className="flex justify-between"><span>Indicative Salary:</span><span className="font-bold text-emerald-600">₹6L - ₹32L /yr</span></div>
                </div>
              </div>
              <button onClick={() => onOpenAuth("register")} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all">Unlock Track Roadmap</button>
            </div>

            {/* Commerce Stream Card */}
            <div className="p-7 bg-slate-50 hover:bg-white rounded-3xl border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl transition-all space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-extrabold text-xs">MEC/CEC</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Commerce & Finance</h3>
                  <p className="text-slate-500 leading-relaxed text-xs mt-1">
                    Strong focus on business economics, financial analysis, marketing, and corporate auditing.
                  </p>
                </div>
                <div className="space-y-2 border-t border-slate-200/50 pt-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between"><span>Core Exams:</span><span className="font-bold text-amber-600">CA Foundation, CUET</span></div>
                  <div className="flex justify-between"><span>Key Careers:</span><span className="font-bold">Investment Banking, Auditor, CFO</span></div>
                  <div className="flex justify-between"><span>Indicative Salary:</span><span className="font-bold text-emerald-600">₹7L - ₹36L /yr</span></div>
                </div>
              </div>
              <button onClick={() => onOpenAuth("register")} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-all">Unlock Track Roadmap</button>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Careers Section */}
      <section id="careers" className="py-24 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              Fast-Growing Industries
            </div>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight leading-tight">Trending & High Impact Careers</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
              A curated catalog of the top-performing, high-demand positions on the global professional landscape.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Software Architect */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-extrabold text-slate-900">Software Architect</h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">Very High Growth</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Designs multi-tiered cloud infrastructure architectures, establishes language standards, and coordinates critical enterprise technical frameworks.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Software Engineering</span>
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Cloud Computing</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Upper Salary Range</span>
                <span className="font-extrabold text-emerald-600">₹45L /yr</span>
              </div>
            </div>

            {/* Data Scientist */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-extrabold text-slate-900">Data Scientist</h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">Very High Growth</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Builds mathematical forecasting models, constructs statistical algorithms, and extracts corporate insights using predictive ML and Deep Learning frameworks.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Statistics</span>
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Machine Learning</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Upper Salary Range</span>
                <span className="font-extrabold text-emerald-600">₹38L /yr</span>
              </div>
            </div>

            {/* Investment Banker */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-extrabold text-slate-900">Investment Banker</h3>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">High Growth</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Evaluates asset valuations, coordinates mergers & acquisitions, and structure capital-market corporate underwriting.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Corporate Finance</span>
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">Valuation</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Upper Salary Range</span>
                <span className="font-extrabold text-emerald-600">₹40L /yr</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onOpenAuth("register")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-xs font-black text-white rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Unlock all 110+ Careers in Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Resources & Toolkits Section */}
      <section id="resources" className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[10px] font-bold text-purple-700 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              Syllabus & Guidance Library
            </div>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl tracking-tight leading-tight">National Resources & Toolkits</h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
              Access comprehensive, structured preparation resources for national entrance exams and advanced university criteria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* National Exam Kit */}
            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/60 space-y-4">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Entrance Syllabus</span>
              <h4 className="text-sm font-bold text-slate-900">JEE & NEET Prep Kit</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Step-by-step syllabus breakdown, weight analysis of chapters, and high-quality free prep resources.
              </p>
              <button onClick={() => onOpenAuth("login")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">Access Resources →</button>
            </div>

            {/* Central Universities */}
            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/60 space-y-4">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">CUET & Admissions</span>
              <h4 className="text-sm font-bold text-slate-900">Central University Guide</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Targeted preparation parameters for DU, BHU, JNU, and other elite Indian Central Universities.
              </p>
              <button onClick={() => onOpenAuth("login")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">Access Resources →</button>
            </div>

            {/* Professional Roadmaps */}
            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/60 space-y-4">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Milestones</span>
              <h4 className="text-sm font-bold text-slate-900">Career Timelines</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                A chronological mapping of steps to transition from Class 10/11/12 directly into professional internships.
              </p>
              <button onClick={() => onOpenAuth("login")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">Access Resources →</button>
            </div>

            {/* AI Learning Syllabus */}
            <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100/60 space-y-4">
              <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Interactive AI</span>
              <h4 className="text-sm font-bold text-slate-900">Dynamic Study Tracks</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Request custom weekly study syllabi directly integrated inside our AI Assistant dashboard.
              </p>
              <button onClick={() => onOpenAuth("login")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">Access Resources →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xs">Got questions about Edu Carrier counseling? We have answers.</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">How is my AI Match Score calculated?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When you take the Edu Carrier Career Quiz, your preferences are mapped into standard weight vectors (e.g. engineering, design, bio, analytics). We calculate the cosine similarity between your interest vector and each target career to provide an objective score.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Is my data secure on this platform?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Absolutely. Your profile details, saved careers, and quiz responses are protected by secure session authentication on our fullstack Node.js server. We do not expose personal data to third parties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-2">Are streams locked once selected?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                No. Streams are typical pathways for high school. Many modern college degrees and careers accept cross-disciplinary lateral entry (e.g., arts students transitioning to UI/UX, or commerce students studying data analysis).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-400">© 2026 Edu Carrier guidance. All rights reserved.</span>
          <div className="flex gap-6">
            <button onClick={() => {
              const el = document.getElementById("careers");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 cursor-pointer">Careers</button>
            <button onClick={() => {
              const el = document.getElementById("streams");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 cursor-pointer">Streams</button>
            <button onClick={() => {
              const el = document.getElementById("resources");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 cursor-pointer">Resources</button>
            <button onClick={() => onOpenAuth("admin")} className="text-xs font-semibold text-slate-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer">
              🔐 Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
