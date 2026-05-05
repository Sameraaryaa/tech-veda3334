"use client";

import React from "react";
import { ChargerStatus } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════
   StatusBadge — Charger availability indicator
   ═══════════════════════════════════════════════════════════ */

interface StatusBadgeProps {
  status: ChargerStatus;
  showLabel?: boolean;
}

const STATUS_CONFIG: Record<
  ChargerStatus,
  { color: string; bg: string; label: string; dotColor: string }
> = {
  available: {
    color: "var(--color-primary)",
    bg: "rgba(0, 255, 136, 0.1)",
    label: "Available",
    dotColor: "#00FF88",
  },
  charging: {
    color: "var(--color-warning)",
    bg: "rgba(245, 158, 11, 0.1)",
    label: "Charging",
    dotColor: "#F59E0B",
  },
  booked: {
    color: "var(--color-danger)",
    bg: "rgba(239, 68, 68, 0.1)",
    label: "Booked",
    dotColor: "#EF4444",
  },
  offline: {
    color: "#4A5568",
    bg: "rgba(74, 85, 104, 0.1)",
    label: "Offline",
    dotColor: "#4A5568",
  },
};

export default function StatusBadge({
  status,
  showLabel = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{
        color: config.color,
        backgroundColor: config.bg,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: config.dotColor,
          boxShadow: status === "available" ? `0 0 6px ${config.dotColor}` : undefined,
          animation: status === "available" ? "pulse-glow 2s infinite" : undefined,
        }}
      />
      {showLabel && config.label}
    </span>
  );
}
