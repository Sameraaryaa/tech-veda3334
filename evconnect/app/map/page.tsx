"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import ChargerCard from "@/components/charger/ChargerCard";
import BatteryGauge from "@/components/route/BatteryGauge";
import BookingModal from "@/components/charger/BookingModal";
import EVAChat from "@/components/chat/EVAChat";
import NFCScanModal from "@/components/nfc/NFCScanModal";
import { Charger, BatteryResult, WeatherData, ConnectorType } from "@/lib/types";
import { MOCK_CHARGERS, EV_MODELS } from "@/lib/data/mockChargers";
import { predictBattery } from "@/lib/algorithms/battery";
import { getWeather, getWeatherIcon } from "@/lib/weather";
import { geocodeAddress, getRoute } from "@/lib/routing";
import { MapPin, Flag, Battery, Zap, Filter, MessageCircle, Play, Wifi, Cloud } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">⚡</div>
        <p className="font-display font-bold text-ev-primary">Loading map...</p>
      </div>
    </div>
  ),
});

type FilterType = "All" | ConnectorType | "Fast";
const FILTER_OPTIONS: FilterType[] = ["All", "Type 2", "CCS2", "CHAdeMO", "15A Socket", "Fast"];

export default function MapPage() {
  const [chargers, setChargers] = useState<Charger[]>(MOCK_CHARGERS);
  const [startInput, setStartInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [batteryPercent, setBatteryPercent] = useState(75);
  const [selectedEV, setSelectedEV] = useState(EV_MODELS[0]);
  const [acOn, setAcOn] = useState(true);
  const [batteryResult, setBatteryResult] = useState<BatteryResult | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<string | undefined>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [bookingCharger, setBookingCharger] = useState<Charger | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [nfcOpen, setNfcOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { getWeather(12.9716, 77.5946).then(setWeather); }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'd' || e.key === 'D') handleDemoMode();
      if (e.key === 'n' || e.key === 'N') setNfcOpen(true);
      if (e.key === 'e' || e.key === 'E') setIsChatOpen(true);
      if (e.key === 'Escape') { setIsChatOpen(false); setNfcOpen(false); setBookingCharger(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const filteredChargers = useMemo(() => {
    let result = chargers;
    if (activeFilter === "Fast") result = result.filter(c => c.powerKW >= 22);
    else if (activeFilter !== "All") result = result.filter(c => c.connectorType === activeFilter);
    return result;
  }, [chargers, activeFilter]);

  const handleCalculateRoute = useCallback(async () => {
    if (!startInput.trim() || !destInput.trim()) return;
    setIsCalculating(true);
    setBatteryResult(null);
    setRouteGeoJSON(undefined);
    try {
      const startCoords = await geocodeAddress(startInput);
      const endCoords = await geocodeAddress(destInput);
      if (!startCoords || !endCoords) { showToast("❌ Could not find locations"); setIsCalculating(false); return; }
      const routeData = await getRoute(startCoords, endCoords);
      const weatherData = await getWeather(startCoords[1], startCoords[0]);
      setWeather(weatherData);
      const result = predictBattery({ distanceKm: routeData.distanceKm, currentBatteryPercent: batteryPercent, fullRangeKm: selectedEV.fullRangeKm, temperatureCelsius: weatherData.temperature, isRaining: weatherData.isRaining, acOn });
      setBatteryResult(result);
      setRouteGeoJSON(routeData.geometry);
      if (!result.canComplete) {
        showToast("🔋 Battery insufficient — showing nearby chargers");
        const midIdx = Math.floor(routeData.coordinates.length / 2);
        const mid = routeData.coordinates[midIdx];
        const withDist = chargers.map(c => ({ ...c, distanceKm: Math.round(haversine(mid[1], mid[0], c.location.lat, c.location.lng) * 10) / 10 }));
        withDist.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
        setChargers(withDist);
      }
    } catch (err) { console.error(err); }
    setIsCalculating(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startInput, destInput, batteryPercent, selectedEV, acOn]);

  const handleDemoMode = useCallback(() => {
    setStartInput("Koramangala, Bangalore");
    setDestInput("Whitefield, Bangalore");
    setBatteryPercent(35);
    setSelectedEV(EV_MODELS[0]);
    showToast("▶ Demo Mode activated");
    setTimeout(() => document.getElementById("calculate-route-btn")?.click(), 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNFCCharger = (charger: Charger) => {
    showToast("⚡ NFC Charger Detected!");
    setBookingCharger(charger);
  };

  const availableCount = filteredChargers.filter(c => c.status === "available").length;

  // Battery slider gradient
  const batteryGradient = batteryPercent > 50
    ? `linear-gradient(to right, #00FF88 ${batteryPercent}%, #1A2F4A ${batteryPercent}%)`
    : batteryPercent > 20
    ? `linear-gradient(to right, #F59E0B ${batteryPercent}%, #1A2F4A ${batteryPercent}%)`
    : `linear-gradient(to right, #EF4444 ${batteryPercent}%, #1A2F4A ${batteryPercent}%)`;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar activePath="/map" onNFCClick={() => setNfcOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL */}
        <div className="w-full md:w-[380px] md:min-w-[380px] flex flex-col overflow-y-auto border-r" style={{ background: "rgba(5,10,20,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(26,47,74,0.5)" }}>
          
          {/* ROUTE PLANNER */}
          <div className="p-4">
            <div className="glass p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-ev-primary text-base flex items-center gap-2"><MapPin size={16} /> Route Planner</h2>
                <span className="pill pill-warning text-[9px]">BETA</span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-primary" />
                  <input className="input-glass !pl-10" placeholder="Starting point" value={startInput} onChange={e => setStartInput(e.target.value)} id="route-start-input" />
                </div>
                <div className="relative">
                  <Flag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-secondary" />
                  <input className="input-glass !pl-10" placeholder="Destination" value={destInput} onChange={e => setDestInput(e.target.value)} id="route-dest-input" />
                </div>
              </div>

              {/* Battery Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-secondary text-xs flex items-center gap-1"><Battery size={14} /> Battery Level</span>
                  <span className="font-mono font-bold text-xl text-ev-primary glow-text-green">{batteryPercent}%</span>
                </div>
                <input type="range" min={0} max={100} value={batteryPercent} onChange={e => setBatteryPercent(Number(e.target.value))} className="w-full h-[6px] rounded-full" style={{ background: batteryGradient }} id="battery-slider" />
                <div className="flex justify-between mt-1 text-text-secondary text-[10px] font-mono"><span>0%</span><span>50%</span><span>100%</span></div>
              </div>

              {/* EV Model */}
              <div className="mb-3">
                <label className="text-text-secondary text-xs mb-1 block">EV Model</label>
                <select className="input-glass text-sm" value={selectedEV.name} onChange={e => { const m = EV_MODELS.find(x => x.name === e.target.value); if (m) setSelectedEV(m); }} id="ev-model-select">
                  {EV_MODELS.map(m => <option key={m.name} value={m.name}>{m.name} ({m.batteryCapacityKwh}kWh, {m.fullRangeKm}km)</option>)}
                </select>
              </div>

              {/* AC Toggle */}
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <div className="relative w-10 h-6 rounded-full transition-colors" style={{ background: acOn ? "#00FF88" : "var(--bg-border)" }} onClick={() => setAcOn(!acOn)}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" style={{ transform: acOn ? "translateX(20px)" : "translateX(4px)" }} />
                </div>
                <span className="text-text-secondary text-xs">AC On <span className="text-text-secondary text-[10px]">(affects range)</span></span>
              </label>

              <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2" onClick={handleCalculateRoute} disabled={isCalculating} id="calculate-route-btn">
                {isCalculating ? <><div className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full animate-spin" /> Calculating...</> : <><Zap size={16} /> Calculate Route</>}
              </button>
            </div>
          </div>

          {/* BATTERY RESULT */}
          {batteryResult && (
            <div className="px-4 pb-3">
              <div className="glass glass-active p-5 rounded-2xl text-center" style={{ animation: "slide-up 0.4s var(--spring)" }}>
                <BatteryGauge percentage={batteryResult.remainingPercent} size={120} />
                <div className="mt-3">
                  {batteryResult.canComplete
                    ? <p className="font-display font-extrabold text-lg text-ev-primary glow-text-green">✓ You&apos;ll Reach</p>
                    : <p className="font-display font-extrabold text-lg text-ev-danger">✗ Battery Insufficient</p>}
                  <p className="text-text-secondary text-xs mt-2 italic"><Cloud size={12} className="inline mr-1" />{batteryResult.weatherNote}</p>
                  {!batteryResult.canComplete && (
                    <div className="glass mt-3 p-3 rounded-xl text-sm" style={{ borderColor: "rgba(245,158,11,0.3)" }}>
                      <span className="text-ev-warning font-mono">Need {batteryResult.chargingNeededKwh.toFixed(1)} kWh more</span>
                      <p className="text-ev-primary text-xs mt-1 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-ev-primary animate-pulse" /> Showing chargers along route
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FILTERS */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <Filter size={14} className="text-text-secondary mt-2 flex-shrink-0" />
            {FILTER_OPTIONS.map(f => (
              <button key={f} className={`pill flex-shrink-0 cursor-pointer transition-all ${activeFilter === f ? "glass-active" : ""}`}
                style={activeFilter === f ? { background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.4)", color: "#00FF88" } : { border: "1px solid rgba(26,47,74,0.8)", color: "#8BA0B4" }}
                onClick={() => setActiveFilter(f)}>{f === "Fast" ? "⚡ Fast" : f}</button>
            ))}
          </div>

          {/* CHARGER LIST */}
          <div className="px-4 pt-2 pb-1">
            <h3 className="text-text-secondary text-xs font-medium uppercase tracking-wide">Available Nearby ({availableCount})</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {filteredChargers.length === 0 ? (
              <div className="text-center py-12"><div className="text-4xl mb-3">🔌</div><p className="text-text-secondary text-sm">No chargers found.</p></div>
            ) : filteredChargers.map(c => (
              <ChargerCard key={c.id} charger={c} onBookClick={setBookingCharger} onCardClick={setBookingCharger} />
            ))}
          </div>
        </div>

        {/* MAP */}
        <div className="hidden md:flex flex-1 relative">
          <MapView chargers={filteredChargers} onChargerClick={setBookingCharger} routeGeoJSON={routeGeoJSON} />

          {/* Demo Mode */}
          <button className="absolute top-4 right-4 z-10 glass px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:border-ev-primary" style={{ color: "#8BA0B4" }} onClick={handleDemoMode} id="demo-mode-btn">
            <Play size={12} /> Demo Mode
          </button>

          {/* Weather */}
          {weather && (
            <div className="absolute bottom-4 left-4 z-10 glass px-4 py-3 rounded-xl flex items-center gap-3">
              <span className="text-2xl">{getWeatherIcon(weather.weatherCode)}</span>
              <div>
                <p className="font-mono text-sm text-text-primary font-bold">{weather.temperature}°C</p>
                <p className="text-text-secondary text-[10px]">{weather.description}{weather.isRaining ? " • 🌧 Rain" : ""}</p>
              </div>
            </div>
          )}

          {/* NFC FAB */}
          <button className="absolute bottom-[88px] right-4 z-10 w-12 h-12 rounded-full glass flex items-center justify-center cursor-pointer transition-all hover:glow-green" style={{ borderColor: "rgba(0,255,136,0.3)" }} onClick={() => setNfcOpen(true)} title="Tap to Charge">
            <Wifi size={20} className="text-ev-primary" />
          </button>

          {/* EVA FAB */}
          <button className="absolute bottom-4 right-4 z-10 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", boxShadow: "0 0 30px rgba(0,255,136,0.4)", animation: "pulse-glow 3s infinite" }} onClick={() => setIsChatOpen(true)} id="eva-chat-btn">
            <MessageCircle size={24} className="text-bg-primary" />
          </button>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] glass px-6 py-3 rounded-xl text-sm text-text-primary flex items-center gap-2" style={{ animation: "slide-up 0.3s var(--spring)", borderColor: "rgba(0,255,136,0.3)" }}>
          {toast}
        </div>
      )}

      {/* MODALS */}
      {bookingCharger && <BookingModal charger={bookingCharger} isOpen={!!bookingCharger} onClose={() => setBookingCharger(null)} currentBatteryPercent={batteryPercent} />}
      <EVAChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <NFCScanModal isOpen={nfcOpen} onClose={() => setNfcOpen(false)} onChargerDetected={handleNFCCharger} />
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = ((lat2 - lat1) * Math.PI) / 180; const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
