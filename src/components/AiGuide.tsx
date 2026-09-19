import React, { useState, useEffect, useRef } from "react";
import { User, Message } from "../types";
import { Sparkles, Send, Bot, User as UserIcon, RefreshCw, Loader2, ArrowRight } from "lucide-react";

interface AiGuideProps {
  user: User | null;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export default function AiGuide({ user, initialPrompt, onClearInitialPrompt }: AiGuideProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `### Hello ${user ? user.fullName : "Student"}! \ud83c\udf93
I am **Edu Carrier AI**, your professional guidance counselor.

I can help you explore streams, design custom learning roadmaps, evaluate entrance exam deadlines, or analyze technical skills.

**Ask me anything, or pick one of these popular questions below:**`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const presetQuestions = [
    "What are the best study pathways for MPC (Engineering)?",
    "Explain the future scope and skills of an AI/ML Engineer.",
    "Tell me how to prepare for the CLAT and pursue a Law degree.",
    "Which exams should I prepare for to enter ISRO or space research?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1), // ignore initial welcoming bot message
          userId: user?.id
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Response failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.text,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I apologize, but I encountered a network error. Please verify your connection or retry shortly.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Renders simple markdown sections (such as strong text, lists, headers)
  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-2 first:mt-0">{trimmed.slice(4)}</h3>;
      }
      if (trimmed.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-extrabold text-indigo-600 mt-5 mb-2 first:mt-0">{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. ") || trimmed.startsWith("4. ") || trimmed.startsWith("5. ")) {
        return <p key={idx} className="text-sm text-slate-700 pl-4 py-0.5 leading-relaxed font-medium">{line}</p>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return <li key={idx} className="text-sm text-slate-700 pl-6 py-0.5 list-none relative leading-relaxed"><span className="absolute left-2 text-indigo-500">•</span>{trimmed.slice(2)}</li>;
      }
      if (trimmed === "") {
        return <div key={idx} className="h-2"></div>;
      }

      // Convert inline bold **text** to element
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-sm text-slate-600 leading-relaxed py-0.5">
          {parts.map((part, pIdx) => idx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      {/* AI Guide Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 border-b border-slate-100 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">AI Career Counselor</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Edu Carrier AI Model</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{
            role: "model",
            text: `### Welcome back! \ud83c\udf93\n\nHow can I help you today? Send a message or pick one of the preset questions below to explore!`,
            timestamp: new Date().toISOString()
          }])}
          className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-all shadow-sm"
          title="Reset Conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-none ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-emerald-500"}`}>
              {msg.role === "user" ? <UserIcon className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
            </div>

            <div className={`p-5 rounded-2xl border space-y-1 ${msg.role === "user" ? "bg-white border-indigo-100 text-slate-800 rounded-tr-none shadow-sm shadow-indigo-50" : "bg-white border-slate-100 text-slate-700 rounded-tl-none shadow-sm shadow-slate-100"}`}>
              <div className="space-y-1">
                {renderMarkdown(msg.text)}
              </div>
              <span className="block text-[9px] text-slate-300 font-bold text-right pt-2 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 mr-auto max-w-[85%]">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-emerald-500 flex items-center justify-center shadow-sm flex-none">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              Edu Carrier AI is reviewing context & constructing response...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Panel */}
      {messages.length === 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-700 flex items-center justify-between gap-3 transition-all"
            >
              <span className="line-clamp-2">{q}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 flex-none" />
            </button>
          ))}
        </div>
      )}

      {/* Message Input Box */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder={user ? "Ask a counselor question..." : "Login to enable rich student context counselor questions..."}
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 focus:border-indigo-600 focus:bg-white rounded-xl focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
