"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, ChevronDown, User, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { usePersona, PERSONAS } from "@/context/PersonaContext";

export function Navbar() {
  const pathname = usePathname();
  const { persona, details, setPersona } = usePersona();

  const navItems = [
    { name: "Overview", href: "/dashboard" },
    { name: "Chat Commerce", href: "/" },
    { name: "Agent Monitor", href: "/agent-monitor" },
    { name: "Audit Trail", href: "/dashboard/audit" },
    { name: "Failure Recovery", href: "/failure-demo" },
    { name: "Guardrails & Settings", href: "/settings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
        {/* Brand & Editorial Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-headline font-bold text-lg shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-lg tracking-tight text-on-surface font-bold">
                  MerchantMind
                </span>
                <span className="text-[10px] tracking-widest uppercase font-mono px-1.5 py-0.2 rounded border border-stone-300 text-stone-500">
                  Editorial
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest font-label font-semibold text-secondary -mt-0.5">
                Curated Commerce Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden 2xl:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-3 py-1.5 rounded text-xs font-label font-medium tracking-wide transition-all",
                    isActive
                      ? "bg-primary-container text-primary font-semibold border border-primary/20 shadow-xs"
                      : "text-on-surface-variant hover:bg-stone-100 hover:text-on-surface"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Zero-Friction Persona Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-stone-100 border border-stone-200 shadow-inner">
          {(["shopper", "merchant", "agent"] as const).map((pKey) => {
            const p = PERSONAS[pKey];
            const isCurrent = persona === pKey;
            return (
              <button
                key={pKey}
                type="button"
                onClick={() => setPersona(pKey, true)}
                className={clsx(
                  "px-3 py-1 rounded-md text-xs font-label font-semibold transition-all flex items-center gap-1.5",
                  isCurrent
                    ? "bg-white text-stone-900 shadow-sm border border-stone-200/90 font-bold"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white/50"
                )}
                title={`Switch to ${p.badge}: ${p.title}`}
              >
                <span>{pKey === "shopper" ? "👤" : pKey === "merchant" ? "🏪" : "🤖"}</span>
                <span className="hidden sm:inline">{p.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Right Status & Persona Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-stone-50 border border-stone-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-mono text-[11px] text-stone-500 uppercase tracking-wider font-medium">
              Live Sync
            </span>
            <span className="font-mono text-[11px] text-primary font-semibold">99.98%</span>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-stone-50 border border-stone-200 shadow-2xs">
            <div
              className={clsx(
                "w-7 h-7 rounded flex items-center justify-center font-bold text-xs shadow-2xs border",
                persona === "shopper"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : persona === "agent"
                  ? "bg-purple-100 text-purple-800 border-purple-300 font-mono"
                  : "bg-blue-100 text-primary border-blue-300 font-headline"
              )}
            >
              {details.avatar}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-headline font-bold text-stone-900 leading-tight">
                {details.title}
              </span>
              <span className="text-[10px] font-mono text-stone-500 leading-none">
                {details.subtitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="flex xl:hidden overflow-x-auto border-t border-stone-200 px-4 py-2 gap-1 no-scrollbar bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "px-2.5 py-1 text-xs whitespace-nowrap rounded font-label",
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
