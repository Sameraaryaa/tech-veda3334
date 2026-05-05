"use client";
import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { Wifi, Check, Smartphone, Zap, CreditCard } from "lucide-react";

export default function UserNFCPage() {
  const [registered, setRegistered] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleRegister = () => { setScanning(true); setTimeout(() => { setScanning(false); setRegistered(true); }, 2000); };

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" userName="Arya" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My NFC Card" userName="Arya" />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* NFC Card Visual */}
          <div className="flex justify-center mb-8">
            <div className="relative group cursor-pointer" style={{ width: "350px", height: "200px", perspective: "1000px" }}>
              <div className="w-full h-full rounded-2xl p-6 flex flex-col justify-between transition-transform" style={{
                background: registered ? "linear-gradient(135deg, #0D1B2A, #1A2F4A)" : "var(--bg-border)",
                border: registered ? "1px solid rgba(0,255,136,0.3)" : "2px dashed rgba(26,47,74,0.8)",
                boxShadow: registered ? "0 0 40px rgba(0,255,136,0.15), 0 20px 40px rgba(0,0,0,0.3)" : "none",
              }}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5"><Zap size={14} className="text-ev-primary" /><span className="text-white text-sm font-display font-bold">EVConnect</span></div>
                  <CreditCard size={16} className="text-text-secondary" />
                </div>
                <div className="flex items-center justify-center"><Wifi size={40} style={{ color: registered ? "#00FF88" : "#4A6080" }} /></div>
                <div className="flex justify-between items-end">
                  <span className="font-mono text-sm" style={{ color: registered ? "#F0F4F8" : "#4A6080" }}>{registered ? "ARYA" : "NOT REGISTERED"}</span>
                  <span className="font-mono text-xs text-text-secondary">{registered ? "••••A7F3" : "----"}</span>
                </div>
              </div>
            </div>
          </div>

          {!registered ? (
            <div className="text-center">
              <h2 className="font-display font-extrabold text-2xl text-white mb-2">Register Your NFC Card</h2>
              <p className="text-text-secondary max-w-md mx-auto mb-6">Any blank NFC tag works. Click register, then hold the card to the back of your phone.</p>
              <button className="btn-primary px-8 py-4 text-base" onClick={handleRegister} disabled={scanning}>
                {scanning ? "Scanning..." : "Register Card"}
              </button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto space-y-4">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Check size={20} className="text-ev-primary" />
                <span className="text-ev-primary font-medium">Card Registered & Active</span>
              </div>
              <h3 className="font-display font-bold text-white text-center mb-4">How to Use Your Card</h3>
              {[
                { icon: "🏃", title: "Walk up to any charger", desc: "Find a charger on the map, arrive at location" },
                { icon: "📱", title: "Tap your card", desc: "Hold card near the charger terminal (phone)" },
                { icon: "⚡", title: "Charging starts", desc: "If you have a booking, session starts instantly" },
              ].map((s, i) => (
                <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="font-display font-bold text-sm text-text-primary">{s.title}</p>
                    <p className="text-text-secondary text-xs">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
