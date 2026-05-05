"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Zap, Square, Star, MessageCircle, Plug } from "lucide-react";

// Deterministic pseudo-random values to avoid hydration mismatch
const ELEC_LINES = [
  { bottom: 8, speed: 9, delay: 0.5 },
  { bottom: 17, speed: 14, delay: 2.1 },
  { bottom: 25, speed: 11, delay: 3.8 },
  { bottom: 33, speed: 18, delay: 1.3 },
  { bottom: 42, speed: 10, delay: 4.2 },
  { bottom: 50, speed: 16, delay: 0.9 },
  { bottom: 58, speed: 12, delay: 3.1 },
  { bottom: 67, speed: 19, delay: 2.7 },
  { bottom: 75, speed: 13, delay: 1.8 },
  { bottom: 83, speed: 15, delay: 4.6 },
  { bottom: 91, speed: 8, delay: 0.3 },
  { bottom: 96, speed: 17, delay: 3.5 },
];

export default function ChargingSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [chargePercent, setChargePercent] = useState(35);
  const [energyKwh, setEnergyKwh] = useState(0);
  const [costSoFar, setCostSoFar] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rating, setRating] = useState(0);

  const pricePerUnit = 7.5;
  const powerKW = 7.2;
  const batteryKwh = 40.5;
  const remainMin = Math.max(0, Math.round(((100 - chargePercent) / 100) * batteryKwh / powerKW * 60));
  const fillColor = chargePercent > 80 ? "#00FF88" : chargePercent > 40 ? "#F59E0B" : "#EF4444";

  useEffect(() => {
    if (completed || chargePercent >= 100) return;
    const interval = setInterval(() => {
      setChargePercent(p => Math.min(p + 1, 100));
      setEnergyKwh(e => Math.round((e + batteryKwh / 100) * 10) / 10);
      setCostSoFar(c => Math.round((c + (batteryKwh / 100) * pricePerUnit) * 10) / 10);
      setElapsedSec(s => s + 8);
    }, 8000);
    return () => clearInterval(interval);
  }, [completed, chargePercent]);

  const handleStop = () => {
    setCompleted(true);
    setShowConfirm(false);
  };

  if (completed) {
    const co2 = Math.round(energyKwh * 0.82 * 10) / 10;
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center max-w-md w-full" style={{ animation: "slide-up 0.5s var(--spring)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(0,255,136,0.15)", boxShadow: "0 0 60px rgba(0,255,136,0.3)" }}>
            <Zap size={40} className="text-ev-primary" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-ev-primary mb-2 glow-text-green">Charging Complete! ✓</h1>
          <p className="text-text-secondary text-sm mb-8">Session #{sessionId}</p>

          <div className="glass rounded-2xl p-6 mb-6 text-left space-y-3">
            <div className="flex justify-between"><span className="text-text-secondary">Total Energy</span><span className="font-mono font-bold">{energyKwh} kWh</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Total Cost</span><span className="font-mono font-bold text-ev-primary text-xl">₹{costSoFar}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Duration</span><span className="font-mono">{Math.floor(elapsedSec / 3600)}h {Math.floor((elapsedSec % 3600) / 60)}m</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Charged</span><span className="font-mono">35% → {chargePercent}%</span></div>
          </div>

          <div className="glass rounded-xl p-4 mb-6 text-center">
            <p className="text-ev-primary text-sm">🌱 Saved {co2} kg CO₂ vs petrol</p>
          </div>

          <div className="mb-6">
            <p className="text-text-secondary text-sm mb-2">Rate this session</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="cursor-pointer"><Star size={28} className={rating >= s ? "text-ev-warning fill-ev-warning" : "text-text-secondary"} /></button>
              ))}
            </div>
          </div>

          <Link href="/user-dashboard" className="no-underline"><button className="btn-primary w-full py-3">Back to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Electricity lines — deterministic to avoid hydration mismatch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {ELEC_LINES.map((line, i) => (
          <div key={i} className="absolute w-full" style={{
            height: "1px", background: "rgba(0,255,136,0.08)", left: 0,
            bottom: `${line.bottom}%`,
            animation: `elec-line ${line.speed}s linear ${line.delay}s infinite`,
          }} />
        ))}
      </div>

      {/* Green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${fillColor}15, transparent 70%)` }} />

      <div className="relative z-10 text-center max-w-lg w-full px-4">
        <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2"><Plug size={14} className="text-ev-primary" /> Rajesh Kumar&apos;s Charger • {powerKW} kW</p>

        {/* Battery */}
        <div className="relative w-[200px] h-[360px] mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl" style={{ border: `3px solid ${fillColor}`, boxShadow: `0 0 40px ${fillColor}30` }}>
            <div className="absolute bottom-0 left-0 right-0 rounded-b-[14px] overflow-hidden transition-all duration-[8000ms] ease-linear" style={{ height: `${chargePercent}%`, background: `linear-gradient(0deg, ${fillColor}CC, ${fillColor})` }}>
              <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, rgba(255,255,255,0.08) 2px, transparent 4px)", animation: "shimmer-up 2s linear infinite" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div><p className="font-mono font-bold text-5xl" style={{ color: "white", textShadow: `0 0 30px ${fillColor}80` }}>{chargePercent}%</p><Zap size={24} className="mx-auto mt-2" style={{ color: fillColor, animation: "pulse-glow 1s infinite" }} /></div>
            </div>
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 rounded-t-lg" style={{ background: fillColor }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { val: `${chargePercent}%`, label: "Charged" },
            { val: `${energyKwh}`, label: "kWh" },
            { val: `₹${costSoFar}`, label: "Cost", glow: true },
            { val: `${Math.floor(remainMin / 60)}h ${remainMin % 60}m`, label: "Left" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-xl p-3 text-center">
              <p className={`font-mono text-lg font-bold ${s.glow ? "text-ev-primary glow-text-green" : "text-text-primary"}`}>{s.val}</p>
              <p className="text-text-secondary text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Power gauge */}
        <div className="glass rounded-xl p-3 mb-6">
          <div className="flex justify-between text-xs text-text-secondary mb-1"><span>Charging at {powerKW} kW</span><span className="font-mono">{powerKW}/50 kW</span></div>
          <div className="h-2 rounded-full" style={{ background: "var(--bg-border)" }}><div className="h-full rounded-full" style={{ width: `${(powerKW / 50) * 100}%`, background: "linear-gradient(90deg, #00FF88, #0EA5E9)" }} /></div>
        </div>

        {/* Charger info */}
        <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>R</div>
            <div className="text-left">
              <p className="text-text-primary text-sm font-medium">Rajesh Kumar</p>
              <p className="text-text-secondary text-xs">7.2 kW Type 2 • Koramangala</p>
            </div>
          </div>
          <a href="https://wa.me/919876543210?text=Hi%20from%20EVConnect" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center no-underline" style={{ background: "rgba(37,211,102,0.15)" }}><MessageCircle size={16} style={{ color: "#25D366" }} /></a>
        </div>

        {/* Stop */}
        {!showConfirm ? (
          <button className="glass px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:border-ev-danger" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }} onClick={() => setShowConfirm(true)}>
            <Square size={14} /> Stop Charging Session
          </button>
        ) : (
          <div className="glass rounded-xl p-4">
            <p className="text-text-primary text-sm mb-3">Are you sure? Current charge: {chargePercent}%</p>
            <div className="flex gap-3 justify-center">
              <button className="px-6 py-2 rounded-lg text-sm font-bold" style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.4)" }} onClick={handleStop}>Stop Session</button>
              <button className="px-6 py-2 rounded-lg text-sm font-bold" style={{ background: "rgba(0,255,136,0.2)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" }} onClick={() => setShowConfirm(false)}>Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
