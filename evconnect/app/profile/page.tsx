"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import NFCScanModal from "@/components/nfc/NFCScanModal";
import { EV_MODELS } from "@/lib/data/mockChargers";
import { Battery, Zap, MapPin, Calendar, Settings, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const [selectedEV, setSelectedEV] = useState(EV_MODELS[0]);
  const [nfcOpen, setNfcOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activePath="/profile" onNFCClick={() => setNfcOpen(true)} />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Profile Header */}
        <div className="glass rounded-3xl p-8 text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-display font-extrabold text-3xl" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>
            A
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Arya</h1>
          <p className="text-text-secondary text-sm mt-1">EV Enthusiast • Bangalore</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="pill pill-primary text-xs">⚡ Active</span>
            <span className="pill pill-secondary text-xs">🔋 {selectedEV.name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Zap, value: "12", label: "Sessions", color: "#00FF88" },
            { icon: MapPin, value: "342 km", label: "Driven", color: "#0EA5E9" },
            { icon: Calendar, value: "₹1,240", label: "Spent", color: "#F59E0B" },
          ].map(s => (
            <div key={s.label} className="glass p-4 text-center rounded-xl">
              <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
              <p className="font-mono font-bold text-xl text-text-primary">{s.value}</p>
              <p className="text-text-secondary text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* EV Model */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2"><Battery size={18} className="text-ev-primary" /> Your EV</h2>
          <select className="input-glass w-full mb-4" value={selectedEV.name} onChange={e => { const m = EV_MODELS.find(x => x.name === e.target.value); if (m) setSelectedEV(m); }}>
            {EV_MODELS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass rounded-xl p-3 text-center">
              <p className="font-mono text-lg text-ev-primary">{selectedEV.batteryCapacityKwh}</p>
              <p className="text-text-secondary text-[10px]">kWh</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="font-mono text-lg text-ev-secondary">{selectedEV.fullRangeKm}</p>
              <p className="text-text-secondary text-[10px]">km Range</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="font-mono text-lg text-text-primary">{selectedEV.connectorType}</p>
              <p className="text-text-secondary text-[10px]">Connector</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "var(--bg-border)" }}>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2"><Settings size={18} className="text-text-secondary" /> Settings</h2>
          </div>
          {[
            { label: "Push Notifications", desc: "Get alerts for bookings", defaultOn: true },
            { label: "Dark Mode", desc: "Always dark", defaultOn: true },
            { label: "Location Access", desc: "Find nearby chargers", defaultOn: false },
          ].map(s => (
            <SettingRow key={s.label} {...s} />
          ))}
        </div>
      </div>

      <NFCScanModal isOpen={nfcOpen} onClose={() => setNfcOpen(false)} onChargerDetected={() => setNfcOpen(false)} />
    </div>
  );
}

function SettingRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: "rgba(26,47,74,0.3)" }}>
      <div>
        <p className="text-text-primary text-sm font-medium">{label}</p>
        <p className="text-text-secondary text-xs">{desc}</p>
      </div>
      <button className="relative w-12 h-7 rounded-full transition-colors" style={{ background: on ? "#00FF88" : "var(--bg-border)" }} onClick={() => setOn(!on)}>
        <div className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(22px)" : "translateX(4px)" }} />
      </button>
    </div>
  );
}
