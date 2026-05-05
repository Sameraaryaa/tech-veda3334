import { StatePricing } from "../types";

/* ═══════════════════════════════════════════════════════════
   State-wise EV Electricity Pricing Data
   Based on actual residential EV tariffs across India
   ═══════════════════════════════════════════════════════════ */

export const STATE_EV_PRICING: Record<string, StatePricing> = {
  Karnataka: {
    floor: 4.5,
    suggested: 7.5,
    ceiling: 12,
    unit: "₹/kWh",
    board: "BESCOM",
  },
  Maharashtra: {
    floor: 5.0,
    suggested: 8.0,
    ceiling: 13,
    unit: "₹/kWh",
    board: "MSEDCL",
  },
  Delhi: {
    floor: 4.0,
    suggested: 7.0,
    ceiling: 11,
    unit: "₹/kWh",
    board: "BSES",
  },
  "Tamil Nadu": {
    floor: 3.85,
    suggested: 6.5,
    ceiling: 10,
    unit: "₹/kWh",
    board: "TANGEDCO",
  },
  Telangana: {
    floor: 4.0,
    suggested: 7.0,
    ceiling: 11,
    unit: "₹/kWh",
    board: "TSSPDCL",
  },
  Gujarat: {
    floor: 4.5,
    suggested: 7.5,
    ceiling: 12,
    unit: "₹/kWh",
    board: "DGVCL",
  },
  Rajasthan: {
    floor: 3.5,
    suggested: 6.5,
    ceiling: 10,
    unit: "₹/kWh",
    board: "JVVNL",
  },
  "Uttar Pradesh": {
    floor: 4.0,
    suggested: 7.0,
    ceiling: 11,
    unit: "₹/kWh",
    board: "UPPCL",
  },
  default: {
    floor: 5.0,
    suggested: 8.0,
    ceiling: 13,
    unit: "₹/kWh",
    board: "State Board",
  },
};

/* City → State mapping */
export const CITY_STATE_MAP: Record<string, string> = {
  Bangalore: "Karnataka",
  Bengaluru: "Karnataka",
  Mumbai: "Maharashtra",
  Pune: "Maharashtra",
  Delhi: "Delhi",
  "New Delhi": "Delhi",
  Noida: "Uttar Pradesh",
  Gurgaon: "Delhi",
  Chennai: "Tamil Nadu",
  Hyderabad: "Telangana",
  Ahmedabad: "Gujarat",
  Jaipur: "Rajasthan",
};
