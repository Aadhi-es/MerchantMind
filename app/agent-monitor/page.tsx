"use client";

import React, { useEffect, useState } from "react";
import { AuditLogEntry } from "@/types/audit";
import {
  Cpu,
  Zap,
  Globe,
  ShieldCheck,
  ExternalLink,
  Layers,
  Activity,
  ArrowRight,
  Terminal,
  Sparkles,
  Server,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { NegotiationArena } from "@/components/agent-monitor/NegotiationArena";

export default function AgentMonitorPage() {
  const [activeTab, setActiveTab] = useState<"arena" | "protocols" | "ledger">("arena");
  const [agentLogs, setAgentLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetch("/api/audit?limit=25")
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) {
          setAgentLogs(data.logs.filter((l: AuditLogEntry) => l.agent_type === "agent"));
        }
      })
      .catch(console.error);
  }, []);

  const protocols = [
    {
      name: "AP2 Protocol",
      alliance: "Google Coalition",
      layer: "Cryptographic Mandate Signing & Trust",
      status: "Active & Verified",
      icon: ShieldCheck,
      details: "Validates buyer-agent cryptographic authority tokens before debit execution.",
      endpoint: "/api/agent/checkout",
      latency: "42ms",
    },
    {
      name: "ACP Protocol",
      alliance: "Google DeepMind + Fintech Standards",
      layer: "Agent Checkout & Catalog Discovery",
      status: "Active & Live",
      icon: Cpu,
      details: "Standardizes intent-to-checkout sessions and machine-readable cart negotiation.",
      endpoint: "/api/agent/catalog",
      latency: "38ms",
    },
    {
      name: "NPCI UAP",
      alliance: "NPCI / UPI Circle",
      layer: "UPI Agent Reserve Pay & Auto-Debit",
      status: "Pilot Ready (Sept 2026)",
      icon: Zap,
      details: "Enables autonomous UPI debits within pre-set reserve pools without per-action OTP.",
      endpoint: "/api/agent/negotiate",
      latency: "55ms",
    },
    {
      name: "x402 Protocol",
      alliance: "Coinbase / IETF HTTP 402",
      layer: "Machine-to-Machine Settlement",
      status: "Standby",
      icon: Globe,
      details: "Native HTTP status code 402 micro-settlement for autonomous machine commerce.",
      endpoint: "/api/razorpay/create-order",
      latency: "61ms",
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 py-5 flex flex-col gap-5">
      {/* Top Header & Page Navigation Tabs */}
      <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-headline text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              Agentic Commerce Cockpit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-200 font-mono text-xs font-semibold">
              M2M Governance Rails
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Real-time autonomous machine-to-machine negotiation, protocol compliance verification, and cryptographic settlement on Razorpay test rails.
          </p>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex p-1 rounded-lg bg-stone-100 border border-stone-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("arena")}
            className={clsx(
              "px-3.5 py-2 text-xs font-label font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "arena"
                ? "bg-white text-primary shadow-xs border border-stone-200/60"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Live Negotiation Arena</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("protocols")}
            className={clsx(
              "px-3.5 py-2 text-xs font-label font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "protocols"
                ? "bg-white text-primary shadow-xs border border-stone-200/60"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Protocol Specs &amp; APIs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={clsx(
              "px-3.5 py-2 text-xs font-label font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === "ledger"
                ? "bg-white text-primary shadow-xs border border-stone-200/60"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span>M2M Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700 font-mono text-[10px]">
              {agentLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE NEGOTIATION ARENA (HERO INTERACTION) */}
      {activeTab === "arena" && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Sleek 1-Line Compact Protocol Ticker */}
          <div className="bg-stone-900 text-stone-200 px-4 py-2.5 rounded-lg border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono shadow-xs">
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>4 PROTOCOLS ONLINE</span>
              </div>
              <div className="flex items-center gap-1 text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>AP2 (Google)</span>
              </div>
              <div className="flex items-center gap-1 text-stone-300">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>ACP (DeepMind)</span>
              </div>
              <div className="flex items-center gap-1 text-stone-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>NPCI UAP (UPI)</span>
              </div>
              <div className="flex items-center gap-1 text-stone-400">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>x402 (HTTP M2M)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("protocols")}
              className="text-[11px] text-stone-400 hover:text-white flex items-center gap-1 transition-colors self-start md:self-auto cursor-pointer"
            >
              <span>View Full Protocol &amp; API Specs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Dual-Agent Arena Component */}
          <NegotiationArena />
        </div>
      )}

      {/* TAB 2: PROTOCOL ARCHITECTURE & REST APIS */}
      {activeTab === "protocols" && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Protocol Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Cryptographic Protocol Standards
              </h3>
              <span className="text-xs font-mono text-stone-500">Autonomous Compliance Stack</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {protocols.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 font-headline text-sm font-bold text-stone-900">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{p.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.status}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-primary font-semibold mb-1">
                        {p.alliance}
                      </div>
                      <div className="text-xs font-medium text-stone-700 mb-2">{p.layer}</div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">{p.details}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span className="truncate mr-2">{p.endpoint}</span>
                      <span className="text-emerald-700 font-bold shrink-0">{p.latency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine-to-Machine REST APIs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                Machine-to-Machine REST Endpoints
              </h3>
              <span className="text-xs font-mono text-stone-500">Programmatic Agent Interfaces</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full">
              <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">GET /api/agent/catalog</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-mono font-semibold">
                      ACP Discovery
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Returns machine-readable JSON catalog with structured attributes, prices in paise, availability, and negotiation endpoints.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-stone-900 text-stone-300 font-mono text-[11px] overflow-x-auto">
                  <code>curl -X GET http://localhost:3000/api/agent/catalog</code>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">POST /api/agent/negotiate</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-mono font-semibold">
                      Bounded Haggling
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Permits autonomous buyer agents to request volume or bundle discounts. Enforces merchant guardrail floor caps (max 15%).
                  </p>
                </div>
                <div className="p-2.5 rounded bg-stone-900 text-stone-300 font-mono text-[11px] overflow-x-auto">
                  <code>curl -X POST /api/agent/negotiate -d &apos;&#123;&quot;requested_discount&quot;:20&#125;&apos;</code>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">POST /api/agent/checkout</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-primary text-[10px] font-mono font-semibold">
                      AP2 Settlement
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Executes autonomous checkout with cryptographic authorization token verification and Razorpay order binding.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-stone-900 text-stone-300 font-mono text-[11px] overflow-x-auto">
                  <code>curl -X POST /api/agent/checkout -d &apos;&#123;&quot;token&quot;:&quot;ap2_sig...&quot;&#125;&apos;</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: M2M TRANSACTION LEDGER */}
      {activeTab === "ledger" && (
        <div className="w-full bg-white rounded-xl p-6 border border-stone-200 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Machine-to-Machine Transaction Ledger
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Live cryptographic events generated exclusively by autonomous AI Buyer Agents transacting with MerchantMind
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-stone-500">
                {agentLogs.length} Events Synced
              </span>
              <Link
                href="/dashboard/audit"
                className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-mono font-medium flex items-center gap-1 transition-colors"
              >
                <span>Full Audit Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="pb-2.5 font-normal">Timestamp</th>
                  <th className="pb-2.5 font-normal">Action Type</th>
                  <th className="pb-2.5 font-normal">Agent Identity</th>
                  <th className="pb-2.5 font-normal text-right">Settlement Impact</th>
                  <th className="pb-2.5 font-normal text-right">Guardrail Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {agentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-stone-400 font-sans">
                      <Server className="w-8 h-8 text-stone-300 mx-auto mb-2 stroke-1" />
                      <p className="font-medium text-stone-600">No machine-to-machine transactions yet.</p>
                      <p className="text-xs text-stone-400 mt-1">
                        Switch to the <strong className="text-primary cursor-pointer" onClick={() => setActiveTab("arena")}>Live Negotiation Arena</strong> tab to initiate autonomous agent trades.
                      </p>
                    </td>
                  </tr>
                ) : (
                  agentLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 text-stone-500">
                        {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="py-3 font-sans font-medium text-stone-900">
                        {log.action_type.replace(/_/g, " ")}
                      </td>
                      <td className="py-3 text-purple-700 font-semibold">
                        {log.customer_id}
                      </td>
                      <td className="py-3 text-right font-bold text-primary">
                        {log.revenue_impact ? `₹${(log.revenue_impact / 100).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {log.guardrail_check?.guardrail || "Passed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

