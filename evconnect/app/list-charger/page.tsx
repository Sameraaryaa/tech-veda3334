"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import ChargerCard from "@/components/charger/ChargerCard";
import { ArrowLeft, Zap, Clock, Check, ChevronRight, PartyPopper } from "lucide-react";
import { ConnectorType } from "@/lib/types";
import { getPricingBand, estimateMonthlyEarnings } from "@/lib/algorithms/pricing";
import { CITY_STATE_MAP } from "@/lib/data/statePricing";

const CONNECTORS: { type: ConnectorType; icon: string; models: string; speed: string; speedColor: string; defaultKW: number }[] = [
  { type: "Type 2", icon: "🔌", models: "Nexon EV, Ather, Ola", speed: "Standard AC", speedColor: "#0EA5E9", defaultKW: 7.2 },
  { type: "CCS2", icon: "⚡", models: "Nexon EV, MG ZS, Kona", speed: "DC Fast", speedColor: "#00FF88", defaultKW: 50 },
  { type: "CHAdeMO", icon: "🔋", models: "Leaf, Outlander PHEV", speed: "DC Fast", speedColor: "#F59E0B", defaultKW: 50 },
  { type: "15A Socket", icon: "🏠", models: "Any with adapter", speed: "Slow", speedColor: "#8BA0B4", defaultKW: 3.3 },
];

const AMENITIES = [
  { id: "parking", emoji: "🅿️", label: "Free Parking" },
  { id: "wifi", emoji: "📶", label: "WiFi" },
  { id: "covered", emoji: "☂️", label: "Covered" },
  { id: "restroom", emoji: "🚿", label: "Restroom" },
  { id: "water", emoji: "💧", label: "Water" },
  { id: "cctv", emoji: "🔒", label: "CCTV" },
];

const CITIES = ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Other"];

