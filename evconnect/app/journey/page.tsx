"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, Flag, Battery, Zap, Cloud, ChevronRight, Plus, X } from "lucide-react";
import BatteryGauge from "@/components/route/BatteryGauge";
import BookingModal from "@/components/charger/BookingModal";
import { EV_MODELS, MOCK_CHARGERS } from "@/lib/data/mockChargers";
import { predictBattery } from "@/lib/algorithms/battery";
import { getWeather, getWeatherIcon } from "@/lib/weather";
import { geocodeAddress, getRoute } from "@/lib/routing";
import { Charger, BatteryResult, WeatherData } from "@/lib/types";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><div className="text-5xl animate-pulse">⚡</div></div> });

export default function JourneyPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const [batteryPercent, setBatteryPercent] = useState(67);
  const [selectedEV, setSelectedEV] = useState(EV_MODELS[0]);
  const [acOn, setAcOn] = useState(true);
  const [isCalc, setIsCalc] = useState(false);
  const [result, setResult] = useState<BatteryResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<string | undefined>();
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeTime, setRouteTime] = useState(0);
  const [chargingStops, setChargingStops] = useState<Charger[]>([]);
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);

  const handlePlan = useCallback(async () => {
    if (!origin.trim() || !destination.trim()) return;
    setIsCalc(true); setResult(null); setRouteGeoJSON(undefined); setChargingStops([]);
    try {
      const startCoords = await geocodeAddress(origin);
      const endCoords = await geocodeAddress(destination);
      if (!startCoords || !endCoords) { setIsCalc(false); return; }
      const routeData = await getRoute(startCoords, endCoords);
      const weatherData = await getWeather(startCoords[1], startCoords[0]);
      setWeather(weatherData);
      setRouteDistance(routeData.distanceKm);
      setRouteTime(Math.round(routeData.durationMin));
      const battResult = predictBattery({ distanceKm: routeData.distanceKm, currentBatteryPercent: batteryPercent, fullRangeKm: selectedEV.fullRangeKm, temperatureCelsius: weatherData.temperature, isRaining: weatherData.isRaining, acOn });
      setResult(battResult);
      setRouteGeoJSON(routeData.geometry);
      if (!battResult.canComplete) {
        const midIdx = Math.floor(routeData.coordinates.length / 2);
        const mid = routeData.coordinates[midIdx];
        const nearRoute = MOCK_CHARGERS.filter(c => c.status === "available").map(c => {
          const d = haversine(mid[1], mid[0], c.location.lat, c.location.lng);
          return { ...c, distanceKm: Math.round(d * 10) / 10 };
        }).sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 3);
        setChargingStops(nearRoute);
      }
    } catch (e) { console.error(e); }
    setIsCalc(false);
  }, [origin, destination, batteryPercent, selectedEV, acOn]);

  const verdictColor = !result ? "#8BA0B4" : result.canComplete ? (result.remainingPercent > 20 ? "#00FF88" : "#F59E0B") : "#EF4444";
  const verdictBg = !result ? "transparent" : result.canComplete ? (result.remainingPercent > 20 ? "rgba(0,255,136,0.08)" : "rgba(245,158,11,0.08)") : "rgba(239,68,68,0.08)";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0 z-50" style={{ background: "rgba(5,10,20,0.9)", backdropFilter: "blur(20px)", borderColor: "rgba(26,47,74,0.5)" }}>
        <div className="flex items-center gap-3">
          <Link href="/user-dashboard" className="no-underline text-text-secondary hover:text-ev-primary transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="font-display font-extrabold text-xl text-white">Journey Planner</h1>
        </div>
        <select className="input-glass text-xs py-1.5 px-3 w-auto" value={selectedEV.name} onChange={e => { const m = EV_MODELS.find(x => x.name === e.target.value); if (m) setSelectedEV(m); }}>
          {EV_MODELS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
        </select>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-[420px] min-w-[420px] flex flex-col overflow-y-auto border-r" style={{ background: "rgba(5,10,20,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(26,47,74,0.5)" }}>
          <div className="p-5 space-y-5">
            {/* Inputs */}
            <div className="glass rounded-2xl p-5">
              <h2 className="font-display font-bold text-lg text-white mb-4">Plan Your Journey</h2>
              <div className="space-y-3">
                <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ev-primary" /><input className="input-glass !pl-9" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
                {stops.map((s, i) => (
                  <div key={i} className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ev-warning" /><input className="input-glass !pl-9 !pr-10" placeholder={`Stop ${i + 1}`} value={s} onChange={e => { const n = [...stops]; n[i] = e.target.value; setStops(n); }} /><button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setStops(stops.filter((_, j) => j !== i))}><X size={14} className="text-text-secondary" /></button></div>
                ))}
                {stops.length < 3 && <button className="text-text-secondary text-xs flex items-center gap-1 hover:text-ev-primary transition-colors" onClick={() => setStops([...stops, ""])}><Plus size={12} /> Add Stop</button>}
                <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ev-danger" /><input className="input-glass !pl-9" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} /></div>
              </div>
            </div>

            {/* Battery */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-text-secondary text-sm flex items-center gap-1"><Battery size={14} /> Current Battery</span>
                <span className="font-mono font-bold text-2xl text-ev-primary glow-text-green">{batteryPercent}%</span>
              </div>
              <input type="range" min={5} max={100} value={batteryPercent} onChange={e => setBatteryPercent(Number(e.target.value))} className="w-full h-[6px] rounded-full" style={{ background: `linear-gradient(to right, ${batteryPercent > 50 ? "#00FF88" : batteryPercent > 20 ? "#F59E0B" : "#EF4444"} ${batteryPercent}%, #1A2F4A ${batteryPercent}%)` }} />
              <label className="flex items-center gap-2 mt-3 cursor-pointer text-sm text-text-secondary">
                <div className="relative w-10 h-6 rounded-full" style={{ background: acOn ? "#00FF88" : "var(--bg-border)" }} onClick={() => setAcOn(!acOn)}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: acOn ? "translateX(20px)" : "translateX(4px)" }} />
                </div>
                AC {acOn ? "On" : "Off"}
              </label>
            </div>

            <button className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2" onClick={handlePlan} disabled={isCalc}>
              {isCalc ? <><div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> Planning...</> : <><Zap size={18} /> Plan Journey</>}
            </button>

            {/* RESULTS */}
            {result && (
              <div className="space-y-4" style={{ animation: "slide-up 0.4s var(--spring)" }}>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="font-mono text-lg text-text-primary">{routeDistance.toFixed(1)}</p><p className="text-text-secondary text-[10px]">km</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="font-mono text-lg text-ev-secondary">{routeTime} min</p><p className="text-text-secondary text-[10px]">Est. Time</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="font-mono text-lg" style={{ color: verdictColor }}>{Math.round(100 - result.remainingPercent)}%</p><p className="text-text-secondary text-[10px]">Battery Used</p></div>
                </div>

                {/* Verdict */}
                <div className="glass rounded-2xl p-6 text-center" style={{ background: verdictBg, borderColor: `${verdictColor}30` }}>
                  <BatteryGauge percentage={result.remainingPercent} size={100} />
                  {result.canComplete ? (
                    <div className="mt-3">
                      <p className="font-display font-extrabold text-xl" style={{ color: verdictColor }}>{result.remainingPercent > 20 ? "✓ You'll make it!" : "⚠ Tight — quick top-up recommended"}</p>
                      <p className="font-mono text-sm text-text-secondary mt-1">{result.remainingPercent}% remaining at destination</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="font-display font-extrabold text-xl text-ev-danger">✗ Battery Insufficient</p>
                      <p className="font-mono text-sm text-ev-warning mt-1">Need {result.chargingNeededKwh.toFixed(1)} kWh more</p>
                    </div>
                  )}
                  <p className="text-text-secondary text-xs mt-2 italic flex items-center justify-center gap-1"><Cloud size={10} /> {result.weatherNote}</p>
                </div>

                {/* Charging Stops */}
                {chargingStops.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-white text-sm mb-3">Recommended Charging Stops</h3>
                    <div className="space-y-3">
                      {chargingStops.map((cs, i) => {
                        const addKm = Math.round((20 / 100) * selectedEV.fullRangeKm);
                        const cost = Math.round(((20 / 100) * selectedEV.batteryCapacityKwh) * cs.pricePerUnit);
                        const timeMin = Math.round(((20 / 100) * selectedEV.batteryCapacityKwh) / cs.powerKW * 60);
                        return (
                          <div key={cs.id} className="glass rounded-xl p-4" style={{ animation: `slide-up 0.3s var(--spring) ${i * 0.1}s both` }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>{i + 1}</span>
                              <span className="text-text-secondary text-xs">At {cs.distanceKm} km mark</span>
                            </div>
                            <p className="font-display font-bold text-sm text-text-primary">{cs.ownerName}&apos;s Charger</p>
                            <p className="text-text-secondary text-xs">{cs.connectorType} · {cs.powerKW}kW · ₹{cs.pricePerUnit}/kWh</p>
                            <p className="text-ev-primary text-xs mt-1 font-mono">Charge 20% → adds {addKm}km</p>
                            <p className="text-text-secondary text-xs font-mono">₹{cost} · ~{timeMin} min</p>
                            <div className="flex gap-2 mt-3">
                              <button className="btn-primary text-xs py-2 px-4 flex items-center gap-1" onClick={() => setBookingCharger(cs)}>Book This Stop <ChevronRight size={12} /></button>
                              <button className="btn-ghost text-xs py-2 px-4">Details</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {chargingStops.length > 1 && (
                      <div className="glass rounded-xl p-4 mt-3 text-center">
                        <p className="text-text-secondary text-xs mb-2">Book all stops at once</p>
                        <button className="btn-primary text-sm py-2.5 px-6">Book All Stops — ₹{chargingStops.reduce((a, cs) => a + Math.round(((20/100)*selectedEV.batteryCapacityKwh)*cs.pricePerUnit), 0)}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MAP */}
        <div className="flex-1 relative">
          <MapView chargers={chargingStops.length > 0 ? chargingStops : MOCK_CHARGERS.slice(0, 10)} onChargerClick={setBookingCharger} routeGeoJSON={routeGeoJSON} />
          {weather && (
            <div className="absolute bottom-4 left-4 z-10 glass px-4 py-3 rounded-xl flex items-center gap-3">
              <span className="text-2xl">{getWeatherIcon(weather.weatherCode)}</span>
              <div><p className="font-mono text-sm text-text-primary font-bold">{weather.temperature}°C</p><p className="text-text-secondary text-[10px]">{weather.description}</p></div>
            </div>
          )}
        </div>
      </div>

      {bookingCharger && <BookingModal charger={bookingCharger} isOpen={!!bookingCharger} onClose={() => setBookingCharger(null)} currentBatteryPercent={batteryPercent} />}
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = ((lat2-lat1)*Math.PI)/180; const dLon = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
