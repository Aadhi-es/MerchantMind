"use client";

import React, { useState } from "react";
import { AuditLogEntry } from "@/types/audit";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ChevronDown, ChevronRight, ShieldCheck, Terminal, Bot, User } from "lucide-react";

interface AuditTimelineProps {
  logs: AuditLogEntry[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getActionColor = (action: string) => {
    if (action.includes("failed")) return "bg-status-error border-status-error";
    if (action.includes("confirmed") || action.includes("accepted")) return "bg-status-success border-status-success";
    if (action.includes("upsell") || action.includes("agent")) return "bg-gold border-gold";
    return "bg-white/40 border-white/60";
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/[0.08]">
      {logs.map((log, index) => {
        const id = log.id || index;
        const isExpanded = expandedId === id;
        const dotColor = getActionColor(log.action_type);
        const time = new Date(log.created_at || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        return (
          <div key={id} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 top-3.5 w-2.5 h-2.5 rounded-full border ${dotColor} shadow-[0_0_8px_currentColor]`}
            />

            <GlassCard
              interactive
              onClick={() => toggleExpand(id)}
              className="p-4 border-white/[0.07] hover:border-gold/30 transition-all"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {log.agent_type === "agent" ? (
                    <Bot className="w-3.5 h-3.5 text-gold" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-text-secondary" />
                  )}
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-gold">
                    {log.action_type.replace(/_/g, " ")}
                  </span>
                  {log.guardrail_check && (
                    <GlassBadge
                      variant={log.guardrail_check.passed ? "success" : "error"}
                      size="sm"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {log.guardrail_check.passed ? "Guardrail: PASSED" : "Guardrail: BLOCKED"}
                    </GlassBadge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim">
                  <span>{time}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-text-secondary" />
                  )}
                </div>
              </div>

              {/* Main summary */}
              <p className="text-xs text-text-primary mt-2 leading-relaxed">
                {log.action_details?.reasoning ||
                  log.action_details?.customer_message ||
                  log.action_details?.details ||
                  JSON.stringify(log.action_details)}
              </p>

              {/* Collapsed quick pill tags */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] font-mono text-text-secondary">
                {log.conversation_id && (
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05]">
                    Conv: {log.conversation_id}
                  </span>
                )}
                {log.razorpay_ids?.order_id && (
                  <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-gold">
                    Order: {log.razorpay_ids.order_id}
                  </span>
                )}
                {log.revenue_impact !== undefined && log.revenue_impact !== 0 && (
                  <span className="px-2 py-0.5 rounded bg-status-successBg text-status-success border border-status-success/30">
                    Revenue: {log.revenue_impact > 0 ? "+" : ""}₹
                    {(log.revenue_impact / 100).toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Expandable Forensic Reasoning */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Forensic Reasoning Payload</span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/60 border border-white/[0.08] overflow-x-auto text-[11px] font-mono text-text-secondary leading-relaxed">
                    <pre className="text-xs text-emerald-400/90 whitespace-pre-wrap font-mono">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}
