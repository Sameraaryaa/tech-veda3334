"use client";

import React from "react";
import { Charger } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { Star, Zap, MapPin, ChevronRight } from "lucide-react";

interface ChargerCardProps {
  charger: Charger;
  onBookClick?: (charger: Charger) => void;
  onCardClick?: (charger: Charger) => void;
}

const CONNECTOR_COLORS: Record<string, string> = {
  "Type 2": "#0EA5E9",
  "CCS2": "#00FF88",
  "CHAdeMO": "#F59E0B",
  "15A Socket": "#8BA0B4",
};

export default function ChargerCard({ charger, onBookClick, onCardClick }: ChargerCardProps) {
  const connColor = CONNECTOR_COLORS[charger.connectorType] || "#8BA0B4";

  return (
    <div
      className="glass glass-hover p-4 cursor-pointer group"
      style={{ borderRadius: "14px" }}
      onClick={() => onCardClick?.(charger)}
    >
      {/* TOP ROW */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm" style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}>
          {charger.ownerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-[15px] text-text-primary leading-tight">{charger.ownerName}</h3>
          <p className="text-text-secondary text-xs truncate flex items-center gap-1 mt-0.5"><MapPin size={10} />{charger.location.address}, {charger.location.city}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.1)" }}>
          <Star size={12} className="text-ev-warning fill-ev-warning" />
          <span className="font-mono text-xs text-ev-warning font-bold">{charger.rating}</span>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="flex items-center gap-3 mb-3">
        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: `${connColor}18`, color: connColor, border: `1px solid ${connColor}30` }}>
          {charger.connectorType}
        </span>
        <span className="font-mono text-sm text-text-secondary flex items-center gap-1"><Zap size={12} />{charger.powerKW} kW</span>
        <span className="font-mono text-sm text-ev-primary font-bold">₹{charger.pricePerUnit}/kWh</span>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={charger.status} />
          {charger.distanceKm !== undefined && (
            <span className="text-text-secondary text-xs">{charger.distanceKm} km</span>
          )}
        </div>
        <button
          className="px-4 py-1.5 rounded-lg text-xs font-display font-bold flex items-center gap-1 transition-all"
          style={{ background: "linear-gradient(135deg, #00FF88, #00CC6A)", color: "#050A14" }}
          onClick={e => { e.stopPropagation(); onBookClick?.(charger); }}
        >
          Book Now <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
