import React, { useState } from "react";
import { User } from "../types";
import { User as UserIcon, BookOpen, Key, CheckSquare, Sparkles, AlertCircle, Award } from "lucide-react";

interface ProfileProps {
  user: User;
  savedCareersCount: number;
  onProfileUpdated: (user: User) => void;
}

export default function Profile({ user, savedCareersCount, onProfileUpdated }: ProfileProps) {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [classLevel, setClassLevel] = useState(user.classLevel || "Class 11");
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(user.preferredSubjects || []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const skillOptions = [
    "Programming / Coding", "Visual Design / Editing", "Financial Analysis", "Creative Writing",
    "Public Speaking / Debating", "Scientific Research", "Team Leadership / Management", "Logical Reasoning"
  ];

  const subjectOptions = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Economics / Accounts", "History / Civics",
    "Political Science", "Computer Science", "Fine Arts"
  ];

  const classLevels = [
    "Class 10", "Class 11", "Class 12"
  ];

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleToggleSubject = (subject: string) => {
    if (preferredSubjects.includes(subject)) {
      setPreferredSubjects(preferredSubjects.filter(s => s !== subject));
    } else {
      setPreferredSubjects([...preferredSubjects, subject]);
    }
  };

  // Profile Completeness math:
  // - Name filled: 20%
  // - Class level filled: 20%
  // - Saved careers > 0: 20%
  // - At least 1 Skill: 20%
  // - At least 1 Subject: 20%
  const calculateCompleteness = () => {
    let score = 0;
    if (user.fullName) score += 20;
    if (user.classLevel) score += 20;
    if (savedCareersCount > 0) score += 20;
    if (skills.length > 0) score += 20;
    if (preferredSubjects.length > 0) score += 20;
    return score;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, classLevel, skills, preferredSubjects, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
      } else {
        setSuccess("Profile successfully updated on the server!");
        onProfileUpdated(data.user || data);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Network failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Left Column: Progress Meter */}
      <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* SVG Ring Progress Meter */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#progressGrad)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completeness / 100)}`}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <span className="block text-3xl font-extrabold text-slate-800">{completeness}%</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Complete</span>
            </div>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 mt-2">{user.fullName}</h3>
          <span className="text-xs text-slate-400 font-mono block">{user.email}</span>
          <span className="inline-block mt-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
            {user.classLevel || classLevel}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3 text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Completeness Guide</h4>
          <div className="space-y-2 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.fullName ? "bg-emerald-500" : "bg-slate-200"}`}></span>
              <span>Name added (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.classLevel ? "bg-emerald-500" : "bg-slate-200"}`}></span>
              <span>Class Level chosen (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${savedCareersCount > 0 ? "bg-emerald-500" : "bg-slate-200"}`}></span>
              <span>Saved careers &gt; 0 (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${skills.length > 0 ? "bg-emerald-500" : "bg-slate-200"}`}></span>
              <span>Added vocational skills (20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${preferredSubjects.length > 0 ? "bg-emerald-500" : "bg-slate-200"}`}></span>
              <span>Picked favorite subjects (20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Profile Editors */}
      <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <UserIcon className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Academic Profile</h2>
            <p className="text-xs text-slate-400">Keep preferences updated to refine AI guidance recommendation models.</p>
          </div>
        </div>

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-600 flex items-center gap-2">
            <Award className="w-4.5 h-4.5" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class / Education Level</label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none transition-all"
              >
                {classLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Subject Checklist */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Favorite Subjects
              </h4>
              <p className="text-[10px] text-slate-400">Select subjects you find most interesting or perform well in.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {subjectOptions.map((subj) => {
                const checked = preferredSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => handleToggleSubject(subj)}
                    className={`p-2.5 border rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${checked ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500"}`}
                  >
                    <span>{subj}</span>
                    {checked && <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Skills Checklist */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Key Skills / Aptitudes
              </h4>
              <p className="text-[10px] text-slate-400">Pick competencies or interests you currently possess or wish to refine.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {skillOptions.map((skill) => {
                const checked = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`p-2.5 border rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all ${checked ? "border-indigo-600 bg-indigo-50/50 text-indigo-700" : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500"}`}
                  >
                    <span>{skill}</span>
                    {checked && <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Security updates */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-indigo-600" />
                Security & Password Update
              </h4>
              <p className="text-[10px] text-slate-400">Leave fields empty if you do not want to update password credentials.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200/50 transition-all disabled:opacity-50"
            >
              {loading ? "Saving changes..." : "Save Academic Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
