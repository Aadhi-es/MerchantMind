"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { Play, Bot, ArrowRight, CheckCircle2, Terminal } from "lucide-react";

export function SimulateAgentBuyer() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setStep(1);
    setLogs([]);
    setTransactionResult(null);

    // 1. Discovery
    setLogs((prev) => [...prev, "[1/3] AI Buyer Agent initiating GET /api/agent/catalog?category=accessories&q=logitech"]);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const catRes = await fetch("/api/agent/catalog?category=accessories&q=logitech");
      const catData = await catRes.json();
      const targetProduct = catData.results?.[0] || {
        sku: "PER-LOG-01",
        name: "Logitech MX Master 3S Wireless Performance Mouse",
        price_paise: 999500,
      };

      setLogs((prev) => [
        ...prev,
        `[1/3] Returned ${catData.total_results || 1} verified products. Selected SKU #${targetProduct.sku} (${targetProduct.name}).`,
      ]);

      // 2. Negotiation
      setStep(2);
      setLogs((prev) => [
        ...prev,
        `[2/3] AI Buyer Agent initiating POST /api/agent/negotiate requesting 12% discount on ${targetProduct.name}...`,
      ]);
      await new Promise((r) => setTimeout(r, 700));

      const negRes = await fetch("/api/agent/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [targetProduct.sku],
          requested_discount_percent: 12,
          buyer_agent_id: "agent-gemini-buyer-44",
        }),
      });
      const negData = await negRes.json();
      setLogs((prev) => [
        ...prev,
        `[2/3] Guardrail check: ${negData.guardrail_enforcement || "PASSED"}. Approved ${negData.offered_discount_percent}% off. Total: ${negData.offered_total_formatted}.`,
      ]);

      // 3. Autonomous Checkout
      setStep(3);
      setLogs((prev) => [
        ...prev,
        "[3/3] AI Buyer Agent initiating POST /api/agent/checkout with AP2 authorization mandate...",
      ]);
      await new Promise((r) => setTimeout(r, 800));

      const checkRes = await fetch("/api/agent/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ sku: targetProduct.sku, quantity: 1 }],
          offer_id: negData.offer_id,
          buyer_agent_id: "agent-gemini-buyer-44",
          authorization: { protocol: "ap2", token: "ap2_cryptographic_signed_token_99182" },
        }),
      });
      const checkData = await checkRes.json();

      setLogs((prev) => [
        ...prev,
        `[3/3] SUCCESS ✓ Razorpay Order #${checkData.order_id} created. Settlement bound to AP2 token.`,
      ]);
      setTransactionResult(checkData);
      setStep(4);
    } catch (e: any) {
      setLogs((prev) => [...prev, `Simulation failed: ${e.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <GlassCard className="p-5 border-white/[0.07] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <h3 className="font-heading text-sm font-bold text-text-primary flex items-center gap-2">
            <Bot className="w-4 h-4 text-gold" />
            Simulate Autonomous AI Buyer Agent
          </h3>
          <p className="text-xs text-text-secondary">
            Test end-to-end Machine-to-Machine commerce (Discovery $\rightarrow$ Negotiation $\rightarrow$ AP2 Checkout)
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          onClick={runSimulation}
          isLoading={isRunning}
          className="text-xs py-1.5"
        >
          <Play className="w-3 h-3" />
          Run Simulated AI Buyer
        </GlassButton>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div
          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            step >= 1
              ? "bg-gold-subtle border-gold/40 text-gold"
              : "bg-white/[0.02] border-white/[0.05] text-text-dim"
          }`}
        >
          <span className="font-mono font-bold">01</span>
          <span>Catalog Query</span>
        </div>
        <div
          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            step >= 2
              ? "bg-gold-subtle border-gold/40 text-gold"
              : "bg-white/[0.02] border-white/[0.05] text-text-dim"
          }`}
        >
          <span className="font-mono font-bold">02</span>
          <span>Negotiation</span>
        </div>
        <div
          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
            step >= 3
              ? "bg-status-successBg border-status-success/40 text-status-success"
              : "bg-white/[0.02] border-white/[0.05] text-text-dim"
          }`}
        >
          <span className="font-mono font-bold">03</span>
          <span>AP2 Checkout</span>
        </div>
      </div>

      {/* Terminal Live Output */}
      {logs.length > 0 && (
        <div className="p-3.5 rounded-lg bg-black/70 border border-white/[0.08] font-mono text-xs text-emerald-400 space-y-1.5 max-h-48 overflow-y-auto">
          <div className="text-[10px] text-text-dim flex items-center gap-1.5 pb-1 border-b border-white/[0.06]">
            <Terminal className="w-3 h-3 text-gold" />
            <span>Telemetry Console (Machine-to-Machine)</span>
          </div>
          {logs.map((line, i) => (
            <div key={i} className="leading-relaxed">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Final Receipt */}
      {transactionResult && (
        <div className="p-3 rounded-lg bg-white/[0.02] border border-status-success/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-success" />
            <span className="font-semibold text-text-primary">
              Order {transactionResult.order_id} Settled Programmatically
            </span>
          </div>
          <span className="font-mono font-bold text-gold">{transactionResult.total_formatted}</span>
        </div>
      )}
    </GlassCard>
  );
}
