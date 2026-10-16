import React, { useState } from "react";
import {
  GraduationCap,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Sparkles,
  Loader2,
  Check
} from "lucide-react";
import { User } from "../types";

interface AuthProps {
  initialMode: "login" | "register" | "admin" | "forgot";
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ initialMode, onClose, onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register" | "admin" | "forgot">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [classLevel, setClassLevel] = useState("Class 10");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [resetToken, setResetToken] = useState("");
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const switchMode = (newMode: "login" | "register" | "admin" | "forgot") => {
    setMode(newMode);
    setResetStep(1);
    setResetToken("");
    resetMessages();
  };

  const fillDemoStudent = () => {
    setEmail("demo@educarrier.com");
    setPassword("demo123");
    resetMessages();
  };

  const handleRequestResetToken = async () => {
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    resetMessages();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process password reset request.");
      } else {
        setResetStep(2);
        if (data.resetToken) {
          setResetToken(data.resetToken);
          setSuccessMsg("Reset code generated! Please enter your new password below.");
        } else {
          setSuccessMsg("If this email is registered, a password reset token has been sent.");
        }
      }
    } catch (e) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    if (mode === "forgot") {
      if (resetStep === 1) {
        await handleRequestResetToken();
        return;
      }

      if (!email.trim() || !resetToken.trim() || !newPassword || !confirmNewPassword) {
        setError("Please provide your email, reset token, and matching new password.");
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match. Please verify and try again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), token: resetToken.trim(), newPassword })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to reset password. Please verify your token.");
        } else {
          setSuccessMsg("Password reset successfully! You can now log in with your updated credentials.");
          setPassword(newPassword);
          setNewPassword("");
          setConfirmNewPassword("");
          setResetToken("");
          setResetStep(1);
        }
      } catch (err) {
        setError("Connection error. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === "register") {
      if (!fullName.trim() || !email.trim() || !password || !confirmPassword || !classLevel) {
        setError("Please complete all registration fields.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), password, classLevel })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed. This email may already be in use.");
        } else {
          if (data.token) {
            localStorage.setItem("newedu_token", data.token);
          }
          onLoginSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // login or admin mode
      if (!email.trim() || !password) {
        setError("Please enter your email and password.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid email or password.");
        } else {
          if (mode === "admin" && data.user.role !== "admin") {
            setError("Access Restricted: This account does not possess administrative privileges.");
            setLoading(false);
            return;
          }
          if (data.token) {
            localStorage.setItem("newedu_token", data.token);
          }
          onLoginSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setError("Network connection error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const classLevels = ["Class 10", "Class 11", "Class 12"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Immersive blurred backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Remodeled Auth Dialog Box */}
      <div className="relative w-full max-w-[460px] my-auto bg-white rounded-3xl border border-slate-100/80 shadow-[0_25px_70px_rgba(15,23,42,0.28)] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Subtle Decorative Ambient Glow Top */}
        <div className={`absolute top-0 inset-x-0 h-32 opacity-15 pointer-events-none blur-2xl transition-colors duration-300 ${
          mode === "admin"
            ? "bg-gradient-to-b from-amber-500 to-slate-900"
            : mode === "forgot"
            ? "bg-gradient-to-b from-amber-400 to-indigo-600"
            : "bg-gradient-to-b from-indigo-500 to-blue-600"
        }`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200/90 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="relative pt-7 px-8 pb-3 text-center">
          {mode === "admin" ? (
            <div className="flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg flex items-center justify-center text-amber-400 mb-3 relative group">
                <ShieldCheck className="w-7 h-7" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700 mb-1.5 tracking-wide">
                <span>🛡️</span> Administrative Portal
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Counselor & Admin Login</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Restricted access for certified educators, mentors, and administrators.
              </p>
            </div>
          ) : mode === "forgot" ? (
            <div className="flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-sm flex items-center justify-center text-amber-600 mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[11px] font-bold text-amber-700 border border-amber-100 mb-1.5">
                <span>🔑</span> Security Recovery
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reset Your Password</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Enter your registered email address and create a fresh password to regain access.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-200 flex items-center justify-center text-white mb-3">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === "register" ? "Create Student Profile" : "Welcome Back"}
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {mode === "register"
                  ? "Unlock personalized career guidance, stream comparisons & AI mentorship."
                  : "Sign in to access your EduCarrier dashboard and saved roadmap."}
              </p>
            </div>
          )}
        </div>

        {/* Remodeled Segmented Mode Switcher (Shown on regular modes) */}
        {mode !== "forgot" ? (
          <div className="px-8 pt-3">
            <div className="p-1 bg-slate-100/90 rounded-2xl flex items-center border border-slate-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "login"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "register"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
              <button
                type="button"
                onClick={() => switchMode("admin")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === "admin"
                    ? "bg-slate-900 text-amber-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            </div>
          </div>
        ) : (
          <div className="px-8 pt-2">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-8 pt-4 space-y-4">

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs font-medium text-rose-700 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-medium text-emerald-800 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name in Register Mode */}
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {mode === "admin"
                    ? "Admin Email"
                    : mode === "forgot"
                    ? "Registered Email Address"
                    : "Email Address"}
                </label>
                {/* Demo autofill helpers */}
                {mode === "login" && !email && (
                  <button
                    type="button"
                    onClick={fillDemoStudent}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Quick Demo Fill
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === "admin"
                      ? "admin@educarrier.com"
                      : "student@example.com"
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* In Forgot Password Mode: Step 1 = Request code, Step 2 = Enter token + New Password */}
            {mode === "forgot" ? (
              <>
                {resetStep === 2 && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                      Verification Reset Token
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Paste verification reset token"
                        className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-amber-50/50 hover:bg-white focus:bg-white border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}

                {resetStep === 2 && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        New Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Confirm New Password
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Regular Password Field (Login, Register, Admin) */
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  {(mode === "login" || mode === "admin") && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Additional Fields in Register Mode */}
            {mode === "register" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Academic Standard / Grade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {classLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setClassLevel(lvl)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                          classLevel === lvl
                            ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                            : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {classLevel === lvl && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-2 text-sm font-bold text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                mode === "admin"
                  ? "bg-slate-900 hover:bg-slate-800 shadow-slate-950/20"
                  : mode === "forgot"
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "register" ? (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Create Free Account</span>
                </>
              ) : mode === "admin" ? (
                <>
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>Authorize Admin Access</span>
                </>
              ) : mode === "forgot" ? (
                <>
                  <KeyRound className="w-4.5 h-4.5" />
                  <span>{resetStep === 1 ? "Request Reset Token" : "Verify Token & Update Password"}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

            {/* Success state action to proceed directly to login */}
            {mode === "forgot" && successMsg && (
              <button
                type="button"
                onClick={() => {
                  switchMode("login");
                }}
                className="w-full py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                Proceed to Sign In Now
              </button>
            )}
          </form>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 text-center">
            {mode === "login" && (
              <p className="text-xs text-slate-500">
                New to EduCarrier?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                >
                  Create an account
                </button>
              </p>
            )}

            {mode === "register" && (
              <p className="text-xs text-slate-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                >
                  Sign in here
                </button>
              </p>
            )}

            {mode === "admin" && (
              <p className="text-xs text-slate-500">
                Student or parent?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none"
                >
                  Go to Student Sign In
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <p className="text-xs text-slate-500">
                Remember your credentials?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors focus:outline-none inline-flex items-center gap-1"
                >
                  Return to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
