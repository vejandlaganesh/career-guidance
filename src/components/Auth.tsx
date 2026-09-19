import React, { useState } from "react";
import { GraduationCap, LogIn, UserPlus, Eye, EyeOff, X, ShieldCheck } from "lucide-react";
import { User } from "../types";

interface AuthProps {
  initialMode: "login" | "register" | "admin";
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ initialMode, onClose, onLoginSuccess }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register" | "admin">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classLevel, setClassLevel] = useState("Class 10");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      if (!fullName || !email || !password || !confirmPassword || !classLevel) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password should be at least 6 characters.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password, classLevel })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed.");
        } else {
          onLoginSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setError("Email and password are required.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid credentials.");
        } else {
          if (mode === "admin" && data.user.role !== "admin" && data.user.email !== "admin@educarrier.com" && data.user.email !== "admin@example.com") {
            setError("Access Denied: You do not have administrator privileges.");
            setLoading(false);
            return;
          }
          onLoginSuccess(data.user);
          onClose();
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const classLevels = [
    "Class 10", "Class 11", "Class 12"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 z-10 space-y-6 animate-in fade-in zoom-in duration-250">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          {mode === "admin" ? (
            <>
              <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center text-amber-500 shadow-md">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Admin Portal Login
              </h2>
              <p className="text-xs text-slate-500">
                Please provide authorized credentials to enter administrative console
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center text-indigo-600">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {mode === "register" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="text-xs text-slate-400">
                {mode === "register" ? "Explore streams, quizzes & AI guide" : "Sign in to access your dashboard"}
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {mode === "admin" ? "Admin Email Address" : "Email Address"}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === "admin" ? "admin@educarrier.com" : "e.g. rahul@example.com"}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class Level</label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                >
                  {classLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 text-sm font-semibold text-white rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
              mode === "admin" 
                ? "bg-slate-900 hover:bg-slate-800 shadow-slate-200" 
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
            }`}
          >
            {mode === "register" ? (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                {loading ? "Registering..." : "Register Now"}
              </>
            ) : mode === "admin" ? (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                {loading ? "Authorizing..." : "Authorize Admin Access"}
              </>
            ) : (
              <>
                <LogIn className="w-4.5 h-4.5" />
                {loading ? "Logging in..." : "Log In"}
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 space-y-2">
          {mode === "admin" ? (
            <p className="text-xs text-slate-400">
              Not an administrator?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                Access Student Portal
              </button>
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                {mode === "register" ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "register" ? "login" : "register");
                    setError("");
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
                >
                  {mode === "register" ? "Login here" : "Register here"}
                </button>
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Are you an educator?{" "}
                <button
                  onClick={() => {
                    setMode("admin");
                    setError("");
                  }}
                  className="font-bold text-slate-600 hover:text-slate-800 transition-colors focus:outline-none"
                >
                  Enter Admin Portal
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
