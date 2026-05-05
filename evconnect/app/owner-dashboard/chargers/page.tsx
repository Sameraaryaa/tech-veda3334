"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers, updateChargerStatus } from "@/lib/firebase";
import { Charger } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, ToggleRight, ToggleLeft, Pencil, Trash2, Smartphone, Zap } from "lucide-react";

export default function OwnerChargersPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [chargers, setChargers] = useState<Charger[]>([]);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  useEffect(() => {
    const unsub = listenToAllChargers((all) => setChargers(all));
    return () => unsub();
  }, []);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><div className="w-12 h-12 rounded-full" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", animation: "pulse-glow 2s infinite" }}><Zap size={24} className="m-3" fill="#050A14" /></div></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Chargers" />
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-display font-bold text-xl text-white">Manage Your Chargers</h2>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2" onClick={() => router.push("/list-charger")}><Plus size={16} /> Add New Charger</button>
          </div>
          {chargers.length === 0 && <div className="glass rounded-xl p-12 text-center"><p className="text-text-secondary">No chargers found. Seed chargers from the map page first.</p></div>}
          {chargers.map(c => <ChargerRow key={c.id} charger={c} />)}
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
    try { await updateChargerStatus(charger.id, newStatus); } catch (e) { console.error(e); setStatus(charger.status); }
  };
  return (
    <div className="glass rounded-xl p-5 flex items-center gap-6">
      <div className="flex-1">
        <h3 className="font-display font-bold text-text-primary">{charger.ownerName}&apos;s Charger</h3>
        <p className="text-text-secondary text-xs mt-0.5">{charger.location.address}, {charger.location.city}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="pill pill-secondary text-[10px]">{charger.connectorType}</span>
          <span className="font-mono text-xs text-text-secondary">{charger.powerKW} kW</span>
          <span className="font-mono text-xs text-ev-primary">₹{charger.pricePerUnit}/kWh</span>
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)" }}>
          <Smartphone size={12} className="text-ev-primary" /> NFC Linked
        </div>
        <button onClick={handleToggle} className="cursor-pointer">
          {isAvail ? <ToggleRight size={32} className="text-ev-primary" /> : <ToggleLeft size={32} className="text-text-secondary" />}
        </button>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer"><Pencil size={14} className="text-text-secondary" /></button>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer"><Trash2 size={14} className="text-ev-danger" /></button>
      </div>
    </div>
  );
}
