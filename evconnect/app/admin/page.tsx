"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers } from "@/lib/firebase";
import { Charger } from "@/lib/types";
import { Zap, Users, DollarSign, TrendingUp, Activity, Shield, LogOut, Home, BarChart3, CreditCard, MapPin, ChevronRight, Search, Download } from "lucide-react";

const OWNERS = [
  { name: "Rajesh Kumar", chargers: 4, earnings: 12400, pending: 3200, sessions: 86, rating: 4.7, status: "active" },
  { name: "Priya Nair", chargers: 3, earnings: 9800, pending: 2100, sessions: 62, rating: 4.8, status: "active" },
  { name: "Vikram Shetty", chargers: 5, earnings: 15600, pending: 4500, sessions: 112, rating: 4.5, status: "active" },
  { name: "Ananya Sharma", chargers: 2, earnings: 5200, pending: 1400, sessions: 34, rating: 4.9, status: "active" },
  { name: "Suresh Reddy", chargers: 3, earnings: 8900, pending: 2800, sessions: 58, rating: 4.6, status: "active" },
  { name: "Meena Iyer", chargers: 2, earnings: 4600, pending: 1200, sessions: 28, rating: 4.4, status: "active" },
  { name: "Arun Patel", chargers: 6, earnings: 22100, pending: 5400, sessions: 148, rating: 4.7, status: "active" },
  { name: "Divya Menon", chargers: 1, earnings: 2100, pending: 600, sessions: 14, rating: 4.3, status: "inactive" },
  { name: "Karthik Rao", chargers: 4, earnings: 11200, pending: 3100, sessions: 76, rating: 4.6, status: "active" },
  { name: "Lakshmi Devi", chargers: 2, earnings: 3800, pending: 900, sessions: 22, rating: 4.2, status: "active" },
];

const RECENT_PAYOUTS = [
  { owner: "Rajesh Kumar", amount: 3200, date: "Apr 30, 2025", method: "UPI", status: "completed" },
  { owner: "Vikram Shetty", amount: 4500, date: "Apr 30, 2025", method: "Bank Transfer", status: "completed" },
  { owner: "Priya Nair", amount: 2100, date: "Apr 30, 2025", method: "UPI", status: "completed" },
  { owner: "Arun Patel", amount: 5400, date: "Apr 30, 2025", method: "Bank Transfer", status: "pending" },
  { owner: "Suresh Reddy", amount: 2800, date: "Apr 30, 2025", method: "UPI", status: "pending" },
];

