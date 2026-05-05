"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { Clock, MapPin, Navigation, X as XIcon, Zap } from "lucide-react";
import Link from "next/link";

const MY_BOOKINGS = [
  { id: "B101", charger: "Rajesh Kumar", loc: "Koramangala 4th Block", time: "Today, 6:00 PM", cost: "₹94", status: "upcoming" },
  { id: "B102", charger: "Priya Nair", loc: "HSR Layout Sector 1", time: "Yesterday, 2:00 PM", cost: "₹62", kWh: "8.2", dur: "1h 8m", status: "completed" },
  { id: "B103", charger: "Vikram Shetty", loc: "Whitefield Main Rd", time: "May 2, 10:00 AM", cost: "₹151", kWh: "20.1", dur: "2h 47m", status: "completed" },
];

export default function UserBookingsPage() {
  const [tab, setTab] = useState("upcoming");
  const tabs = ["upcoming", "active", "completed", "cancelled"];
  const filtered = MY_BOOKINGS.filter(b => b.status === tab);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Bookings" userName="Arya" />
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
              <div key={b.id} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-text-primary">{b.charger}</p>
                    <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={10} />{b.loc}</p>
                  </div>
                  <span className="font-mono text-xl text-ev-primary font-bold">{b.cost}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><Clock size={12} />{b.time}</span>
                  {b.kWh && <span className="font-mono">{b.kWh} kWh</span>}
                  {b.dur && <span className="font-mono">{b.dur}</span>}
                </div>
                {b.status === "upcoming" && (
                  <div className="flex gap-2 mt-3">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.loc)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs py-2 px-4 flex items-center gap-1 no-underline"><Navigation size={12} /> Get Directions</a>
                    <button className="pill cursor-pointer text-xs py-2 px-4" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}><XIcon size={12} className="inline mr-1" /> Cancel</button>
                  </div>
                )}
                {b.status === "upcoming" && (
                  <div className="mt-3 glass rounded-lg p-2 text-xs text-text-secondary flex items-center gap-2">
                    <Zap size={12} className="text-ev-primary" /> Tip: Tap your NFC card at the charger to start your session instantly
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
