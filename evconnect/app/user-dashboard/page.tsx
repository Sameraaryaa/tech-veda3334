"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import NFCScanModal from "@/components/nfc/NFCScanModal";
import Link from "next/link";
import { Zap, MapPin, Route, Smartphone, Battery, Leaf, Calendar, TrendingUp } from "lucide-react";
import { MOCK_CHARGERS, EV_MODELS } from "@/lib/data/mockChargers";

export default function UserDashboard() {
  const [nfcOpen, setNfcOpen] = useState(false);
  const ev = EV_MODELS[0];
  const nearbyChargers = MOCK_CHARGERS.filter(c => c.status === "available").slice(0, 3);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Dashboard" userName="Arya" />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">

          {/* Greeting */}
          <div className="glass rounded-2xl p-8 flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-white">Ready to charge, Arya? ⚡</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="pill pill-secondary text-xs">🚗 {ev.name}</span>
                <span className="pill pill-primary text-xs">🔋 67%</span>
              </div>
            </div>
            <div className="w-24">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-border)" }}>
                <div className="h-full rounded-full" style={{ width: "67%", background: "linear-gradient(90deg, #F59E0B, #00FF88)" }} />
              </div>
              <p className="text-text-secondary text-[10px] text-center mt-1 font-mono">67% — 209 km</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/map", icon: MapPin, title: "Find Charger", desc: "Near me", color: "#00FF88" },
              { href: "/journey", icon: Route, title: "Plan Journey", desc: "Route + battery", color: "#0EA5E9" },
              { href: "/user-dashboard/bookings", icon: Calendar, title: "Active Booking", desc: "None active", color: "#F59E0B" },
              { href: "#", icon: Smartphone, title: "Tap NFC", desc: "Instant charge", color: "#8B5CF6", onClick: () => setNfcOpen(true) },
            ].map(a => (
              <Link key={a.title} href={a.href} className="no-underline" onClick={a.onClick ? (e) => { e.preventDefault(); a.onClick(); } : undefined}>
                <div className="glass glass-hover rounded-xl p-5 cursor-pointer h-full">
                  <a.icon size={24} style={{ color: a.color }} className="mb-3" />
                  <p className="font-display font-bold text-sm text-text-primary">{a.title}</p>
                  <p className="text-text-secondary text-xs mt-0.5">{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nearby Chargers */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">Chargers Near You</h3>
                <Link href="/map" className="text-ev-primary text-xs no-underline hover:underline">View All →</Link>
              </div>
              <div className="space-y-3">
                {nearbyChargers.map(c => (
                  <div key={c.id} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>{c.ownerName.charAt(0)}</div>
                      <div>
                        <p className="text-text-primary text-sm font-medium">{c.ownerName}</p>
                        <p className="text-text-secondary text-[10px]">{c.connectorType} • {c.powerKW} kW • ₹{c.pricePerUnit}/kWh</p>
                      </div>
                    </div>
                    <span className="pill pill-primary text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-ev-primary inline-block mr-1" style={{ boxShadow: "0 0 4px #00FF88" }} />Available
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-text-secondary text-[10px] mt-3 text-center">Based on your last location</p>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { date: "Today", charger: "Rajesh Kumar", loc: "Koramangala", kWh: "12.5", cost: "₹94", status: "completed" },
                  { date: "Yesterday", charger: "Priya Nair", loc: "HSR Layout", kWh: "8.2", cost: "₹62", status: "completed" },
                  { date: "May 2", charger: "Vikram Shetty", loc: "Whitefield", kWh: "20.1", cost: "₹151", status: "completed" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ borderLeft: "2px solid rgba(0,255,136,0.3)" }}>
                    <div>
                      <span className="pill text-[9px] mb-1" style={{ background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.2)" }}>{b.date}</span>
                      <p className="text-text-primary text-sm mt-1">{b.charger} — {b.loc}</p>
                      <p className="text-text-secondary text-xs">{b.kWh} kWh • {b.cost}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, value: "24", label: "Total Sessions", color: "#00FF88" },
              { icon: Battery, value: "186 kWh", label: "Total Charged", color: "#0EA5E9" },
              { icon: TrendingUp, value: "₹1,395", label: "Total Spent", color: "#F59E0B" },
              { icon: Leaf, value: "152 kg", label: "CO₂ Saved 🌱", color: "#00FF88" },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5 text-center">
                <s.icon size={20} style={{ color: s.color }} className="mx-auto mb-2" />
                <p className="font-mono font-bold text-xl text-text-primary">{s.value}</p>
                <p className="text-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

        </main>
      </div>
      <NFCScanModal isOpen={nfcOpen} onClose={() => setNfcOpen(false)} onChargerDetected={() => setNfcOpen(false)} />
    </div>
  );
}
