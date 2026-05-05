"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import NFCScanModal from "@/components/nfc/NFCScanModal";
import { Zap, MapPin, CheckCircle, ChevronRight, Wifi, Play } from "lucide-react";

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: 30 }).map((_, i) => {
        const size = 2 + Math.random() * 4;
        const isBlue = Math.random() > 0.6;
        return (
          <div key={i} style={{
            position: "absolute", bottom: "-10px", left: `${Math.random() * 100}%`,
            width: `${size}px`, height: `${size}px`, borderRadius: "50%",
            background: isBlue ? "#0EA5E9" : "#00FF88", opacity: 0,
            animation: `fp ${8 + Math.random() * 12}s linear ${Math.random() * 10}s infinite`,
          }} />
        );
      })}
      <style jsx>{`
        @keyframes fp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const STATS = [
  { value: "2,400+", label: "Chargers" },
  { value: "18", label: "Cities" },
  { value: "₹4.50", label: "avg/kWh" },
  { value: "4.8★", label: "Rating" },
];

const STEPS = [
  { num: "01", icon: MapPin, title: "Plan Your Route", desc: "Enter start, end, battery%. We calculate if you'll make it with weather-adjusted predictions.", gradient: "linear-gradient(135deg, #0EA5E9, #3B82F6)" },
  { num: "02", icon: Zap, title: "Find P2P Chargers", desc: "Live map shows available home chargers along your route. Real-time status from Firebase.", gradient: "linear-gradient(135deg, #00FF88, #00CC6A)" },
  { num: "03", icon: CheckCircle, title: "Book & Charge", desc: "One tap booking. Pay the owner directly at fair state rates. EVA guides you through it all.", gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)" },
];

const EV_NAMES = ["🚗 Tata Nexon EV","🛵 Ather 450X","🛵 Ola S1 Pro","🚗 MG ZS EV","🚗 Hyundai Kona","🚗 Kia EV6","🚗 BYD Atto 3","🏍️ Revolt RV400","🛵 Hero Vida V1","🛵 Bajaj Chetak"];
const CONNECTORS = ["Type 2 AC •","CCS2 DC Fast •","CHAdeMO •","15A Socket •","Type 2 AC •","CCS2 DC Fast •","CHAdeMO •","15A Socket •"];

export default function HomePage() {
  const [nfcOpen, setNfcOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activePath="/" onNFCClick={() => setNfcOpen(true)} />

      {/* HERO */}
      <section className="relative flex items-center justify-center min-h-[92vh] px-4 overflow-hidden">
        <ParticleField />
        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-sm" style={{ animation: "slide-up 0.6s var(--spring)" }}>
            <span className="text-ev-primary">#1</span>
            <span className="text-text-secondary">EV Platform India 🇮🇳</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-[84px] leading-[1.05] mb-6">
            <span className="text-white block" style={{ animation: "slide-up 0.5s var(--spring) 0.1s both" }}>Charge Anywhere.</span>
            <span className="text-gradient-primary block" style={{ animation: "slide-up 0.5s var(--spring) 0.2s both" }}>Pay Nothing Extra.</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-[500px] mx-auto mb-10 leading-relaxed" style={{ animation: "slide-up 0.5s var(--spring) 0.4s both" }}>
            India&apos;s first peer-to-peer EV charging network. Find home chargers near you, plan your route, and never run out of battery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animation: "slide-up 0.5s var(--spring) 0.6s both" }}>
            <Link href="/map" className="no-underline">
              <button className="btn-primary text-base px-8 py-4 flex items-center gap-2 min-w-[240px] justify-center" id="hero-cta-find">
                Find a Charger <ChevronRight size={18} />
              </button>
            </Link>
            <Link href="/list-charger" className="no-underline">
              <button className="btn-ghost text-base px-8 py-4 flex items-center gap-2 min-w-[240px] justify-center" id="hero-cta-list">
                <Zap size={18} /> List Your Charger
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }} />
      </section>

      {/* FLOATING STATS */}
      <section className="relative -mt-12 z-20 px-4 mb-8">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="glass glass-hover p-5 text-center cursor-default" style={{ animation: `slide-up 0.5s var(--spring) ${0.1 * i}s both` }}>
              <p className="font-mono font-bold text-2xl text-ev-primary glow-text-green">{stat.value}</p>
              <p className="text-text-secondary text-xs uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-4">How EVConnect Works</h2>
            <div className="w-20 h-[2px] mx-auto" style={{ background: "linear-gradient(90deg, #00FF88, #0EA5E9)" }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="glass glass-hover p-7 relative overflow-hidden group">
                <span className="absolute top-3 right-4 font-mono text-6xl font-bold" style={{ color: "rgba(0,255,136,0.06)" }}>{step.num}</span>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background: step.gradient }}>
                  <step.icon size={28} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFC FEATURE */}
      <section className="py-20 px-4" style={{ background: "rgba(0,255,136,0.03)", borderTop: "1px solid rgba(0,255,136,0.1)", borderBottom: "1px solid rgba(0,255,136,0.1)" }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="pill pill-warning text-xs font-bold mb-4 inline-block">NEW FEATURE</span>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4">
              Tap. Book. <span className="text-gradient-primary">Charge.</span>
            </h2>
            <p className="text-text-secondary text-base leading-relaxed max-w-md mb-6">
              Walk up to any EVConnect charger, tap your phone on the NFC tag — booking opens instantly. No searching. No typing.
            </p>
            <button className="btn-ghost flex items-center gap-2" onClick={() => setNfcOpen(true)}>
              <Play size={16} /> Watch it work
            </button>
          </div>
          <div className="relative w-[300px] h-[500px] flex-shrink-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[380px] rounded-[32px]" style={{ background: "var(--bg-surface)", border: "2px solid var(--bg-border)", animation: "phone-tilt 3s ease-in-out infinite", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <div className="absolute inset-3 rounded-[24px] bg-bg-primary overflow-hidden p-3">
                <div className="text-center mt-6">
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: "rgba(0,255,136,0.15)" }}>
                    <Zap size={18} className="text-ev-primary" />
                  </div>
                  <p className="font-display font-bold text-xs text-ev-primary">Charger Detected!</p>
                  <p className="text-text-secondary text-[9px] mt-1">Rajesh Kumar • 7.2 kW</p>
                  <div className="mt-3 px-3">
                    <div className="glass rounded-lg p-2 text-[8px] text-text-secondary mb-2"><span className="font-mono text-ev-primary text-xs font-bold">₹7.50</span>/kWh</div>
                    <div className="bg-ev-primary rounded-lg py-1.5 text-[9px] font-bold text-bg-primary">Book Now</div>
                  </div>
                </div>
              </div>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full" style={{ bottom: "80px", border: "2px solid #00FF88", animation: `nfc-ripple 2s infinite ${i * 0.3}s` }} />
            ))}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140px] h-[90px] glass rounded-2xl flex items-center justify-center gap-2" style={{ borderColor: "rgba(0,255,136,0.3)" }}>
              <Wifi size={18} className="text-ev-primary" />
              <span className="font-mono text-sm text-ev-primary font-bold">NFC</span>
            </div>
          </div>
        </div>
      </section>

      {/* EV TICKER */}
      <section className="py-6 overflow-hidden">
        <div className="mb-3" style={{ overflow: "hidden" }}>
          <div className="flex gap-3 whitespace-nowrap" style={{ animation: "marquee 35s linear infinite" }}>
            {[...EV_NAMES, ...EV_NAMES].map((name, i) => (
              <span key={i} className="glass px-4 py-2 rounded-full text-sm text-text-secondary flex-shrink-0">{name}</span>
            ))}
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="flex gap-3 whitespace-nowrap" style={{ animation: "marquee 30s linear infinite reverse" }}>
            {[...CONNECTORS, ...CONNECTORS].map((name, i) => (
              <span key={i} className="glass px-4 py-2 rounded-full text-sm text-text-secondary flex-shrink-0">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* EVA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-[600px] mx-auto glass p-10 text-center rounded-3xl" style={{ borderColor: "rgba(0,255,136,0.2)" }}>
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, #00FF88, #0EA5E9, #8B5CF6, #00FF88)", animation: "rotate-gradient 3s linear infinite", filter: "blur(6px)", opacity: 0.6 }} />
            <div className="absolute inset-1 rounded-full flex items-center justify-center font-display font-extrabold text-xl" style={{ background: "var(--bg-primary)", color: "#00FF88" }}>E</div>
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-2">Meet <span className="text-gradient-primary">EVA</span></h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6 leading-relaxed">Your AI charging assistant. Ask anything about EVs, routes, costs, connectors. EVA knows your route, your battery, and live charger availability.</p>
          <div className="flex gap-2 max-w-sm mx-auto mb-4">
            <div className="input-glass flex-1 text-left text-sm" style={{ padding: "12px 16px", color: "var(--text-muted)" }}>Ask EVA...</div>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#00FF88" }}><Zap size={18} className="text-bg-primary" /></div>
          </div>
          <p className="text-text-secondary text-[10px] font-mono">Available 24/7 • Powered by Gemini 2.5 Flash</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto w-full" style={{ borderTop: "1px solid rgba(26,47,74,0.8)" }}>
        <div className="flex items-center gap-2 mb-2 md:mb-0"><Zap size={16} className="text-ev-primary" /><span className="font-display font-bold text-sm text-ev-primary">EVConnect</span></div>
        <p className="text-text-secondary text-xs">© 2025 EVConnect | Built for VisionAstraa EV Academy Hackathon</p>
        <p className="text-text-secondary text-[10px] mt-1 md:mt-0">Find. Charge. Go.</p>
      </footer>

      <NFCScanModal isOpen={nfcOpen} onClose={() => setNfcOpen(false)} onChargerDetected={() => setNfcOpen(false)} />
    </div>
  );
}
