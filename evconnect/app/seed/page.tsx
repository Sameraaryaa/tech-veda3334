"use client";

import React, { useState } from "react";
import { getFirebaseDB } from "@/lib/firebase";
import { ref, set } from "firebase/database";
import { generateMassiveChargers } from "@/lib/data/seedChargers";
import { Zap, Database, Check, Loader2 } from "lucide-react";

// Demo bookings, users, and sessions for judges
const DEMO_USERS = [
  { uid: "demo_user_001", name: "Arya", email: "arya@evconnect.in", role: "user", photoURL: null, nfcCardUID: "A7F3E2D1", createdAt: "2025-03-15T10:30:00Z" },
  { uid: "demo_user_002", name: "Ananya Sharma", email: "ananya@gmail.com", role: "user", photoURL: null, nfcCardUID: "B8G4F3E2", createdAt: "2025-04-02T14:20:00Z" },
  { uid: "demo_user_003", name: "Vikram Shetty", email: "vikram.s@gmail.com", role: "user", photoURL: null, nfcCardUID: null, createdAt: "2025-04-10T09:15:00Z" },
  { uid: "demo_owner_001", name: "Rajesh Kumar", email: "rajesh.k@gmail.com", role: "owner", photoURL: null, nfcCardUID: "C9H5G4F3", createdAt: "2025-02-20T08:00:00Z" },
  { uid: "demo_owner_002", name: "Priya Nair", email: "priya.n@gmail.com", role: "owner", photoURL: null, nfcCardUID: "D0I6H5G4", createdAt: "2025-03-01T11:30:00Z" },
  { uid: "demo_owner_003", name: "Suresh Reddy", email: "suresh.r@gmail.com", role: "owner", photoURL: null, nfcCardUID: "E1J7I6H5", createdAt: "2025-03-10T16:45:00Z" },
];

const DEMO_BOOKINGS = Array.from({ length: 40 }, (_, i) => {
  const days = [0, 0, 1, 1, 2, 3, 5, 7, 10, 14, 20, 25, 30];
  const dayAgo = days[i % days.length];
  const date = new Date(Date.now() - dayAgo * 86400000);
  const hour = 6 + (i * 3) % 16;
  date.setHours(hour, 0, 0, 0);
  const users = ["demo_user_001", "demo_user_002", "demo_user_003"];
  const chargerIdx = (i * 7) % 150;
  const statuses = ["completed", "completed", "completed", "completed", "upcoming", "active", "cancelled"];
  const status = dayAgo === 0 && i < 3 ? (i === 0 ? "active" : "upcoming") : statuses[i % statuses.length];
  const kWh = Math.round((5 + (i * 2.3) % 25) * 10) / 10;
  const cost = Math.round(kWh * (5 + (i % 6)));
  const durationMin = Math.round(kWh / 7.2 * 60);
  return {
    id: `booking_${String(i + 1).padStart(3, "0")}`,
    userId: users[i % users.length],
    chargerId: `charger_${String(chargerIdx + 1).padStart(3, "0")}`,
    status,
    scheduledTime: date.toISOString(),
    kWh: status === "completed" || status === "active" ? kWh : 0,
    cost: status === "completed" || status === "active" ? cost : 0,
    durationMin: status === "completed" ? durationMin : 0,
    createdAt: new Date(date.getTime() - 3600000).toISOString(),
    rating: status === "completed" ? 3 + (i % 3) : 0,
  };
});

const DEMO_SESSIONS = Array.from({ length: 25 }, (_, i) => {
  const dayAgo = i * 2;
  const date = new Date(Date.now() - dayAgo * 86400000);
  date.setHours(8 + (i * 2) % 12, 0, 0, 0);
  const kWh = Math.round((8 + (i * 3.7) % 30) * 10) / 10;
  const cost = Math.round(kWh * (5 + (i % 5)));
  const co2 = Math.round(kWh * 0.82 * 10) / 10;
  return {
    id: `session_${String(i + 1).padStart(3, "0")}`,
    bookingId: `booking_${String(i + 1).padStart(3, "0")}`,
    chargerId: `charger_${String((i * 5 + 1) % 150 + 1).padStart(3, "0")}`,
    userId: ["demo_user_001", "demo_user_002", "demo_user_003"][i % 3],
    startTime: date.toISOString(),
    endTime: new Date(date.getTime() + (kWh / 7.2) * 3600000).toISOString(),
    kWh,
    cost,
    co2Saved: co2,
    status: i === 0 ? "active" : "completed",
    startPercent: 20 + (i * 5) % 40,
    endPercent: 60 + (i * 3) % 40,
    rating: 3 + (i % 3),
  };
});

