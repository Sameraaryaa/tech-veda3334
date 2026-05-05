"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import NFCScanModal from "@/components/nfc/NFCScanModal";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers } from "@/lib/firebase";
import { Charger } from "@/lib/types";
import { Zap, TrendingUp, Calendar, Activity, Plus, ToggleLeft, ToggleRight } from "lucide-react";

const ACTIVITY_FEED = [
  { icon: "📅", text: "New booking received", time: "2 min ago", color: "#0EA5E9" },
  { icon: "⚡", text: "Charging session started", time: "15 min ago", color: "#00FF88" },
  { icon: "✓", text: "Session completed — ₹45 earned", time: "1 hr ago", color: "#00FF88" },
  { icon: "📱", text: "Charger activated via NFC", time: "2 hrs ago", color: "#F59E0B" },
  { icon: "📅", text: "New booking from user", time: "3 hrs ago", color: "#0EA5E9" },
];

const EARNINGS_7D = [120, 85, 200, 150, 310, 240, 340];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [nfcOpen, setNfcOpen] = useState(false);
  const [chargers, setChargers] = useState<Charger[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [user, loading, router]);

  // Listen to chargers from Firebase
  useEffect(() => {
    const unsub = listenToAllChargers((all) => {
      setChargers(all.slice(0, 4));
    });
    return () => unsub();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", animation: "pulse-glow 2s infinite" }}>
          <Zap size={24} fill="#050A14" />
        </div>
      </div>
    );
  }

  const userName = user.displayName;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Overview" activeCount={chargers.filter(c => c.status === "available").length} />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Welcome Card */}
          <div className="glass rounded-2xl p-8 flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white">{greeting}, {userName} ☀️</h2>
              <p className="text-text-secondary mt-1">Your chargers are earning while you sleep.</p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-xs">Today&apos;s Earnings</p>
              <p className="font-mono font-bold text-4xl text-ev-primary glow-text-green">₹340</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, value: String(chargers.length), label: "Total Chargers", color: "#00FF88" },
              { icon: Activity, value: "8", label: "Today's Sessions", color: "#0EA5E9" },
              { icon: Calendar, value: "2", label: "Pending Bookings", color: "#F59E0B" },
              { icon: TrendingUp, value: "₹2,450", label: "This Month", color: "#00FF88" },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5">
                <s.icon size={20} style={{ color: s.color }} className="mb-2" />
                <p className="font-mono font-bold text-2xl text-text-primary">{s.value}</p>
                <p className="text-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Activity Feed */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display font-bold text-white">Live Activity</h3>
                <span className="w-2 h-2 rounded-full bg-ev-primary" style={{ animation: "pulse-glow 2s infinite" }} />
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {ACTIVITY_FEED.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ animation: `slide-up 0.3s var(--spring) ${i * 0.05}s both` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ background: `${event.color}18` }}>{event.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm">{event.text}</p>
                      <p className="font-mono text-[10px] text-text-secondary mt-0.5">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Chart */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">7-Day Earnings</h3>
              <div className="flex items-end justify-between gap-2 h-[200px] pt-4">
                {EARNINGS_7D.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="font-mono text-[10px] text-text-secondary">₹{val}</span>
                    <div className="w-full rounded-t-lg transition-all" style={{
                      height: `${(val / Math.max(...EARNINGS_7D)) * 150}px`,
                      background: "linear-gradient(180deg, #00FF88, #00CC6A)",
                      opacity: 0.8,
                      animation: `slide-up 0.5s var(--spring) ${i * 0.05}s both`,
                    }} />
                    <span className="font-mono text-[10px] text-text-secondary">{DAYS[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charger Status Grid */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white">Your Chargers</h3>
              <button className="btn-ghost text-xs py-2 px-4 flex items-center gap-1" onClick={() => router.push("/owner-dashboard/chargers")}>
                <Plus size={14} /> Manage
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chargers.map(c => (
                <ChargerStatusCard key={c.id} charger={c} />
              ))}
              {chargers.length === 0 && (
                <div className="glass rounded-xl p-6 text-center col-span-full">
                  <p className="text-text-secondary text-sm">No chargers yet. Add your first charger!</p>
                  <button className="btn-primary mt-3 text-sm py-2 px-6" onClick={() => router.push("/list-charger")}>List a Charger</button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <NFCScanModal isOpen={nfcOpen} onClose={() => setNfcOpen(false)} onChargerDetected={() => setNfcOpen(false)} />
    </div>
  );
}

function ChargerStatusCard({ charger }: { charger: Charger }) {
  const [status, setStatus] = useState(charger.status);
  const isAvail = status === "available";
  const statusColors: Record<string, string> = { available: "#00FF88", charging: "#F59E0B", booked: "#EF4444", offline: "#4A5568" };
  return (
    <div className="glass rounded-xl p-5 transition-all" style={{ borderLeft: `4px solid ${statusColors[status] || "#4A5568"}` }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display font-bold text-sm text-text-primary">{charger.ownerName}&apos;s Charger</h4>
        <button onClick={() => setStatus(isAvail ? "offline" : "available")} className="cursor-pointer">{isAvail ? <ToggleRight size={28} className="text-ev-primary" /> : <ToggleLeft size={28} className="text-text-secondary" />}</button>
      </div>
      <p className="text-text-secondary text-xs mb-2">{charger.location.address}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="pill text-[10px]" style={{ background: `${statusColors[status]}18`, color: statusColors[status], border: `1px solid ${statusColors[status]}30` }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ background: statusColors[status] }} />{status}
        </span>
        <span className="text-text-secondary font-mono">{charger.powerKW} kW</span>
        <span className="text-ev-primary font-mono">₹{charger.pricePerUnit}</span>
      </div>
    </div>
  );
}
