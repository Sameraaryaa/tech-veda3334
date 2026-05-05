"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════
   RoutePlanner — Route input form with location + battery
   Will be fully implemented in Prompt 4
   ═══════════════════════════════════════════════════════════ */

interface RoutePlannerProps {
  onCalculateRoute?: (data: {
    start: string;
    destination: string;
    batteryPercent: number;
    evModel: string;
  }) => void;
}

export default function RoutePlanner({ onCalculateRoute }: RoutePlannerProps) {
  return (
    <div className="p-4">
      <h3 className="font-display font-bold text-ev-primary text-lg mb-4">
        Plan Your Route
      </h3>
      <p className="text-text-secondary text-sm">
        Route planner coming in Prompt 4...
      </p>
    </div>
  );
}