export default function ListChargerPage() {
  const [step, setStep] = useState(1);
  const [connector, setConnector] = useState<ConnectorType>("Type 2");
  const [powerKW, setPowerKW] = useState(7.2);
  const [availFrom, setAvailFrom] = useState("08:00");
  const [availTo, setAvailTo] = useState("22:00");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [pricePerUnit, setPricePerUnit] = useState(7.5);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPublished, setIsPublished] = useState(false);

  const state = CITY_STATE_MAP[city] || "default";
  const pricingBand = useMemo(() => getPricingBand(state), [state]);
  const monthlyEarnings = useMemo(() => estimateMonthlyEarnings(pricePerUnit, powerKW, 4), [pricePerUnit, powerKW]);
  const yearlyEarnings = monthlyEarnings * 12;
  const chargeTime = Math.round(40.5 / powerKW * 10) / 10;

  const toggleAmenity = (id: string) => setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activePath="/list-charger" />
      <div className="flex-1 max-w-[640px] mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/map" className="inline-flex items-center gap-1 text-text-secondary text-sm mb-4 hover:text-ev-primary no-underline transition-colors"><ArrowLeft size={16} /> Back to Map</Link>
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">List Your Charger</h1>
          <p className="text-text-secondary mt-2">Earn <span className="font-mono text-ev-primary font-bold glow-text-green">₹500–₹3,000</span>/month from your home charger</p>
        </div>

        {/* Step indicator */}
        {!isPublished && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {[{ n: 1, l: "Charger Details" }, { n: 2, l: "Location & Pricing" }, { n: 3, l: "Go Live" }].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono transition-all" style={{
                      background: step >= s.n ? "linear-gradient(135deg, #00FF88, #00CC6A)" : "var(--bg-border)",
                      color: step >= s.n ? "#050A14" : "var(--text-secondary)",
                      boxShadow: step === s.n ? "0 0 20px rgba(0,255,136,0.4)" : "none",
                    }}>{step > s.n ? <Check size={14} /> : s.n}</div>
                    <span className={`text-xs hidden sm:block ${step >= s.n ? "text-text-primary" : "text-text-secondary"}`}>{s.l}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px mx-2" style={{ background: "var(--bg-border)" }} />}
                </React.Fragment>
              ))}
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-border)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: progressWidth, background: "linear-gradient(90deg, #00FF88, #0EA5E9)" }} />
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-white mb-3">What type of charger do you have?</h3>
              <div className="grid grid-cols-2 gap-3">
                {CONNECTORS.map(c => (
                  <button key={c.type} className={`glass p-5 text-left transition-all ${connector === c.type ? "glass-active" : "glass-hover"}`} style={connector === c.type ? { transform: "scale(1.02)" } : {}} onClick={() => { setConnector(c.type); setPowerKW(c.defaultKW); }}>
                    <span className="text-2xl">{c.icon}</span>
                    <p className="font-display font-bold text-sm text-white mt-2">{c.type}</p>
                    <p className="text-text-secondary text-[10px] mt-1">{c.models}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono" style={{ background: `${c.speedColor}18`, color: c.speedColor }}>{c.speed}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">Charging Speed</span>
                <span className="font-mono text-2xl text-ev-primary glow-text-green">{powerKW} kW</span>
              </div>
              <input type="range" min={3.3} max={50} step={0.1} value={powerKW} onChange={e => setPowerKW(Number(e.target.value))} className="w-full h-[6px] rounded-full" style={{ background: `linear-gradient(to right, #00FF88 ${((powerKW - 3.3) / 46.7) * 100}%, #1A2F4A ${((powerKW - 3.3) / 46.7) * 100}%)` }} />
              <p className="text-text-secondary text-xs mt-2 text-center">≈ {chargeTime} hours to fully charge a Nexon EV</p>
            </div>

            <div>
              <h3 className="text-text-secondary text-sm mb-2 flex items-center gap-1"><Clock size={14} /> Your Availability</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-text-secondary text-[10px] mb-1 block">From</label><input type="time" className="input-glass text-sm" value={availFrom} onChange={e => setAvailFrom(e.target.value)} /></div>
                <div><label className="text-text-secondary text-[10px] mb-1 block">To</label><input type="time" className="input-glass text-sm" value={availTo} onChange={e => setAvailTo(e.target.value)} /></div>
              </div>
            </div>

            <div>
              <h3 className="text-text-secondary text-sm mb-2">What do you offer?</h3>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <button key={a.id} className="pill cursor-pointer text-sm py-2 px-3 transition-all" style={{
                    background: amenities.includes(a.id) ? "rgba(0,255,136,0.12)" : "transparent",
                    color: amenities.includes(a.id) ? "#00FF88" : "var(--text-secondary)",
                    border: amenities.includes(a.id) ? "1px solid rgba(0,255,136,0.4)" : "1px solid var(--bg-border)",
                  }} onClick={() => toggleAmenity(a.id)}>{a.emoji} {a.label}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full py-3 flex items-center justify-center gap-2" onClick={() => setStep(2)}>Next: Location & Pricing <ChevronRight size={16} /></button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-white mb-3">Your charger location</h3>
              <div className="space-y-3">
                <input className="input-glass" placeholder="Full address (e.g. 12th Main, Koramangala)" value={address} onChange={e => setAddress(e.target.value)} />
                <select className="input-glass" value={city} onChange={e => setCity(e.target.value)}>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <div className="glass rounded-xl p-3 text-xs text-text-secondary" style={{ animation: "slide-up 0.3s var(--spring)" }}>
                  Detected: <span className="text-white font-medium">{state}</span> — <span className="text-ev-primary">{pricingBand.board}</span>
                  <br />Reference tariff: <span className="font-mono text-ev-primary">₹{pricingBand.floor}/kWh</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-white mb-1">Set your price</h3>
              <p className="text-text-secondary text-xs mb-4">{pricingBand.board} {state} avg: <span className="font-mono text-ev-primary">₹{pricingBand.floor}/kWh</span></p>

              <div className="flex justify-between items-center mb-2">
                <span className="text-text-secondary text-sm">Price per kWh</span>
                <span className="font-mono text-3xl text-ev-primary font-bold glow-text-green">₹{pricePerUnit.toFixed(1)}</span>
              </div>
              <input type="range" min={pricingBand.floor} max={pricingBand.ceiling} step={0.5} value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} className="w-full h-[6px] rounded-full" style={{ background: `linear-gradient(to right, #00FF88 ${((pricePerUnit - pricingBand.floor) / (pricingBand.ceiling - pricingBand.floor)) * 100}%, #1A2F4A ${((pricePerUnit - pricingBand.floor) / (pricingBand.ceiling - pricingBand.floor)) * 100}%)` }} />
              <div className="flex justify-between mt-1 text-text-secondary text-[10px] font-mono"><span>₹{pricingBand.floor}</span><span>⭐ ₹{pricingBand.suggested}</span><span>₹{pricingBand.ceiling}</span></div>

              {pricePerUnit === pricingBand.suggested && <div className="mt-3 pill pill-primary text-xs">✓ Best for bookings</div>}

              <div className="mt-4 glass glass-active rounded-xl p-5 text-center">
                <p className="text-text-secondary text-xs mb-1">At ₹{pricePerUnit.toFixed(1)}/kWh — 4 hrs/day average:</p>
                <p className="font-mono font-bold text-3xl text-ev-primary glow-text-green" key={monthlyEarnings} style={{ animation: "number-tick 0.3s var(--spring)" }}>₹{monthlyEarnings.toLocaleString()}/mo</p>
                <p className="text-text-secondary text-xs mt-1">That&apos;s <span className="text-ev-primary font-mono">₹{yearlyEarnings.toLocaleString()}</span>/year</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost flex-1 py-3" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary flex-1 py-3 flex items-center justify-center gap-2" onClick={() => setStep(3)}>Next: Preview <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && !isPublished && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-white">Here&apos;s how your charger looks to users</h3>
            <ChargerCard charger={{ id: "preview", ownerId: "preview", ownerName: "You", ownerPhone: "+91-XXXXXXXXXX", location: { lat: 0, lng: 0, address: address || "Your address", city, state }, connectorType: connector, powerKW, pricePerUnit, currency: "INR", status: isAvailable ? "available" : "offline", availableFrom: availFrom, availableTo: availTo, rating: 5.0, totalSessions: 0, amenities, images: [], createdAt: Date.now() }} />

            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <span className="text-text-primary text-sm font-medium">Available Now</span>
              <button className="relative w-14 h-8 rounded-full transition-colors" style={{ background: isAvailable ? "#00FF88" : "var(--bg-border)", boxShadow: isAvailable ? "0 0 20px rgba(0,255,136,0.3)" : "none" }} onClick={() => setIsAvailable(!isAvailable)}>
                <div className="absolute top-1.5 w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: isAvailable ? "translateX(28px)" : "translateX(4px)" }} />
              </button>
            </div>

            <div className="flex gap-3">
              <button className="btn-ghost flex-1 py-3" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary flex-1 py-4 text-base flex items-center justify-center gap-2" onClick={() => setIsPublished(true)}><Zap size={18} /> Publish My Charger ⚡</button>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {isPublished && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,255,136,0.15)", boxShadow: "0 0 60px rgba(0,255,136,0.3)", animation: "slide-up 0.5s var(--spring)" }}>
              <PartyPopper size={40} className="text-ev-primary" />
            </div>
            <h2 className="font-display font-extrabold text-3xl text-ev-primary mb-3 glow-text-green">You&apos;re Live! 🎉</h2>
            <p className="text-text-secondary max-w-sm mx-auto mb-8">Users can now find your charger on the map. You&apos;ll earn every time someone books.</p>
            <Link href="/map" className="no-underline"><button className="btn-primary px-8 py-3 text-base">See It on the Map →</button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
