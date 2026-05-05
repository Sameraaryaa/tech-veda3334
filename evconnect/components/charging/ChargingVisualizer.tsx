"use client";

import React, { useState, useEffect } from "react";
import { Zap, Square, Plug } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   ChargingVisualizer — Live charging session screen
   Cinematic battery fill with real-time stats
   ═══════════════════════════════════════════════════════════ */

interface ChargingVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  chargerName?: string;
  powerKW?: number;
  pricePerUnit?: number;
}

export default function ChargingVisualizer({ isOpen, onClose, chargerName = "Rajesh Kumar", powerKW = 7.2, pricePerUnit = 7.5 }: ChargingVisualizerProps) {
  const [chargePercent, setChargePercent] = useState(35);
  const [energyDelivered, setEnergyDelivered] = useState(0);
  const [costSoFar, setCostSoFar] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isOpen || chargePercent >= 100) return;
    const interval = setInterval(() => {
      setChargePercent(p => { const next = Math.min(p + 1, 100); return next; });
      setEnergyDelivered(e => Math.round((e + 0.405) * 10) / 10);
      setCostSoFar(c => Math.round((c + 0.405 * pricePerUnit) * 10) / 10);
      setElapsedSeconds(s => s + 8);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen, chargePercent, pricePerUnit]);

  if (!isOpen) return null;

  const remainMinutes = Math.max(0, Math.round(((100 - chargePercent) / 100) * 40.5 / powerKW * 60));
  const fillColor = chargePercent > 80 ? "#00FF88" : chargePercent > 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: "rgba(5,10,20,0.95)" }}>
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: "3px", height: "3px", background: "#00FF88", opacity: 0,
            left: `${40 + Math.random() * 20}%`, bottom: "20%",
            animation: `fp ${4 + Math.random() * 6}s linear ${Math.random() * 4}s infinite`,
          }} />
        ))}
        <style jsx>{`@keyframes fp { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.1; } 100% { transform: translateY(-60vh); opacity: 0; } }`}</style>
      </div>

      <div className="relative z-10 text-center max-w-md w-full px-4">
        {/* Charger name */}
        <p className="text-text-secondary text-sm mb-2 flex items-center justify-center gap-2">
          <Plug size={14} className="text-ev-primary" /> {chargerName}&apos;s Charger • {powerKW} kW
        </p>

        {/* Battery */}
        <div className="relative w-[180px] h-[300px] mx-auto mb-8">
          {/* Outer */}
          <div className="absolute inset-0 rounded-2xl" style={{ border: `3px solid ${fillColor}`, boxShadow: `0 0 30px ${fillColor}40` }}>
            {/* Fill */}
            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl overflow-hidden transition-all duration-[8000ms] ease-linear" style={{ height: `${chargePercent}%`, background: `linear-gradient(0deg, ${fillColor}CC, ${fillColor})` }}>
              {/* Shimmer lines */}
              <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, transparent, rgba(255,255,255,0.1) 2px, transparent 4px)", animation: "shimmer-up 2s linear infinite" }} />
            </div>

            {/* Center percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <p className="font-mono font-bold text-4xl" style={{ color: fillColor, textShadow: `0 0 20px ${fillColor}80` }}>{chargePercent}%</p>
                <Zap size={20} className="mx-auto mt-1" style={{ color: fillColor }} />
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 rounded-t-md" style={{ background: fillColor }} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass p-4 rounded-xl text-center">
            <p className="font-mono text-2xl font-bold text-ev-primary">{energyDelivered}</p>
            <p className="text-text-secondary text-xs mt-1">kWh Delivered</p>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <p className="font-mono text-2xl font-bold text-ev-primary glow-text-green">₹{costSoFar}</p>
            <p className="text-text-secondary text-xs mt-1">Cost So Far</p>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <p className="font-mono text-2xl font-bold text-ev-secondary">{powerKW} kW</p>
            <p className="text-text-secondary text-xs mt-1">Power Input</p>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <p className="font-mono text-2xl font-bold text-text-primary">{Math.floor(remainMinutes / 60)}h {remainMinutes % 60}m</p>
            <p className="text-text-secondary text-xs mt-1">Remaining</p>
          </div>
        </div>

        {/* Power gauge */}
        <div className="glass p-3 rounded-xl mb-6">
          <div className="flex justify-between text-xs text-text-secondary mb-1">
            <span>Charging Speed</span>
            <span className="font-mono">{powerKW} / 50 kW</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "var(--bg-border)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(powerKW / 50) * 100}%`, background: "linear-gradient(90deg, #00FF88, #0EA5E9)" }} />
          </div>
        </div>

        {/* Stop */}
        <button className="glass px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:border-ev-danger" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }} onClick={onClose}>
          <Square size={14} /> Stop Session
        </button>
      </div>
    </div>
  );
}
