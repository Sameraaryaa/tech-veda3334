"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { TrendingUp, Download, Zap } from "lucide-react";

const MONTHLY_DATA = [1200, 1800, 2100, 1600, 2450, 2800, 3200, 2900, 3500, 3100, 3800, 4200];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function OwnerEarningsPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [period, setPeriod] = useState("month");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><div className="w-12 h-12 rounded-full" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", animation: "pulse-glow 2s infinite" }}><Zap size={24} className="m-3" fill="#050A14" /></div></div>;

  const total = MONTHLY_DATA.reduce((a, b) => a + b, 0);
  const max = Math.max(...MONTHLY_DATA);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Earnings" />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="glass glass-active rounded-2xl p-10 text-center">
            <p className="text-text-secondary text-sm mb-1">Total Earned</p>
            <p className="font-mono font-bold text-6xl text-ev-primary glow-text-green">₹{total.toLocaleString()}</p>
            <p className="text-text-secondary text-sm mt-2">Since joining EVConnect</p>
          </div>

          <div className="flex gap-2">
            {["week", "month", "year", "all"].map(p => (
              <button key={p} className="pill cursor-pointer capitalize px-4 py-2" style={period === p ? { background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" } : { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" }} onClick={() => setPeriod(p)}>This {p}</button>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-white flex items-center gap-2"><TrendingUp size={18} className="text-ev-primary" /> Monthly Earnings</h3>
              <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"><Download size={12} /> Export CSV</button>
            </div>
            <div className="flex items-end justify-between gap-2 h-[250px] pt-4">
              {MONTHLY_DATA.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="font-mono text-[9px] text-text-secondary">₹{(val / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t-lg" style={{ height: `${(val / max) * 200}px`, background: "linear-gradient(180deg, #00FF88, #00CC6A)", opacity: 0.8, animation: `slide-up 0.5s var(--spring) ${i * 0.03}s both` }} />
                  <span className="font-mono text-[10px] text-text-secondary">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-bold text-white mb-4">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-text-secondary text-xs text-left border-b" style={{ borderColor: "var(--bg-border)" }}>
                  <th className="py-3 font-medium">Date</th><th className="py-3 font-medium">Charger</th><th className="py-3 font-medium">User</th><th className="py-3 font-medium">Duration</th><th className="py-3 font-medium">kWh</th><th className="py-3 font-medium text-right">Amount</th>
                </tr></thead>
                <tbody>
                  {[
                    { date: "May 5", charger: "Type 2", user: "Ananya S.", dur: "2h 10m", kwh: "15.5", amt: "₹116" },
                    { date: "May 4", charger: "CCS2", user: "Vikram M.", dur: "25m", kwh: "20.8", amt: "₹166" },
                    { date: "May 4", charger: "Type 2", user: "Priya R.", dur: "3h", kwh: "21.6", amt: "₹162" },
                    { date: "May 3", charger: "Type 2", user: "Ravi K.", dur: "1h 30m", kwh: "10.8", amt: "₹81" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ borderColor: "rgba(26,47,74,0.3)" }}>
                      <td className="py-3 font-mono text-text-secondary text-xs">{r.date}</td>
                      <td className="py-3">{r.charger}</td>
                      <td className="py-3">{r.user}</td>
                      <td className="py-3 font-mono text-xs">{r.dur}</td>
                      <td className="py-3 font-mono text-xs">{r.kwh}</td>
                      <td className="py-3 font-mono text-ev-primary font-bold text-right">{r.amt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
