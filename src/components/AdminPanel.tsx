import React, { useState, useEffect } from "react";
import {
  Users, GraduationCap, BrainCircuit, MessageSquare, AlertCircle, Compass, BookOpen,
  Sliders, Bell, Sparkles, Plus, Trash2, Edit, Save, Check, X, ShieldCheck, TrendingUp, Info, UserPlus, LayoutDashboard,
  Calendar, Award, CheckSquare, ListTodo, Flame, Trophy, Newspaper, Megaphone, Copy, Eye, Clock, List, RefreshCw
} from "lucide-react";
import { allCareers, STREAMS, CompiledCareer } from "../data";
import { RESOURCES_DATABASE } from "./Resources";
import { QUIZ_QUESTIONS } from "./CareerQuiz";

interface AdminPanelProps {
  onRefreshData?: () => void;
  activeSubTab?: "overview" | "students" | "activities" | "careers" | "streams" | "resources" | "quiz" | "notifications" | "ai";
  setActiveSubTab?: (tab: "overview" | "students" | "activities" | "careers" | "streams" | "resources" | "quiz" | "notifications" | "ai") => void;
}

export default function AdminPanel({ onRefreshData, activeSubTab: externalActiveSubTab, setActiveSubTab: externalSetActiveSubTab }: AdminPanelProps) {
  const [internalActiveSubTab, internalSetActiveSubTab] = useState<"overview" | "students" | "activities" | "careers" | "streams" | "resources" | "quiz" | "notifications" | "ai">("overview");

  const activeSubTab = externalActiveSubTab !== undefined ? externalActiveSubTab : internalActiveSubTab;
  const setActiveSubTab = (tab: "overview" | "students" | "activities" | "careers" | "streams" | "resources" | "quiz" | "notifications" | "ai") => {
    if (externalSetActiveSubTab) {
      externalSetActiveSubTab(tab);
    } else {
      internalSetActiveSubTab(tab);
    }
  };
  const [stats, setStats] = useState<{
    users: number;
    quizzes: number;
    saved: number;
    conversations: number;
  } | null>(null);
  const [studentList, setStudentList] = useState<{ id: string; fullName: string; email: string; classLevel: string; registeredAt: string; role?: string }[]>([]);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Platform Custom data loaded from DB
  const [platformData, setPlatformData] = useState<any>({
    customCareers: [],
    customStreams: [],
    customResources: [],
    customQuizQuestions: [],
    customColleges: [],
    customExams: [],
    customCourses: [],
    customSkills: [],
    customRoadmaps: [],
    customRecommendations: [],
    aiConfig: { systemInstruction: "" }
  });

  // Activities form & management states
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [viewingMetricsActivity, setViewingMetricsActivity] = useState<any | null>(null);

  // Form fields
  const [actType, setActType] = useState<string>("quiz");
  const [actTitle, setActTitle] = useState<string>("");
  const [actDescription, setActDescription] = useState<string>("");
  const [actTargetAudience, setActTargetAudience] = useState<string>("Class 11-12");
  const [actStartDate, setActStartDate] = useState<string>("2026-09-20");
  const [actStartTime, setActStartTime] = useState<string>("06:00 PM");
  const [actEndDate, setActEndDate] = useState<string>("2026-09-20");
  const [actEndTime, setActEndTime] = useState<string>("08:00 PM");
  const [actPriority, setActPriority] = useState<string>("Normal");
  const [actStatus, setActStatus] = useState<string>("Draft");
  
  // Quiz specific sub-form
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    { id: "q1", question: "What does AI stand for?", options: ["Artificial Intelligence", "Active Integration", "Automated Interface", "None of the above"], correctAnswer: "Artificial Intelligence", marks: 10 }
  ]);
  const [quizTimeLimit, setQuizTimeLimit] = useState<number>(10);
  const [quizAttempts, setQuizAttempts] = useState<number>(1);

  // News specific fields
  const [newsImage, setNewsImage] = useState<string>("");
  const [newsSource, setNewsSource] = useState<string>("");
  const [newsExternalRef, setNewsExternalRef] = useState<string>("");
  const [newsCategory, setNewsCategory] = useState<string>("Career Guidance");

  // Event specific fields
  const [eventDate, setEventDate] = useState<string>("2026-09-28");
  const [eventTime, setEventTime] = useState<string>("17:00");

  // Competition specific fields
  const [competitionRules, setCompetitionRules] = useState<string>("1. Attempt honestly. 2. Time limit is strict.");
  const [competitionPoints, setCompetitionPoints] = useState<number>(100);

  // Local Form states for Add / Edit
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Advanced Quiz Builder and Editor states
  const [isAddingQuizQuestion, setIsAddingQuizQuestion] = useState(false);
  const [editingQuizQuestionId, setEditingQuizQuestionId] = useState<string | number | null>(null);
  const [quizFormQ, setQuizFormQ] = useState("");
  const [quizFormHint, setQuizFormHint] = useState("Pick all that apply");
  const [quizFormType, setQuizFormType] = useState<"single" | "multi">("multi");
  const [quizFormOptions, setQuizFormOptions] = useState<any[]>([
    { label: "", tags: {} }
  ]);
  const [aiQuizPrompt, setAiQuizPrompt] = useState("");
  const [isGeneratingQuizQuestion, setIsGeneratingQuizQuestion] = useState(false);

  // New User Form states
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserName, setAddUserName] = useState("");
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserClass, setAddUserClass] = useState("Class 10");
  const [addUserRole, setAddUserRole] = useState("student");
  const [addUserPassword, setAddUserPassword] = useState("");
  const [addUserConfirmPassword, setAddUserConfirmPassword] = useState("");
  const [addUserError, setAddUserError] = useState("");

  // Notifications form state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");

  // AI Prompt form state
  const [aiSystemInstruction, setAiSystemInstruction] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load general stats and student directory
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setStudentList(statsData.users || []);
      }

      // 2. Load custom platform configurations
      const platRes = await fetch("/api/platform/data");
      if (platRes.ok) {
        const platData = await platRes.json();
        setPlatformData(platData);
        if (platData.aiConfig?.systemInstruction) {
          setAiSystemInstruction(platData.aiConfig.systemInstruction);
        }
      }

      // 3. Load activities list
      const actRes = await fetch("/api/activities");
      if (actRes.ok) {
        const actData = await actRes.json();
        setAdminActivities(actData.activities || []);
      }
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const triggerPlatformRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
  };

  // Activity administration operations
  const handleSaveActivity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!actTitle) {
      setAlertMessage({ type: "error", text: "Please provide a title for the activity." });
      return;
    }

    const payload: any = {
      id: editingActivity?.id || undefined,
      type: actType,
      title: actTitle,
      description: actDescription,
      targetAudience: actTargetAudience,
      startDate: actStartDate,
      startTime: actStartTime,
      endDate: actEndDate,
      endTime: actEndTime,
      priority: actPriority,
      status: actStatus
    };

    if (actType === "quiz") {
      payload.questions = quizQuestions;
      payload.timeLimit = quizTimeLimit;
      payload.attemptsAllowed = quizAttempts;
    } else if (actType === "news") {
      payload.image = newsImage;
      payload.source = newsSource;
      payload.externalRef = newsExternalRef;
      payload.category = newsCategory;
    } else if (actType === "event") {
      payload.eventDate = eventDate;
      payload.eventTime = eventTime;
    } else if (actType === "competition") {
      payload.rules = competitionRules;
      payload.points = competitionPoints;
    }

    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAlertMessage({
          type: "success",
          text: editingActivity ? "Activity updated successfully! 🛠️" : "Activity created & notification broadcasted successfully! 📢"
        });
        setIsAddingActivity(false);
        setEditingActivity(null);
        // Reset form
        setActTitle("");
        setActDescription("");
        loadAdminData();
        triggerPlatformRefresh();
      } else {
        setAlertMessage({ type: "error", text: "Failed to save activity." });
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Communication failure with server." });
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      const res = await fetch("/api/activities/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Activity deleted successfully." });
        loadAdminData();
        triggerPlatformRefresh();
      }
    } catch (e) {
      setAlertMessage({ type: "error", text: "Failed to delete activity." });
    }
  };

  const handleDuplicateActivity = async (activity: any) => {
    const duplicated = {
      ...activity,
      id: undefined,
      title: `${activity.title} (Copy)`,
      status: "Draft",
      createdAt: new Date().toISOString(),
      completions: [],
      participants: [],
      results: []
    };
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated)
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Activity duplicated successfully as Draft!" });
        loadAdminData();
        triggerPlatformRefresh();
      }
    } catch (e) {
      setAlertMessage({ type: "error", text: "Failed to duplicate activity." });
    }
  };

  const handlePublishToggle = async (activity: any, forceStatus?: string) => {
    const nextStatus = forceStatus || (activity.status === "Published" || activity.status === "published" || activity.status === "live" ? "Draft" : "Published");
    const updated = {
      ...activity,
      status: nextStatus
    };
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: `Activity marked as ${nextStatus}! 🚀` });
        loadAdminData();
        triggerPlatformRefresh();
      }
    } catch (e) {
      setAlertMessage({ type: "error", text: "Failed to update activity status." });
    }
  };

  const startEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setActType(activity.type);
    setActTitle(activity.title);
    setActDescription(activity.description || "");
    setActTargetAudience(activity.targetAudience || "Class 11-12");
    setActStartDate(activity.startDate || "2026-09-20");
    setActStartTime(activity.startTime || "06:00 PM");
    setActEndDate(activity.endDate || "2026-09-20");
    setActEndTime(activity.endTime || "08:00 PM");
    setActPriority(activity.priority || "Normal");
    setActStatus(activity.status || "Draft");

    if (activity.type === "quiz") {
      setQuizQuestions(activity.questions || []);
      setQuizTimeLimit(activity.timeLimit || 10);
      setQuizAttempts(activity.attemptsAllowed || 1);
    } else if (activity.type === "news") {
      setNewsImage(activity.image || "");
      setNewsSource(activity.source || "");
      setNewsExternalRef(activity.externalRef || "");
      setNewsCategory(activity.category || "Career Guidance");
    } else if (activity.type === "event") {
      setEventDate(activity.eventDate || "2026-09-28");
      setEventTime(activity.eventTime || "17:00");
    } else if (activity.type === "competition") {
      setCompetitionRules(activity.rules || "");
      setCompetitionPoints(activity.points || 100);
    }
    setIsAddingActivity(true);
  };

  const handlePushNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    try {
      const res = await fetch("/api/admin/notifications/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: notifTitle, body: notifBody })
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Alert notification pushed to all active students successfully! 📢" });
        setNotifTitle("");
        setNotifBody("");
        loadAdminData();
        triggerPlatformRefresh();
      } else {
        setAlertMessage({ type: "error", text: "Failed to push announcement notification." });
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Server communication error." });
    }
  };

  const handleSaveFormQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizFormQ.trim()) {
      setAlertMessage({ type: "error", text: "Question statement is required." });
      return;
    }
    const validOptions = quizFormOptions.filter(opt => opt.label.trim() !== "");
    if (validOptions.length < 2) {
      setAlertMessage({ type: "error", text: "Please provide at least 2 options with labels." });
      return;
    }

    try {
      const existingQuestions = getCombinedQuizQuestions();
      let updatedQuestions = [...(platformData.customQuizQuestions || [])];

      if (editingQuizQuestionId !== null) {
        const customIdx = updatedQuestions.findIndex(q => q.id === editingQuizQuestionId);
        const updatedQuestion = {
          id: editingQuizQuestionId,
          q: quizFormQ,
          hint: quizFormHint,
          type: quizFormType,
          options: validOptions
        };
        if (customIdx !== -1) {
          updatedQuestions[customIdx] = updatedQuestion;
        } else {
          updatedQuestions.push(updatedQuestion);
        }
      } else {
        const nextId = existingQuestions.length > 0 
          ? Math.max(...existingQuestions.map(q => typeof q.id === "number" ? q.id : Number(q.id) || 0)) + 1 
          : 1;
        const newQuestion = {
          id: nextId,
          q: quizFormQ,
          hint: quizFormHint,
          type: quizFormType,
          options: validOptions
        };
        updatedQuestions.push(newQuestion);
      }

      await savePlatformCollection("quizQuestions", updatedQuestions);
      setAlertMessage({ type: "success", text: "Quiz question successfully saved and compiled!" });
      setIsAddingQuizQuestion(false);
      setEditingQuizQuestionId(null);
      setQuizFormQ("");
      setQuizFormHint("Pick all that apply");
      setQuizFormType("multi");
      setQuizFormOptions([{ label: "", tags: {} }]);
    } catch (err) {
      setAlertMessage({ type: "error", text: "Failed to save the quiz question." });
    }
  };

  const handleAiDevelopQuestion = async () => {
    if (!aiQuizPrompt.trim()) {
      setAlertMessage({ type: "error", text: "Please enter a career theme or topic first (e.g. Finance, Healthcare)." });
      return;
    }
    setIsGeneratingQuizQuestion(true);
    setAlertMessage(null);
    try {
      const res = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiQuizPrompt })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.q && Array.isArray(data.options)) {
          setQuizFormQ(data.q);
          setQuizFormHint(data.hint || "Pick your preference");
          setQuizFormType((data.type === "multi" ? "multi" : "single") as "single" | "multi");
          setQuizFormOptions(data.options);
          setAlertMessage({ type: "success", text: "AI drafted a custom question! Review, tweak details below, and save when ready. 🪄" });
        } else {
          setAlertMessage({ type: "error", text: "Invalid question structure returned by AI." });
        }
      } else {
        setAlertMessage({ type: "error", text: "Failed to connect to the AI model." });
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Failed to generate AI question draft." });
    } finally {
      setIsGeneratingQuizQuestion(false);
    }
  };

  const handleSaveAiConfig = async () => {
    try {
      const res = await fetch("/api/platform/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "aiConfig",
          data: { systemInstruction: aiSystemInstruction }
        })
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Counselor AI System Guidelines updated successfully!" });
        loadAdminData();
        triggerPlatformRefresh();
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Failed to save AI configuration settings." });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const res = await fetch("/api/admin/students/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action: "delete" })
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Student account deleted successfully." });
        setDeleteConfirmId(null);
        loadAdminData();
        triggerPlatformRefresh();
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Failed to remove user account." });
    }
  };

  // Generic Save to platformData arrays
  const savePlatformCollection = async (type: string, updatedList: any[]) => {
    try {
      const res = await fetch("/api/platform/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data: updatedList })
      });
      if (res.ok) {
        setAlertMessage({ type: "success", text: `${type.toUpperCase()} collection successfully synchronized and deployed live! 🚀` });
        loadAdminData();
        triggerPlatformRefresh();
      } else {
        setAlertMessage({ type: "error", text: `Failed to save changes to ${type}.` });
      }
    } catch (err) {
      setAlertMessage({ type: "error", text: "Network sync failure." });
    }
  };

  // Combine static and custom data for display lists
  const getCombinedCareers = (): CompiledCareer[] => {
    const staticList = allCareers();
    const customList = platformData.customCareers || [];
    // override or concat
    const combined = [...staticList];
    customList.forEach((cc: any) => {
      const idx = combined.findIndex(c => c.id === cc.id);
      if (idx !== -1) {
        combined[idx] = { ...combined[idx], ...cc };
      } else {
        combined.push(cc);
      }
    });
    return combined;
  };

  const getCombinedResources = () => {
    const staticList = RESOURCES_DATABASE;
    const customList = platformData.customResources || [];
    const combined = [...staticList];
    customList.forEach((cr: any) => {
      const idx = combined.findIndex(r => r.id === cr.id);
      if (idx !== -1) {
        combined[idx] = { ...combined[idx], ...cr };
      } else {
        combined.push(cr);
      }
    });
    return combined;
  };

  const getCombinedQuizQuestions = () => {
    const staticList = QUIZ_QUESTIONS;
    const customList = platformData.customQuizQuestions || [];
    const combined = [...staticList];
    customList.forEach((cq: any) => {
      const idx = combined.findIndex(q => q.id === cq.id);
      if (idx !== -1) {
        combined[idx] = { ...combined[idx], ...cq };
      } else {
        combined.push(cq);
      }
    });
    return combined;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-xs font-semibold text-slate-400 gap-2">
        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        Syncing admin directory logs...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white text-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-100/40 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-50 to-indigo-50/30 rounded-full blur-3xl -mr-20 -mt-20 -z-10"></div>
        <div className="relative z-10">
          <span className="bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase inline-block mb-2 border border-amber-200">
            Edu Carrier Command Center
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Platform Administration</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Publish educational streams, trending careers, manage matching quiz rubrics, and broadcast global student alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              loadAdminData();
              setAlertMessage({ type: "success", text: "All directories re-synchronized from database successfully." });
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-100"
          >
            Re-Sync System Data
          </button>
        </div>
      </div>

      {alertMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
          alertMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-red-50 text-red-800 border-red-100"
        }`}>
          <span>{alertMessage.text}</span>
          <button onClick={() => setAlertMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>
      )}

      {/* Administrative Sub Tabs bar */}
      {!externalActiveSubTab && (
        <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-1 scrollbar-none">
          {[
            { id: "overview", label: "Dashboard", icon: LayoutDashboard },
            { id: "students", label: "Students Directory", icon: Users },
            { id: "activities", label: "Manage Activities", icon: Calendar },
            { id: "careers", label: "Manage Careers", icon: Compass },
            { id: "streams", label: "Manage Streams", icon: BookOpen },
            { id: "resources", label: "Manage Resources", icon: Sliders },
            { id: "quiz", label: "Quiz", icon: BrainCircuit },
            { id: "ai", label: "AI", icon: Sparkles }
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setSelectedItem(null);
                  setIsAdding(false);
                  setAlertMessage(null);
                }}
                className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeSubTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN CONTAINER TABS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        
        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {activeSubTab === "overview" && (
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl text-slate-800 border border-slate-200/80">
            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Good Morning, Admin <span className="animate-bounce">👋</span>
              </h2>
              <p className="text-slate-500 text-xs">Here's what's happening on Edu Carrier today.</p>
            </div>

            {/* 4 Outlined Cards Row with Original live values */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {[
                { count: stats?.users ?? studentList.length ?? 0, label: "Students", detail: "Registered Profiles" },
                { count: allCareers().length, label: "Careers", detail: "Active Pathways" },
                { count: Object.keys(STREAMS).length, label: "Streams", detail: "Curriculum Maps" },
                { count: stats?.quizzes ?? 0, label: "Quizzes", detail: "Attempts Taken" }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all rounded-2xl p-4 flex flex-col justify-between min-h-[110px] shadow-sm"
                >
                  <div className="text-2xl font-mono font-black tracking-tight text-slate-900">
                    {card.count}
                  </div>
                  <div className="mt-3">
                    <span className="text-xs font-bold text-slate-700 block leading-tight">{card.label}</span>
                    <span className="text-[10px] text-indigo-600 font-semibold block mt-1 leading-none">{card.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle row: User Activity & Popular Careers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              {/* User Activity widget */}
              <div className="lg:col-span-7 border border-slate-200 bg-white rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">User Activity</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black">📈 Activity Chart</span>
                    <span className="text-[10px] text-slate-400">Live platform requests</span>
                  </div>
                </div>

                {/* SVG Chart area */}
                <div className="py-2">
                  <svg className="w-full h-24 text-indigo-500" viewBox="0 0 400 100" fill="none">
                    {/* Gridlines */}
                    <line x1="0" y1="15" x2="400" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="85" x2="400" y2="85" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Area fill */}
                    <path d="M 0 85 Q 80 30 160 65 T 320 20 L 400 50 L 400 100 L 0 100 Z" fill="url(#grad)" opacity="0.05" />
                    
                    {/* Stroke */}
                    <path d="M 0 85 Q 80 30 160 65 T 320 20 L 400 50" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Accent dots */}
                    <circle cx="80" cy="45" r="3.5" fill="#6366f1" />
                    <circle cx="160" cy="65" r="3.5" fill="#6366f1" />
                    <circle cx="240" cy="40" r="3.5" fill="#10b981" />
                    <circle cx="320" cy="20" r="4.5" fill="#ef4444" />

                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Circular Drill down link */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold">Updated 2 mins ago</span>
                  <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Popular Careers widget */}
              <div className="lg:col-span-5 border border-slate-200 bg-white rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Popular Careers</h4>
                  <p className="text-[10px] text-slate-400">Most viewed path choices this week</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { rank: "01", title: "Data Scientist", category: "Technology & AI", match: "97% Match Rate" },
                    { rank: "02", title: "Software Engineer", category: "Technology & AI", match: "94% Match Rate" },
                    { rank: "03", title: "AI Engineer", category: "Technology & AI", match: "99% Match Rate" }
                  ].map((pop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-400">{pop.rank}</span>
                        <div>
                          <span className="block font-bold text-slate-800 text-xs">{pop.title}</span>
                          <span className="block text-[9px] text-slate-400">{pop.category}</span>
                        </div>
                      </div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">
                        {pop.match}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-400 text-right">
                  Interactive Rankings
                </div>
              </div>
            </div>

            {/* Drilldown Section: Realtime Registrations */}
            <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Recent Registrations & Stream Enrolments
                </h3>
                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Realtime Live</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Academic Stage</th>
                      <th className="py-2.5 px-3 text-right">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {studentList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-900 font-extrabold">{st.fullName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{st.email}</td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-200/50">
                            {st.classLevel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            st.role === "admin" || st.email === "admin@educarrier.com"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/50" 
                              : "bg-slate-100 text-slate-600 border border-slate-200/50"
                          }`}>
                            {st.role || "student"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITIES MANAGEMENT */}
        {activeSubTab === "activities" && (
          <div className="space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Activities & Events Planner
                </h3>
                <p className="text-slate-500">Create, schedule, publish, duplicate, and monitor interactive learning activities, live events, tasks, news, or real-time quizzes.</p>
              </div>
              
              {!isAddingActivity && (
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setActType("quiz");
                    setActTitle("");
                    setActDescription("");
                    setActTargetAudience("Class 11-12");
                    setActStartDate(new Date().toISOString().split('T')[0]);
                    setActStartTime("06:00 PM");
                    setActEndDate(new Date().toISOString().split('T')[0]);
                    setActEndTime("08:00 PM");
                    setActPriority("Normal");
                    setActStatus("Draft");
                    setQuizQuestions([
                      { id: "q1", question: "AI & ML Quiz Question #1", options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A", marks: 10 }
                    ]);
                    setQuizTimeLimit(10);
                    setQuizAttempts(1);
                    setNewsImage("");
                    setNewsSource("");
                    setNewsExternalRef("");
                    setNewsCategory("Career Guidance");
                    setEventDate(new Date().toISOString().split('T')[0]);
                    setEventTime("17:00");
                    setCompetitionRules("1. Attempt honestly. 2. Time limit is strict.");
                    setCompetitionPoints(100);
                    setIsAddingActivity(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Create Activity
                </button>
              )}
            </div>

            {/* If Adding or Editing Activity */}
            {isAddingActivity ? (
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-sm font-extrabold text-slate-800">
                    {editingActivity ? "Edit Activity Detail" : "Create New Activity"}
                  </h4>
                  <button
                    onClick={() => {
                      setIsAddingActivity(false);
                      setEditingActivity(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveActivity(); }} className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Activity Type</label>
                    <select
                      value={actType}
                      onChange={(e) => setActType(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="quiz">📝 Real-Time Quiz</option>
                      <option value="news">📰 Educational News</option>
                      <option value="task">🎯 Student Task</option>
                      <option value="challenge">🧠 Daily Challenge</option>
                      <option value="competition">🏆 Competition</option>
                      <option value="learning">📚 Learning Activity</option>
                      <option value="announcement">📢 Important Announcement</option>
                      <option value="event">🎓 Career Event</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Target Audience</label>
                    <select
                      value={actTargetAudience}
                      onChange={(e) => setActTargetAudience(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="All">All Students (All classes)</option>
                      <option value="Class 9">Class 9 Only</option>
                      <option value="Class 10">Class 10 Only</option>
                      <option value="Class 11">Class 11 Only</option>
                      <option value="Class 12">Class 12 Only</option>
                      <option value="Class 9-10">Classes 9 & 10 (High School)</option>
                      <option value="Class 11-12">Classes 11 & 12 (Junior College)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Title</label>
                    <input
                      type="text"
                      value={actTitle}
                      onChange={(e) => setActTitle(e.target.value)}
                      placeholder="e.g. AI & Machine Learning Quiz"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Description / Instruction Details</label>
                    <textarea
                      value={actDescription}
                      onChange={(e) => setActDescription(e.target.value)}
                      placeholder="Describe the activity, timeline, or steps for students."
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Start Date</label>
                    <input
                      type="date"
                      value={actStartDate}
                      onChange={(e) => setActStartDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Start Time</label>
                    <input
                      type="text"
                      value={actStartTime}
                      onChange={(e) => setActStartTime(e.target.value)}
                      placeholder="e.g. 06:00 PM"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">End Date</label>
                    <input
                      type="date"
                      value={actEndDate}
                      onChange={(e) => setActEndDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">End Time</label>
                    <input
                      type="text"
                      value={actEndTime}
                      onChange={(e) => setActEndTime(e.target.value)}
                      placeholder="e.g. 08:00 PM"
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Priority Level</label>
                    <select
                      value={actPriority}
                      onChange={(e) => setActPriority(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="Low">🟢 Low Priority</option>
                      <option value="Normal">🔵 Normal Priority</option>
                      <option value="High">🔴 High Priority</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 text-[10px] uppercase">Activity Status</label>
                    <select
                      value={actStatus}
                      onChange={(e) => setActStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published Live</option>
                    </select>
                  </div>

                  {/* DYNAMIC SUB-FORMS */}
                  {actType === "quiz" && (
                    <div className="sm:col-span-2 border-t border-slate-200/80 pt-4 mt-2 space-y-4">
                      <h5 className="font-extrabold text-slate-800 text-xs">📝 Quiz Question & Parameter Configurations</h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Time Limit (minutes)</label>
                          <input
                            type="number"
                            value={quizTimeLimit}
                            onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Allowed Attempts</label>
                          <input
                            type="number"
                            value={quizAttempts}
                            onChange={(e) => setQuizAttempts(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Quiz Questions List Manager */}
                      <div className="space-y-3.5 bg-white border border-slate-200 rounded-2xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-700 text-[11px]">Quiz Questions ({quizQuestions.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setQuizQuestions([
                                ...quizQuestions,
                                {
                                  id: "q-" + Date.now(),
                                  question: "",
                                  options: ["", "", "", ""],
                                  correctAnswer: "",
                                  marks: 10
                                }
                              ]);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Question
                          </button>
                        </div>

                        {quizQuestions.map((q, idx) => (
                          <div key={q.id || idx} className="border-b border-slate-100 pb-4 mb-2 space-y-2 last:border-b-0 last:pb-0">
                            <div className="flex justify-between items-center gap-2">
                              <span className="font-extrabold text-indigo-600 text-[10px]">Question #{idx + 1}</span>
                              {quizQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setQuizQuestions(quizQuestions.filter((item, i) => i !== idx))}
                                  className="text-rose-600 hover:text-rose-800 font-bold"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const arr = [...quizQuestions];
                                arr[idx].question = e.target.value;
                                setQuizQuestions(arr);
                              }}
                              placeholder="Enter the question text"
                              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:outline-none"
                              required
                            />

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {q.options.map((opt: string, optIdx: number) => (
                                <input
                                  key={optIdx}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const arr = [...quizQuestions];
                                    arr[idx].options[optIdx] = e.target.value;
                                    setQuizQuestions(arr);
                                  }}
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-[11px] bg-white focus:outline-none"
                                  required
                                />
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Correct Option Text</label>
                                <select
                                  value={q.correctAnswer}
                                  onChange={(e) => {
                                    const arr = [...quizQuestions];
                                    arr[idx].correctAnswer = e.target.value;
                                    setQuizQuestions(arr);
                                  }}
                                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                                >
                                  <option value="">Select correct answer</option>
                                  {q.options.map((opt: string, oIdx: number) => (
                                    <option key={oIdx} value={opt}>{opt || `Option ${oIdx + 1}`}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Marks</label>
                                <input
                                  type="number"
                                  value={q.marks || 10}
                                  onChange={(e) => {
                                    const arr = [...quizQuestions];
                                    arr[idx].marks = Number(e.target.value);
                                    setQuizQuestions(arr);
                                  }}
                                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {actType === "news" && (
                    <div className="sm:col-span-2 border-t border-slate-200/80 pt-4 mt-2 space-y-4">
                      <h5 className="font-extrabold text-slate-800 text-xs">📰 News-Specific Settings</h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">News Category</label>
                          <input
                            type="text"
                            value={newsCategory}
                            onChange={(e) => setNewsCategory(e.target.value)}
                            placeholder="e.g. JEE Admissions, Scholarships, Internships"
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Source URL / Publication Name</label>
                          <input
                            type="text"
                            value={newsSource}
                            onChange={(e) => setNewsSource(e.target.value)}
                            placeholder="e.g. National Testing Agency / Times of India"
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Cover Image URL (Optional)</label>
                          <input
                            type="text"
                            value={newsImage}
                            onChange={(e) => setNewsImage(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/photo..."
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">External Reference Link</label>
                          <input
                            type="text"
                            value={newsExternalRef}
                            onChange={(e) => setNewsExternalRef(e.target.value)}
                            placeholder="e.g. https://jeemain.nta.nic.in"
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {actType === "event" && (
                    <div className="sm:col-span-2 border-t border-slate-200/80 pt-4 mt-2 space-y-4">
                      <h5 className="font-extrabold text-slate-800 text-xs">🎓 Career Event Specifics</h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Event Date</label>
                          <input
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Event Time</label>
                          <input
                            type="text"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            placeholder="e.g. 05:00 PM IST"
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {actType === "competition" && (
                    <div className="sm:col-span-2 border-t border-slate-200/80 pt-4 mt-2 space-y-4">
                      <h5 className="font-extrabold text-slate-800 text-xs">🏆 Competition Guidelines & Points</h5>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Rules and Regulations</label>
                          <textarea
                            value={competitionRules}
                            onChange={(e) => setCompetitionRules(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-600 text-[10px] uppercase">Rewards / Experience Points (XP)</label>
                          <input
                            type="number"
                            value={competitionPoints}
                            onChange={(e) => setCompetitionPoints(Number(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2 pt-4 border-t border-slate-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingActivity(false);
                        setEditingActivity(null);
                      }}
                      className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActStatus("Draft");
                        setTimeout(() => handleSaveActivity(), 50);
                      }}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-xl transition-all text-xs"
                    >
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      onClick={() => setActStatus("Published")}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs"
                    >
                      {editingActivity ? "Update & Publish" : "Publish Activity Live 🚀"}
                    </button>
                  </div>
                </form>
              </div>
            ) : viewingMetricsActivity ? (
              // METRICS SUMMARY PANEL
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      Activity Metrics: {viewingMetricsActivity.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1">Completion analysis, registered participants & quiz grades.</span>
                  </div>
                  <button
                    onClick={() => setViewingMetricsActivity(null)}
                    className="px-3 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
                  >
                    ← Back to List
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <span className="text-2xl font-black text-slate-800 block">
                      {viewingMetricsActivity.participants?.length || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Participants</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <span className="text-2xl font-black text-emerald-600 block">
                      {viewingMetricsActivity.completions?.length || 0}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Completions</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <span className="text-2xl font-black text-indigo-600 block">
                      {viewingMetricsActivity.participants?.length 
                        ? Math.round(((viewingMetricsActivity.completions?.length || 0) / viewingMetricsActivity.participants.length) * 100)
                        : 0}%
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Completion Rate</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center">
                    <span className="text-xl font-black text-slate-800 block uppercase pt-1">
                      {viewingMetricsActivity.type}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Type</span>
                  </div>
                </div>

                {/* Participant Scores Table */}
                {viewingMetricsActivity.type === "quiz" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h5 className="font-extrabold text-slate-800 text-[11px] border-b border-slate-50 pb-2">Quiz Results & Grades</h5>
                    {viewingMetricsActivity.results && viewingMetricsActivity.results.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold">
                              <th className="py-2">Student Name (Email)</th>
                              <th className="py-2">Score Earned</th>
                              <th className="py-2">Submission Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                            {viewingMetricsActivity.results.map((res: any, idx: number) => {
                              const sUser = studentList.find(s => s.id === res.userId);
                              return (
                                <tr key={idx}>
                                  <td className="py-2 text-slate-900 font-extrabold">
                                    {sUser?.fullName || res.userId} ({sUser?.email || "Student"})
                                  </td>
                                  <td className="py-2">
                                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                                      {res.score} Points
                                    </span>
                                  </td>
                                  <td className="py-2 font-mono text-slate-400">
                                    {new Date(res.completedAt).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-4">No submissions received yet for this quiz challenge.</p>
                    )}
                  </div>
                )}

                {viewingMetricsActivity.type !== "quiz" && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                    <h5 className="font-extrabold text-slate-800 text-[11px] border-b border-slate-50 pb-2">Students Who Completed</h5>
                    {viewingMetricsActivity.completions && viewingMetricsActivity.completions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {viewingMetricsActivity.completions.map((cUserId: string, idx: number) => {
                          const sUser = studentList.find(s => s.id === cUserId);
                          return (
                            <span key={idx} className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                              {sUser?.fullName || `ID: ${cUserId}`}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-center py-4">No student completions recorded yet.</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // ACTIVITIES TABLE LISTING WITH BROADCAST SIDEBAR
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Activities List */}
                <div className="lg:col-span-2 border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Activities & Learning Tasks</h4>
                    <span className="text-[10px] font-bold text-indigo-600">{adminActivities.length} Configured</span>
                  </div>

                  {adminActivities.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-slate-500 font-extrabold text-xs">No active or scheduled activities found.</p>
                      <p className="text-slate-400 text-[10px]">Click "+ Create Activity" to launch educational challenges, event schedules or quizzes.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Activity</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Audience</th>
                            <th className="py-2.5 px-3">Timeline</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                          {adminActivities.map((act) => {
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
                            const icon = iconMap[act.type] || "✨";
                            const isLive = act.status === "Published" || act.status === "published";
                            return (
                              <tr key={act.id} className="hover:bg-slate-50/50">
                                <td className="py-3 px-3">
                                  <div>
                                    <span className="font-black text-slate-900 text-xs block">{icon} {act.title}</span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{act.description}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold border border-indigo-100/40 uppercase">
                                    {act.type}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold">
                                    {act.targetAudience}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="block text-slate-700 font-bold">{act.startDate}</span>
                                  <span className="block text-[9px] text-slate-400 mt-0.5">{act.startTime} - {act.endTime}</span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                                    isLive 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}>
                                    {isLive ? "Live" : "Draft"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setViewingMetricsActivity(act)}
                                      title="View metrics & participant completions"
                                      className="px-2 py-1 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[10px] font-bold text-slate-500 transition-all flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" /> Metrics
                                    </button>
                                    <button
                                      onClick={() => startEditActivity(act)}
                                      title="Edit Details"
                                      className="p-1 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateActivity(act)}
                                      title="Duplicate Activity"
                                      className="p-1 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-100 hover:bg-indigo-50 cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handlePublishToggle(act)}
                                      title={isLive ? "Unpublish to Draft" : "Publish Live"}
                                      className={`p-1 rounded-lg border cursor-pointer ${
                                        isLive 
                                          ? "text-rose-600 border-rose-100 hover:bg-rose-50" 
                                          : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                      }`}
                                    >
                                      {isLive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteActivity(act.id)}
                                      title="Delete Activity"
                                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Right Column: Push Announcements Broadcast */}
                <div className="border border-slate-200 bg-white rounded-2xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <span className="text-lg">📢</span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Instant Broadcast Center</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Push real-time alert banners directly to all active students' trays.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePushNotification} className="space-y-4 pt-1 text-[11px]">
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider">Alert Title Header</label>
                      <input
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="e.g. CBSE Term Registration Deadlines Announced!"
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider">Alert Body Details</label>
                      <textarea
                        value={notifBody}
                        onChange={(e) => setNotifBody(e.target.value)}
                        placeholder="e.g. The registration portal for central board examinations opens tomorrow. Confirm all documents by..."
                        className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
                        rows={4}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-colors shadow-md shadow-slate-100"
                    >
                      <Bell className="w-3.5 h-3.5" /> Broadcast Announcement Live
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENTS DIRECTORY */}
        {activeSubTab === "students" && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Manage Registered Student Directory</h3>
                <p className="text-slate-500">Edit existing student accounts, assign security roles, or wipe inactive student profiles.</p>
              </div>
              <button
                onClick={() => {
                  setAddUserOpen(!addUserOpen);
                  setAddUserName("");
                  setAddUserEmail("");
                  setAddUserClass("Class 10");
                  setAddUserRole("student");
                  setAddUserPassword("");
                  setAddUserConfirmPassword("");
                  setAddUserError("");
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm text-xs transition-all cursor-pointer self-start sm:self-auto"
              >
                {addUserOpen ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {addUserOpen ? "Cancel Creation" : "Create User"}
              </button>
            </div>

            {addUserOpen && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAddUserError("");
                  if (!addUserName.trim() || !addUserEmail.trim() || !addUserPassword || !addUserConfirmPassword) {
                    setAddUserError("All form fields are required.");
                    return;
                  }
                  if (addUserPassword !== addUserConfirmPassword) {
                    setAddUserError("Passwords do not match.");
                    return;
                  }
                  if (addUserPassword.length < 6) {
                    setAddUserError("Password must be at least 6 characters long.");
                    return;
                  }

                  try {
                    const res = await fetch("/api/auth/register", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        fullName: addUserName,
                        email: addUserEmail,
                        password: addUserPassword,
                        classLevel: addUserClass,
                        role: addUserRole
                      })
                    });
                    const resData = await res.json();
                    if (!res.ok) {
                      setAddUserError(resData.error || "Failed to register user.");
                    } else {
                      setAlertMessage({ type: "success", text: `User account created successfully for "${addUserName}".` });
                      setAddUserOpen(false);
                      setAddUserName("");
                      setAddUserEmail("");
                      setAddUserClass("Class 10");
                      setAddUserRole("student");
                      setAddUserPassword("");
                      setAddUserConfirmPassword("");
                      loadAdminData();
                      if (onRefreshData) onRefreshData();
                    }
                  } catch (err) {
                    setAddUserError("Network failure occurred while registering the user.");
                  }
                }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 max-w-xl"
              >
                <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                  <UserPlus className="w-4.5 h-4.5 text-indigo-600" />
                  Register New Account
                </div>

                {addUserError && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-xs">
                    {addUserError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={addUserName}
                      onChange={(e) => setAddUserName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address (Gmail)</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@gmail.com"
                      value={addUserEmail}
                      onChange={(e) => setAddUserEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Target Class</label>
                    <select
                      value={addUserClass}
                      onChange={(e) => setAddUserClass(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-700"
                    >
                      <option value="Class 10">10th Class</option>
                      <option value="Class 11">11th Class</option>
                      <option value="Class 12">12th Class</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Platform Role</label>
                    <select
                      value={addUserRole}
                      onChange={(e) => setAddUserRole(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs font-semibold text-slate-700"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={addUserPassword}
                      onChange={(e) => setAddUserPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={addUserConfirmPassword}
                      onChange={(e) => setAddUserConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Save User Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddUserOpen(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider py-3">
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Class / Target</th>
                    <th className="py-2 px-3">Platform Role</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {studentList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        {selectedItem?.id === st.id ? (
                          <input
                            type="text"
                            value={selectedItem.fullName}
                            onChange={(e) => setSelectedItem({ ...selectedItem, fullName: e.target.value })}
                            className="border border-slate-200 rounded p-1 text-xs"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-900">{st.fullName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">{st.email}</td>
                      <td className="py-3 px-3">
                        {selectedItem?.id === st.id ? (
                          <select
                            value={selectedItem.classLevel}
                            onChange={(e) => setSelectedItem({ ...selectedItem, classLevel: e.target.value })}
                            className="border border-slate-200 rounded p-1 text-xs"
                          >
                            <option value="Class 10">Class 10</option>
                            <option value="Class 11">Class 11</option>
                            <option value="Class 12">Class 12</option>
                            <option value="Graduate">Graduate</option>
                          </select>
                        ) : (
                          st.classLevel
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {selectedItem?.id === st.id ? (
                          <select
                            value={selectedItem.role || "student"}
                            onChange={(e) => setSelectedItem({ ...selectedItem, role: e.target.value })}
                            className="border border-slate-200 rounded p-1 text-xs"
                          >
                            <option value="student">student</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            st.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                          }`}>{st.role || "student"}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {selectedItem?.id === st.id ? (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch("/api/admin/students/save", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ studentId: st.id, action: "update", data: selectedItem })
                                  });
                                  if (res.ok) {
                                    setAlertMessage({ type: "success", text: "Student records updated successfully!" });
                                    setSelectedItem(null);
                                    loadAdminData();
                                    triggerPlatformRefresh();
                                  }
                                } catch (e) {}
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button onClick={() => setSelectedItem(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-1 rounded cursor-pointer">✕</button>
                          </div>
                        ) : deleteConfirmId === st.id ? (
                          <div className="flex items-center justify-end gap-2 text-[11px]">
                            <span className="text-red-600 font-extrabold animate-pulse">Delete?</span>
                            <button
                              onClick={() => handleDeleteStudent(st.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setSelectedItem(st)} className="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(st.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CAREERS DIRECTORY */}
        {activeSubTab === "careers" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Manage Careers Directory</h3>
                <p className="text-slate-500">Edit salaries, qualifications, matching tags, future scope, or register entirely new career tracks.</p>
              </div>
              {!isAdding && (
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setSelectedItem({
                      id: "career-" + Date.now().toString().substring(8),
                      title: "New Career Title",
                      category: "software_tech",
                      streams: ["mpc"],
                      short: "Short career description summaries...",
                      degree: "B.Tech/B.Sc",
                      skills: ["Logic", "Coding"],
                      languages: [],
                      salary: [4, 15],
                      growth: "Very High Growth",
                      tags: { coding: 2 }
                    });
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Career
                </button>
              )}
            </div>

            {isAdding && selectedItem && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl">
                <h4 className="font-extrabold text-slate-900">Add / Edit Career Form</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Career ID</label>
                    <input
                      type="text"
                      value={selectedItem.id}
                      onChange={(e) => setSelectedItem({ ...selectedItem, id: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Career Title</label>
                    <input
                      type="text"
                      value={selectedItem.title}
                      onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Vertical Category</label>
                    <select
                      value={selectedItem.category}
                      onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs"
                    >
                      <option value="software_tech">Software & Technology</option>
                      <option value="core_engineering">Core Engineering</option>
                      <option value="science_research">Science & Research</option>
                      <option value="medical_health">Medical & Healthcare</option>
                      <option value="business_finance">Business & Finance</option>
                      <option value="media_creative">Media & Creative</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Academic Degree Required</label>
                    <input
                      type="text"
                      value={selectedItem.degree}
                      onChange={(e) => setSelectedItem({ ...selectedItem, degree: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Short Intro</label>
                    <input
                      type="text"
                      value={selectedItem.short}
                      onChange={(e) => setSelectedItem({ ...selectedItem, short: e.target.value })}
                      className="w-full border border-slate-200 bg-white rounded p-2 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 uppercase text-[10px]">Average Salary Range (Lakhs/yr)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={selectedItem.salary?.[0] || 4}
                        onChange={(e) => setSelectedItem({ ...selectedItem, salary: [Number(e.target.value), selectedItem.salary?.[1] || 15] })}
                        className="w-1/2 border border-slate-200 bg-white rounded p-2 text-xs"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={selectedItem.salary?.[1] || 15}
                        onChange={(e) => setSelectedItem({ ...selectedItem, salary: [selectedItem.salary?.[0] || 4, Number(e.target.value)] })}
                        className="w-1/2 border border-slate-200 bg-white rounded p-2 text-xs"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const updated = [...platformData.customCareers];
                      const idx = updated.findIndex(c => c.id === selectedItem.id);
                      if (idx !== -1) {
                        updated[idx] = selectedItem;
                      } else {
                        updated.push(selectedItem);
                      }
                      savePlatformCollection("careers", updated);
                      setIsAdding(false);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded font-bold cursor-pointer"
                  >
                    Save Career
                  </button>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Title</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Streams</th>
                      <th className="py-2 px-3">Degree</th>
                      <th className="py-2 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                    {getCombinedCareers().map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">{c.title}</td>
                        <td className="py-2.5 px-3 font-mono">{c.category}</td>
                        <td className="py-2.5 px-3">{c.streams.join(", ")}</td>
                        <td className="py-2.5 px-3">{c.degree}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedItem(c);
                              setIsAdding(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer inline-block mr-2"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const updated = (platformData.customCareers || []).filter((item: any) => item.id !== c.id);
                              savePlatformCollection("careers", updated);
                            }}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STREAMS DIRECTORY */}
        {activeSubTab === "streams" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">Manage Streams, Exams & Colleges</h3>
            <p className="text-slate-500">Edit key examinations, target universities, and course syllabuses mapped under core fields.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(STREAMS).map((key) => {
                const stream = STREAMS[key];
                return (
                  <div key={key} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-slate-900 text-sm">{stream.name} Stream</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">{key}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[9px]">Tagline</span>
                        <input
                          type="text"
                          defaultValue={stream.tagline}
                          onBlur={(e) => {
                            const updated = [...platformData.customStreams];
                            const existingIdx = updated.findIndex(s => s.key === key);
                            const updatedStreamObj = existingIdx !== -1 ? { ...updated[existingIdx], tagline: e.target.value } : { key, tagline: e.target.value };
                            if (existingIdx !== -1) updated[existingIdx] = updatedStreamObj; else updated.push(updatedStreamObj);
                            savePlatformCollection("streams", updated);
                          }}
                          className="w-full border border-slate-200 rounded bg-white p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[9px]">Colleges</span>
                        <input
                          type="text"
                          defaultValue={stream.colleges.join(", ")}
                          onBlur={(e) => {
                            const updated = [...platformData.customStreams];
                            const list = e.target.value.split(",").map(i => i.trim());
                            const existingIdx = updated.findIndex(s => s.key === key);
                            const updatedStreamObj = existingIdx !== -1 ? { ...updated[existingIdx], colleges: list } : { key, colleges: list };
                            if (existingIdx !== -1) updated[existingIdx] = updatedStreamObj; else updated.push(updatedStreamObj);
                            savePlatformCollection("streams", updated);
                          }}
                          className="w-full border border-slate-200 rounded bg-white p-1 text-xs"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[9px]">Exams</span>
                        <input
                          type="text"
                          defaultValue={stream.exams.join(", ")}
                          onBlur={(e) => {
                            const updated = [...platformData.customStreams];
                            const list = e.target.value.split(",").map(i => i.trim());
                            const existingIdx = updated.findIndex(s => s.key === key);
                            const updatedStreamObj = existingIdx !== -1 ? { ...updated[existingIdx], exams: list } : { key, exams: list };
                            if (existingIdx !== -1) updated[existingIdx] = updatedStreamObj; else updated.push(updatedStreamObj);
                            savePlatformCollection("streams", updated);
                          }}
                          className="w-full border border-slate-200 rounded bg-white p-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: RESOURCES DIRECTORY */}
        {activeSubTab === "resources" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Manage Resources & Entrance Exams Database</h3>
                <p className="text-slate-500">Create study guides, entrance exam timeline bulletins, or scholarship deadlines.</p>
              </div>
              {!isAdding && (
                <button
                  onClick={() => {
                    setIsAdding(true);
                    setSelectedItem({
                      id: "resource-" + Date.now().toString().substring(8),
                      title: "New Entrance Examination",
                      type: "exam",
                      category: "Science",
                      deadline: "January",
                      description: "New registration guidelines...",
                      steps: ["Fill registration application form", "Appear for online test"]
                    });
                  }}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Resource
                </button>
              )}
            </div>

            {isAdding && selectedItem && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 max-w-2xl">
                <h4 className="font-extrabold text-slate-900">Add / Edit Resource</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">ID Key</label>
                    <input
                      type="text"
                      value={selectedItem.id}
                      onChange={(e) => setSelectedItem({ ...selectedItem, id: e.target.value })}
                      className="w-full border border-slate-200 bg-white p-2 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Resource Title</label>
                    <input
                      type="text"
                      value={selectedItem.title}
                      onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                      className="w-full border border-slate-200 bg-white p-2 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Category / Subject</label>
                    <input
                      type="text"
                      value={selectedItem.category}
                      onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                      className="w-full border border-slate-200 bg-white p-2 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Target Deadline</label>
                    <input
                      type="text"
                      value={selectedItem.deadline}
                      onChange={(e) => setSelectedItem({ ...selectedItem, deadline: e.target.value })}
                      className="w-full border border-slate-200 bg-white p-2 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-bold text-slate-400 uppercase text-[9px]">Long Description</label>
                    <textarea
                      value={selectedItem.description}
                      onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                      className="w-full border border-slate-200 bg-white p-2 rounded text-xs"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setIsAdding(false); setSelectedItem(null); }} className="px-3 py-1.5 bg-slate-200 rounded font-bold cursor-pointer">Cancel</button>
                  <button
                    onClick={() => {
                      const updated = [...platformData.customResources];
                      const idx = updated.findIndex(r => r.id === selectedItem.id);
                      if (idx !== -1) {
                        updated[idx] = selectedItem;
                      } else {
                        updated.push(selectedItem);
                      }
                      savePlatformCollection("resources", updated);
                      setIsAdding(false);
                      setSelectedItem(null);
                    }}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded font-bold cursor-pointer"
                  >
                    Save Resource
                  </button>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Resource / Examination Title</th>
                    <th className="py-2 px-3">Subject Category</th>
                    <th className="py-2 px-3">Application Deadline</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {getCombinedResources().map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{r.title}</td>
                      <td className="py-2.5 px-3">{r.category}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600">{r.deadline}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem(r);
                            setIsAdding(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 p-1 cursor-pointer inline-block mr-2"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const updated = (platformData.customResources || []).filter((item: any) => item.id !== r.id);
                            savePlatformCollection("resources", updated);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: QUIZ & SKILLS */}
        {activeSubTab === "quiz" && (
          <div className="space-y-6 text-xs animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 animate-pulse" />
                  Manage Matching Quiz & Recommendation Rules
                </h3>
                <p className="text-slate-500 mt-0.5">Edit existing matching quiz items, add new question options manually, or generate questions with AI assistance.</p>
              </div>
              {!isAddingQuizQuestion && (
                <button
                  onClick={() => {
                    setEditingQuizQuestionId(null);
                    setQuizFormQ("");
                    setQuizFormHint("Pick all that apply");
                    setQuizFormType("multi");
                    setQuizFormOptions([
                      { label: "Option A", tags: { coding: 2 } },
                      { label: "Option B", tags: { creative: 2 } }
                    ]);
                    setIsAddingQuizQuestion(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer text-xs"
                >
                  <Plus className="w-4 h-4" /> Add Custom Question
                </button>
              )}
            </div>

            {/* MANAGE QUESTION FORM (ADD / EDIT) */}
            {isAddingQuizQuestion && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>⚙️</span> {editingQuizQuestionId !== null ? `Modify Question ${editingQuizQuestionId}` : "Create New Custom Question"}
                  </h4>
                  <button
                    onClick={() => {
                      setIsAddingQuizQuestion(false);
                      setEditingQuizQuestionId(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-extrabold text-xs"
                  >
                    Cancel & Return
                  </button>
                </div>

                {/* AI brainstorming helper box */}
                <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-4.5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <div>
                      <h5 className="text-[11px] font-black text-indigo-950 uppercase tracking-tight">Need help brainstorming? Let AI write it!</h5>
                      <p className="text-[9px] text-indigo-700/80 font-medium">Type any career field or topic, and our AI will draft a complete question with custom options and recommended weights!</p>
                    </div>
                  </div>
                  <div className="flex gap-2 max-w-xl">
                    <input
                      type="text"
                      value={aiQuizPrompt}
                      onChange={(e) => setAiQuizPrompt(e.target.value)}
                      placeholder="e.g. Finance & Stock Trading, Space Exploration, Visual Arts"
                      className="flex-1 border border-indigo-200/50 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-indigo-400"
                      disabled={isGeneratingQuizQuestion}
                    />
                    <button
                      type="button"
                      onClick={handleAiDevelopQuestion}
                      disabled={isGeneratingQuizQuestion}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer"
                    >
                      {isGeneratingQuizQuestion ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Drafting...
                        </>
                      ) : (
                        "Generate Draft"
                      )}
                    </button>
                  </div>
                </div>

                {/* Actual Manual Form */}
                <form onSubmit={handleSaveFormQuestion} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block font-black text-slate-500 uppercase text-[9px] tracking-wider">Question Statement</label>
                      <input
                        type="text"
                        value={quizFormQ}
                        onChange={(e) => setQuizFormQ(e.target.value)}
                        placeholder="e.g., Which environment do you prefer working in?"
                        className="w-full border border-slate-200 rounded-xl bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-black text-slate-500 uppercase text-[9px] tracking-wider">Helpful Hint / Sub-label</label>
                      <input
                        type="text"
                        value={quizFormHint}
                        onChange={(e) => setQuizFormHint(e.target.value)}
                        placeholder="e.g., Select up to two options"
                        className="w-full border border-slate-200 rounded-xl bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-black text-slate-500 uppercase text-[9px] tracking-wider">Answer Selection Mode</label>
                      <select
                        value={quizFormType}
                        onChange={(e) => setQuizFormType(e.target.value as any)}
                        className="w-full border border-slate-200 rounded-xl bg-white p-2.5 text-xs focus:outline-none focus:border-indigo-400"
                      >
                        <option value="single">Single Choice (Radio Buttons)</option>
                        <option value="multi">Multiple Selection (Checkboxes)</option>
                      </select>
                    </div>
                  </div>

                  {/* Options List Builder */}
                  <div className="space-y-3.5 border-t border-slate-200/60 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="block font-black text-slate-900 uppercase text-[10px] tracking-wider">Options & Recommendation Rules</span>
                      <button
                        type="button"
                        onClick={() => setQuizFormOptions([...quizFormOptions, { label: "", tags: {} }])}
                        className="text-indigo-600 hover:text-indigo-800 font-extrabold text-[10px] flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add Option Slot
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {quizFormOptions.map((opt, optIdx) => (
                        <div key={optIdx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm relative">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-400 uppercase text-[9px]">Option {optIdx + 1}</span>
                            {quizFormOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setQuizFormOptions(quizFormOptions.filter((_, idx) => idx !== optIdx))}
                                className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                              >
                                Remove Option
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const updated = [...quizFormOptions];
                                updated[optIdx].label = e.target.value;
                                setQuizFormOptions(updated);
                              }}
                              placeholder="Type option choice label here..."
                              className="w-full border border-slate-100 rounded-xl bg-slate-50/50 p-2 text-xs focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-semibold"
                            />
                          </div>

                          {/* Matching Tag Weight Management inside the option card */}
                          <div className="space-y-2 border-t border-slate-50 pt-2">
                            <span className="block font-bold text-slate-400 uppercase text-[8px] tracking-wider">Weights & Scoring Alignment</span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(opt.tags || {}).map(([tagKey, weight]) => (
                                <span key={tagKey} className="bg-slate-100 hover:bg-rose-50 text-slate-800 border border-slate-200/50 px-2 py-1 rounded-xl text-[9px] font-bold flex items-center gap-1.5 transition-colors">
                                  <span className="uppercase">{tagKey}</span>: 
                                  <select
                                    value={String(weight)}
                                    onChange={(e) => {
                                      const updated = [...quizFormOptions];
                                      updated[optIdx].tags[tagKey] = Number(e.target.value);
                                      setQuizFormOptions(updated);
                                    }}
                                    className="bg-transparent font-black text-indigo-600 focus:outline-none cursor-pointer"
                                  >
                                    <option value="1">1 (Low)</option>
                                    <option value="2">2 (Mid)</option>
                                    <option value="3">3 (High)</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...quizFormOptions];
                                      delete updated[optIdx].tags[tagKey];
                                      setQuizFormOptions(updated);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 font-extrabold text-[10px]"
                                    title="Remove this tag"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}

                              {/* Dropdown to add a weight tag to this option */}
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const updated = [...quizFormOptions];
                                    if (!updated[optIdx].tags) updated[optIdx].tags = {};
                                    updated[optIdx].tags[e.target.value] = 2; // default middle weight
                                    setQuizFormOptions(updated);
                                    e.target.value = ""; // Reset dropdown
                                  }
                                }}
                                className="bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border border-indigo-100/50 px-2 py-0.5 rounded-lg text-[9px] font-bold cursor-pointer focus:outline-none max-w-[130px]"
                                defaultValue=""
                              >
                                <option value="" disabled>+ Link Tag Weight</option>
                                {[
                                  "engineering",
                                  "coding",
                                  "analytics",
                                  "science",
                                  "biology",
                                  "medicine",
                                  "business",
                                  "finance",
                                  "government",
                                  "law",
                                  "writing",
                                  "creative",
                                  "design",
                                  "hands-on",
                                  "helping-people",
                                  "agriculture"
                                ]
                                  .filter(key => !opt.tags || !opt.tags[key])
                                  .map(key => (
                                    <option key={key} value={key}>{key}</option>
                                  ))
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-slate-200/60 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingQuizQuestion(false);
                        setEditingQuizQuestionId(null);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-extrabold text-xs bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Discard Draft
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md text-xs transition-all cursor-pointer"
                    >
                      {editingQuizQuestionId !== null ? "Save Changes" : "Create Quiz Question"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* QUIZ QUESTIONS DISPLAY LIST */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Recommendation Questions ({getCombinedQuizQuestions().length})</h4>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {getCombinedQuizQuestions().map((q) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="text-indigo-600">❓</span> Question {q.id}
                        <span className="bg-slate-100 text-slate-600 font-extrabold rounded-lg px-2 py-0.5 text-[8px] uppercase tracking-wide">
                          {q.type === "multi" ? "Multi-Selection" : "Single Choice"}
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingQuizQuestionId(q.id);
                            setQuizFormQ(q.q);
                            setQuizFormHint(q.hint || "Select options");
                            setQuizFormType((q.type === "single" ? "single" : "multi") as "single" | "multi");
                            setQuizFormOptions(JSON.parse(JSON.stringify(q.options || [])));
                            setIsAddingQuizQuestion(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black flex items-center gap-0.5 cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50 transition-colors"
                          title="Modify statement, choices and recommendation rules"
                        >
                          Modify
                        </button>

                        {/* Delete Custom Question Button */}
                        {platformData.customQuizQuestions?.some((item: any) => item.id === q.id) && (
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete Question ${q.id}? This cannot be undone.`)) {
                                const updated = (platformData.customQuizQuestions || []).filter((item: any) => item.id !== q.id);
                                await savePlatformCollection("quizQuestions", updated);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 text-[10px] font-black flex items-center gap-0.5 cursor-pointer bg-rose-50/50 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100/50 transition-colors"
                            title="Delete this custom question"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="block font-bold text-slate-400 uppercase text-[8px] tracking-wider mb-0.5">Question Statement</span>
                        <p className="text-slate-800 font-bold text-xs">{q.q}</p>
                        {q.hint && <p className="text-slate-400 text-[10px] mt-0.5 italic font-medium">Hint: {q.hint}</p>}
                      </div>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                          <span className="block font-black text-slate-400 uppercase text-[8px] tracking-wider mb-1.5">Options & Scoring Rules</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {q.options.map((opt: any, optIdx: number) => (
                              <div key={optIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 shadow-xs">
                                <span className="block font-extrabold text-slate-800 text-xs">{opt.label}</span>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(opt.tags || {}).map(([tag, val]) => (
                                    <span key={tag} className="bg-indigo-50/70 text-indigo-700 border border-indigo-100/30 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight">
                                      {tag}: {String(val)}
                                    </span>
                                  ))}
                                  {Object.keys(opt.tags || {}).length === 0 && (
                                    <span className="text-slate-400 text-[8px] italic font-medium">No recommendation tags</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AI CONFIGURATION */}
        {activeSubTab === "ai" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">Manage Virtual Counselor Guidelines</h3>
            <p className="text-slate-500">Fine-tune the custom system instructions and behavioral attributes of your Edu Carrier AI guidance counselor.</p>
            
            <div className="space-y-4 max-w-2xl bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase text-[10px]">AI Counselor System Instructions</label>
                <textarea
                  value={aiSystemInstruction}
                  onChange={(e) => setAiSystemInstruction(e.target.value)}
                  placeholder="e.g. You are a career advisor. Direct students to engineering or humanities..."
                  className="w-full border border-slate-200 rounded-xl p-2.5 font-mono text-xs bg-white focus:outline-none"
                  rows={8}
                />
              </div>
              <button
                onClick={handleSaveAiConfig}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Save System Instructions
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
