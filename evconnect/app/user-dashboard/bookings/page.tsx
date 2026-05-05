"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { Clock, MapPin, Navigation, X as XIcon, Zap } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";
import { getUserBookings, listenToAllChargers, cancelBooking } from "@/lib/firebase";
import { Booking, Charger } from "@/lib/types";

export default function UserBookingsPage() {
  const { user, loading } = useAuthContext();
  const [tab, setTab] = useState("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const tabs = ["upcoming", "active", "completed", "cancelled"];

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        setIsFetching(true);
        try {
          const data = await getUserBookings(user.uid);
          setBookings(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsFetching(false);
        }
      };
      fetchBookings();

      const unsub = listenToAllChargers((all) => setChargers(all));
      return () => unsub();
    }
  }, [user]);

  const handleCancel = async (bookingId: string, chargerId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await cancelBooking(bookingId, chargerId);
      // Refresh bookings
      if (user) {
        const data = await getUserBookings(user.uid);
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const getChargerName = (id: string) => {
    const c = chargers.find(c => c.id === id);
    return c ? `${c.ownerName}'s Charger` : "Charger";
  };

  const getChargerLoc = (id: string) => {
    const c = chargers.find(c => c.id === id);
    return c ? `${c.location.address}, ${c.location.city}` : "Location not found";
  };

  const filtered = bookings.filter(b => {
    if (tab === "upcoming") return b.status === "confirmed";
    return b.status === tab;
  });

  if (loading || isFetching) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><Zap size={32} className="text-ev-primary animate-pulse" /></div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="My Bookings" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex gap-2 mb-6">
            {tabs.map(t => (
              <button key={t} className="pill cursor-pointer capitalize px-4 py-2" style={tab === t ? { background: "rgba(0,255,136,0.08)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.4)" } : { border: "1px solid var(--bg-border)", color: "var(--text-secondary)" }} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center"><p className="text-text-secondary">No {tab} bookings found.</p></div>
            ) : filtered.map(b => (
              <div key={b.id} className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-text-primary">{getChargerName(b.chargerId)}</p>
                    <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={10} />{getChargerLoc(b.chargerId)}</p>
                  </div>
                  <span className="font-mono text-xl text-ev-primary font-bold">₹{b.estimatedCost}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><Clock size={12} />{new Date(b.startTime).toLocaleString()}</span>
                  <span className="font-mono">{b.estimatedKwh} kWh</span>
                </div>
                {(b.status === "confirmed" || b.status === "active") && (
                  <div className="flex gap-2 mt-3">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(getChargerLoc(b.chargerId))}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs py-2 px-4 flex items-center gap-1 no-underline"><Navigation size={12} /> Get Directions</a>
                    {b.status === "confirmed" && (
                      <button onClick={() => b.id && handleCancel(b.id, b.chargerId)} className="pill cursor-pointer text-xs py-2 px-4" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}><XIcon size={12} className="inline mr-1" /> Cancel</button>
                    )}
                  </div>
                )}
                {b.status === "confirmed" && (
                  <div className="mt-3 glass rounded-lg p-2 text-xs text-text-secondary flex items-center gap-2">
                    <Zap size={12} className="text-ev-primary" /> Tip: Tap your NFC card at the charger to start your session instantly
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
