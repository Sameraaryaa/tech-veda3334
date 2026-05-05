"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════
   BatteryGauge — Circular SVG battery level indicator
   ═══════════════════════════════════════════════════════════ */

interface BatteryGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export default function BatteryGauge({
  percentage,
  size = 120,
  strokeWidth = 8,
}: BatteryGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on level
  const color =
    percentage > 40
      ? "var(--color-primary)"
      : percentage > 20
        ? "var(--color-warning)"
        : "var(--color-danger)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span
          className="font-mono font-bold text-2xl"
          style={{ color }}
        >
          {Math.round(percentage)}%
        </span>
        <span className="text-text-secondary text-[10px] mt-0.5">
          BATTERY
        </span>
      </div>
    </div>
  );
}