const DEMO_NFC_CARDS = [
  { uid: "A7F3E2D1", linkedUserId: "demo_user_001", linkedCharger: null, type: "user", registeredAt: "2025-03-15T10:30:00Z" },
  { uid: "B8G4F3E2", linkedUserId: "demo_user_002", linkedCharger: null, type: "user", registeredAt: "2025-04-02T14:20:00Z" },
  { uid: "C9H5G4F3", linkedUserId: "demo_owner_001", linkedCharger: "charger_001", type: "owner", registeredAt: "2025-02-20T08:00:00Z" },
  { uid: "D0I6H5G4", linkedUserId: "demo_owner_002", linkedCharger: "charger_021", type: "owner", registeredAt: "2025-03-01T11:30:00Z" },
  { uid: "E1J7I6H5", linkedUserId: "demo_owner_003", linkedCharger: "charger_043", type: "owner", registeredAt: "2025-03-10T16:45:00Z" },
];

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "seeding" | "done" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [counts, setCounts] = useState({ chargers: 0, users: 0, bookings: 0, sessions: 0, nfc: 0 });

  const handleSeed = async () => {
    setStatus("seeding");
    try {
      const db = getFirebaseDB();

      // 1. Seed 150 chargers
      setProgress("Seeding 150 chargers...");
      const chargers = generateMassiveChargers();
      const chargersObj: Record<string, unknown> = {};
      chargers.forEach(c => { chargersObj[c.id] = c; });
      await set(ref(db, "chargers"), chargersObj);
      setCounts(p => ({ ...p, chargers: chargers.length }));

      // 2. Seed demo users
      setProgress("Seeding demo users...");
      const usersObj: Record<string, unknown> = {};
      DEMO_USERS.forEach(u => { usersObj[u.uid] = u; });
      await set(ref(db, "users"), usersObj);
      setCounts(p => ({ ...p, users: DEMO_USERS.length }));

      // 3. Seed bookings
      setProgress("Seeding 40 bookings...");
      const bookingsObj: Record<string, unknown> = {};
      DEMO_BOOKINGS.forEach(b => { bookingsObj[b.id] = b; });
      await set(ref(db, "bookings"), bookingsObj);
      setCounts(p => ({ ...p, bookings: DEMO_BOOKINGS.length }));

      // 4. Seed sessions
      setProgress("Seeding 25 charging sessions...");
      const sessionsObj: Record<string, unknown> = {};
      DEMO_SESSIONS.forEach(s => { sessionsObj[s.id] = s; });
      await set(ref(db, "sessions"), sessionsObj);
      setCounts(p => ({ ...p, sessions: DEMO_SESSIONS.length }));

      // 5. Seed NFC cards
      setProgress("Seeding NFC cards...");
      const nfcObj: Record<string, unknown> = {};
      DEMO_NFC_CARDS.forEach(n => { nfcObj[n.uid] = n; });
      await set(ref(db, "nfc_cards"), nfcObj);
      setCounts(p => ({ ...p, nfc: DEMO_NFC_CARDS.length }));

      setProgress("✅ All data seeded successfully!");
      setStatus("done");
    } catch (err) {
      console.error("Seed error:", err);
      setProgress(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-primary)" }}>
      <div className="glass rounded-3xl p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)" }}>
          <Database size={32} style={{ color: "#050A14" }} />
        </div>
        <h1 className="font-display font-extrabold text-3xl text-white mb-2">Seed Firebase Database</h1>
        <p className="text-text-secondary text-sm mb-8">This will populate your Firebase Realtime Database with 150 chargers, users, bookings, sessions, and NFC cards for the hackathon demo.</p>

        {status === "idle" && (
          <button className="btn-primary px-8 py-4 text-base" onClick={handleSeed}>
            <Zap size={18} className="inline mr-2" /> Seed All Data
          </button>
        )}

        {status === "seeding" && (
          <div className="space-y-4">
            <Loader2 size={40} className="text-ev-primary mx-auto animate-spin" />
            <p className="text-ev-primary text-sm">{progress}</p>
          </div>
        )}

        {(status === "done" || status === "error") && (
          <div className="space-y-4">
            {status === "done" && <Check size={40} className="text-ev-primary mx-auto" />}
            <p className={`text-sm ${status === "done" ? "text-ev-primary" : "text-ev-danger"}`}>{progress}</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Chargers", val: counts.chargers, color: "#00FF88" },
                { label: "Users", val: counts.users, color: "#0EA5E9" },
                { label: "Bookings", val: counts.bookings, color: "#F59E0B" },
                { label: "Sessions", val: counts.sessions, color: "#8B5CF6" },
                { label: "NFC Cards", val: counts.nfc, color: "#00FF88" },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-3 text-center">
                  <p className="font-mono text-xl font-bold" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-text-secondary text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
            <button className="btn-ghost mt-4 px-6 py-2" onClick={() => { setStatus("idle"); setCounts({ chargers: 0, users: 0, bookings: 0, sessions: 0, nfc: 0 }); }}>Seed Again</button>
          </div>
        )}

        <p className="text-text-secondary text-[10px] mt-6">⚠️ This replaces all existing data in Firebase. Use only for demo setup.</p>
      </div>
    </div>
  );
}
