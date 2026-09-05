"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  ShieldCheck,
  Sliders,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { usePersona } from "@/context/PersonaContext";

export function Sidebar() {
  const pathname = usePathname();
  const { details, persona } = usePersona();

  const links = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat Commerce", href: "/", icon: MessageSquare },
    { name: "Agent Monitor", href: "/agent-monitor", icon: Bot },
    { name: "Audit Trail", href: "/dashboard/audit", icon: ShieldCheck },
    { name: "Failure Recovery", href: "/failure-demo", icon: AlertTriangle },
    { name: "Guardrails & Rules", href: "/settings", icon: Sliders },
    { name: "Pitch Deck (2 Slides)", href: "/pitch", icon: Sparkles },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#fbfaf8] border-r border-stone-200/90 z-40 hidden md:flex flex-col justify-between py-5 px-3">
      <div className="flex flex-col gap-4">
        <div className="px-3 pt-1 flex items-center justify-between">
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
            Intelligence Suite
          </span>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-stone-200/70 text-stone-700 font-semibold uppercase">
            {details.badge}
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded transition-all font-label text-xs font-medium",
                  isActive
                    ? "bg-primary text-white font-semibold shadow-xs"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                <Icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-stone-500")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Telemetry Tile at Bottom */}
      <div className="flex flex-col gap-2 p-3 bg-white border border-stone-200/90 rounded shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-stone-500 uppercase tracking-wider">LATENCY</span>
          <span className="font-mono text-xs text-primary font-bold">42ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-stone-500 uppercase tracking-wider">DECISION RATE</span>
          <span className="font-mono text-xs text-stone-700 font-semibold">1.2k/min</span>
        </div>
      </div>
    </aside>
  );
}
