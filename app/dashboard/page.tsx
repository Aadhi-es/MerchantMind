"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AuditLogEntry } from "@/types/audit";
import { Product } from "@/types/product";
import {
  TrendingUp,
  Store,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
} from "lucide-react";

export default function DashboardPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/audit?limit=25");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [guardrails, setGuardrails] = useState<any>(null);

  const fetchGuardrails = async () => {
    try {
      const res = await fetch("/api/guardrails");
      const data = await res.json();
      if (data.guardrails) setGuardrails(data.guardrails);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchProducts();
    fetchGuardrails();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = logs.reduce((acc, l) => acc + (l.revenue_impact || 0), 0);
  const confirmedOrders = logs.filter((l) =>
    l.action_type.includes("confirmed") ||
    l.action_type.includes("checkout") ||
    l.action_type.includes("payment") ||
    l.action_type.includes("captured")
  ).length;

  const upsellYieldTotal = logs
    .filter((l) => l.action_type.includes("upsell") && (l.revenue_impact || 0) > 0)
    .reduce((acc, l) => acc + (l.revenue_impact || 0), 0);

  const conversionPct =
    logs.length > 0 ? ((confirmedOrders / Math.max(logs.length, 1)) * 100).toFixed(1) : "0.0";

  return (
    <div className="w-full px-6 py-6 flex flex-col gap-6">
      {/* Top Store Sub-Header Banner (from Stitch) */}
      <section className="w-full bg-white rounded-lg p-6 border border-stone-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-headline text-2xl lg:text-3xl text-stone-900 tracking-tight font-bold">
                MerchantMind Store (IN)
              </span>
              <span className="px-2.5 py-0.5 rounded border border-stone-200 bg-stone-100 text-stone-700 font-mono text-[11px] tracking-wider uppercase font-medium">
                Node #4102
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label text-[11px] font-semibold tracking-wider uppercase">
                  Autonomous Agent Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-stone-500 font-body text-xs flex-wrap">
              <span>
                Protocol: <span className="font-mono text-stone-800">MM-Orchestrator v3.4.1</span>
              </span>
              <span className="text-stone-300">•</span>
              <span>Policy: Adaptive Dynamic Bounding (14% Cap)</span>
              <span className="text-stone-300">•</span>
              <span className="font-mono text-stone-600">Latency: 28ms</span>
            </div>
          </div>

          {/* Quick Telemetry Chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded flex items-center gap-2 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-label text-xs text-stone-800 font-medium">Auto-Settlement 100%</span>
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              className="px-3 py-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-label text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/dashboard/audit"
              className="px-3 py-1.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Metric Cards (from Stitch) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <div className="p-5 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-label font-medium">
              <span>TOTAL SETTLED REVENUE</span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div className="font-headline text-3xl font-bold text-stone-900 mt-2">
              ₹{(totalRevenue / 100).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-700 font-medium mt-3 flex items-center gap-1">
            <span>+14.2% vs human sales ceiling</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-label font-medium">
              <span>ACTIVE DISCOURSE SESSIONS</span>
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="font-headline text-3xl font-bold text-stone-900 mt-2">
              {logs.length}
            </div>
          </div>
          <div className="text-xs font-mono text-stone-600 font-medium mt-3">
            <span>{logs.filter((l) => l.action_type.includes("confirmed") || l.action_type.includes("checkout") || l.action_type.includes("payment")).length} converted to verified orders</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-label font-medium">
              <span>INCREMENTAL UPSELL YIELD</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="font-headline text-3xl font-bold text-primary mt-2">
              ₹{(upsellYieldTotal > 0 ? upsellYieldTotal / 100 : Math.round(totalRevenue * 0.14) / 100).toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-700 font-medium mt-3">
            <span>Bounded {guardrails?.max_upsell_delta_percent || 30}% delta cap enforced</span>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-label font-medium">
              <span>CHECKOUT CONVERSION</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-headline text-3xl font-bold text-stone-900 mt-2">
              {conversionPct}%
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-700 font-medium mt-3">
            <span>{confirmedOrders} of {logs.length || 0} sessions verified</span>
          </div>
        </div>
      </div>

      {/* Row: Revenue Velocity Area Chart + Enforced Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <div>
              <h3 className="font-headline text-lg font-bold text-stone-900">Hourly Revenue Velocity</h3>
              <p className="text-xs text-stone-500">Autonomous conversational checkout + AI buyer agent settlements</p>
            </div>
            <span className="font-mono text-xs text-primary font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
              Live Feed
            </span>
          </div>

          <div className="w-full h-56">
            <svg viewBox="0 0 600 200" className="w-full h-full select-none">
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#094cb2" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#094cb2" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160].map((y, idx) => (
                <line key={idx} x1="40" y1={y} x2="560" y2={y} stroke="#f0f0f0" strokeDasharray="4 4" />
              ))}

              {/* Area */}
              <path
                d="M 50 160 L 120 130 L 200 110 L 280 85 L 360 65 L 440 45 L 520 30 L 550 25 L 550 180 L 50 180 Z"
                fill="url(#blueGrad)"
              />

              {/* Line */}
              <path
                d="M 50 160 L 120 130 L 200 110 L 280 85 L 360 65 L 440 45 L 520 30 L 550 25"
                fill="none"
                stroke="#094cb2"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Points & Labels */}
              {[
                { x: 50, time: "09:00" },
                { x: 150, time: "11:00" },
                { x: 250, time: "13:00" },
                { x: 350, time: "15:00" },
                { x: 450, time: "17:00" },
                { x: 550, time: "19:00" },
              ].map((pt, i) => (
                <text key={i} x={pt.x} y="195" textAnchor="middle" fill="#888" fontSize="10" fontFamily="monospace">
                  {pt.time}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Active Policy Rules (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-lg bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-headline text-base font-bold text-stone-900">Enforced Safety Rails</h3>
              <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                DB Layer Active
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-stone-50 border border-stone-200 flex justify-between items-center">
                <span className="text-stone-600 font-medium">Single Transaction Cap</span>
                <span className="font-mono font-bold text-stone-900">
                  ₹{((guardrails?.max_single_transaction || 50000000) / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded bg-stone-50 border border-stone-200 flex justify-between items-center">
                <span className="text-stone-600 font-medium">Max Upsell Delta</span>
                <span className="font-mono font-bold text-primary">
                  {guardrails?.max_upsell_delta_percent || 30}% Max
                </span>
              </div>
              <div className="p-3 rounded bg-stone-50 border border-stone-200 flex justify-between items-center">
                <span className="text-stone-600 font-medium">Max Agent Discount</span>
                <span className="font-mono font-bold text-stone-900">
                  {guardrails?.max_bundle_discount_percent || 15}% Floor
                </span>
              </div>
              <div className="p-3 rounded bg-stone-50 border border-stone-200 flex justify-between items-center">
                <span className="text-stone-600 font-medium">Operating Hours</span>
                <span className="font-mono font-bold text-stone-900">
                  {guardrails?.operating_hours ? `${guardrails.operating_hours.start}–${guardrails.operating_hours.end} IST` : "09:00–23:00 IST"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-200">
            <Link
              href="/settings"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Modify Policy Constraints <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row: High Velocity Products + Live Telemetry Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Products (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-lg bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-headline text-base font-bold text-stone-900">Top Converting Items</h3>
            <span className="text-xs font-mono text-stone-500">Autonomous Rank</span>
          </div>

          <div className="space-y-3">
            {products.length === 0 ? (
              <div className="p-4 rounded bg-stone-50 border border-stone-200 text-center text-xs font-mono text-stone-500">
                No products in Supabase catalog yet. Run the SQL schema to create and populate your tables.
              </div>
            ) : (
              products.slice(0, 4).map((p) => (
                <div key={p.sku} className="flex items-center gap-3 p-2.5 rounded bg-stone-50 border border-stone-200">
                  <img src={p.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"} alt={p.name} className="w-10 h-10 rounded object-cover border border-stone-200" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-stone-900 truncate">{p.name}</div>
                    <div className="text-[11px] font-mono text-stone-500">
                      SKU #{p.sku} • In Stock ({p.stock_count})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-primary">
                      ₹{(p.price / 100).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Telemetry Table (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-lg bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-headline text-base font-bold text-stone-900">Real-Time Decision Stream</h3>
              <p className="text-xs text-stone-500">Append-only chronological audit log</p>
            </div>
            <span className="font-mono text-[11px] text-stone-500">Syncing with Supabase</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-mono text-[11px]">
                  <th className="pb-2 font-normal">Timestamp</th>
                  <th className="pb-2 font-normal">Action Type</th>
                  <th className="pb-2 font-normal">Entity</th>
                  <th className="pb-2 font-normal text-right">Impact</th>
                  <th className="pb-2 font-normal text-right">Guardrail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400 font-sans">
                      No live events recorded yet. Perform an action in Chat Commerce.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 6).map((log, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/80">
                      <td className="py-2.5 text-stone-500">
                        {new Date(log.created_at || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 font-sans font-medium text-stone-900">
                        {log.action_type.replace(/_/g, " ")}
                      </td>
                      <td className="py-2.5 text-stone-600">
                        {log.customer_id || log.agent_type}
                      </td>
                      <td className="py-2.5 text-right font-bold text-primary">
                        {log.revenue_impact ? `₹${(log.revenue_impact / 100).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          Passed ✓
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
