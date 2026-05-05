"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { MOCK_CHARGERS } from "@/lib/data/mockChargers";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, ToggleRight, ToggleLeft, Pencil, Trash2, Smartphone } from "lucide-react";

export default function OwnerChargersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Chargers" userName="Arya" />
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-display font-bold text-xl text-white">Manage Your Chargers</h2>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2"><Plus size={16} /> Add New Charger</button>
          </div>
          {MOCK_CHARGERS.slice(0, 4).map(c => <ChargerRow key={c.id} charger={c} />)}
        </main>
      </div>
    </div>
  );
}

function ChargerRow({ charger }: { charger: typeof MOCK_CHARGERS[0] }) {
  const [status, setStatus] = useState(charger.status);
  const isAvail = status === "available";
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
        <button onClick={() => setStatus(isAvail ? "offline" : "available")} className="cursor-pointer">
          {isAvail ? <ToggleRight size={32} className="text-ev-primary" /> : <ToggleLeft size={32} className="text-text-secondary" />}
        </button>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer"><Pencil size={14} className="text-text-secondary" /></button>
        <button className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer"><Trash2 size={14} className="text-ev-danger" /></button>
      </div>
    </div>
  );
}
