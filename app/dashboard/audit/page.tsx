"use client";

import React, { useEffect, useState } from "react";
import { AuditLogEntry, MerchantGuardrails } from "@/types/audit";
import { DEFAULT_GUARDRAILS } from "@/lib/guardrails";
import {
  ShieldCheck,
  RefreshCw,
  Filter,
  Terminal,
  ChevronDown,
  ChevronRight,
  Bot,
  User,
  CheckCircle2,
  Lock,
  FileCheck,
} from "lucide-react";
import { clsx } from "clsx";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/audit?limit=50");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "upsell") return log.action_type.includes("upsell");
    if (filter === "agent") return log.agent_type === "agent";
    if (filter === "checkout") return log.action_type.includes("checkout") || log.action_type.includes("payment");
    if (filter === "failure") return log.action_type.includes("failed");
    return true;
  });

  return (
    <div className="w-full px-6 py-6 flex flex-col gap-6">
      {/* Forensic Navigation & Telemetry State Bar (from Stitch) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-3">
        <nav className="flex items-center gap-2 font-mono text-xs text-stone-600">
          <span className="text-stone-400">MerchantMind</span>
          <span className="text-stone-300">/</span>
          <span>Audit Log</span>
          <span className="text-stone-300">/</span>
          <span className="text-primary font-semibold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            Deterministic Flight Recorder
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
            <span className="font-mono text-[11px] text-stone-700 font-semibold uppercase tracking-wider">
              RECORDING SEALED
            </span>
            <span className="font-mono text-[11px] text-stone-400">SHA-256::e3b0c442</span>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            className="px-3 py-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-label text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Forensic Flight Recorder Header Card (from Stitch) */}
      <section className="relative rounded-lg bg-white p-6 shadow-sm border border-stone-200 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-headline text-2xl font-bold text-stone-900 tracking-tight">
                Forensic Decision Log &amp; Explainer
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-medium uppercase tracking-wider">
                Store ID: sportsfit-in-delhi
              </span>
              <span className="flex items-center gap-1 font-label text-xs font-semibold text-primary bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                <Lock className="w-3 h-3" /> Append-Only RLS Policy
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-stone-500">
              <span>Channel: Web Chat (SDK v4.2)</span>
              <span className="text-stone-300">•</span>
              <span>Audit Level: Deterministic III</span>
              <span className="text-stone-300">•</span>
              <span>Database: Supabase PostgreSQL (Immutable)</span>
            </div>
          </div>

          {/* Standard criteria badge */}
          <div className="p-3.5 rounded bg-blue-50/60 border border-blue-200 text-xs text-primary font-medium max-w-sm">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>Track Verification Standard</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Every money action explainable, bounded and gated. Complete audit trail of mathematical bounding and payment outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-stone-400 font-mono flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {[
          { key: "all", label: "All Events" },
          { key: "upsell", label: "Upsell Bounding" },
          { key: "agent", label: "AI Buyer Telemetry" },
          { key: "checkout", label: "Razorpay Checkouts" },
          { key: "failure", label: "Failure Recovery" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={clsx(
              "px-3 py-1.5 rounded font-mono text-xs transition-all",
              filter === key
                ? "bg-primary text-white font-bold shadow-xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Grid: Timeline + Guardrail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Timeline (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
            {filteredLogs.map((log, index) => {
              const id = log.id || index;
              const isExpanded = expandedId === id;
              const time = new Date(log.created_at || Date.now()).toLocaleTimeString();

              return (
                <div key={id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-xs" />

                  <div
                    onClick={() => toggleExpand(id)}
                    className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm hover:border-primary/40 transition-all cursor-pointer space-y-2.5"
                  >
                    {/* Event Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {log.agent_type === "agent" ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-stone-500" />
                        )}
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                          {log.action_type.replace(/_/g, " ")}
                        </span>
                        {log.guardrail_check && (
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-mono font-semibold border",
                              log.guardrail_check.passed
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-red-50 text-red-800 border-red-200"
                            )}
                          >
                            {log.guardrail_check.passed ? "Guardrail: PASSED" : "Guardrail: BLOCKED"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
                        <span>{time}</span>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Summary text */}
                    <p className="text-xs text-stone-800 leading-relaxed font-body">
                      {log.action_details?.reasoning ||
                        log.action_details?.customer_message ||
                        JSON.stringify(log.action_details)}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-500 pt-1">
                      {log.conversation_id && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                          Conv: {log.conversation_id}
                        </span>
                      )}
                      {log.razorpay_ids?.order_id && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-primary border border-blue-200 font-semibold">
                          Order: {log.razorpay_ids.order_id}
                        </span>
                      )}
                      {log.revenue_impact !== undefined && log.revenue_impact !== 0 && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          Impact: ₹{(log.revenue_impact / 100).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Expandable Forensic JSON Payload */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-stone-200 mt-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Forensic Payload (Deterministic Audit State)</span>
                        </div>
                        <pre className="p-3 rounded bg-stone-900 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Policy & Bounding Rules (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-lg bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-headline text-base font-bold text-stone-900">Active Guardrail Bounds</h3>
              <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Enforced
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-700">Upsell Bounding Formula</span>
                  <span className="font-mono text-primary">30% Max</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  `Math.abs(P_upsell - P_base) / P_base &lt;= 0.30`. Prohibits predatory price inflation.
                </p>
              </div>

              <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-700">Single Transaction Ceiling</span>
                  <span className="font-mono text-stone-900">₹10,000</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Autonomous orders over this ceiling require manual merchant sign-off.
                </p>
              </div>

              <div className="p-3 rounded bg-stone-50 border border-stone-200 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-stone-700">Bundle Negotiation Floor</span>
                  <span className="font-mono text-stone-900">15% Max</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  AI buyer agents cannot negotiate discounts exceeding 15% under any circumstances.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
