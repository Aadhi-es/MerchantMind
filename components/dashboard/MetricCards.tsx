"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, ShoppingCart, Sparkles, CheckCircle2 } from "lucide-react";

interface MetricCardsProps {
  totalRevenue: number; // in paise
  totalConversations: number;
  upsellRevenue: number; // in paise
  conversionRate: number; // percentage
}

export function MetricCards({
  totalRevenue,
  totalConversations,
  upsellRevenue,
  conversionRate,
}: MetricCardsProps) {
  const cards = [
    {
      title: "Revenue Today",
      value: `₹${(totalRevenue / 100).toLocaleString("en-IN")}`,
      delta: "+14.2% vs baseline",
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: "Agent Conversations",
      value: totalConversations.toString(),
      delta: "18 sales converted",
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      title: "Incremental Upsell",
      value: `₹${(upsellRevenue / 100).toLocaleString("en-IN")}`,
      delta: "From 12 bounded upgrades",
      isPositive: true,
      icon: Sparkles,
    },
    {
      title: "Checkout Conversion",
      value: `${conversionRate.toFixed(1)}%`,
      delta: "+31% higher than web forms",
      isPositive: true,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <GlassCard key={idx} className="p-4 border-white/[0.07]">
            <div className="flex items-center justify-between text-text-secondary text-xs">
              <span>{c.title}</span>
              <Icon className="w-4 h-4 text-gold/80" />
            </div>
            <div className="font-heading text-2xl font-bold text-text-primary mt-2">
              {c.value}
            </div>
            <div className="text-[11px] font-mono text-status-success mt-1">
              {c.delta}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
