import { RouteInput, BatteryResult, ChargingCostResult } from "../types";

/* ═══════════════════════════════════════════════════════════
   Battery Prediction Algorithm
   Weather-adjusted range calculation for EVs
   ═══════════════════════════════════════════════════════════ */

export function predictBattery(input: RouteInput): BatteryResult {
  // Weather factor calculation
  let weatherFactor = 1.0;
  let weatherNote = "Ideal conditions";

  if (input.temperatureCelsius < 15) {
    weatherFactor = 1.2; // 20% more consumption in cold
    weatherNote = "Cold weather: range reduced 20%";
  } else if (input.temperatureCelsius > 40) {
    weatherFactor = 1.1; // AC load in extreme heat
    weatherNote = "Hot weather: AC load reduces range 10%";
  }

  if (input.isRaining) {
    weatherFactor += 0.05;
    weatherNote += " + Rain: additional 5% drain";
  }

  if (input.acOn && input.temperatureCelsius > 30) {
    weatherFactor += 0.05;
  }

  // Battery consumption calculation
  const baseConsumptionPercent =
    (input.distanceKm / input.fullRangeKm) * 100;
  const adjustedConsumption = baseConsumptionPercent * weatherFactor;
  const remainingPercent =
    input.currentBatteryPercent - adjustedConsumption;
  const canComplete = remainingPercent >= 10; // 10% safety buffer

  return {
    batteryUsedPercent: Math.round(adjustedConsumption * 10) / 10,
    remainingPercent: Math.max(Math.round(remainingPercent * 10) / 10, 0),
    canComplete,
    chargingNeededKwh: canComplete
      ? 0
      : Math.round(Math.abs(remainingPercent) * 0.01 * 40.5 * 10) / 10,
    weatherNote,
  };
}

/* ═══════════════════════════════════════════════════════════
   Charging Cost Calculator
   ═══════════════════════════════════════════════════════════ */

export function calculateChargingCost(
  energyKwh: number,
  pricePerKwh: number,
  chargerPowerKw: number
): ChargingCostResult {
  const chargingTimeHours = energyKwh / chargerPowerKw;
  const chargingTimeMinutes = Math.ceil(chargingTimeHours * 60);
  const totalCost = energyKwh * pricePerKwh;

  return {
    totalCost: Math.ceil(totalCost),
    chargingTimeMinutes,
    breakdown: `${energyKwh.toFixed(1)} kWh × ₹${pricePerKwh}/kWh = ₹${Math.ceil(totalCost)}`,
  };
}

/* ═══════════════════════════════════════════════════════════
   Utility: Format charging time for display
   ═══════════════════════════════════════════════════════════ */

export function formatChargingTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}
