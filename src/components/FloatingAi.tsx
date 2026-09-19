import React, { useState, useEffect, useRef } from "react";
import { User, Message } from "../types";
import { Sparkles, Send, Bot, X, Loader2, MessageSquare, CornerDownLeft, RefreshCw } from "lucide-react";

interface FloatingAiProps {
  user: User | null;
}

export default function FloatingAi({ user }: FloatingAiProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `### Hello ${user ? user.fullName.split(" ")[0] : "there"}! 👋
I am your **Edu Carrier Dashboard Helper**.

Ask me any quick questions about:
1. **The new PCMB** double-science track
2. **CEC careers** vs MEC paths
3. **Emerging tech streams** (AI, Renewable Energy)

*Pick a quick prompt below or type your question!*`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    { label: "⚡ PCMB Scope", query: "Explain the scope, entrance exams, and college options for the newly added PCMB stream." },
    { label: "⚖️ CEC vs MEC", query: "What is the difference between CEC (Civics, Economics, Commerce) and MEC? Which is better for Law and CA?" },
    { label: "🤖 Hot AI Careers", query: "Tell me about emerging careers in AI like Prompt Engineering and Agricultural AI Specialists." },
    { label: "🌟 Best Colleges", query: "What are the top colleges in India for Engineering, Medical, and Commerce streams?" }
  ];

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

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
          history: messages.slice(1),
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
          text: "I encountered a slight issue connecting to the counselor module. Please retry in a few moments.",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-3 mb-1 first:mt-0">{trimmed.slice(4)}</h4>;
      }
      if (trimmed.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-extrabold text-indigo-600 mt-4 mb-1 first:mt-0">{trimmed.slice(3)}</h3>;
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return <p key={idx} className="text-xs text-slate-700 pl-3 py-0.5 leading-relaxed font-semibold">{line}</p>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={idx} className="text-xs text-slate-700 pl-4 py-0.5 list-none relative leading-relaxed">
            <span className="absolute left-1 text-indigo-500">•</span>
            {trimmed.slice(2)}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={idx} className="h-1.5"></div>;
      }

      // Convert inline bold **text** to element
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed py-0.5">
          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part)}
        </p>
      );
    });
  };

  const resetChat = () => {
    setMessages([
      {
        role: "model",
        text: `### Reset Done! ⚡\n\nHow can I help you explore your options now? Enter a prompt or select a direct shortcut below!`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden mb-4 animate-in fade-in slide-in-from-bottom-8 duration-250">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-100">
                <Sparkles className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight">Dashboard Advisor</h3>
                <span className="block text-[9px] text-indigo-200 font-semibold uppercase tracking-wider">Active Guide</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={resetChat} 
                className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset conversation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3.5">
            {messages.map((m, idx) => {
              const isModel = m.role === "model";
              return (
                <div key={idx} className={`flex gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}>
                  {isModel && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[78%] p-3 rounded-2xl text-xs shadow-sm ${
                    isModel 
                      ? "bg-white border border-slate-100 text-slate-700 rounded-tl-none" 
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}>
                    {isModel ? renderMarkdown(m.text) : <p className="leading-relaxed font-semibold">{m.text}</p>}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Counselor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Shortcuts */}
          <div className="bg-slate-50 px-4 pb-2 border-t border-slate-100/50">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quick Counsel Shortcuts:</span>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSend(p.query)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:border-indigo-400 rounded-lg transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Ask anything about streams or careers..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-semibold text-slate-700"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-8.5 h-8.5 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative border-2 border-white/20 group"
        aria-label="Ask Career Assistant"
        id="floating-ai-advisor"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-in spin-in duration-200" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 fill-white/10 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-extrabold text-white items-center justify-center">AI</span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
