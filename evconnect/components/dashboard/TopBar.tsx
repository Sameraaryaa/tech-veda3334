"use client";

import React, { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";

interface TopBarProps {
  title: string;
  activeCount?: number;
}

export default function TopBar({ title, activeCount = 0 }: TopBarProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const { user } = useAuthContext();
  const userName = user?.displayName || "User";

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-40" style={{ background: "rgba(5,10,20,0.8)", backdropFilter: "blur(20px)", borderColor: "rgba(26,47,74,0.5)" }}>
      <h1 className="font-display font-bold text-xl text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {activeCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <span className="w-2 h-2 rounded-full bg-ev-primary" style={{ boxShadow: "0 0 6px #00FF88", animation: "pulse-glow 2s infinite" }} />
            <span className="text-text-secondary">{activeCount} charger{activeCount > 1 ? "s" : ""} active</span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center glass cursor-pointer" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} className="text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ background: "#00FF88", color: "#050A14" }}>3</span>
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-72 glass rounded-xl p-3 space-y-2" style={{ animation: "slide-up 0.2s var(--spring)" }}>
              {["New booking from Ananya S.", "Charger activated via NFC", "Session completed — ₹45"].map((n, i) => (
                <div key={i} className="px-3 py-2 rounded-lg text-xs text-text-secondary hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors">{n}</div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>{userName.charAt(0)}</div>
          )}
          <ChevronDown size={14} className="text-text-secondary" />
        </div>
      </div>
    </header>
  );
}
