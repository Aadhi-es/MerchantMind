"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface DataPoint {
  time: string;
  revenue: number;
}

export function RevenueChart() {
  const data: DataPoint[] = [
    { time: "09:00", revenue: 4200 },
    { time: "11:00", revenue: 12400 },
    { time: "13:00", revenue: 19800 },
    { time: "15:00", revenue: 26500 },
    { time: "17:00", revenue: 34200 },
    { time: "19:00", revenue: 41800 },
    { time: "21:00", revenue: 48900 },
  ];

  const maxRevenue = 55000;
  const width = 600;
  const height = 220;
  const padding = 40;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.revenue / maxRevenue) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <GlassCard className="p-5 border-white/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-sm font-bold text-text-primary">Hourly Revenue Velocity</h3>
          <p className="text-xs text-text-secondary">Combined conversational sales + AI buyer agent settlements</p>
        </div>
        <span className="text-xs font-mono text-gold px-2 py-0.5 rounded bg-gold-subtle border border-gold/30">
          Live (Razorpay)
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A853" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D4A853" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((factor, idx) => {
            const y = height - padding - factor * (height - padding * 2);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#555"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ₹{((maxRevenue * factor) / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#goldGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#D4A853" strokeWidth="2.5" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#0F0F0F" stroke="#D4A853" strokeWidth="2" />
              <text
                x={p.x}
                y={height - padding + 18}
                textAnchor="middle"
                fill="#888"
                fontSize="10"
                fontFamily="monospace"
              >
                {p.time}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </GlassCard>
  );
}
