"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ShieldCheck, Cpu, Zap, Globe } from "lucide-react";

export function ProtocolStatus() {
  const protocols = [
    {
      name: "AP2 Protocol",
      alliance: "Google Coalition",
      layer: "Cryptographic Mandate Signing & Trust",
      status: "Active & Verified",
      badgeVariant: "success" as const,
      icon: ShieldCheck,
      details: "Validates buyer-agent cryptographic authority tokens before debit execution.",
    },
    {
      name: "ACP Protocol",
      alliance: "Google DeepMind + Fintech Standards",
      layer: "Agent Checkout & Catalog Discovery",
      status: "Active & Live",
      badgeVariant: "success" as const,
      icon: Cpu,
      details: "Standardizes intent-to-checkout sessions and machine-readable cart negotiation.",
    },
    {
      name: "NPCI UAP",
      alliance: "NPCI / UPI Circle",
      layer: "UPI Agent Reserve Pay & Auto-Debit",
      status: "Pilot Ready (Sept 2026)",
      badgeVariant: "gold" as const,
      icon: Zap,
      details: "Enables autonomous UPI debits within pre-set reserve pools without per-action OTP.",
    },
    {
      name: "x402 Protocol",
      alliance: "Coinbase / IETF HTTP 402",
      layer: "Machine-to-Machine Settlement",
      status: "Standby",
      badgeVariant: "neutral" as const,
      icon: Globe,
      details: "Native HTTP status code 402 micro-settlement for autonomous machine commerce.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {protocols.map((p, idx) => {
        const Icon = p.icon;
        return (
          <GlassCard key={idx} className="p-4 border-white/[0.07] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
                  <Icon className="w-4 h-4 text-gold" />
                  <span>{p.name}</span>
                </div>
                <GlassBadge variant={p.badgeVariant} size="sm">
                  {p.status}
                </GlassBadge>
              </div>

              <div className="text-[11px] font-mono text-gold mb-1">{p.alliance}</div>
              <div className="text-xs font-medium text-text-secondary mb-2">{p.layer}</div>
              <p className="text-[11px] text-text-dim leading-relaxed">{p.details}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-text-dim">
              <span>Endpoint Ready</span>
              <span className="text-status-success font-semibold">200 OK</span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
