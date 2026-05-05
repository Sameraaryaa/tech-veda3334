"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { EV_MODELS } from "@/lib/data/mockChargers";
import { Plus, Check, Trash2, Car, Battery, Route, Plug } from "lucide-react";

export default function UserVehiclesPage() {
  const [vehicles, setVehicles] = useState([EV_MODELS[0]]);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Vehicles" userName="Arya" />
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-bold text-xl text-white">Your Electric Vehicles</h2>
            <button className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Vehicle</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v, i) => (
              <div key={i} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,255,136,0.1)" }}><Car size={24} className="text-ev-primary" /></div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-text-primary">{v.name}</h3>
                      {i === 0 && <span className="pill pill-primary text-[9px]"><Check size={8} className="inline mr-0.5" /> Primary</span>}
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg glass flex items-center justify-center cursor-pointer"><Trash2 size={14} className="text-ev-danger" /></button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><Battery size={16} className="mx-auto mb-1 text-ev-primary" /><p className="font-mono text-lg text-text-primary">{v.batteryCapacityKwh}</p><p className="text-text-secondary text-[10px]">kWh</p></div>
                  <div className="glass rounded-xl p-3 text-center"><Route size={16} className="mx-auto mb-1 text-ev-secondary" /><p className="font-mono text-lg text-text-primary">{v.fullRangeKm}</p><p className="text-text-secondary text-[10px]">km Range</p></div>
                  <div className="glass rounded-xl p-3 text-center"><Plug size={16} className="mx-auto mb-1 text-ev-warning" /><p className="font-mono text-lg text-text-primary">{v.connectorType}</p><p className="text-text-secondary text-[10px]">Connector</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Modal */}
          {showAdd && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">Add a Vehicle</h3>
              <select className="input-glass mb-4" onChange={e => { const m = EV_MODELS.find(x => x.name === e.target.value); if (m) { setVehicles([...vehicles, m]); setShowAdd(false); } }}>
                <option value="">Select your EV model...</option>
                {EV_MODELS.filter(m => !vehicles.find(v => v.name === m.name)).map(m => <option key={m.name} value={m.name}>{m.name} ({m.batteryCapacityKwh}kWh, {m.fullRangeKm}km)</option>)}
              </select>
              <button className="btn-ghost text-sm py-2 px-4" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
