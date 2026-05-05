"use client";

import React, { useState, useMemo } from "react";
import { Charger } from "@/lib/types";
import { calculateChargingCost, formatChargingTime } from "@/lib/algorithms/battery";
import StatusBadge from "@/components/ui/StatusBadge";
import { Star, Zap, Copy, MessageCircle, Check, X, Phone } from "lucide-react";

interface BookingModalProps {
  charger: Charger;
  isOpen: boolean;
  onClose: () => void;
  currentBatteryPercent?: number;
}

type BookingStep = "details" | "loading" | "success";

export default function BookingModal({ charger, isOpen, onClose, currentBatteryPercent = 50 }: BookingModalProps) {
  const [targetPercent, setTargetPercent] = useState(80);
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule">("now");
  const [scheduleTime, setScheduleTime] = useState("14:00");
  const [step, setStep] = useState<BookingStep>("details");
  const [copied, setCopied] = useState(false);

  const costResult = useMemo(() => {
    const cap = 40.5;
    const pct = Math.max(targetPercent - currentBatteryPercent, 0);
    const kwh = (pct / 100) * cap;
    return { ...calculateChargingCost(kwh, charger.pricePerUnit, charger.powerKW), energyKwh: Math.round(kwh * 10) / 10 };
  }, [targetPercent, currentBatteryPercent, charger]);

  const handleConfirm = async () => {
    setStep("loading");
    await new Promise(r => setTimeout(r, 1500));
    setStep("success");
  };

  const handleCopy = () => { navigator.clipboard.writeText(charger.ownerPhone); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-end justify-center">
      <div className="absolute inset-0" style={{ background: "rgba(5,10,20,0.88)", backdropFilter: "blur(6px)" }} onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-t-3xl overflow-y-auto" style={{ background: "var(--bg-surface)", borderTop: "2px solid var(--color-primary)", maxHeight: "88vh", animation: "slide-up 0.35s var(--spring)" }}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} /></div>

        <button className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--bg-border)" }} onClick={onClose}><X size={14} className="text-text-secondary" /></button>

        {/* SUCCESS */}
        {step === "success" && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,255,136,0.15)", boxShadow: "0 0 60px rgba(0,255,136,0.3)", animation: "slide-up 0.4s var(--spring)" }}>
              <Check size={40} className="text-ev-primary" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-ev-primary mb-2">Booking Confirmed!</h2>
            <p className="text-text-secondary text-sm mb-1 font-mono text-[10px]">ID: #EVK{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            <p className="text-text-secondary text-sm mb-6">{charger.ownerName}&apos;s charger is reserved.</p>

            <div className="glass rounded-xl p-4 mb-4 text-left">
              <div className="flex justify-between mb-2"><span className="text-text-secondary text-sm">Energy</span><span className="font-mono text-sm">{costResult.energyKwh} kWh</span></div>
              <div className="flex justify-between mb-2"><span className="text-text-secondary text-sm">Time</span><span className="font-mono text-sm">{formatChargingTime(costResult.chargingTimeMinutes)}</span></div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--bg-border)" }}>
                <span className="font-medium">Total</span><span className="font-mono font-bold text-lg text-ev-primary glow-text-green">₹{costResult.totalCost}</span>
              </div>
            </div>

            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-text-secondary text-xs mb-2">Contact Owner</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Phone size={14} className="text-ev-primary" /><span className="font-mono text-sm">{charger.ownerPhone}</span></div>
                <button className="p-2 rounded-lg" style={{ background: "var(--bg-border)" }} onClick={handleCopy}>
                  {copied ? <Check size={14} className="text-ev-primary" /> : <Copy size={14} className="text-text-secondary" />}
                </button>
              </div>
            </div>

            <a href={`https://wa.me/${charger.ownerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I've booked your EV charger on EVConnect. Arriving soon!`)}`} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-3 flex items-center justify-center gap-2 no-underline" style={{ background: "#25D366" }}>
              <MessageCircle size={18} /> Open WhatsApp
            </a>
          </div>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <div className="p-12 text-center">
            <div className="w-full h-2 rounded-full overflow-hidden mb-6" style={{ background: "var(--bg-border)" }}>
              <div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00FF88, #0EA5E9, #00FF88)", backgroundSize: "200% 100%", animation: "charging-pulse 1.5s infinite" }} />
            </div>
            <p className="text-text-secondary text-sm">Processing...</p>
          </div>
        )}

        {/* DETAILS */}
        {step === "details" && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-lg" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>
                {charger.ownerName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-lg text-text-primary">{charger.ownerName}</h2>
                <p className="text-text-secondary text-xs truncate">{charger.location.address}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1"><Star size={12} className="text-ev-warning fill-ev-warning" /><span className="font-mono text-xs text-ev-warning">{charger.rating}</span></div>
                  <span className="pill pill-secondary text-[10px]">{charger.connectorType}</span>
                  <span className="font-mono text-xs text-text-secondary">{charger.powerKW} kW</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="glass rounded-xl p-3 mb-5 flex items-center gap-3"><StatusBadge status={charger.status} /><span className="text-text-secondary text-xs">{charger.status === "available" ? "Available Now" : `Currently ${charger.status}`}</span></div>

            {/* Cost Calculator */}
            <div className="mb-5">
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">Calculate Your Cost</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-secondary text-sm">Charge up to:</span>
                <span className="font-mono font-bold text-xl text-ev-primary glow-text-green">{targetPercent}%</span>
              </div>
              <input type="range" min={Math.max(currentBatteryPercent, 10)} max={100} value={targetPercent} onChange={e => setTargetPercent(Number(e.target.value))} className="w-full h-[6px] rounded-full mb-3" style={{ background: `linear-gradient(to right, #00FF88 ${((targetPercent - currentBatteryPercent) / (100 - currentBatteryPercent)) * 100}%, #1A2F4A ${((targetPercent - currentBatteryPercent) / (100 - currentBatteryPercent)) * 100}%)` }} />

              {/* Preset pills */}
              <div className="flex gap-2 mb-4">
                {[50, 80, 100].map(p => (
                  <button key={p} className={`pill cursor-pointer ${targetPercent === p ? "pill-primary" : ""}`} style={targetPercent !== p ? { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" } : undefined} onClick={() => setTargetPercent(p)}>{p}%</button>
                ))}
              </div>

              {/* 3 stat cards */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="glass p-3 text-center rounded-xl">
                  <p className="font-mono text-lg text-text-primary">{costResult.energyKwh}</p>
                  <p className="text-text-secondary text-[10px]">kWh</p>
                </div>
                <div className="glass p-3 text-center rounded-xl">
                  <p className="font-mono text-lg text-ev-secondary">{formatChargingTime(costResult.chargingTimeMinutes)}</p>
                  <p className="text-text-secondary text-[10px]">Time</p>
                </div>
                <div className="glass p-3 text-center rounded-xl" style={{ borderColor: "rgba(0,255,136,0.3)" }}>
                  <p className="font-mono text-2xl font-bold text-ev-primary glow-text-green" style={{ animation: "number-tick 0.3s var(--spring)" }} key={costResult.totalCost}>₹{costResult.totalCost}</p>
                  <p className="text-text-secondary text-[10px]">Cost</p>
                </div>
              </div>
              <p className="text-center font-mono text-[10px] text-text-secondary">{costResult.breakdown}</p>
            </div>

            {/* Time Slot */}
            <div className="mb-5">
              <p className="text-text-secondary text-sm mb-2">Start Charging</p>
              <div className="flex gap-2 mb-2">
                {(["now", "schedule"] as const).map(m => (
                  <button key={m} className={`pill flex-1 justify-center cursor-pointer py-2 ${scheduleMode === m ? "pill-primary" : ""}`} style={scheduleMode !== m ? { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" } : undefined} onClick={() => setScheduleMode(m)}>{m === "now" ? "Now" : "Schedule"}</button>
                ))}
              </div>
              {scheduleMode === "schedule" && <input type="time" className="input-glass text-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />}
              <p className="text-text-secondary text-[10px] mt-1">Available {charger.availableFrom} – {charger.availableTo}</p>
            </div>

            {/* Confirm */}
            <button className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2" onClick={handleConfirm} disabled={charger.status !== "available"} id="confirm-booking-btn">
              <Zap size={18} /> Confirm Booking — ₹{costResult.totalCost}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
