"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import BookingModal from "@/components/charger/BookingModal";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers } from "@/lib/firebase";
import { Charger } from "@/lib/types";
import { MapPin, Zap, Filter } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><div className="text-5xl animate-pulse">⚡</div></div>,
});

export default function UserFindChargersPage() {
  const router = useRouter();
  const { user, loading } = useAuthContext();
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [filter, setFilter] = useState("All");
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);

  useEffect(() => { if (!loading && !user) router.push("/auth"); }, [user, loading, router]);
  useEffect(() => {
    const unsub = listenToAllChargers((all) => setChargers(all));
    return () => unsub();
  }, []);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><Zap size={32} className="text-ev-primary animate-pulse" /></div>;

  const filters = ["All", "Type 2", "CCS2", "CHAdeMO", "15A Socket"];
  const filtered = filter === "All" ? chargers : chargers.filter(c => c.connectorType === filter);
  const available = filtered.filter(c => c.status === "available");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Find Chargers" />
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel — Charger list */}
          <div className="w-[340px] min-w-[340px] border-r flex flex-col overflow-hidden" style={{ borderColor: "rgba(26,47,74,0.5)" }}>
            {/* Filters */}
            <div className="p-3 border-b flex gap-1.5 flex-wrap" style={{ borderColor: "rgba(26,47,74,0.3)" }}>
              <Filter size={14} className="text-text-secondary mt-1.5" />
              {filters.map(f => (
                <button key={f} className="pill cursor-pointer text-[10px] px-3 py-1" style={filter === f ? { background: "rgba(0,255,136,0.1)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" } : { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" }} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>

            {/* Stats */}
            <div className="px-3 py-2 text-xs text-text-secondary border-b" style={{ borderColor: "rgba(26,47,74,0.3)" }}>
              <span className="text-ev-primary font-mono font-bold">{available.length}</span> available · <span className="font-mono">{filtered.length}</span> total
            </div>

            {/* Charger list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {available.slice(0, 30).map(c => (
                <div key={c.id} className="glass rounded-xl p-3 cursor-pointer hover:border-ev-primary transition-all" onClick={() => setBookingCharger(c)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>{c.ownerName.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate">{c.ownerName}</p>
                      <p className="text-text-secondary text-[10px] truncate">{c.location.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1.5">
                      <span className="pill text-[9px] px-2 py-0.5" style={{ background: "rgba(14,165,233,0.1)", color: "#0EA5E9", border: "1px solid rgba(14,165,233,0.2)" }}>{c.connectorType}</span>
                      <span className="text-text-secondary text-[10px] font-mono">{c.powerKW}kW</span>
                    </div>
                    <span className="font-mono text-ev-primary text-xs font-bold">₹{c.pricePerUnit}/kWh</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapView chargers={filtered} onChargerClick={setBookingCharger} />
          </div>
        </main>
      </div>

      {bookingCharger && <BookingModal charger={bookingCharger} isOpen={!!bookingCharger} onClose={() => setBookingCharger(null)} currentBatteryPercent={67} />}
    </div>
  );
}
