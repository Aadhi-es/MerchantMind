"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Bot,
  User,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Server,
  FileCode,
  DollarSign,
  Flame,
  CreditCard,
  RefreshCw,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState<1 | 2>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation (Arrow Left & Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentSlide((prev) => (prev === 1 ? 2 : 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => (prev === 2 ? 1 : 2));
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between select-none font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Presentation Top HUD */}
      <header className="px-6 py-4 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-xs">
              M
            </div>
            <span className="font-headline text-lg font-bold text-white tracking-tight">
              MerchantMind
            </span>
          </Link>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700">
            Track 01: AI Growth &amp; Agentic Commerce
          </span>
        </div>

        {/* Slide Counter & Hotkey info */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
            <span className="text-stone-200 font-bold">Slide {currentSlide} of 2</span>
            <span className="text-stone-600">|</span>
            <span className="hidden md:inline text-stone-500 text-[11px]">Use ← / → keys or buttons</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentSlide(1)}
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded transition-all",
                currentSlide === 1 ? "bg-primary text-white font-bold" : "bg-stone-800 text-stone-400 hover:text-white"
              )}
            >
              1. The Shift
            </button>
            <button
              onClick={() => setCurrentSlide(2)}
              className={clsx(
                "px-2.5 py-1 text-xs font-mono rounded transition-all",
                currentSlide === 2 ? "bg-primary text-white font-bold" : "bg-stone-800 text-stone-400 hover:text-white"
              )}
            >
              2. Architecture
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Slide Stage */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 max-w-7xl mx-auto w-full z-10">
        {/* ========================================================= */}
        {/* SLIDE 1: THE CORE PROBLEM & THE AGENTIC COMMERCE SHIFT */}
        {/* ========================================================= */}
        {currentSlide === 1 && (
          <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>The 2026 Paradigm Shift | NPCI UAP &amp; Google AP2</span>
              </div>
              <h1 className="font-headline text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                The Next 100 Million Shoppers Won&apos;t Be Human. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                  They Will Be Autonomous AI Buyer Agents.
                </span>
              </h1>
              <p className="text-sm md:text-base text-stone-400 max-w-3xl leading-relaxed mt-1">
                E-commerce websites were designed strictly for humans clicking visual buttons. When an autonomous AI buyer bot arrives to purchase on behalf of a user, today&apos;s stores completely break.
              </p>
            </div>

            {/* Visual Contrast Flowchart: Broken Store vs MerchantMind */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
              {/* Left Flowchart: The Broken Status Quo (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-red-950/20 border border-red-900/40 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-red-900/40 mb-3">
                    <span className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Traditional Storefront (Fails With Bots)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-300 font-mono">
                      100% Abandonment
                    </span>
                  </div>

                  {/* Flow Steps */}
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-2.5 rounded bg-black/40 border border-red-900/30 flex items-center gap-2.5">
                      <Bot className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-white font-semibold">1. AI Buyer Bot Arrives</div>
                        <div className="text-stone-400 text-[10px]">Browsing on consumer&apos;s behalf</div>
                      </div>
                    </div>

                    <div className="flex justify-center text-red-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-black/40 border border-red-900/30 flex items-center gap-2.5 text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white">2. Hit by Captcha &amp; JS DOM</div>
                        <div className="text-stone-400 text-[10px]">No machine-readable catalog</div>
                      </div>
                    </div>

                    <div className="flex justify-center text-red-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-black/40 border border-red-900/30 flex items-center gap-2.5 text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="truncate">
                        <div className="font-semibold text-white">3. Fixed Rigid Pricing</div>
                        <div className="text-stone-400 text-[10px]">No protocol for discount negotiation</div>
                      </div>
                    </div>

                    <div className="flex justify-center text-red-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-red-900/30 border border-red-700/60 flex items-center gap-2.5 text-red-200">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <div>
                        <div className="font-bold">4. Checkout Failure &amp; Abort</div>
                        <div className="text-[10px] text-red-300">Requires manual human OTP / clicks</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 pt-2 border-t border-red-900/30">
                  Result: Merchant loses the transaction to competitor platforms.
                </div>
              </div>

              {/* Right Flowchart: The MerchantMind Infrastructure (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col justify-between gap-4 shadow-lg shadow-emerald-950/20">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-800/40 mb-3">
                    <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      MerchantMind Infrastructure on Razorpay Rails
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-mono font-bold">
                      Zero Friction Settlement
                    </span>
                  </div>

                  {/* Flow Steps */}
                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-2.5 rounded bg-black/40 border border-emerald-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="text-white font-semibold">1. ACP Catalog Discovery</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                        GET /api/agent/catalog (340ms)
                      </span>
                    </div>

                    <div className="flex justify-center text-emerald-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-black/40 border border-emerald-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-white font-semibold">2. Live Dual-Agent Haggling Duel</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                        Gemini 3.5 Flash Lite + Margin Defense
                      </span>
                    </div>

                    <div className="flex justify-center text-emerald-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-black/40 border border-emerald-800/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="text-white font-semibold">3. Cryptographic AP2 Mandate Signing</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                        Delegated Budget Caps
                      </span>
                    </div>

                    <div className="flex justify-center text-emerald-500/60 font-mono text-[10px]">▼</div>

                    <div className="p-2.5 rounded bg-emerald-900/30 border border-emerald-600/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-white font-bold">4. Razorpay Test Rails Settlement</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-stone-950 font-bold font-mono">
                        Instant UPI Reserve Debit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Metric Strip */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-800/40 text-center font-mono">
                  <div className="p-2 rounded bg-black/40 border border-emerald-900/40">
                    <div className="text-emerald-400 font-bold text-sm md:text-base">+24%</div>
                    <div className="text-[10px] text-stone-400">Basket Size (Cross-Sell)</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-emerald-900/40">
                    <div className="text-emerald-400 font-bold text-sm md:text-base">100%</div>
                    <div className="text-[10px] text-stone-400">Machine Transactable</div>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-emerald-900/40">
                    <div className="text-emerald-400 font-bold text-sm md:text-base">0%</div>
                    <div className="text-[10px] text-stone-400">Margin Floor Breaches</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SLIDE 2: END-TO-END ARCHITECTURE & THE FINANCIAL BAR */}
        {/* ========================================================= */}
        {currentSlide === 2 && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>The Hackathon Bar | Explainable, Bounded &amp; Gated</span>
              </div>
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                End-to-End System Architecture &amp; Financial Governance
              </h1>
              <p className="text-xs md:text-sm text-stone-400 max-w-3xl leading-relaxed">
                Every money action is mathematically bounded by merchant guardrails, backed by cryptographic authority tokens, and permanently recorded in an immutable forensic audit trail.
              </p>
            </div>

            {/* 4-Tier Architecture Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-1">
              {/* Pillar 1: Dual Ingestion Layer */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold pb-2 border-b border-stone-800 mb-2.5">
                    <User className="w-4 h-4" />
                    <span>1. DUAL CHANNELS</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-stone-950 border border-stone-800">
                      <div className="font-semibold text-stone-200">Human Shoppers</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Conversational Chat Commerce (/), 360° Inspector, Multi-Item Show Cart.</div>
                    </div>
                    <div className="p-2 rounded bg-stone-950 border border-stone-800">
                      <div className="font-semibold text-stone-200">Autonomous AI Bots</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">M2M REST API (/api/agent/*) with AP2 &amp; ACP Discovery.</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-stone-800">
                  1,000+ SKU Catalog Indexed
                </div>
              </div>

              {/* Pillar 2: AI Reasoning Layer */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold pb-2 border-b border-stone-800 mb-2.5">
                    <Cpu className="w-4 h-4" />
                    <span>2. REASONING CORE</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-stone-950 border border-stone-800">
                      <div className="font-semibold text-stone-200">Gemini 3.5 Flash Lite</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Natural unscripted haggling dialogue, witty banter &amp; game theory.</div>
                    </div>
                    <div className="p-2 rounded bg-stone-950 border border-stone-800">
                      <div className="font-semibold text-stone-200">3-Turn Convergence</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Anchor ➔ Walkaway Bluff ➔ Pareto Accord with instant UPI trigger.</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-stone-800">
                  Latency: 340ms Scoped Retrieval
                </div>
              </div>

              {/* Pillar 3: Deterministic Financial Firewall */}
              <div className="p-4 rounded-xl bg-stone-900 border border-amber-900/40 flex flex-col justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold pb-2 border-b border-amber-900/40 mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>3. MATH FIREWALL</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-stone-950 border border-amber-900/30">
                      <div className="font-semibold text-amber-300">Upsell Ceiling: ≤ 30%</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Mathematically blocks 500% LLM hallucination upgrades.</div>
                    </div>
                    <div className="p-2 rounded bg-stone-950 border border-amber-900/30">
                      <div className="font-semibold text-amber-300">Discount Cap: Max 15%</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Defends wholesale floor; guarantees +10% merchant margin.</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-amber-500 pt-2 border-t border-amber-900/40 font-semibold">
                  Zero Trust on Prompt Alone
                </div>
              </div>

              {/* Pillar 4: Settlement & Audit Layer */}
              <div className="p-4 rounded-xl bg-stone-900 border border-emerald-900/40 flex flex-col justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold pb-2 border-b border-emerald-900/40 mb-2.5">
                    <Layers className="w-4 h-4" />
                    <span>4. SETTLEMENT &amp; AUDIT</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-stone-950 border border-emerald-900/30">
                      <div className="font-semibold text-emerald-300">Razorpay Test Rails</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Orders, Payment Links, and Instant UPI reserve pools.</div>
                    </div>
                    <div className="p-2 rounded bg-stone-950 border border-emerald-900/30">
                      <div className="font-semibold text-emerald-300">Supabase Audit Ledger</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Append-only chronological trail with RLS and before/after states.</div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 pt-2 border-t border-emerald-900/40 font-semibold">
                  Graceful Failure (/failure-demo)
                </div>
              </div>
            </div>

            {/* Bottom Failure Recovery Callout Banner */}
            <div className="p-3.5 rounded-lg bg-stone-900/80 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-stone-300">
                <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>
                  <strong className="text-white">Graceful Failure Protocol:</strong> When bank network drops occur, MerchantMind triggers non-alarmist recovery with an idempotent replacement link &amp; zero duplicate charges.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  TESTED &amp; VERIFIED
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Presentation Footer & Control Bar */}
      <footer className="px-6 py-4 border-t border-stone-800/80 bg-stone-950/80 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
          <span>MerchantMind • Razorpay Hackathon 2026</span>
          <span className="text-stone-700">•</span>
          <span className="text-stone-400">Track 01: AI Growth &amp; Agentic Commerce</span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide(1)}
            disabled={currentSlide === 1}
            className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Slide 1</span>
          </button>

          <button
            onClick={() => setCurrentSlide(2)}
            disabled={currentSlide === 2}
            className="px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-mono font-bold flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <span>Slide 2</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
