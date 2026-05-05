"use client";

import React, { useState, useRef, useEffect } from "react";
import { chatWithEVA } from "@/lib/gemini";
import { MOCK_CHARGERS } from "@/lib/data/mockChargers";
import { X, Zap, Send, Minus } from "lucide-react";

interface Message { role: "user" | "eva"; content: string; timestamp: Date; }
interface EVAChatProps { isOpen: boolean; onClose: () => void; }

const QUICK_ACTIONS = [
  "🗺️ Find chargers near me",
  "🔋 Will my battery last?",
  "💰 Calculate charging cost",
  "🔌 What connector do I need?",
];

export default function EVAChat({ isOpen, onClose }: EVAChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text.trim(), timestamp: new Date() }]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await chatWithEVA(text, { nearbyChargers: MOCK_CHARGERS.filter(c => c.status === "available").slice(0, 5) });
      setMessages(prev => [...prev, { role: "eva", content: res, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "eva", content: "EVA is temporarily unavailable. Please try the map directly.", timestamp: new Date() }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full z-[200] flex flex-col" style={{ width: "min(400px, 100vw)", background: "rgba(5,10,20,0.92)", backdropFilter: "blur(24px)", borderLeft: "1px solid rgba(0,255,136,0.15)", animation: "slide-in-right 0.35s var(--spring)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #00FF88, #0EA5E9, #8B5CF6, #00FF88)", animation: "rotate-gradient 3s linear infinite", filter: "blur(4px)", opacity: 0.5 }} />
            <div className="absolute inset-1 rounded-full flex items-center justify-center bg-bg-primary"><Zap size={18} className="text-ev-primary" /></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-ev-primary" style={{ boxShadow: "0 0 6px #00FF88", animation: "pulse-glow 2s infinite" }} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-ev-primary text-lg leading-none">EVA</h2>
            <p className="text-text-secondary text-[10px] mt-0.5">EV Assistant • Live data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-border)" }} onClick={onClose}><Minus size={12} className="text-text-secondary" /></button>
          <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-border)" }} onClick={onClose}><X size={12} className="text-text-secondary" /></button>
        </div>
      </div>

      {/* Context bar */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
        <span className="glass px-3 py-1 rounded-full text-[10px] text-text-secondary flex-shrink-0">⚡ {MOCK_CHARGERS.filter(c => c.status === "available").length} chargers nearby</span>
        <span className="glass px-3 py-1 rounded-full text-[10px] text-text-secondary flex-shrink-0">🌤 Live weather</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #00FF88, #0EA5E9, #8B5CF6, #00FF88)", animation: "rotate-gradient 3s linear infinite", filter: "blur(6px)", opacity: 0.5 }} />
              <div className="absolute inset-1 rounded-full flex items-center justify-center bg-bg-primary font-display font-extrabold text-xl text-ev-primary">E</div>
            </div>
            <h3 className="font-display font-bold text-text-primary text-xl mb-1">Hi! I&apos;m EVA 👋</h3>
            <p className="text-text-secondary text-sm text-center mb-6 max-w-xs">I know your route, battery level, and live charger availability.</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
              {QUICK_ACTIONS.map(a => (
                <button key={a} className="glass glass-hover p-3 rounded-xl text-left text-xs text-text-secondary cursor-pointer" onClick={() => sendMessage(a)}>{a}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "eva" && <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1" style={{ background: "rgba(0,255,136,0.2)" }}><span className="text-ev-primary text-[10px] font-bold">E</span></div>}
            <div className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed" style={{
              background: msg.role === "user" ? "rgba(0,255,136,0.12)" : "rgba(13,27,42,0.8)",
              border: msg.role === "user" ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(26,47,74,0.6)",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              color: "var(--text-primary)",
            }}>
              {msg.content}
              <div className="mt-1"><span className="font-mono text-[10px] text-text-secondary">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,255,136,0.2)" }}><span className="text-ev-primary text-[10px] font-bold">E</span></div>
            <div className="glass px-4 py-3 rounded-2xl flex items-center gap-1.5">
              {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-ev-primary" style={{ animation: `bounce-dots 1.4s ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Follow-up chips */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t" style={{ borderColor: "rgba(26,47,74,0.5)", scrollbarWidth: "none" }}>
          {["Tell me more", "Cheaper options", "Alternatives"].map(c => (
            <button key={c} className="glass px-3 py-1.5 rounded-full text-xs text-text-secondary flex-shrink-0 cursor-pointer hover:text-ev-primary hover:border-ev-primary transition-colors" onClick={() => sendMessage(c)}>{c}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="px-4 py-3 border-t flex gap-2 flex-shrink-0" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
        <input className="input-glass flex-1 !py-2.5 !rounded-full text-sm" placeholder="Ask EVA anything..." value={input} onChange={e => setInput(e.target.value)} disabled={isLoading} id="eva-input" />
        <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: input.trim() ? "#00FF88" : "var(--bg-border)" }} type="submit" disabled={isLoading || !input.trim()} id="eva-send-btn">
          <Send size={16} style={{ color: input.trim() ? "#050A14" : "#8BA0B4" }} />
        </button>
      </form>
    </div>
  );
}
