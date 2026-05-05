"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers, updateChargerStatus } from "@/lib/firebase";
import { Charger } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, ToggleRight, ToggleLeft, Smartphone, Zap, DollarSign, Users, TrendingUp, BarChart3 } from "lucide-react";

export default function MyChargersPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [tab, setTab] = useState<"chargers" | "earnings">("chargers");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  useEffect(() => {
    const unsub = listenToAllChargers((all) => {
      // In production, filter by user.uid === charger.ownerId
      // For demo, show first 5 as "your" chargers
      setChargers(all.slice(0, 5));
    });
    return () => unsub();
  }, []);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><Zap size={32} className="text-ev-primary animate-pulse" /></div>;

  const totalEarnings = 2450;
  const thisMonth = 840;
  const activeSessions = chargers.filter(c => c.status === "charging").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Chargers" />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, value: String(chargers.length), label: "Listed Chargers", color: "#00FF88" },
              { icon: Users, value: String(activeSessions), label: "Active Sessions", color: "#0EA5E9" },
              { icon: DollarSign, value: `₹${thisMonth}`, label: "This Month", color: "#F59E0B" },
              { icon: TrendingUp, value: `₹${totalEarnings.toLocaleString()}`, label: "Total Earned", color: "#00FF88" },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5">
                <s.icon size={20} style={{ color: s.color }} className="mb-2" />
                <p className="font-mono font-bold text-2xl text-text-primary">{s.value}</p>
                <p className="text-text-secondary text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["chargers", "earnings"] as const).map(t => (
              <button key={t} className="pill cursor-pointer capitalize px-5 py-2 text-sm" style={tab === t ? { background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" } : { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" }} onClick={() => setTab(t)}>
                {t === "chargers" ? "⚡ My Chargers" : "💰 Earnings"}
              </button>
            ))}
          </div>

          {tab === "chargers" ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="font-display font-bold text-lg text-white">Manage Your Chargers</h2>
                <Link href="/list-charger"><button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Plus size={16} /> List New Charger</button></Link>
              </div>

              {chargers.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                  <Zap size={40} className="text-text-secondary mx-auto mb-4" />
                  <p className="text-text-secondary mb-3">You haven&apos;t listed any chargers yet.</p>
                  <Link href="/list-charger"><button className="btn-primary px-6 py-2.5">List Your First Charger</button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {chargers.map(c => <ChargerRow key={c.id} charger={c} />)}
                </div>
              )}
            </>
          ) : (
            /* Earnings Tab */
            <div className="space-y-6">
              <div className="glass glass-active rounded-2xl p-10 text-center">
                <p className="text-text-secondary text-sm mb-1">Total Earned</p>
                <p className="font-mono font-bold text-5xl text-ev-primary glow-text-green">₹{totalEarnings.toLocaleString()}</p>
                <p className="text-text-secondary text-sm mt-2">Since joining EVConnect</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-ev-primary" /> Monthly Breakdown</h3>
                <div className="flex items-end justify-between gap-2 h-[200px] pt-4">
                  {[120, 280, 350, 420, 560, 640, 840].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="font-mono text-[9px] text-text-secondary">₹{val}</span>
                      <div className="w-full rounded-t-lg" style={{ height: `${(val / 840) * 160}px`, background: "linear-gradient(180deg, #00FF88, #00CC6A)", opacity: 0.8, animation: `slide-up 0.5s var(--spring) ${i * 0.05}s both` }} />
                      <span className="font-mono text-[10px] text-text-secondary">{["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {[
                    { date: "May 5", user: "Ananya S.", kWh: "15.5", amt: "₹116", status: "completed" },
                    { date: "May 4", user: "Vikram M.", kWh: "20.8", amt: "₹166", status: "completed" },
                    { date: "May 3", user: "Priya R.", kWh: "8.2", amt: "₹62", status: "completed" },
                    { date: "May 2", user: "Ravi K.", kWh: "12.1", amt: "₹91", status: "completed" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ borderLeft: "2px solid rgba(0,255,136,0.3)" }}>
                      <div>
                        <p className="text-text-primary text-sm">{r.user}</p>
                        <p className="text-text-secondary text-xs">{r.date} · {r.kWh} kWh</p>
                      </div>
                      <span className="font-mono text-ev-primary font-bold">{r.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ChargerRow({ charger }: { charger: Charger }) {
  const [status, setStatus] = useState(charger.status);
  const isAvail = status === "available";
  const handleToggle = async () => {
    const newStatus = isAvail ? "offline" : "available";
    setStatus(newStatus);
    try { await updateChargerStatus(charger.id, newStatus); } catch { setStatus(charger.status); }
  };
  const statusColors: Record<string, string> = { available: "#00FF88", charging: "#F59E0B", booked: "#0EA5E9", offline: "#4A5568" };
  return (
    <div className="glass rounded-xl p-5 flex items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-text-primary text-sm">{charger.ownerName}&apos;s Charger</h3>
          <span className="w-2 h-2 rounded-full" style={{ background: statusColors[status], boxShadow: `0 0 6px ${statusColors[status]}` }} />
        </div>
        <p className="text-text-secondary text-xs">{charger.location.address}, {charger.location.city}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="pill pill-secondary text-[10px]">{charger.connectorType}</span>
          <span className="font-mono text-xs text-text-secondary">{charger.powerKW} kW</span>
          <span className="font-mono text-xs text-ev-primary">₹{charger.pricePerUnit}/kWh</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px]" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)" }}>
          <Smartphone size={10} className="text-ev-primary" /> NFC
        </div>
        <button onClick={handleToggle} className="cursor-pointer">
          {isAvail ? <ToggleRight size={28} className="text-ev-primary" /> : <ToggleLeft size={28} className="text-text-secondary" />}
        </button>
      </div>
    </div>
  );
}
