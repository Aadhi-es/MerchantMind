"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { AuditLogEntry } from "@/types/audit";
import { CheckCircle2, AlertTriangle, Sparkles, Bot, ShoppingCart, ArrowUpRight } from "lucide-react";

interface ActivityFeedProps {
  logs: AuditLogEntry[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  const getActionMeta = (entry: AuditLogEntry) => {
    switch (entry.action_type) {
      case "order_confirmed":
      case "payment_confirmed":
        return {
          icon: CheckCircle2,
          color: "text-status-success",
          badge: <GlassBadge variant="success">Confirmed ✓</GlassBadge>,
          title: `Payment Captured • ₹${((entry.revenue_impact || 0) / 100).toLocaleString("en-IN")}`,
        };
      case "upsell_offered":
      case "upsell_accepted":
      case "upsell_evaluated":
        return {
          icon: Sparkles,
          color: "text-gold",
          badge: <GlassBadge variant="gold">Upsell</GlassBadge>,
          title: `Smart Upgrade Evaluated (+${entry.action_details?.delta_percent || 14.3}%)`,
        };
      case "payment_failed":
        return {
          icon: AlertTriangle,
          color: "text-status-error",
          badge: <GlassBadge variant="error">Gateway Timeout</GlassBadge>,
          title: "Payment Failed • Non-Panic Recovery Link Sent",
        };
      case "agent_checkout":
      case "agent_query_received":
        return {
          icon: Bot,
          color: "text-gold",
          badge: <GlassBadge variant="gold">AI Buyer</GlassBadge>,
          title: `Autonomous AI Buyer Protocol (${entry.action_details?.authorization_protocol?.toUpperCase() || "AP2"})`,
        };
      default:
        return {
          icon: ShoppingCart,
          color: "text-text-secondary",
          badge: <GlassBadge variant="neutral">Action</GlassBadge>,
          title: entry.action_type.replace(/_/g, " "),
        };
    }
  };

  return (
    <GlassCard className="p-5 border-white/[0.07] h-full flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div>
          <h3 className="font-heading text-sm font-bold text-text-primary">Live Activity Stream</h3>
          <p className="text-xs text-text-secondary">Chronological decision & settlement telemetry</p>
        </div>
        <span className="text-[10px] font-mono text-text-dim">Auto-Syncing</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
        {logs.length === 0 ? (
          <div className="text-center text-xs text-text-dim py-8">No recorded activity yet.</div>
        ) : (
          logs.map((log, idx) => {
            const meta = getActionMeta(log);
            const Icon = meta.icon;
            const time = new Date(log.created_at || Date.now()).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] flex items-start gap-3 transition-colors"
              >
                <div className={`p-1.5 rounded-md bg-black/40 border border-white/[0.06] ${meta.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {meta.title}
                    </span>
                    <span className="text-[10px] font-mono text-text-dim whitespace-nowrap">
                      {time}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-secondary line-clamp-1 mt-0.5">
                    {log.action_details?.reasoning ||
                      log.action_details?.customer_message ||
                      JSON.stringify(log.action_details)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {meta.badge}
                    {log.razorpay_ids?.order_id && (
                      <span className="text-[10px] font-mono text-text-dim">
                        {log.razorpay_ids.order_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
