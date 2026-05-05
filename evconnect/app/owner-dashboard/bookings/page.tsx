"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { Check, X, Zap, Clock, User } from "lucide-react";

const BOOKINGS = [
  { id: "B001", user: "Ananya S.", charger: "Type 2 — 7.2kW", time: "Today, 6:00 PM", duration: "2 hrs", cost: "₹108", status: "pending" },
  { id: "B002", user: "Vikram M.", charger: "CCS2 — 50kW", time: "Today, 3:00 PM", duration: "30 min", cost: "₹250", status: "active" },
  { id: "B003", user: "Priya R.", charger: "Type 2 — 7.2kW", time: "Yesterday, 8:00 AM", duration: "3 hrs", cost: "₹162", status: "completed" },
  { id: "B004", user: "Ravi K.", charger: "Type 2 — 7.2kW", time: "May 2, 10:00 AM", duration: "1.5 hrs", cost: "₹81", status: "completed" },
];

export default function OwnerBookingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [tab, setTab] = useState<string>("pending");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><div className="w-12 h-12 rounded-full" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", animation: "pulse-glow 2s infinite" }} /></div>;

  const tabs = ["pending", "active", "completed", "cancelled"];
  const filtered = BOOKINGS.filter(b => b.status === tab);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Bookings" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex gap-2 mb-6">
            {tabs.map(t => (
              <button key={t} className="pill cursor-pointer capitalize px-4 py-2" style={tab === t ? { background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" } : { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" }} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center"><p className="text-text-secondary">No {tab} bookings.</p></div>
            ) : filtered.map(b => (
              <div key={b.id} className="glass rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0EA5E9, #3B82F6)", color: "white" }}><User size={18} /></div>
                  <div>
                    <p className="text-text-primary font-medium">{b.user}</p>
                    <p className="text-text-secondary text-xs">{b.charger} • {b.time}</p>
                    <p className="text-text-secondary text-xs flex items-center gap-2 mt-0.5"><Clock size={10} /> {b.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg text-ev-primary font-bold">{b.cost}</span>
                  {b.status === "pending" && (
                    <>
                      <button className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}><Check size={16} className="text-ev-primary" /></button>
                      <button className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}><X size={16} className="text-ev-danger" /></button>
                    </>
                  )}
                  {b.status === "active" && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
                      <Zap size={12} className="text-ev-primary" /> Charging...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
