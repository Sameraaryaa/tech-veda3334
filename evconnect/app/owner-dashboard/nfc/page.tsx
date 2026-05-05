"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { Wifi, Check, Shield, Zap, Smartphone, QrCode, Copy } from "lucide-react";

export default function OwnerNFCPage() {
  const [registered, setRegistered] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegister = () => { setScanning(true); setTimeout(() => { setScanning(false); setRegistered(true); }, 2000); };
  const handleCopy = () => { navigator.clipboard.writeText("https://evconnect.netlify.app/map?charger=charger_id_001"); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="owner" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="NFC Setup" userName="Arya" />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Hero */}
          <div className="glass rounded-2xl p-12 text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-6">
              {[0, 1, 2].map(i => (
                <div key={i} className="absolute inset-0 rounded-full" style={{ border: `2px solid rgba(0,255,136,${0.6 - i * 0.15})`, transform: `scale(${0.5 + i * 0.25})`, animation: scanning ? `nfc-ripple 1.5s infinite ${i * 0.2}s` : `pulse-glow ${2 + i * 0.3}s infinite ${i * 0.3}s` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center"><Wifi size={32} className="text-ev-primary" /></div>
            </div>
            <h2 className="font-display font-extrabold text-3xl text-white mb-2">Your NFC Charging Card</h2>
            <p className="text-text-secondary max-w-md mx-auto">{registered ? "Your NFC card is registered and linked to your chargers." : "Register your NFC card to enable tap-to-activate at your charger."}</p>

            {!registered ? (
              <button className="btn-primary px-8 py-4 mt-6 text-base" onClick={handleRegister} disabled={scanning}>
                {scanning ? <><div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin inline-block mr-2" /> Scanning...</> : <><Smartphone size={18} className="inline mr-2" /> Register NFC Card</>}
              </button>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)" }}>
                  <Check size={16} className="text-ev-primary" />
                  <span className="text-ev-primary text-sm font-medium">Card Registered ✓</span>
                </div>
                <p className="font-mono text-sm text-text-secondary">UID: ••••••••A7F3</p>
              </div>
            )}
          </div>

          {registered && (
            <>
              {/* How It Works */}
              <div className="glass rounded-2xl p-6 mb-6">
                <h3 className="font-display font-bold text-white mb-4">How It Works</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: "🏠", title: "Walk to your charger", desc: "Approach your home charger terminal" },
                    { icon: "📱", title: "Tap NFC card", desc: "Hold card near your phone/terminal" },
                    { icon: "⚡", title: "Charger activates", desc: "Users can now book and charge" },
                  ].map((s, i) => (
                    <div key={i} className="glass rounded-xl p-5 text-center">
                      <span className="text-3xl">{s.icon}</span>
                      <p className="font-display font-bold text-sm text-text-primary mt-3">{s.title}</p>
                      <p className="text-text-secondary text-xs mt-1">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test + Share */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><Shield size={18} className="text-ev-primary" /> Test NFC Tap</h3>
                  <p className="text-text-secondary text-sm mb-4">Simulate what users will see when they tap.</p>
                  <button className="btn-primary w-full py-3" onClick={() => alert("⚡ Charger activated! Available for booking.")}>
                    <Zap size={16} className="inline mr-2" /> Simulate Tap
                  </button>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-display font-bold text-white mb-3 flex items-center gap-2"><QrCode size={18} className="text-ev-primary" /> Share Charger</h3>
                  <p className="text-text-secondary text-sm mb-4">Share this QR/link with EV drivers near you.</p>
                  <div className="glass rounded-xl p-4 flex items-center justify-between mb-3">
                    <span className="text-text-secondary text-xs truncate flex-1 font-mono">evconnect.netlify.app/map?c=001</span>
                    <button className="ml-2" onClick={handleCopy}>{copied ? <Check size={16} className="text-ev-primary" /> : <Copy size={16} className="text-text-secondary" />}</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
