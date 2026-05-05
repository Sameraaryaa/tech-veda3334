"use client";

import React, { useState, useEffect } from "react";
import { isNFCSupported, startNFCScan, simulateNFCDetection } from "@/lib/nfc";
import { MOCK_CHARGERS } from "@/lib/data/mockChargers";
import { Charger } from "@/lib/types";
import { X, Wifi, Check, AlertTriangle, Zap, MapPin, Star } from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   NFCScanModal — Tap your phone to NFC card → instant booking
   4 states: ready → scanning → detected → error
   ═══════════════════════════════════════════════════════════ */

type NFCState = "ready" | "scanning" | "detected" | "error";

interface NFCScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChargerDetected: (charger: Charger) => void;
}

export default function NFCScanModal({ isOpen, onClose, onChargerDetected }: NFCScanModalProps) {
  const [state, setState] = useState<NFCState>("ready");
  const [detectedCharger, setDetectedCharger] = useState<Charger | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setState("ready");
      setDetectedCharger(null);
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    setState("scanning");
    setStatusText("Scanning...");

    const textCycle = ["Scanning...", "Reading tag...", "Verifying charger..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % textCycle.length;
      setStatusText(textCycle[i]);
    }, 1200);

    await startNFCScan(
      (chargerId) => {
        clearInterval(interval);
        handleChargerFound(chargerId);
      },
      (error) => {
        clearInterval(interval);
        setErrorMsg(error);
        setState("error");
      }
    );
  };

  const handleSimulate = () => {
    setState("scanning");
    setStatusText("Scanning...");

    const textCycle = ["Scanning...", "Reading tag...", "Verifying charger..."];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % textCycle.length;
      setStatusText(textCycle[i]);
    }, 400);

    simulateNFCDetection((chargerId) => {
      clearInterval(interval);
      handleChargerFound(chargerId);
    });
  };

  const handleChargerFound = (chargerId: string) => {
    const charger = MOCK_CHARGERS.find((c) => c.id === chargerId) || MOCK_CHARGERS[0];
    setDetectedCharger(charger);
    setState("detected");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(5,10,20,0.92)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative glass w-full max-w-[400px] mx-4 p-10 text-center"
        style={{
          animation: "slide-up 0.35s var(--spring)",
          borderRadius: "var(--radius-xl)",
          borderColor: state === "detected" ? "rgba(0,255,136,0.5)" : undefined,
          boxShadow: state === "detected"
            ? "0 0 60px rgba(0,255,136,0.3), 0 8px 32px rgba(0,0,0,0.4)"
            : undefined,
        }}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-border)" }}
          onClick={onClose}
        >
          <X size={14} className="text-text-secondary" />
        </button>

        {/* ═══ STATE: READY ═══ */}
        {state === "ready" && (
          <>
            {/* NFC Icon — 3 arcs */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `2px solid rgba(0,255,136,${0.6 - i * 0.15})`,
                    transform: `scale(${0.5 + i * 0.25})`,
                    animation: `pulse-glow ${2 + i * 0.3}s infinite ${i * 0.3}s`,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <Wifi size={32} className="text-ev-primary" />
              </div>
            </div>

            <h2 className="font-display font-extrabold text-2xl text-text-primary mb-2">
              Hold Phone Near NFC Tag
            </h2>
            <p className="text-text-secondary text-sm mb-8">
              Place your phone on any EVConnect NFC charger tag
            </p>

            <button className="btn-primary w-full py-4 text-base mb-3" onClick={handleStartScan}>
              <Wifi size={18} className="inline mr-2" />
              Start NFC Scan
            </button>

            {!isNFCSupported() && (
              <p className="text-text-secondary text-xs mt-2">
                ⓘ NFC not available — use simulate button below
              </p>
            )}

            <button
              className="text-text-secondary text-xs mt-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleSimulate}
            >
              Simulate NFC
            </button>
          </>
        )}

        {/* ═══ STATE: SCANNING ═══ */}
        {state === "scanning" && (
          <>
            {/* Phone + NFC card animation */}
            <div className="relative w-32 h-48 mx-auto mb-6">
              {/* Phone shape */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-36 rounded-xl"
                style={{
                  background: "var(--bg-surface)",
                  border: "2px solid var(--bg-border)",
                  animation: "phone-tilt 2s ease-in-out infinite",
                }}
              >
                <div className="absolute inset-2 rounded-lg bg-bg-primary flex items-center justify-center">
                  <Zap size={20} className="text-ev-primary animate-pulse" />
                </div>
              </div>

              {/* NFC Ripples */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full"
                  style={{
                    border: "2px solid #00FF88",
                    animation: `nfc-ripple 2s infinite ${i * 0.2}s`,
                  }}
                />
              ))}

              {/* Card shape */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-10 rounded-lg glass flex items-center justify-center"
              >
                <span className="font-mono text-[10px] text-ev-primary">NFC</span>
              </div>
            </div>

            <p className="font-mono text-sm text-ev-primary mb-2 animate-pulse">{statusText}</p>

            {/* Scanning dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-ev-primary"
                  style={{ animation: `bounce-dots 1.4s ${i * 0.2}s infinite` }}
                />
              ))}
            </div>

            <button className="text-text-secondary text-sm cursor-pointer hover:text-text-primary" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {/* ═══ STATE: DETECTED ═══ */}
        {state === "detected" && detectedCharger && (
          <>
            {/* Success checkmark */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: "rgba(0,255,136,0.15)",
                boxShadow: "0 0 40px rgba(0,255,136,0.3)",
                animation: "slide-up 0.4s var(--spring)",
              }}
            >
              <Check size={32} className="text-ev-primary" />
            </div>

            <h3 className="font-display font-extrabold text-xl text-ev-primary mb-1">
              Charger Detected!
            </h3>

            {/* Charger details */}
            <div
              className="glass p-4 rounded-xl text-left my-5"
              style={{ animation: "slide-up 0.5s var(--spring) 0.1s both" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}
                >
                  {detectedCharger.ownerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-sm text-text-primary">
                    {detectedCharger.ownerName}&apos;s Charger
                  </p>
                  <p className="text-text-secondary text-xs flex items-center gap-1">
                    <MapPin size={10} />
                    {detectedCharger.location.address}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-ev-warning fill-ev-warning" />
                  <span className="font-mono text-xs text-ev-warning">{detectedCharger.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-ev-primary" style={{ boxShadow: "0 0 6px #00FF88" }} />
                  Available Now
                </span>
                <span className="pill pill-secondary text-[10px]">{detectedCharger.connectorType}</span>
                <span className="font-mono text-text-secondary">{detectedCharger.powerKW} kW</span>
                <span className="font-mono text-ev-primary font-bold">₹{detectedCharger.pricePerUnit}/kWh</span>
              </div>
            </div>

            <button
              className="btn-primary w-full py-4 text-base mb-3"
              onClick={() => {
                onChargerDetected(detectedCharger);
                onClose();
              }}
              style={{ animation: "slide-up 0.5s var(--spring) 0.2s both" }}
            >
              Book Now →
            </button>
            <button
              className="btn-ghost w-full py-3 text-sm"
              onClick={onClose}
              style={{ animation: "slide-up 0.5s var(--spring) 0.3s both" }}
            >
              View on Map
            </button>
          </>
        )}

        {/* ═══ STATE: ERROR ═══ */}
        {state === "error" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <AlertTriangle size={32} className="text-ev-danger" />
            </div>

            <h3 className="font-display font-bold text-xl text-ev-danger mb-2">
              {errorMsg.includes("not supported") ? "NFC Not Supported" : "Scan Failed"}
            </h3>
            <p className="text-text-secondary text-sm mb-6">{errorMsg}</p>

            <button className="btn-primary w-full py-3 mb-3" onClick={() => setState("ready")}>
              Try Again
            </button>
            <button className="btn-ghost w-full py-3 text-sm" onClick={handleSimulate}>
              Simulate NFC Instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
