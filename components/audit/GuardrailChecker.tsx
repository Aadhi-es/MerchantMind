"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { MerchantGuardrails } from "@/types/audit";
import { ShieldCheck, Lock, DollarSign, Percent, Clock } from "lucide-react";

interface GuardrailCheckerProps {
  guardrails: MerchantGuardrails;
}

export function GuardrailChecker({ guardrails }: GuardrailCheckerProps) {
  return (
    <GlassCard className="p-5 border-white/[0.07] space-y-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-status-success" />
          <h3 className="font-heading text-sm font-bold text-text-primary">Enforced Safety Rails</h3>
        </div>
        <GlassBadge variant="success" size="sm">
          Active at DB Layer
        </GlassBadge>
      </div>

      <div className="space-y-3 text-xs">
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <DollarSign className="w-3.5 h-3.5 text-gold" />
            <span>Single Transaction Ceiling</span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            ₹{(guardrails.max_single_transaction / 100).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <Percent className="w-3.5 h-3.5 text-gold" />
            <span>Max Upsell Price Delta</span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            {guardrails.max_upsell_delta_percent}% Max
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <Percent className="w-3.5 h-3.5 text-gold" />
            <span>Max Negotiation Discount</span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            {guardrails.max_bundle_discount_percent}% Cap
          </span>
        </div>

        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-secondary">
            <Clock className="w-3.5 h-3.5 text-gold" />
            <span>Operating Window</span>
          </div>
          <span className="font-mono font-bold text-text-primary">
            {guardrails.operating_hours.start} – {guardrails.operating_hours.end} IST
          </span>
        </div>

        <div className="pt-2 border-t border-white/[0.04]">
          <span className="text-[11px] text-text-dim block mb-1.5">Strict Prohibited Categories:</span>
          <div className="flex flex-wrap gap-1.5">
            {guardrails.blocked_categories.map((cat, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-errorBg text-status-error border border-status-error/30"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
