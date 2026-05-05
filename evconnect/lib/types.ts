/* ═══════════════════════════════════════════════════════════
   EVConnect — Shared Type Definitions
   ═══════════════════════════════════════════════════════════ */

export type ChargerStatus = "available" | "charging" | "booked" | "offline";
export type ConnectorType = "Type 2" | "CCS2" | "CHAdeMO" | "15A Socket";
export type PaymentMethod = "UPI" | "Cash" | "Card";

export interface ChargerLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
}

export interface Charger {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  location: ChargerLocation;
  connectorType: ConnectorType;
  powerKW: number;
  pricePerUnit: number;
  currency: string;
  status: ChargerStatus;
  availableFrom: string;
  availableTo: string;
  rating: number;
  totalSessions: number;
  amenities: string[];
  images: string[];
  createdAt: number;
  distanceKm?: number;
}

export interface Booking {
  id?: string;
  chargerId: string;
  userId: string;
  userName: string;
  startTime: number;
  endTime: number;
  estimatedKwh: number;
  estimatedCost: number;
  status: "confirmed" | "active" | "completed" | "cancelled";
  paymentMethod: PaymentMethod;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  evModel: string;
  batteryCapacityKwh: number;
  connectorType: ConnectorType;
  fullRangeKm: number;
  photoURL?: string;
}

export interface EVModel {
  name: string;
  batteryCapacityKwh: number;
  fullRangeKm: number;
  connectorType: ConnectorType;
}

export interface RouteInput {
  distanceKm: number;
  currentBatteryPercent: number;
  fullRangeKm: number;
  temperatureCelsius: number;
  isRaining: boolean;
  acOn: boolean;
}

export interface BatteryResult {
  batteryUsedPercent: number;
  remainingPercent: number;
  canComplete: boolean;
  chargingNeededKwh: number;
  weatherNote: string;
}

export interface RouteData {
  distanceKm: number;
  durationMinutes: number;
  geometry: string;
  coordinates: [number, number][];
  startCoords: [number, number];
  endCoords: [number, number];
}

export interface WeatherData {
  temperature: number;
  isRaining: boolean;
  weatherCode: number;
  description: string;
}

export interface ChargingCostResult {
  totalCost: number;
  chargingTimeMinutes: number;
  breakdown: string;
}

export interface StatePricing {
  floor: number;
  suggested: number;
  ceiling: number;
  unit: string;
  board: string;
}
