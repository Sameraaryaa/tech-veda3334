import { STATE_EV_PRICING, CITY_STATE_MAP } from "../data/statePricing";
import { StatePricing } from "../types";

/* ═══════════════════════════════════════════════════════════
   Pricing Utilities
   State-aware electricity pricing for P2P chargers
   ═══════════════════════════════════════════════════════════ */

/**
 * Get the suggested price per kWh for a given state
 */
export function getSuggestedPrice(state: string): number {
  const pricing = STATE_EV_PRICING[state] || STATE_EV_PRICING["default"];
  return pricing.suggested;
}

/**
 * Format a cost value in Indian Rupees
 */
export function formatCost(amount: number): string {
  return `₹${Math.ceil(amount)}`;
}

/**
 * Get the full pricing band for a state
 */
export function getPricingBand(state: string): StatePricing {
  return STATE_EV_PRICING[state] || STATE_EV_PRICING["default"];
}

/**
 * Get state from city name
 */
export function getStateFromCity(city: string): string {
  return CITY_STATE_MAP[city] || "default";
}

/**
 * Calculate estimated monthly earnings for a charger host
 */
export function estimateMonthlyEarnings(
  pricePerKwh: number,
  powerKw: number,
  hoursPerDay: number = 4
): number {
  const dailyKwh = powerKw * hoursPerDay;
  const dailyEarning = dailyKwh * pricePerKwh;
  return Math.round(dailyEarning * 30);
}

/**
 * Validate price is within the allowed band for a state
 */
export function isPriceValid(price: number, state: string): boolean {
  const band = getPricingBand(state);
  return price >= band.floor && price <= band.ceiling;
}
