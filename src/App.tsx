import React, { useState, useEffect } from "react";
import {
  GraduationCap, LayoutDashboard, Compass, BrainCircuit, MessageSquare, BookOpen,
  Bookmark, User as UserIcon, LogOut, Bell, Menu, X, Search, Sparkles, Award,
  ArrowRight, ShieldCheck, ChevronRight, Sliders, Check, HelpCircle, Users, TrendingUp,
  Calendar, Trash2
} from "lucide-react";

import Home from "./components/Home";
import Auth from "./components/Auth";
import StreamExplorer from "./components/StreamExplorer";
import CareerExplorer from "./components/CareerExplorer";
import CareerQuiz from "./components/CareerQuiz";
import AiGuide from "./components/AiGuide";
import Profile from "./components/Profile";
import Resources from "./components/Resources";
import AdminPanel from "./components/AdminPanel";
import FloatingAi from "./components/FloatingAi";

import { User, Notification } from "./types";
import { getCareer, allCareers, CATEGORY_LABELS, CompiledCareer, updateDynamicData } from "./data";
import { updateResources } from "./components/Resources";
import { updateQuizQuestions } from "./components/CareerQuiz";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<"overview" | "students" | "activities" | "careers" | "streams" | "resources" | "quiz" | "notifications" | "ai">("overview");
  const [authMode, setAuthMode] = useState<"login" | "register" | "admin" | null>(null);
  const [savedCareers, setSavedCareers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastNotification, setToastNotification] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Student view activities states
  const [studentActivities, setStudentActivities] = useState<any[]>([]);
  const [activeQuizModal, setActiveQuizModal] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizTimer, setQuizTimer] = useState<number>(0);
  const [quizSubmittedResult, setQuizSubmittedResult] = useState<number | null>(null);

  // Compare Careers Tray
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchStudentActivities = async () => {
    try {
      const res = await fetch("/api/activities");
      if (res.ok) {
        const data = await res.json();
        setStudentActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Failed to fetch custom activities:", err);
    }
  };

  const fetchPlatformData = async () => {
    try {
      const res = await fetch("/api/platform/data");
      if (res.ok) {
        const data = await res.json();
        updateDynamicData(data.customCareers, data.customStreams);
        updateResources(data.customResources);
        updateQuizQuestions(data.customQuizQuestions);
      }
    } catch (err) {
      console.error("Failed to fetch custom platform data:", err);
    }
  };

  // Load session and platform data on startup
  useEffect(() => {
    fetchPlatformData();
    fetchStudentActivities();
    try {
      const stored = localStorage.getItem("newedu_user");
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        const isAdminUser = u.role === "admin" || u.email === "admin@educarrier.com" || u.email === "admin@example.com";
        setActiveTab(isAdminUser ? "admin" : "dashboard");
        loadUserData(u.id);
      }
    } catch (e) {}
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Fetch saved career bookmarks
      const bRes = await fetch(`/api/bookmarks/${userId}`);
      if (bRes.ok) {
        const bData = await bRes.json();
        setSavedCareers(bData.bookmarks || []);
      }

      // Fetch student notification list
      const nRes = await fetch(`/api/notifications/${userId}`);
      if (nRes.ok) {
        const nData = await nRes.json();
        const incoming = nData.notifications || [];
        setNotifications((prevNotifications) => {
          if (prevNotifications.length > 0 && incoming.length > prevNotifications.length) {
            const newOnes = incoming.filter(
              (n: any) => !prevNotifications.some((existing) => existing.id === n.id)
            );
            if (newOnes.length > 0) {
              setToastNotification(newOnes[0]);
            }
          }
          return incoming;
        });
      }

      // Fetch activities list
      fetchStudentActivities();
    } catch (err) {
      console.error("Failed to load user credentials:", err);
    }
  };

  // Real-time notification and activity background polling loop
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      loadUserData(user.id);
    }, 6000); // Poll every 6 seconds for a highly responsive feel
    return () => clearInterval(intervalId);
  }, [user]);

  // Timer effect for active quiz activity
  useEffect(() => {
    if (!activeQuizModal) return;
    if (quizTimer <= 0) {
      handleQuizAutoSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setQuizTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [activeQuizModal, quizTimer]);

  const handleQuizAutoSubmit = () => {
    alert("Time limit reached! Your quiz attempts have been auto-submitted.");
    submitStudentQuiz();
  };

  const submitStudentQuiz = async () => {
    if (!user || !activeQuizModal) return;
    
    // Calculate score
    let score = 0;
    const questions = activeQuizModal.questions || [];
    questions.forEach((q: any) => {
      const selected = quizAnswers[q.id || q.question];
      if (selected === q.correctAnswer) {
        score += q.marks || 10;
      }
    });

    try {
      const res = await fetch("/api/activities/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          activityId: activeQuizModal.id,
          action: "complete",
          score
        })
      });
      if (res.ok) {
        setQuizSubmittedResult(score);
        fetchStudentActivities();
        loadUserData(user.id);
      } else {
        alert("Failed to record your quiz submission. Please try again.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteOtherActivity = async (activityId: string, type: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/activities/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          activityId,
          action: "complete"
        })
      });
      if (res.ok) {
        alert(`Successfully completed: ${type.toUpperCase()}! Your achievements have been registered. 🌟`);
        fetchStudentActivities();
        loadUserData(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterForEvent = async (activityId: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/activities/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          activityId,
          action: "register"
        })
      });
      if (res.ok) {
        alert("Registration confirmed! Event added to your scheduled notifications. 🎓");
        fetchStudentActivities();
        loadUserData(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("newedu_user", JSON.stringify(loggedInUser));
    const isAdminUser = loggedInUser.role === "admin" || loggedInUser.email === "admin@educarrier.com" || loggedInUser.email === "admin@example.com";
    setActiveTab(isAdminUser ? "admin" : "dashboard");
    loadUserData(loggedInUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    setSavedCareers([]);
    setNotifications([]);
    setCompareList([]);
    localStorage.removeItem("newedu_user");
    setActiveTab("home");
  };

  // Toggle saving bookmark and sync to database
  const handleToggleSave = async (id: string) => {
    if (!user) {
      setAuthMode("login");
      return;
    }

    const updated = savedCareers.includes(id)
      ? savedCareers.filter((val) => val !== id)
      : [...savedCareers, id];

    setSavedCareers(updated);

    try {
      await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, careerId: id })
      });
      // reload alerts
      loadUserData(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch(`/api/notifications/read/${user.id}`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  // Delete a specific notification
  const handleDeleteNotification = async (notificationId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/notifications/${user.id}/${notificationId}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic quick-prompt triggers
  const handleOpenAiGuidePrompt = (promptText?: string) => {
    setAiPrompt(promptText);
    setActiveTab("ai-guide");
  };

  // Compare toggle mechanics
  const handleToggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter((val) => val !== id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare a maximum of 3 careers side-by-side.");
        return;
      }
      setCompareList([...compareList, id]);
    }
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Calculate profile completeness %
  const getProfileCompleteness = () => {
    if (!user) return 0;
    let score = 0;
    if (user.fullName) score += 20;
    if (user.classLevel) score += 20;
    if (savedCareers.length > 0) score += 20;
    if (user.skills && user.skills.length > 0) score += 20;
    if (user.preferredSubjects && user.preferredSubjects.length > 0) score += 20;
    return score;
  };

  // Renders the correct view tab in the workspace panel
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardHome();
      case "careers":
        return (
          <CareerExplorer
            user={user}
            savedCareers={savedCareers}
            onToggleSave={handleToggleSave}
            onOpenQuiz={() => setActiveTab("quiz")}
            onOpenAiGuide={handleOpenAiGuidePrompt}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onClearCompare={handleClearCompare}
            onOpenCompare={() => setShowCompareModal(true)}
          />
        );
      case "streams":
        return (
          <StreamExplorer
            onOpenCareer={(id) => {
              setActiveTab("careers");
              // triggers highlight/view by default
            }}
            onOpenAiGuide={handleOpenAiGuidePrompt}
          />
        );
      case "quiz":
        return (
          <CareerQuiz
            user={user}
            onQuizCompleted={() => {
              if (user) loadUserData(user.id);
            }}
            onOpenCareer={(id) => {
              setActiveTab("careers");
            }}
          />
        );
      case "ai-guide":
        return (
          <AiGuide
            user={user}
            initialPrompt={aiPrompt}
            onClearInitialPrompt={() => setAiPrompt(undefined)}
          />
        );
      case "resources":
        return <Resources />;
      case "activities":
        return renderStudentActivitiesTab();
      case "saved":
        return renderSavedCareersTab();
      case "profile":
        return user ? (
          <Profile
            user={user}
            savedCareersCount={savedCareers.length}
            onProfileUpdated={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem("newedu_user", JSON.stringify(updatedUser));
            }}
          />
        ) : null;
      case "admin":
        return (
          <AdminPanel
            onRefreshData={fetchPlatformData}
            activeSubTab={adminActiveSubTab}
            setActiveSubTab={setAdminActiveSubTab}
          />
        );
      default:
        return renderDashboardHome();
    }
  };

  const isAdmin = !!(user && (user.role === "admin" || user.email === "admin@educarrier.com" || user.email === "admin@example.com"));

  // Sidebar item configuration
  const sidebarItems = isAdmin ? [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
    { id: "students", label: "Students Directory", icon: Users, requiresAuth: true },
    { id: "careers", label: "Manage Careers", icon: Compass, requiresAuth: true },
    { id: "streams", label: "Manage Streams", icon: BookOpen, requiresAuth: true },
    { id: "resources", label: "Manage Resources", icon: Sliders, requiresAuth: true },
    { id: "quiz", label: "Quiz", icon: BrainCircuit, requiresAuth: true },
    { id: "activities", label: "Manage Activities", icon: Calendar, requiresAuth: true }
  ] : [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
    { id: "activities", label: "Activities & Tasks", icon: Calendar, requiresAuth: true },
    { id: "streams", label: "Explore Streams", icon: BookOpen, requiresAuth: false },
    { id: "careers", label: "Career Explorer", icon: Compass, requiresAuth: false },
    { id: "quiz", label: "Career Quiz", icon: BrainCircuit, requiresAuth: true },
    { id: "ai-guide", label: "AI Guide", icon: MessageSquare, requiresAuth: true },
    { id: "resources", label: "Resources & Dates", icon: Sliders, requiresAuth: false }
  ];

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // The custom detailed Student Dashboard tab
  const renderDashboardHome = () => {
    if (!user) return null;
    const pPct = getProfileCompleteness();

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Premium Welcome & Status Dashboard Header */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-8 text-slate-800 border border-slate-100 shadow-xl shadow-slate-100/40">
          {/* Subtle decorative grid/glow backdrops */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-gradient-to-tr from-indigo-50/50 to-purple-50/50 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/70 border border-indigo-100/50 text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Premium Advisor Active
              </div>
              <h1 className="text-3.5xl font-black tracking-tight text-slate-900 leading-none">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
                Your career matches have been synchronized with the class-specific standard: <span className="font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-100/30 px-2.5 py-1 rounded-lg">{user.classLevel || "Class 11"} Track</span>.
              </p>
            </div>

            {/* Premium Multi-Stat Indicators */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100/70 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Readiness</span>
                  <span className="text-base font-black text-slate-800">{pPct}% Complete</span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100/70 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Saves</span>
                  <span className="text-base font-black text-slate-800">{savedCareers.length} Tracks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics & Strengths Dashboard */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Interactive SVG Career Match Radar & Insights */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Real-time Analysis</span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Interactive Compatibility Matrix</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Based on current profile benchmarks, these are the matching index metrics across different streams:
                </p>
              </div>

              {/* Progress bars matching active benchmarks */}
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Engineering & Tech (MPC / Emerging)</span>
                    <span className="text-indigo-600">92% Match</span>
                  </div>
                  <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Commerce & Finance (MEC / CEC)</span>
                    <span className="text-emerald-600">85% Match</span>
                  </div>
                  <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Public Admin & Legal Studies (CEC / Arts)</span>
                    <span className="text-rose-500">74% Match</span>
                  </div>
                  <div className="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full" style={{ width: "74%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stunning Custom SVG Match Dial Graphic */}
            <div className="w-48 h-48 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center p-4 relative flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-slate-200 fill-none" strokeWidth="8" />
                <circle cx="64" cy="64" r="54" className="stroke-indigo-600 fill-none" strokeWidth="8" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * 0.88)} strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 block leading-none">88%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1">Match Index</span>
              </div>
            </div>
          </div>

          {/* Activity Logs & Milestones Timeline */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Aptitude Roadmap</h3>
            
            <div className="space-y-4 relative before:absolute before:left-4.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <div className="flex gap-4.5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">Explore Streams</span>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-normal">
                    Assess detailed courses across MPC, PCMB, MEC, CEC, and Humanities tracks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4.5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">Identify Interest Vector</span>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-normal">
                    Complete the dynamic 6-step questionnaire to refine matching percentages.
                  </p>
                </div>
              </div>

              <div className="flex gap-4.5 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">Consult Advisor</span>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-normal">
                    Engage with the dashboard counselor regarding upcoming entrance exam dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB: Student Activities & Challenges */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <span className="animate-pulse">🔴</span> Interactive Tasks & Real-Time Activities
              </h3>
              <p className="text-slate-400 text-[10px] mt-0.5 font-semibold">Participate in scheduled quizzes, admissions news, custom tasks & daily challenges curated for your academic track.</p>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold border border-indigo-100">
              {(() => {
                const studentClass = user.classLevel || "Class 11";
                const matchCount = studentActivities.filter((act) => {
                  if (act.status !== "Published" && act.status !== "published") return false;
                  const target = act.targetAudience || "All";
                  if (target === "All") return true;
                  if (target === studentClass) return true;
                  if (target === "Class 9-10" && (studentClass === "Class 9" || studentClass === "Class 10")) return true;
                  if (target === "Class 11-12" && (studentClass === "Class 11" || studentClass === "Class 12")) return true;
                  return false;
                }).length;
                return matchCount;
              })()} Available
            </span>
          </div>

          {(() => {
            const studentClass = user.classLevel || "Class 11";
            const matchingActivities = studentActivities.filter((act) => {
              if (act.status !== "Published" && act.status !== "published") return false;
              const target = act.targetAudience || "All";
              if (target === "All") return true;
              if (target === studentClass) return true;
              if (target === "Class 9-10" && (studentClass === "Class 9" || studentClass === "Class 10")) return true;
              if (target === "Class 11-12" && (studentClass === "Class 11" || studentClass === "Class 12")) return true;
              return false;
            });

            if (matchingActivities.length === 0) {
              return (
                <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-2xl block mb-2">🎉</span>
                  <p className="text-slate-500 font-extrabold text-xs">All caught up! No active challenges scheduled for your class level.</p>
                  <p className="text-slate-400 text-[10px] mt-1">Check back later or explore other career guidance modules below.</p>
                </div>
              );
            }

            return (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {matchingActivities.map((act) => {
                  const isCompleted = act.completions?.includes(user.id) || act.participants?.includes(user.id);
                  const isRegistered = act.participants?.includes(user.id);
                  const scoreResult = act.results?.find((r: any) => r.userId === user.id)?.score;

                  const borderColors: Record<string, string> = {
                    quiz: "border-indigo-100 hover:border-indigo-300",
                    news: "border-emerald-100 hover:border-emerald-300",
                    event: "border-amber-100 hover:border-amber-300",
                    challenge: "border-rose-100 hover:border-rose-300"
                  };
                  const borderCls = borderColors[act.type] || "border-slate-100 hover:border-slate-300";

                  const badgeColors: Record<string, string> = {
                    quiz: "bg-indigo-50 text-indigo-700 border-indigo-100/60",
                    news: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
                    event: "bg-amber-50 text-amber-700 border-amber-100/60",
                    challenge: "bg-rose-50 text-rose-700 border-rose-100/60"
                  };
                  const badgeCls = badgeColors[act.type] || "bg-slate-100 text-slate-700 border-slate-200/60";

                  const iconMap: Record<string, string> = {
                    quiz: "📝",
                    news: "📰",
                    task: "🎯",
                    challenge: "🧠",
                    competition: "🏆",
                    learning: "📚",
                    announcement: "📢",
                    event: "🎓"
                  };
                  const typeIcon = iconMap[act.type] || "✨";

                  return (
                    <div
                      key={act.id}
                      className={`bg-white border ${borderCls} rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between gap-4`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${badgeCls}`}>
                            {typeIcon} {act.type}
                          </span>
                          {act.priority === "High" && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Urgent</span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs tracking-tight line-clamp-1">{act.title}</h4>
                          <p className="text-slate-400 text-[10px] mt-1 leading-normal line-clamp-2">{act.description}</p>
                        </div>

                        {act.type === "news" && act.source && (
                          <div className="text-[9px] text-slate-400 font-bold bg-slate-50 p-1.5 rounded-lg border border-slate-100 truncate">
                            Source: <span className="text-slate-600 font-extrabold">{act.source}</span>
                          </div>
                        )}
                        {act.type === "event" && (act.eventDate || act.eventTime) && (
                          <div className="text-[9px] text-indigo-600 font-bold bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/30">
                            📅 {act.eventDate} at {act.eventTime}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-semibold">{act.endDate ? `Ends ${act.endDate}` : "Active"}</span>
                        
                        {isCompleted ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                            Completed ✅ {scoreResult !== undefined ? `(${scoreResult} pts)` : ""}
                          </span>
                        ) : act.type === "quiz" ? (
                          <button
                            onClick={() => {
                              setActiveQuizModal(act);
                              setQuizAnswers({});
                              setQuizTimer((act.timeLimit || 10) * 60);
                              setQuizSubmittedResult(null);
                            }}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer transition-colors"
                          >
                            Take Quiz ({act.timeLimit || 10}m)
                          </button>
                        ) : act.type === "event" ? (
                          isRegistered ? (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-100">
                              Registered 📅
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRegisterForEvent(act.id)}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer transition-colors"
                            >
                              Register Now
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleCompleteOtherActivity(act.id, act.type)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* QUIZ WORKSPACE MODAL OVERLAY */}
        {activeQuizModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-xs">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-100">
                    Active Quiz Session
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-800 block mt-1">{activeQuizModal.title}</h4>
                </div>

                {!quizSubmittedResult && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 font-mono font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <span className="animate-ping w-2 h-2 rounded-full bg-rose-500"></span>
                    Time Remaining: {Math.floor(quizTimer / 60)}:{(quizTimer % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {quizSubmittedResult !== null ? (
                <div className="text-center py-6 space-y-4 animate-in zoom-in duration-200">
                  <span className="text-4xl block">🏆</span>
                  <div className="space-y-1">
                    <h5 className="font-extrabold text-slate-900 text-sm">Attempt Submitted Successfully!</h5>
                    <p className="text-slate-400 text-[10px]">Your results have been synchronized with the academy database.</p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 max-w-xs mx-auto">
                    <span className="text-xs text-indigo-500 uppercase font-bold tracking-widest block">Your Score</span>
                    <span className="text-3xl font-black text-indigo-700 font-mono block mt-1">{quizSubmittedResult} Points</span>
                  </div>

                  <div className="space-y-3 text-left border border-slate-100 p-4 rounded-2xl max-h-[250px] overflow-y-auto bg-slate-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block border-b pb-1">Response Review</span>
                    {(activeQuizModal.questions || []).map((q: any, idx: number) => {
                      const ans = quizAnswers[q.id || q.question];
                      const isCorrect = ans === q.correctAnswer;
                      return (
                        <div key={idx} className="border-b border-slate-100 pb-2 mb-2 last:border-0 last:pb-0">
                          <span className="font-extrabold text-slate-700 text-xs block">Q{idx + 1}: {q.question}</span>
                          <span className="block text-[10px] mt-0.5 text-slate-500">
                            Your response: <span className={isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{ans || "Unanswered"}</span>
                          </span>
                          {!isCorrect && (
                            <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                              Correct option: {q.correctAnswer}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={() => {
                        setActiveQuizModal(null);
                        setQuizSubmittedResult(null);
                        setQuizAnswers({});
                      }}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      Dismiss Session
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); submitStudentQuiz(); }} className="space-y-5">
                  <div className="space-y-5">
                    {(activeQuizModal.questions || []).map((q: any, idx: number) => (
                      <div key={q.id || idx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
                        <span className="font-extrabold text-slate-800 text-xs block">
                          Question {idx + 1}: {q.question}
                        </span>

                        <div className="grid sm:grid-cols-2 gap-2.5">
                          {(q.options || []).map((opt: string, oIdx: number) => {
                            const isSelected = quizAnswers[q.id || q.question] === opt;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  setQuizAnswers({
                                    ...quizAnswers,
                                    [q.id || q.question]: opt
                                  });
                                }}
                                className={`p-2.5 border rounded-xl text-left font-bold text-[11px] transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected 
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm" 
                                    : "bg-white border-slate-200 hover:border-indigo-50/50 text-slate-600"
                                }`}
                              >
                                {opt}
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black ${
                                  isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                                }`}>
                                  {isSelected ? "✓" : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel the active quiz? Progress will be lost.")) {
                          setActiveQuizModal(null);
                        }
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 text-xs cursor-pointer"
                    >
                      Quit Quiz
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                    >
                      Submit Quiz Attempt 🚀
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Premium Action Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100/80 p-6 rounded-3xl flex flex-col justify-between gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-6 right-6 text-[9px] font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-100/50 px-2 py-0.5 rounded-lg">
              Match Engine
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800 tracking-tight">Interactive Interest Vector</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take our refined 6-step cognitive quiz to build an aptitude match chart for all 100+ professional disciplines.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("quiz")}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-700 text-left flex items-center justify-between border border-slate-100 hover:border-slate-800 transition-all duration-200 cursor-pointer"
            >
              Start Career Quiz
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-100/80 p-6 rounded-3xl flex flex-col justify-between gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-6 right-6 text-[9px] font-bold text-emerald-600 bg-emerald-50/70 border border-emerald-100/50 px-2 py-0.5 rounded-lg">
              Counselor Module
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800 tracking-tight">Consult Advisor Chatbot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect directly with the Gemini Counselor to build custom phase-by-phase roadmaps and examine exam requirements.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("ai-guide")}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-700 text-left flex items-center justify-between border border-slate-100 hover:border-slate-800 transition-all duration-200 cursor-pointer"
            >
              Open Counselor Chat
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white border border-slate-100/80 p-6 rounded-3xl flex flex-col justify-between gap-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-6 right-6 text-[9px] font-bold text-amber-600 bg-amber-50/70 border border-amber-100/50 px-2 py-0.5 rounded-lg">
              Saved Desk
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center font-bold">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800 tracking-tight">Review Bookmarked Paths</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quickly access your desk of bookmarked career profiles, entrance syllabi, eligibility metrics, and income stats.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("saved")}
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-xs font-bold text-slate-700 text-left flex items-center justify-between border border-slate-100 hover:border-slate-800 transition-all duration-200 cursor-pointer"
            >
              Manage Saved ({savedCareers.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Pathways Grid */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-100/50 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Top Stream Career Highlights</h3>
            <button 
              onClick={() => setActiveTab("careers")} 
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Browse All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {allCareers().slice(0, 3).map((career) => (
              <div
                key={career.id}
                onClick={() => {
                  setActiveTab("careers");
                }}
                className="p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-lg rounded-2xl cursor-pointer flex flex-col justify-between gap-3.5 transition-all bg-slate-50/50 hover:bg-white"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest">{CATEGORY_LABELS[career.category]}</span>
                  <span className="text-sm font-black text-slate-800 block leading-tight">{career.title}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500">
                    ₹{career.salary[0]}L - ₹{career.salary[1]}L /yr
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/50">
                    {career.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating AI Helper */}
        <FloatingAi user={user} />
      </div>
    );
  };

  // Dedicated Student Activities & Live Tasks Tab
  const renderStudentActivitiesTab = () => {
    if (!user) return null;
    const studentClass = user.classLevel || "Class 11";

    const matchingActivities = studentActivities.filter((act) => {
      if (act.status !== "Published" && act.status !== "published") return false;
      const target = act.targetAudience || "All";
      if (target === "All") return true;
      if (target === studentClass) return true;
      if (target === "Class 9-10" && (studentClass === "Class 9" || studentClass === "Class 10")) return true;
      if (target === "Class 11-12" && (studentClass === "Class 11" || studentClass === "Class 12")) return true;
      return false;
    });

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="animate-pulse text-indigo-600">🔴</span> Activities & Live Tasks
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Participate in scheduled quizzes, custom challenges, news bulletins, and academic events curated for <span className="text-indigo-600 font-extrabold">{studentClass}</span>.
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-bold border border-indigo-100 self-start sm:self-center">
            {matchingActivities.length} Active Challenges
          </span>
        </div>

        {matchingActivities.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto p-8 shadow-sm">
            <span className="text-4xl block mb-3">🎉</span>
            <p className="text-slate-800 font-extrabold text-sm">All caught up! No active challenges scheduled.</p>
            <p className="text-slate-400 text-xs mt-1">Your counselor will schedule new events and quizzes shortly. Explore other resources in the meantime!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingActivities.map((act) => {
              const isCompleted = act.completions?.includes(user.id) || act.participants?.includes(user.id);
              const isRegistered = act.participants?.includes(user.id);
              const scoreResult = act.results?.find((r: any) => r.userId === user.id)?.score;

              const borderColors: Record<string, string> = {
                quiz: "border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-50/50",
                news: "border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-50/50",
                event: "border-amber-100 hover:border-amber-300 hover:shadow-amber-50/50",
                challenge: "border-rose-100 hover:border-rose-300 hover:shadow-rose-50/50"
              };
              const borderCls = borderColors[act.type] || "border-slate-100 hover:border-slate-300";

              const badgeColors: Record<string, string> = {
                quiz: "bg-indigo-50 text-indigo-700 border-indigo-100/60",
                news: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
                event: "bg-amber-50 text-amber-700 border-amber-100/60",
                challenge: "bg-rose-50 text-rose-700 border-rose-100/60"
              };
              const badgeCls = badgeColors[act.type] || "bg-slate-100 text-slate-700 border-slate-200/60";

              const iconMap: Record<string, string> = {
                quiz: "📝",
                news: "📰",
                task: "🎯",
                challenge: "🧠",
                competition: "🏆",
                learning: "📚",
                announcement: "📢",
                event: "🎓"
              };
              const typeIcon = iconMap[act.type] || "✨";

              return (
                <div
                  key={act.id}
                  className={`bg-white border ${borderCls} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${badgeCls}`}>
                        {typeIcon} {act.type}
                      </span>
                      {act.priority === "High" && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Urgent</span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight line-clamp-1">{act.title}</h4>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-3">{act.description}</p>
                    </div>

                    {act.type === "news" && act.source && (
                      <div className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2 rounded-xl border border-slate-100 truncate">
                        Source: <span className="text-slate-700 font-extrabold">{act.source}</span>
                      </div>
                    )}
                    {act.type === "event" && (act.eventDate || act.eventTime) && (
                      <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/30">
                        📅 {act.eventDate} at {act.eventTime}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-bold">{act.endDate ? `Ends ${act.endDate}` : "Active"}</span>
                    
                    {isCompleted ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3.5 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                        Completed ✅ {scoreResult !== undefined ? `(${scoreResult} pts)` : ""}
                      </span>
                    ) : act.type === "quiz" ? (
                      <button
                        onClick={() => {
                          setActiveQuizModal(act);
                          setQuizAnswers({});
                          setQuizTimer((act.timeLimit || 10) * 60);
                          setQuizSubmittedResult(null);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                      >
                        Take Quiz ({act.timeLimit || 10}m)
                      </button>
                    ) : act.type === "event" ? (
                      isRegistered ? (
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3.5 py-2 rounded-xl border border-amber-100">
                          Registered 📅
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegisterForEvent(act.id)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                        >
                          Register Now
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleCompleteOtherActivity(act.id, act.type)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Saved careers list builder view
  const renderSavedCareersTab = () => {
    const savedList = savedCareers.map((id) => getCareer(id)).filter((c): c is CompiledCareer => c !== undefined);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Career Bookmarks</h1>
          <p className="text-sm text-slate-500 mt-1">Review saved careers, salary vectors, and custom phase roadmaps.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col justify-between gap-4 hover:shadow-xl hover:shadow-slate-100 hover:border-indigo-100 transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                      {CATEGORY_LABELS[c.category]}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleSave(c.id)}
                    className="p-1.5 rounded-lg border border-amber-200 text-amber-500 bg-amber-50"
                  >
                    <Bookmark className="w-4 h-4" fill="currentColor" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {c.short}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-full">
                    ₹{c.salary[0]}L - ₹{c.salary[1]}L /yr
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full">
                    {c.growth}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <button
                  onClick={() => {
                    // Set active and open modal by routing to career tab
                    setActiveTab("careers");
                  }}
                  className="w-full py-2 bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-100 rounded-xl text-xs font-bold text-indigo-600 text-center transition-all"
                >
                  View full guide & roadmap
                </button>
              </div>
            </div>
          ))}

          {savedList.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-3xl p-10">
              No saved careers found. Explore Career Explorer and click bookmark button on cards to save.
            </div>
          )}
        </div>
      </div>
    );
  };

  const isPublicPage = !user && (activeTab === "home" || activeTab === "careers" || activeTab === "streams" || activeTab === "resources");

  if (activeTab === "home" && !user) {
    return (
      <>
        <Home
          onNavigate={(tab) => {
            if (tab === "home") return;
            setActiveTab(tab);
          }}
          onOpenAuth={(mode) => setAuthMode(mode)}
        />

        {authMode && (
          <Auth
            initialMode={authMode}
            onClose={() => setAuthMode(null)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </>
    );
  }

  // Comparison Matrix Builder
  const compareListDetails = compareList.map(id => getCareer(id)).filter(Boolean) as CompiledCareer[];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col gap-8 py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(user ? "dashboard" : "home")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">Edu Carrier</span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">AI Counselor</span>
              </div>
            </div>

            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              if (!isAdmin && item.requiresAuth && !user) return null;
              const Icon = item.icon;
              const active = isAdmin
                ? (activeTab === "admin" && adminActiveSubTab === item.id)
                : (activeTab === item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAdmin) {
                      setActiveTab("admin");
                      setAdminActiveSubTab(item.id as any);
                    } else {
                      setActiveTab(item.id);
                    }
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${active ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-800 truncate">{user.fullName}</span>
                  <span className="block text-[10px] text-indigo-600 font-extrabold uppercase truncate">
                    {user.role === "admin" || user.email === "admin@educarrier.com" ? "ADMIN" : user.classLevel}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/50 text-xs font-bold transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setAuthMode("login")}
              className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 transition-all"
            >
              <UserIcon className="w-4.5 h-4.5" />
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen relative">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
              <Menu className="w-6 h-6" />
            </button>

            {/* Quick search that routes to career explorer */}
            <div className="relative w-44 sm:w-64 hidden sm:block">
              <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              <input
                type="text"
                placeholder="Search catalog/careers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveTab("careers");
                }}
                className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Saved Careers shortcut (non-admin only) */}
            {user && !isAdmin && (
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "saved"
                    ? "bg-amber-50 text-amber-700 border-amber-200 shadow-xs"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                }`}
                title="Go to Saved Careers"
              >
                <Bookmark className={`w-4 h-4 ${activeTab === "saved" ? "fill-current text-amber-600" : "text-slate-400"}`} />
                <span className="hidden sm:inline">Saved Careers</span>
                {savedCareers.length > 0 && (
                  <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md">
                    {savedCareers.length}
                  </span>
                )}
              </button>
            )}

            {/* Notification drop */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) handleMarkNotificationsRead();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 relative border border-slate-100 shadow-sm"
                  aria-label="Toggle notifications"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Alert Center</span>
                      <button onClick={() => setShowNotifications(false)} className="text-[10px] text-indigo-600 font-bold hover:text-indigo-700">Close</button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setActiveTab("activities");
                            setShowNotifications(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 hover:bg-indigo-50/50 cursor-pointer transition-all text-left relative group/notif"
                        >
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 flex-none animate-pulse"></div>
                          <div className="flex-1 min-w-0 pr-5">
                            <p className="text-[11px] font-bold text-slate-700 leading-tight">{notif.title}</p>
                            <span className="block text-[9px] text-slate-400 mt-0.5 leading-normal">{notif.body}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notif.id);
                            }}
                            className="absolute right-2 top-2 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover/notif:opacity-100 focus:opacity-100"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {notifications.length === 0 && (
                        <span className="block text-center py-6 text-[11px] text-slate-400 italic">No alerts at this time.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div className="relative">
                {isAdmin ? (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 select-none text-left">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user.fullName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user.fullName.split(" ")[0]} (Admin)</span>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 cursor-pointer bg-slate-50 p-1.5 rounded-xl border border-slate-100 hover:bg-indigo-50/50 transition-all select-none text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {user.fullName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-600 hidden sm:inline">{user.fullName.split(" ")[0]}</span>
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3.5 py-2 border-b border-slate-100 mb-1.5">
                          <p className="text-xs font-bold text-slate-800 truncate">{user.fullName}</p>
                          <span className="block text-[10px] text-slate-400 font-bold truncate">{user.email}</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab("profile");
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-left"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Academic Profile
                        </button>

                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all text-left border-t border-slate-100 mt-1.5 pt-2"
                        >
                          <LogOut className="w-4 h-4 text-slate-400" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthMode("login")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Content Workspace */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

      {/* Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCompareModal(false)}></div>

          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-250">
            <button onClick={() => setShowCompareModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sliders className="w-5.5 h-5.5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Side-by-Side Comparison</h2>
                <p className="text-xs text-slate-400">Compare curriculum, average salaries, entrance criteria, and study timelines.</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-1/4">Criteria</th>
                    {compareListDetails.map((c) => (
                      <th key={c.id} className="py-3.5 px-4 text-slate-800 font-extrabold">{c.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Curriculum / Sector</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal">
                        {CATEGORY_LABELS[c.category]}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Required Qualification</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal">
                        {c.degree}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Indicative Entry Criteria</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal">
                        {c.eligibility}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Average Salary Range</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal font-mono font-bold text-indigo-600">
                        ₹{c.salary[0]}L - ₹{c.salary[1]}L /yr
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Growth Outlook</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-2 py-0.5 rounded font-bold text-[10px]">
                          {c.growth}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Core Entrance Exam</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal italic text-slate-500">
                        {c.exams.join(", ") || "Standard Admission"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-800 bg-slate-50/50">Top Colleges</td>
                    {compareListDetails.map((c) => (
                      <td key={c.id} className="py-3.5 px-4 text-xs leading-normal">
                        {c.colleges[0] || "Top Universities"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 bg-slate-950 text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition-all"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger */}
      {authMode && (
        <Auth
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Floating real-time alert toast */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-[120] max-w-sm bg-white border border-indigo-100 rounded-2xl shadow-2xl p-4 flex gap-3.5 items-start animate-in slide-in-from-right duration-300">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 text-lg">
            🔔
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">{toastNotification.title}</h4>
            <p className="text-slate-500 text-[10px] mt-1 leading-normal line-clamp-2">{toastNotification.body}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => {
                  setActiveTab("activities");
                  setToastNotification(null);
                }}
                className="text-[10px] bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                View Activity
              </button>
              <button
                onClick={() => setToastNotification(null)}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-bold px-2 py-1 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
