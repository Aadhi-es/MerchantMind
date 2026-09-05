"use client";

import React from "react";
import { Product } from "@/types/product";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

interface UpsellCardProps {
  upsellData: {
    originalProduct: Product;
    upsellProduct: Product;
    priceDelta: number; // in paise
    deltaPercent: number;
    reason: string;
  };
  onAccept: (upgrade: Product, original: Product) => void;
  onDecline: () => void;
}

export function UpsellCard({ upsellData, onAccept, onDecline }: UpsellCardProps) {
  const { originalProduct, upsellProduct, priceDelta, deltaPercent, reason } = upsellData;

  return (
    <GlassCard variant="gold" className="p-3.5 my-3 border-gold/40 max-w-xl">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-gold/15 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Upgrade Opportunity</span>
        </div>
        <GlassBadge variant="success" size="sm">
          <ShieldCheck className="w-3 h-3" />
          Bounded (+{deltaPercent}% ≤ 30% cap)
        </GlassBadge>
      </div>

      <div className="flex items-center gap-3">
        {upsellProduct.images[0] && (
          <img
            src={upsellProduct.images[0]}
            alt={upsellProduct.name}
            className="w-16 h-16 rounded-lg object-cover bg-black/40 border border-white/[0.08]"
          />
        )}
        <div className="flex-1">
          <h4 className="text-xs font-medium text-text-primary">
            Upgrade to: <span className="font-semibold text-gold">{upsellProduct.name}</span>
          </h4>
          <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">{reason}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
            <span className="text-text-dim line-through">
              ₹{(originalProduct.price / 100).toLocaleString("en-IN")}
            </span>
            <span className="text-gold font-bold">
              ₹{(upsellProduct.price / 100).toLocaleString("en-IN")}
            </span>
            <span className="text-status-success font-semibold">
              (+₹{(priceDelta / 100).toLocaleString("en-IN")})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-gold/15">
        <GlassButton size="sm" variant="ghost" onClick={onDecline} className="text-[11px] py-1">
          Keep Original
        </GlassButton>
        <GlassButton
          size="sm"
          variant="primary"
          onClick={() => onAccept(upsellProduct, originalProduct)}
          className="text-[11px] py-1"
        >
          <ArrowUpRight className="w-3 h-3" />
          Upgrade for +₹{(priceDelta / 100).toLocaleString("en-IN")}
        </GlassButton>
      </div>
    </GlassCard>
  );
}
