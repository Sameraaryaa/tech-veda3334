/* ═══════════════════════════════════════════════════════════
   Zustand Store — Global state across all dashboards
   ═══════════════════════════════════════════════════════════ */

import { create } from "zustand";
import { Charger } from "@/lib/types";

export interface EVProfile {
  model: string;
  batteryCapacityKwh: number;
  fullRangeKm: number;
  connectorType: string;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: "owner" | "user" | "both";
  nfcCardUID?: string | null;
  photoURL?: string | null;
  ev?: EVProfile;
}

interface AppState {
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  selectedEV: EVProfile;
  setSelectedEV: (ev: EVProfile) => void;
  nearbyChargers: Charger[];
  setNearbyChargers: (c: Charger[]) => void;
  activeBookingId: string | null;
  setActiveBookingId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  selectedEV: { model: "Tata Nexon EV", batteryCapacityKwh: 40.5, fullRangeKm: 312, connectorType: "Type 2" },
  setSelectedEV: (ev) => set({ selectedEV: ev }),
  nearbyChargers: [],
  setNearbyChargers: (c) => set({ nearbyChargers: c }),
  activeBookingId: null,
  setActiveBookingId: (id) => set({ activeBookingId: id }),
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
}));