const MONTHLY_REVENUE = [18200, 24500, 32100, 38400, 42800, 48200, 54600, 51200, 58900, 62400, 68100, 74200];
const MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuthContext();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [tab, setTab] = useState<"overview" | "owners" | "payouts">("overview");
  const [search, setSearch] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  useEffect(() => {
    const unsub = listenToAllChargers((all) => setChargers(all));
    return () => unsub();
  }, []);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><Zap size={32} className="text-ev-primary animate-pulse" /></div>;

  const totalChargers = chargers.length;
  const activeChargers = chargers.filter(c => c.status === "available" || c.status === "charging").length;
  const totalOwners = OWNERS.length;
  const totalRevenue = OWNERS.reduce((s, o) => s + o.earnings, 0);
  const pendingPayouts = OWNERS.reduce((s, o) => s + o.pending, 0);
  const totalSessions = OWNERS.reduce((s, o) => s + o.sessions, 0);
  const platformCommission = Math.round(totalRevenue * 0.15);
  const filteredOwners = OWNERS.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  const handleLogout = async () => { await logout(); router.push("/auth"); };

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-[260px] min-w-[260px] h-screen fixed left-0 top-0 flex flex-col z-50 border-r" style={{ background: "rgba(5,10,20,0.95)", backdropFilter: "blur(24px)", borderColor: "rgba(239,68,68,0.15)" }}>
        <div className="p-5 border-b" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", boxShadow: "0 0 16px rgba(239,68,68,0.4)" }}>
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-lg text-white">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "white" }}>A</div>
            <div>
              <p className="text-text-primary font-medium text-sm">{user.displayName}</p>
              <span className="pill pill-danger text-[9px]">Platform Admin</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {[
            { id: "overview" as const, icon: Home, label: "Overview" },
            { id: "owners" as const, icon: Users, label: "Charger Owners" },
            { id: "payouts" as const, icon: CreditCard, label: "Payouts" },
          ].map(item => (
            <button key={item.id} className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer ${tab === item.id ? "glass-active" : "hover:bg-[rgba(255,255,255,0.03)]"}`} style={tab === item.id ? { borderLeft: "3px solid #EF4444" } : {}} onClick={() => setTab(item.id)}>
              <item.icon size={18} style={{ color: tab === item.id ? "#EF4444" : "#8BA0B4" }} />
              <span style={{ color: tab === item.id ? "#EF4444" : "#F0F4F8" }} className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
          <Link href="/user-dashboard" className="no-underline">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-ev-primary transition-colors cursor-pointer">🚗 Back to Dashboard</div>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-text-secondary hover:text-ev-danger transition-colors cursor-pointer w-full">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-[260px] flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-40" style={{ background: "rgba(5,10,20,0.8)", backdropFilter: "blur(20px)", borderColor: "rgba(26,47,74,0.5)" }}>
          <h1 className="font-display font-bold text-xl text-white">{tab === "overview" ? "Platform Overview" : tab === "owners" ? "Charger Owners" : "Monthly Payouts"}</h1>
          <div className="flex items-center gap-2">
            <span className="pill pill-danger text-xs">🔴 Admin Mode</span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {tab === "overview" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: MapPin, value: String(totalChargers), label: "Total Chargers", color: "#00FF88", sub: `${activeChargers} active` },
                  { icon: Users, value: String(totalOwners), label: "Registered Owners", color: "#0EA5E9", sub: `${OWNERS.filter(o => o.status === "active").length} active` },
                  { icon: DollarSign, value: `₹${(totalRevenue / 1000).toFixed(1)}K`, label: "Total Revenue", color: "#F59E0B", sub: "All time" },
                  { icon: Activity, value: String(totalSessions), label: "Total Sessions", color: "#8B5CF6", sub: "All time" },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-5">
                    <s.icon size={20} style={{ color: s.color }} className="mb-2" />
                    <p className="font-mono font-bold text-2xl text-text-primary">{s.value}</p>
                    <p className="text-text-secondary text-xs mt-1">{s.label}</p>
                    <p className="text-text-secondary text-[10px] mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Revenue Chart + Platform Commission */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass rounded-2xl p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-white flex items-center gap-2"><BarChart3 size={18} style={{ color: "#EF4444" }} /> Platform Revenue (12 months)</h3>
                    <button className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"><Download size={12} /> Export</button>
                  </div>
                  <div className="flex items-end justify-between gap-1.5 h-[220px] pt-4">
                    {MONTHLY_REVENUE.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="font-mono text-[8px] text-text-secondary">₹{(val / 1000).toFixed(0)}K</span>
                        <div className="w-full rounded-t-lg" style={{ height: `${(val / Math.max(...MONTHLY_REVENUE)) * 180}px`, background: `linear-gradient(180deg, ${i === MONTHLY_REVENUE.length - 1 ? "#EF4444" : "#00FF88"}, ${i === MONTHLY_REVENUE.length - 1 ? "#DC2626" : "#00CC6A"})`, opacity: 0.85, animation: `slide-up 0.5s var(--spring) ${i * 0.03}s both` }} />
                        <span className="font-mono text-[9px] text-text-secondary">{MONTHS[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass rounded-2xl p-6 text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                    <p className="text-text-secondary text-xs mb-1">Platform Commission (15%)</p>
                    <p className="font-mono font-bold text-3xl text-ev-danger">₹{platformCommission.toLocaleString()}</p>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
                    <p className="text-text-secondary text-xs mb-1">Pending Payouts</p>
                    <p className="font-mono font-bold text-3xl text-ev-warning">₹{pendingPayouts.toLocaleString()}</p>
                    <button className="btn-primary mt-3 text-xs py-2 px-4">Process All</button>
                  </div>
                  <div className="glass rounded-2xl p-6 text-center" style={{ borderColor: "rgba(0,255,136,0.2)" }}>
                    <p className="text-text-secondary text-xs mb-1">Charger Status</p>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div><p className="font-mono text-lg text-ev-primary">{chargers.filter(c => c.status === "available").length}</p><p className="text-[9px] text-text-secondary">Available</p></div>
                      <div><p className="font-mono text-lg text-ev-warning">{chargers.filter(c => c.status === "charging").length}</p><p className="text-[9px] text-text-secondary">Charging</p></div>
                      <div><p className="font-mono text-lg text-text-secondary">{chargers.filter(c => c.status === "offline").length}</p><p className="text-[9px] text-text-secondary">Offline</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Owners */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-4">Top Earning Owners</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {OWNERS.sort((a, b) => b.earnings - a.earnings).slice(0, 5).map((o, i) => (
                    <div key={o.name} className="glass rounded-xl p-4 text-center" style={{ animation: `slide-up 0.3s var(--spring) ${i * 0.05}s both` }}>
                      <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center font-display font-bold text-sm mb-2" style={{ background: i === 0 ? "linear-gradient(135deg, #F59E0B, #EAB308)" : "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>{o.name.charAt(0)}</div>
                      <p className="text-text-primary text-xs font-medium truncate">{o.name}</p>
                      <p className="font-mono text-sm text-ev-primary font-bold mt-1">₹{o.earnings.toLocaleString()}</p>
                      <p className="text-text-secondary text-[9px]">{o.chargers} chargers · ★{o.rating}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "owners" && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" /><input className="input-glass !pl-9 text-sm" placeholder="Search owners..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <button className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1"><Download size={14} /> Export CSV</button>
              </div>
              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-text-secondary text-xs text-left border-b" style={{ borderColor: "var(--bg-border)" }}>
                    <th className="p-4 font-medium">Owner</th><th className="p-4 font-medium">Chargers</th><th className="p-4 font-medium">Sessions</th><th className="p-4 font-medium">Rating</th><th className="p-4 font-medium">Total Earned</th><th className="p-4 font-medium">Pending</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Action</th>
                  </tr></thead>
                  <tbody>
                    {filteredOwners.map((o, i) => (
                      <tr key={o.name} className="border-b hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ borderColor: "rgba(26,47,74,0.3)", animation: `slide-up 0.3s var(--spring) ${i * 0.03}s both` }}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>{o.name.charAt(0)}</div>
                            <span className="text-text-primary font-medium">{o.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono">{o.chargers}</td>
                        <td className="p-4 font-mono">{o.sessions}</td>
                        <td className="p-4 font-mono text-ev-warning">★{o.rating}</td>
                        <td className="p-4 font-mono text-ev-primary font-bold">₹{o.earnings.toLocaleString()}</td>
                        <td className="p-4 font-mono text-ev-warning">₹{o.pending.toLocaleString()}</td>
                        <td className="p-4"><span className="pill text-[10px]" style={o.status === "active" ? { background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" } : { background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>{o.status}</span></td>
                        <td className="p-4"><button className="pill pill-primary text-[10px] cursor-pointer flex items-center gap-1">Pay ₹{o.pending.toLocaleString()} <ChevronRight size={10} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "payouts" && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="glass rounded-xl p-5 text-center">
                  <p className="text-text-secondary text-xs">Total Paid Out</p>
                  <p className="font-mono font-bold text-3xl text-ev-primary mt-1">₹{(totalRevenue - pendingPayouts).toLocaleString()}</p>
                </div>
                <div className="glass rounded-xl p-5 text-center">
                  <p className="text-text-secondary text-xs">Pending This Cycle</p>
                  <p className="font-mono font-bold text-3xl text-ev-warning mt-1">₹{pendingPayouts.toLocaleString()}</p>
                </div>
                <div className="glass rounded-xl p-5 text-center">
                  <p className="text-text-secondary text-xs">Next Payout Date</p>
                  <p className="font-mono font-bold text-xl text-text-primary mt-2">May 31, 2025</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-white">Payout History</h3>
                <button className="btn-primary text-xs py-2 px-4 flex items-center gap-1"><CreditCard size={14} /> Process All Pending</button>
              </div>

              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-text-secondary text-xs text-left border-b" style={{ borderColor: "var(--bg-border)" }}>
                    <th className="p-4 font-medium">Owner</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Method</th><th className="p-4 font-medium">Status</th>
                  </tr></thead>
                  <tbody>
                    {RECENT_PAYOUTS.map((p, i) => (
                      <tr key={i} className="border-b hover:bg-[rgba(255,255,255,0.02)] transition-colors" style={{ borderColor: "rgba(26,47,74,0.3)" }}>
                        <td className="p-4 text-text-primary font-medium">{p.owner}</td>
                        <td className="p-4 font-mono text-ev-primary font-bold">₹{p.amount.toLocaleString()}</td>
                        <td className="p-4 font-mono text-text-secondary text-xs">{p.date}</td>
                        <td className="p-4 text-text-secondary text-xs">{p.method}</td>
                        <td className="p-4"><span className="pill text-[10px]" style={p.status === "completed" ? { background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" } : { background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
