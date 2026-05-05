"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import BookingModal from "@/components/charger/BookingModal";
import BatteryGauge from "@/components/route/BatteryGauge";
import { useAuthContext } from "@/lib/context/AuthContext";
import { listenToAllChargers } from "@/lib/firebase";
import { EV_MODELS, MOCK_CHARGERS } from "@/lib/data/mockChargers";
import { predictBattery } from "@/lib/algorithms/battery";
import { getWeather, getWeatherIcon } from "@/lib/weather";
import { geocodeAddress, getRoute } from "@/lib/routing";
import { Charger, BatteryResult, WeatherData } from "@/lib/types";
import { MapPin, Battery, Zap, Cloud, ChevronRight, Plus, X } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full"><div className="text-5xl animate-pulse">⚡</div></div>,
});

// Simulated live EV battery data (auto-connected to vehicle)
const EV_LIVE_DATA = {
  batteryPercent: 67,
  vehicleName: "Tata Nexon EV Max",
  lastSync: "2 min ago",
  rangeKm: 209,
  isCharging: false,
  acOn: true,
  temperatureC: 31,
};

export default function UserJourneyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState<string[]>([]);
  const selectedEV = EV_MODELS[0];
  const [batteryPercent, setBatteryPercent] = useState(67);
  const [acOn, setAcOn] = useState(true);
  const [isCalc, setIsCalc] = useState(false);
  const [result, setResult] = useState<BatteryResult | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<string | undefined>();
  const [routeDistance, setRouteDistance] = useState(0);
  const [routeTime, setRouteTime] = useState(0);
  const [chargingStops, setChargingStops] = useState<Charger[]>([]);
  const [allChargers, setAllChargers] = useState<Charger[]>([]);
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);

  useEffect(() => { if (!authLoading && !user) router.push("/auth"); }, [user, authLoading, router]);
  useEffect(() => {
    const unsub = listenToAllChargers((all) => setAllChargers(all));
    return () => unsub();
  }, []);

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
      setRouteTime(Math.round(routeData.durationMinutes || routeData.distanceKm / 40 * 60));
      const battResult = predictBattery({
        distanceKm: routeData.distanceKm,
        currentBatteryPercent: batteryPercent,
        fullRangeKm: selectedEV.fullRangeKm,
        temperatureCelsius: weatherData.temperature,
        isRaining: weatherData.isRaining,
        acOn,
      });
      setResult(battResult);
      setRouteGeoJSON(routeData.geometry);
      // Find chargers near route from Firebase data
      if (!battResult.canComplete || battResult.remainingPercent < 25) {
        const midIdx = Math.floor(routeData.coordinates.length / 2);
        const mid = routeData.coordinates[midIdx];
        const nearRoute = allChargers.filter(c => c.status === "available").map(c => {
          const d = haversine(mid[1], mid[0], c.location.lat, c.location.lng);
          return { ...c, distanceKm: Math.round(d * 10) / 10 };
        }).sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)).slice(0, 3);
        setChargingStops(nearRoute);
      }
    } catch (e) { console.error(e); }
    setIsCalc(false);
  }, [origin, destination, selectedEV, allChargers, batteryPercent, acOn]);

  if (authLoading || !user) return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}><Zap size={32} className="text-ev-primary animate-pulse" /></div>;

  const verdictColor = !result ? "#8BA0B4" : result.canComplete ? (result.remainingPercent > 20 ? "#00FF88" : "#F59E0B") : "#EF4444";
  const verdictBg = !result ? "transparent" : result.canComplete ? (result.remainingPercent > 20 ? "rgba(0,255,136,0.08)" : "rgba(245,158,11,0.08)") : "rgba(239,68,68,0.08)";

  return (
    <div className="flex min-h-screen">
      <Sidebar role="user" />
      <div className="flex-1 ml-[260px] flex flex-col">
        <TopBar title="Journey Planner" />
        <main className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-[400px] min-w-[400px] flex flex-col overflow-y-auto border-r p-5 space-y-4" style={{ borderColor: "rgba(26,47,74,0.5)" }}>

            {/* Battery + Vehicle */}
            <div className="glass glass-active rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Battery size={18} className="text-ev-primary" />
                  <span className="font-display font-bold text-sm text-white">{EV_LIVE_DATA.vehicleName}</span>
                </div>
                <span className="font-mono font-bold text-2xl text-ev-primary glow-text-green">{batteryPercent}%</span>
              </div>
              <input type="range" min={5} max={100} value={batteryPercent} onChange={e => setBatteryPercent(Number(e.target.value))} className="w-full h-[6px] rounded-full" style={{ background: `linear-gradient(to right, ${batteryPercent > 50 ? "#00FF88" : batteryPercent > 20 ? "#F59E0B" : "#EF4444"} ${batteryPercent}%, #1A2F4A ${batteryPercent}%)` }} />
              <div className="flex items-center justify-between mt-2">
                <p className="text-text-secondary text-[10px] font-mono">{Math.round(batteryPercent / 100 * selectedEV.fullRangeKm)} km range</p>
                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-text-secondary">
                  <div className="relative w-8 h-4 rounded-full" style={{ background: acOn ? "#00FF88" : "var(--bg-border)" }} onClick={() => setAcOn(!acOn)}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{ transform: acOn ? "translateX(16px)" : "translateX(2px)" }} />
                  </div>
                  AC {acOn ? "On" : "Off"}
                </label>
              </div>
            </div>

            {/* Route Inputs */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="font-display font-bold text-sm text-white">Plan Your Route</h3>
              <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-ev-primary" /><input className="input-glass !pl-8 text-sm" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} /></div>
              {stops.map((s, i) => (
                <div key={i} className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-ev-warning" /><input className="input-glass !pl-8 !pr-9 text-sm" placeholder={`Stop ${i + 1}`} value={s} onChange={e => { const n = [...stops]; n[i] = e.target.value; setStops(n); }} /><button className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setStops(stops.filter((_, j) => j !== i))}><X size={14} className="text-text-secondary" /></button></div>
              ))}
              {stops.length < 3 && <button className="text-text-secondary text-xs flex items-center gap-1 hover:text-ev-primary transition-colors cursor-pointer" onClick={() => setStops([...stops, ""])}><Plus size={12} /> Add Stop</button>}
              <div className="relative"><div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-ev-danger" /><input className="input-glass !pl-8 text-sm" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} /></div>
              <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2" onClick={handlePlan} disabled={isCalc}>
                {isCalc ? <><div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> Planning...</> : <><Zap size={16} /> Plan Journey</>}
              </button>
            </div>

            {/* RESULTS */}
            {result && (
              <div className="space-y-4" style={{ animation: "slide-up 0.4s var(--spring)" }}>
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass rounded-xl p-2.5 text-center"><p className="font-mono text-sm text-text-primary">{routeDistance.toFixed(1)} km</p><p className="text-text-secondary text-[9px]">Distance</p></div>
                  <div className="glass rounded-xl p-2.5 text-center"><p className="font-mono text-sm text-ev-secondary">{routeTime} min</p><p className="text-text-secondary text-[9px]">Est. Time</p></div>
                  <div className="glass rounded-xl p-2.5 text-center"><p className="font-mono text-sm" style={{ color: verdictColor }}>{Math.round(100 - result.remainingPercent)}%</p><p className="text-text-secondary text-[9px]">Battery Used</p></div>
                </div>

                <div className="glass rounded-2xl p-5 text-center" style={{ background: verdictBg, borderColor: `${verdictColor}30` }}>
                  <BatteryGauge percentage={result.remainingPercent} size={80} />
                  {result.canComplete ? (
                    <div className="mt-2">
                      <p className="font-display font-extrabold text-lg" style={{ color: verdictColor }}>{result.remainingPercent > 20 ? "✓ You'll make it!" : "⚠ Tight — top-up recommended"}</p>
                      <p className="font-mono text-xs text-text-secondary mt-1">{result.remainingPercent}% remaining at destination</p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="font-display font-extrabold text-lg text-ev-danger">✗ Battery Insufficient</p>
                      <p className="font-mono text-xs text-ev-warning mt-1">Need {result.chargingNeededKwh.toFixed(1)} kWh more</p>
                    </div>
                  )}
                  <p className="text-text-secondary text-[10px] mt-2 italic flex items-center justify-center gap-1"><Cloud size={10} /> {result.weatherNote}</p>
                </div>

                {chargingStops.length > 0 && (
                  <div>
                    <h3 className="font-display font-bold text-white text-sm mb-2">Recommended Stops</h3>
                    <div className="space-y-2">
                      {chargingStops.map((cs, i) => {
                        const cost = Math.round(((20/100)*selectedEV.batteryCapacityKwh)*cs.pricePerUnit);
                        const timeMin = Math.round(((20/100)*selectedEV.batteryCapacityKwh)/cs.powerKW*60);
                        return (
                          <div key={cs.id} className="glass rounded-xl p-3" style={{ animation: `slide-up 0.3s var(--spring) ${i*0.1}s both` }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>{i+1}</span>
                              <span className="text-text-secondary text-[10px]">{cs.distanceKm} km along route</span>
                            </div>
                            <p className="font-display font-bold text-xs text-text-primary">{cs.ownerName}</p>
                            <p className="text-text-secondary text-[10px]">{cs.connectorType} · {cs.powerKW}kW · ₹{cs.pricePerUnit}/kWh</p>
                            <p className="text-ev-primary text-[10px] font-mono mt-0.5">₹{cost} · ~{timeMin} min for 20%</p>
                            <button className="btn-primary text-[10px] py-1.5 px-3 mt-2 flex items-center gap-1" onClick={() => setBookingCharger(cs)}>Book <ChevronRight size={10} /></button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <MapView chargers={chargingStops.length > 0 ? chargingStops : allChargers.slice(0, 50)} onChargerClick={setBookingCharger} routeGeoJSON={routeGeoJSON} />
            {weather && (
              <div className="absolute bottom-4 left-4 z-10 glass px-3 py-2 rounded-xl flex items-center gap-2">
                <span className="text-xl">{getWeatherIcon(weather.weatherCode)}</span>
                <div><p className="font-mono text-xs text-text-primary font-bold">{weather.temperature}°C</p><p className="text-text-secondary text-[9px]">{weather.description}</p></div>
              </div>
            )}
          </div>
        </main>
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
