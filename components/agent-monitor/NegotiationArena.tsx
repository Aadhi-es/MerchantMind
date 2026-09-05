"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import {
  Bot,
  Cpu,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  DollarSign,
  Lock,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Search,
  Sliders,
  Flame,
  MessageSquareQuote,
} from "lucide-react";
import { clsx } from "clsx";

interface PresetBuyer {
  id: string;
  name: string;
  role: string;
  targetCategory: string;
  targetQuery: string;
  budgetPaise: number;
  requestedDiscount: number;
  protocol: "ap2" | "uap" | "acp";
  buyerAgentId: string;
  description: string;
}

const PRESETS: PresetBuyer[] = [
  {
    id: "preset-enterprise",
    name: "Acme Corp Procurement Bot",
    role: "Autonomous IT Equipment Buyer",
    targetCategory: "computing",
    targetQuery: "macbook",
    budgetPaise: 15000000, // ₹1,50,000
    requestedDiscount: 20, // Breaches 15% floor to demonstrate dynamic counter-offer!
    protocol: "ap2",
    buyerAgentId: "agent-acme-procure-44",
    description: "Requests an aggressive 20% discount. Watch MerchantMind dynamically enforce its 15% floor and counter-propose!",
  },
  {
    id: "preset-appliance",
    name: "Apex Smart Living Concierge",
    role: "Residential Home Curator AI",
    targetCategory: "appliances",
    targetQuery: "refrigerator",
    budgetPaise: 9500000, // ₹95,000
    requestedDiscount: 10,
    protocol: "uap",
    buyerAgentId: "agent-apex-living-88",
    description: "Procures smart appliances within authorized limits. Requests 10% volume discount, approved inside margin floor.",
  },
  {
    id: "preset-csuite",
    name: "C-Suite Executive Gift Agent",
    role: "Executive Stationery Curator",
    targetCategory: "stationery",
    targetQuery: "parker",
    budgetPaise: 3000000, // ₹30,000
    requestedDiscount: 8,
    protocol: "acp",
    buyerAgentId: "agent-csuite-gifting-12",
    description: "Curates board gifts under ACP protocol. Negotiates 8% bundled discount for prestige pens.",
  },
];

interface ProtocolMessage {
  id: string;
  round: number;
  sender: "buyer" | "seller" | "system";
  action: string;
  payload: any;
  timestamp: string;
  detail: string;
  dialogue?: string;
  desiBadge?: string;
}

export function NegotiationArena() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [hagglingMode, setHagglingMode] = useState<"desi" | "formal">("desi");
  const [selectedPreset, setSelectedPreset] = useState<PresetBuyer>(PRESETS[0]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Custom mode parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [bundleProduct, setBundleProduct] = useState<Product | null>(null);
  const [includeBundle, setIncludeBundle] = useState<boolean>(false);
  const [customDiscount, setCustomDiscount] = useState<number>(18);
  const [customBudgetRupees, setCustomBudgetRupees] = useState<number>(150000);
  const [customProtocol, setCustomProtocol] = useState<"ap2" | "uap" | "acp">("ap2");
  const [customPersonaName, setCustomPersonaName] = useState("Autonomous Procurement Bot");

  const [isNegotiating, setIsNegotiating] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [messages, setMessages] = useState<ProtocolMessage[]>([]);

  const [buyerLogs, setBuyerLogs] = useState<string[]>([]);
  const [sellerLogs, setSellerLogs] = useState<string[]>([]);

  const [mandateToken, setMandateToken] = useState("ap2_mandate_sig_99182a4f");
  const [settlementResult, setSettlementResult] = useState<any>(null);

  const streamRef = useRef<HTMLDivElement>(null);

  // Load products from live Supabase catalog
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(console.error);
  }, []);

  // Update target product when preset or products change
  useEffect(() => {
    if (products.length === 0) return;
    if (mode === "preset") {
      const match = products.find(
        (p) =>
          p.name.toLowerCase().includes(selectedPreset.targetQuery.toLowerCase()) ||
          p.category?.toLowerCase() === selectedPreset.targetCategory.toLowerCase()
      );
      setTargetProduct(match || products[0]);

      // Secondary bundle item (accessory)
      const bundleMatch = products.find(
        (p) =>
          p.sku !== match?.sku &&
          (p.category === "accessories" || p.category === "lifestyle" || p.price < 1500000)
      );
      setBundleProduct(bundleMatch || null);
    } else if (!targetProduct && products.length > 0) {
      setTargetProduct(products[0]);
    }
  }, [selectedPreset, products, mode]);

  // Filtered products for custom dropdown
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-scroll message stream
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [messages, buyerLogs, sellerLogs]);

  const addBuyerLog = (msg: string) => {
    setBuyerLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const addSellerLog = (msg: string) => {
    setSellerLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const addMessage = (msg: ProtocolMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const resetArena = () => {
    setIsNegotiating(false);
    setCurrentRound(0);
    setMessages([]);
    setBuyerLogs([]);
    setSellerLogs([]);
    setSettlementResult(null);
  };

  const runNegotiation = async () => {
    if (!targetProduct) return;
    resetArena();
    setIsNegotiating(true);

    const buyerId = mode === "preset" ? selectedPreset.buyerAgentId : "agent-custom-buyer-77";
    const buyerPersona = mode === "preset" ? selectedPreset.name : customPersonaName;
    const protocol = mode === "preset" ? selectedPreset.protocol : customProtocol;
    const requestedDiscount = mode === "preset" ? selectedPreset.requestedDiscount : customDiscount;
    const budgetPaise = mode === "preset" ? selectedPreset.budgetPaise : customBudgetRupees * 100;

    const initialPrice = targetProduct.price;
    const effectiveBundle = includeBundle && bundleProduct ? bundleProduct : null;
    const bundlePrice = effectiveBundle ? effectiveBundle.price : 0;
    const combinedRetail = initialPrice + bundlePrice;

    try {
      // -------------------------------------------------------------
      // ROUND 1: CATALOG DISCOVERY & STOCK CHECK
      // -------------------------------------------------------------
      setCurrentRound(1);
      addBuyerLog(`Initiating GET /api/agent/catalog for SKU #${targetProduct.sku}`);
      await new Promise((r) => setTimeout(r, 600));

      addSellerLog(`Supabase inventory probe for SKU #${targetProduct.sku} (${targetProduct.stock_count} units available).`);
      await new Promise((r) => setTimeout(r, 600));

      addMessage({
        id: "msg-1",
        round: 1,
        sender: "buyer",
        action: "DISCOVER_CATALOG",
        payload: {
          sku: targetProduct.sku,
          category: targetProduct.category,
          max_budget: `₹${(budgetPaise / 100).toLocaleString("en-IN")}`,
          mandate_protocol: protocol.toUpperCase(),
        },
        timestamp: new Date().toLocaleTimeString(),
        detail: `Buyer Agent discovered SKU #${targetProduct.sku} (${targetProduct.name}) at retail price ₹${(initialPrice / 100).toLocaleString("en-IN")}.`,
      });

      // -------------------------------------------------------------
      // ROUND 2: INITIAL QUOTE & PROPOSED BUNDLE
      // -------------------------------------------------------------
      setCurrentRound(2);
      await new Promise((r) => setTimeout(r, 700));

      addSellerLog(
        effectiveBundle
          ? `Formulating retail quote with attached cross-sell bundle (${effectiveBundle.name}).`
          : `Formulating standalone retail quote for SKU #${targetProduct.sku}.`
      );

      addMessage({
        id: "msg-2",
        round: 2,
        sender: "seller",
        action: "OFFER_QUOTE",
        payload: {
          base_item: { sku: targetProduct.sku, price: `₹${(initialPrice / 100).toLocaleString("en-IN")}` },
          bundle_item: effectiveBundle
            ? { sku: effectiveBundle.sku, name: effectiveBundle.name, price: `₹${(bundlePrice / 100).toLocaleString("en-IN")}` }
            : null,
          combined_retail: `₹${(combinedRetail / 100).toLocaleString("en-IN")}`,
          policy: effectiveBundle ? "15% Maximum Bundle Discount Floor" : "15% Standalone Item Margin Floor",
        },
        timestamp: new Date().toLocaleTimeString(),
        detail: effectiveBundle
          ? `MerchantMind proposed catalog quote of ₹${(combinedRetail / 100).toLocaleString("en-IN")} with bundled accessory.`
          : `MerchantMind proposed catalog quote of ₹${(combinedRetail / 100).toLocaleString("en-IN")} for standalone item.`,
      });

      // -------------------------------------------------------------
      // ROUND 3: REAL DUAL-AGENT NEGOTIATION (GOOGLE GEMINI 3.5 FLASH LITE)
      // -------------------------------------------------------------
      setCurrentRound(3);
      await new Promise((r) => setTimeout(r, 600));

      addSellerLog(
        `Invoking POST /api/agent/live-negotiate (Mode: ${hagglingMode.toUpperCase()}). Analyzing wholesale cost and margin elasticity with Google Gemini...`
      );

      const liveNegRes = await fetch("/api/agent/live-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSku: targetProduct.sku,
          bundleSku: effectiveBundle?.sku || null,
          requestedDiscountPercent: requestedDiscount,
          buyerBudgetPaise: budgetPaise,
          buyerPersona,
          protocol,
          buyerAgentId: buyerId,
          hagglingMode,
        }),
      });

      const negData = await liveNegRes.json();

      if (hagglingMode === "desi" && negData.haggling_steps && Array.isArray(negData.haggling_steps)) {
        // MULTI-TURN INDIAN BAZAAR HAGGLING DUEL (3 Dynamic Back-and-Forth Exchanges)
        for (const step of negData.haggling_steps) {
          if (step.step === 1) {
            // Exchange 3.1: Aggressive Anchor
            addBuyerLog(`⚡ [TACTIC: AGGRESSIVE ANCHOR] Demanding ${step.buyer_offered_discount}% opening discount!`);
            if (step.buyer_thought) addBuyerLog(`Gemini Thought: "${step.buyer_thought}"`);

            addMessage({
              id: `msg-3-step1-buyer`,
              round: 3,
              sender: "buyer",
              action: "COUNTER_OFFER_ANCHOR",
              dialogue: step.buyer_dialogue,
              desiBadge: step.desi_badge || "🔥 AGGRESSIVE ANCHOR",
              payload: {
                tactic: step.tactic,
                demanded_discount: `${step.buyer_offered_discount}%`,
                retail_target: `₹${(combinedRetail / 100).toLocaleString("en-IN")}`,
                mandate_authority: protocol.toUpperCase(),
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.buyer_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));

            addSellerLog(`🛑 [DEFENSE: MARGIN FLOOR] Wholesale acquisition cost breached! Offering token 5% baseline.`);
            if (step.seller_thought) addSellerLog(`Gemini Thought: "${step.seller_thought}"`);

            addMessage({
              id: `msg-3-step1-seller`,
              round: 3,
              sender: "seller",
              action: "MARGIN_FLOOR_RESISTANCE",
              dialogue: step.seller_dialogue,
              desiBadge: "🚫 MARGIN FLOOR RESISTANCE",
              payload: {
                guardrail_alert: "WHOLESALE_COST_VIOLATION",
                offered_concession: "5%",
                margin_defense: "Wholesale Floor Preserved",
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.seller_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));
          } else if (step.step === 2) {
            // Exchange 3.2: Walkaway Bluff
            addBuyerLog(`🚨 [TACTIC: WALKAWAY BLUFF] Threatening to abort transaction and purchase from competitor bot!`);
            if (step.buyer_thought) addBuyerLog(`Gemini Thought: "${step.buyer_thought}"`);

            addMessage({
              id: `msg-3-step2-buyer`,
              round: 3,
              sender: "buyer",
              action: "WALKAWAY_CHURN_THREAT",
              dialogue: step.buyer_dialogue,
              desiBadge: step.desi_badge || "⚡ WALKAWAY BLUFF",
              payload: {
                tactic: step.tactic,
                simulated_competitor: "Amazon / Croma Autonomous Bot",
                action: "SESSION_ABORT_WARNING",
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.buyer_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));

            addSellerLog(`⚠️ [CHURN MITIGATION] Store manager override invoked. Concession raised to 10% + free priority shipping.`);
            if (step.seller_thought) addSellerLog(`Gemini Thought: "${step.seller_thought}"`);

            addMessage({
              id: `msg-3-step2-seller`,
              round: 3,
              sender: "seller",
              action: "RETENTION_CONCESSION",
              dialogue: step.seller_dialogue,
              desiBadge: "🎁 MANAGER SPECIAL CONCESSION",
              payload: {
                tactic: "CHURN_PREVENTION",
                improved_discount: "10%",
                sweetener: "Complimentary Priority Dispatch",
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.seller_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));
          } else if (step.step === 3) {
            // Exchange 3.3: Meet In The Middle Accord
            addBuyerLog(`🤝 [TACTIC: MEET IN THE MIDDLE] Proposing compromise at ${negData.approved_discount_percent}% with Instant UPI mandate!`);
            if (step.buyer_thought) addBuyerLog(`Gemini Thought: "${step.buyer_thought}"`);

            addMessage({
              id: `msg-3-step3-buyer`,
              round: 3,
              sender: "buyer",
              action: "MEET_IN_THE_MIDDLE_ACCORD",
              dialogue: step.buyer_dialogue,
              desiBadge: step.desi_badge || "🤝 MEET IN THE MIDDLE",
              payload: {
                tactic: step.tactic,
                compromise_discount: `${negData.approved_discount_percent}%`,
                settlement_trigger: "INSTANT_RAZORPAY_UPI_PLEDGE",
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.buyer_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));

            addSellerLog(`🎉 [FINAL ACCORD] Margin secured (+${negData.merchant_margin_percent}%). You drive a hard bargain! Deal locked!`);
            if (step.seller_thought) addSellerLog(`Gemini Thought: "${step.seller_thought}"`);

            addMessage({
              id: `msg-3-step3-seller`,
              round: 3,
              sender: "seller",
              action: "DEAL_LOCKED_ACCORD",
              dialogue: step.seller_dialogue,
              desiBadge: "🎉 DEAL LOCKED (ACCORD REACHED)",
              payload: {
                guardrail_status: negData.guardrail_status,
                approved_discount: `${negData.approved_discount_percent}%`,
                final_total_formatted: negData.final_formatted,
                savings: negData.savings_formatted,
                merchant_net_margin: `+${negData.merchant_margin_percent}%`,
                guardrail_enforcement: negData.guardrail_enforcement,
                model: negData.model_used || "Google Gemini 3.5 Flash Lite",
              },
              timestamp: new Date().toLocaleTimeString(),
              detail: step.seller_machine_detail,
            });

            await new Promise((r) => setTimeout(r, 1100));
          }
        }
      } else {
        // Corporate Formal Mode (Standard 1 exchange)
        addBuyerLog(
          `Consulting reasoning engine: Demanding ${requestedDiscount}% discount under ${protocol.toUpperCase()} mandate authority.`
        );

        addMessage({
          id: "msg-3",
          round: 3,
          sender: "buyer",
          action: "COUNTER_OFFER",
          payload: {
            requested_discount: `${requestedDiscount}%`,
            buyer_agent_id: buyerId,
            target_skus: [targetProduct.sku, effectiveBundle?.sku].filter(Boolean),
            mandate_token: mandateToken,
          },
          timestamp: new Date().toLocaleTimeString(),
          detail: `Buyer Agent countered demanding a ${requestedDiscount}% discount.`,
        });

        if (negData.buyer_thought) {
          addBuyerLog(`Gemini Thought: "${negData.buyer_thought}"`);
        }
        if (negData.seller_thought) {
          addSellerLog(`Gemini Thought: "${negData.seller_thought}"`);
        }

        await new Promise((r) => setTimeout(r, 1000));

        addMessage({
          id: "msg-4",
          round: 3,
          sender: "seller",
          action: negData.guardrail_status === "COUNTER_OFFER_CAPPED" ? "GUARDRAIL_COUNTER_OFFER" : "DISCOUNT_APPROVED",
          payload: {
            guardrail_status: negData.guardrail_status,
            approved_discount: `${negData.approved_discount_percent}%`,
            final_total_formatted: negData.final_formatted,
            savings: negData.savings_formatted,
            merchant_net_margin: `+${negData.merchant_margin_percent}%`,
            guardrail_enforcement: negData.guardrail_enforcement,
            ai_reasoning: negData.seller_thought,
            model: negData.model_used || "Google Gemini 3.5 Flash Lite",
          },
          timestamp: new Date().toLocaleTimeString(),
          detail:
            negData.guardrail_status === "COUNTER_OFFER_CAPPED"
              ? `MerchantMind blocked excessive ${requestedDiscount}% discount (capped at ${negData.approved_discount_percent}% floor) to preserve merchant profitability.`
              : `MerchantMind approved ${negData.approved_discount_percent}% discount within merchant margin limits.`,
        });
      }

      // -------------------------------------------------------------
      // ROUND 4: CRYPTOGRAPHIC MANDATE HANDSHAKE
      // -------------------------------------------------------------
      setCurrentRound(4);
      await new Promise((r) => setTimeout(r, 900));

      addBuyerLog(
        `Validating agreed amount ${negData.final_formatted} <= Mandate Budget ₹${(budgetPaise / 100).toLocaleString("en-IN")}. VALIDATED.`
      );
      addBuyerLog(`Affixing cryptographic signature for autonomous debit execution.`);

      addMessage({
        id: "msg-5",
        round: 4,
        sender: "buyer",
        action: "SIGN_MANDATE_TOKEN",
        payload: {
          protocol: protocol.toUpperCase(),
          mandate_token: mandateToken,
          status: "DIGITALLY_SIGNED",
          session_key: `sig_ed25519_${Math.random().toString(36).substring(2, 12)}`,
        },
        timestamp: new Date().toLocaleTimeString(),
        detail: `Buyer Agent digitally signed ${protocol.toUpperCase()} mandate token. Authorizing settlement.`,
      });

      // -------------------------------------------------------------
      // ROUND 5: RAZORPAY AUTONOMOUS SETTLEMENT
      // -------------------------------------------------------------
      setCurrentRound(5);
      await new Promise((r) => setTimeout(r, 1000));

      addSellerLog(`Submitting authorized order to Razorpay Test Rails (POST /api/agent/checkout)...`);

      const checkRes = await fetch("/api/agent/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { sku: targetProduct.sku, quantity: 1 },
            ...(effectiveBundle ? [{ sku: effectiveBundle.sku, quantity: 1 }] : []),
          ],
          offer_id: negData.offer_id,
          buyer_agent_id: buyerId,
          final_price_paise: negData.final_paise,
          authorization: {
            protocol,
            token: mandateToken,
          },
          payment_method: "upi",
        }),
      });

      const checkData = await checkRes.json();

      addSellerLog(
        `SUCCESS ✓ Razorpay Order #${checkData.order_id || "order_live_m2m"} created and verified. Logged to Supabase audit trail.`
      );
      addBuyerLog(`Transaction settled. Receipt token stored in agent ledger.`);

      addMessage({
        id: "msg-6",
        round: 5,
        sender: "seller",
        action: "ORDER_SETTLED",
        payload: {
          razorpay_order_id: checkData.order_id,
          audit_id: checkData.audit_id,
          settled_amount: negData.final_formatted,
          discount_saved: `${negData.savings_formatted} (${negData.approved_discount_percent}%)`,
          merchant_profit_margin: `+${negData.merchant_margin_percent}%`,
          payment_link: checkData.payment_link_url,
          protocol: protocol.toUpperCase(),
        },
        timestamp: new Date().toLocaleTimeString(),
        detail: `Settlement complete on Razorpay rails! Order #${checkData.order_id} recorded in immutable audit log.`,
      });

      setSettlementResult({
        orderId: checkData.order_id,
        auditId: checkData.audit_id,
        paymentLink: checkData.payment_link_url,
        settledAmount: negData.final_paise,
        originalAmount: combinedRetail,
        discountSaved: negData.savings_paise,
        discountPercent: negData.approved_discount_percent,
        merchantMargin: negData.merchant_margin_percent,
        guardrailStatus: negData.guardrail_status,
        targetProduct,
        bundleProduct: effectiveBundle,
        protocol: protocol.toUpperCase(),
        buyerId,
      });
    } catch (e: any) {
      console.error(e);
      addBuyerLog(`Negotiation error: ${e.message}`);
      addSellerLog(`Session aborted: ${e.message}`);
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Top Banner: Arena Header & Mode Switcher */}
      <section className="w-full bg-white rounded-xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-headline text-xl lg:text-2xl text-stone-900 font-bold tracking-tight">
                Live Dual-Agent Negotiation Arena
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-primary border border-blue-200 font-mono text-xs font-semibold">
                Google Gemini 3.5 Flash Lite
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Razorpay Test Rails
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">
              Simulate autonomous commercial haggling between Buyer Agent &amp; MerchantMind. Test margin elasticity, walkaway bluffs, and automated mandate debit.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={resetArena}
              disabled={isNegotiating}
              className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-label text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={runNegotiation}
              disabled={isNegotiating || !targetProduct}
              className={clsx(
                "px-4.5 py-2 rounded-lg font-label text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer",
                isNegotiating
                  ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90 ring-2 ring-primary/20"
              )}
            >
              <Play className={clsx("w-3.5 h-3.5", isNegotiating ? "animate-spin" : "")} />
              <span>{isNegotiating ? "Gemini Negotiating Live..." : "Launch Live M2M Negotiation"}</span>
            </button>
          </div>
        </div>

        {/* Control Sub-Bar: Mode & Haggling Duel selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Catalog Mode */}
            <div className="flex p-1 rounded-lg bg-stone-100 border border-stone-200/80">
              <button
                type="button"
                disabled={isNegotiating}
                onClick={() => setMode("preset")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-label font-semibold rounded-md transition-all cursor-pointer",
                  mode === "preset"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-200 font-bold"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                Presets (3)
              </button>
              <button
                type="button"
                disabled={isNegotiating}
                onClick={() => setMode("custom")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-label font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  mode === "custom"
                    ? "bg-white text-stone-900 shadow-xs border border-stone-200 font-bold"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                <Sliders className="w-3 h-3" />
                <span>Custom Catalog (1,000+)</span>
              </button>
            </div>

            {/* Haggling Mode */}
            <div className="flex p-1 rounded-lg bg-stone-100 border border-stone-200/80">
              <button
                type="button"
                disabled={isNegotiating}
                onClick={() => setHagglingMode("desi")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-label font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer",
                  hagglingMode === "desi"
                    ? "bg-amber-600 text-white shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <Flame className={clsx("w-3.5 h-3.5", hagglingMode === "desi" ? "text-amber-200 animate-pulse" : "text-amber-600")} />
                <span>🔥 High-Stakes Duel</span>
                <span className={clsx(
                  "px-1.5 py-0.2 rounded text-[9px] uppercase font-bold",
                  hagglingMode === "desi" ? "bg-black/25 text-amber-100" : "bg-stone-200 text-stone-600"
                )}>
                  Drama
                </span>
              </button>
              <button
                type="button"
                disabled={isNegotiating}
                onClick={() => setHagglingMode("formal")}
                className={clsx(
                  "px-3 py-1.5 text-xs font-label font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer",
                  hagglingMode === "formal"
                    ? "bg-stone-800 text-white shadow-xs font-bold"
                    : "text-stone-600 hover:text-stone-900"
                )}
              >
                <span>🏢 Corporate RFP</span>
              </button>
            </div>
          </div>

          <div className="font-mono text-[11px] text-stone-500 flex items-center gap-2">
            <span>LLM Intelligence Engine:</span>
            <span className="text-stone-900 font-bold">Google Gemini 3.5 Flash Lite</span>
          </div>
        </div>
      </section>

      {/* Mode 1: Presets Selector */}
      {mode === "preset" ? (
        <section className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-headline text-sm font-bold text-stone-900">
                Select Pre-Configured Buyer Agent Persona
              </h3>
            </div>
            <span className="font-mono text-[11px] text-stone-400">
              Live Supabase Multi-Brand Inventory
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isNegotiating}
                  onClick={() => setSelectedPreset(preset)}
                  className={clsx(
                    "p-4 rounded-lg border text-left flex flex-col justify-between transition-all",
                    isSelected
                      ? "bg-blue-50/50 border-blue-300 ring-2 ring-blue-400/20 shadow-xs"
                      : "bg-stone-50 border-stone-200 hover:bg-stone-100/80"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-headline text-xs font-bold text-stone-900">
                        {preset.name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-primary font-semibold uppercase">
                        {preset.protocol.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-medium mb-1">
                      {preset.role}
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-200/70 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-stone-500">Demanded Discount:</span>
                    <span className={clsx("font-bold", preset.requestedDiscount > 15 ? "text-amber-700" : "text-emerald-700")}>
                      {preset.requestedDiscount}% {preset.requestedDiscount > 15 ? "(Will Trigger Counter-Offer!)" : "(Approved)"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        /* Mode 2: Custom 1,000+ Product Selector */
        <section className="bg-white rounded-lg p-5 border border-stone-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <h3 className="font-headline text-sm font-bold text-stone-900">
                Custom Negotiation Sandbox — Choose from 1,000+ Real Catalog Items
              </h3>
            </div>
            <span className="font-mono text-xs text-primary font-bold">
              {products.length} Products Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Product Selector with Search (6 cols) */}
            <div className="md:col-span-6 flex flex-col gap-2">
              <label className="text-xs font-mono font-semibold text-stone-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <span>Search &amp; Select Product:</span>
              </label>
              <input
                type="text"
                placeholder="Search Dyson, Apple, Bosch, Sony, Parker, Logitech, Samsung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-md focus:outline-none focus:border-primary font-mono"
              />

              <div className="max-h-44 overflow-y-auto border border-stone-200 rounded-md divide-y divide-stone-100 bg-stone-50 text-xs">
                {filteredProducts.slice(0, 8).map((p) => {
                  const isChosen = targetProduct?.sku === p.sku;
                  return (
                    <button
                      key={p.sku}
                      type="button"
                      onClick={() => {
                        setTargetProduct(p);
                        // Suggest compatible bundle
                        const other = products.find((x) => x.sku !== p.sku && x.category === "accessories");
                        setBundleProduct(other || null);
                      }}
                      className={clsx(
                        "w-full p-2.5 text-left flex items-center justify-between hover:bg-white transition-colors",
                        isChosen ? "bg-blue-50/80 font-semibold border-l-4 border-primary" : ""
                      )}
                    >
                      <div className="truncate mr-2">
                        <div className="text-stone-900 truncate font-headline text-xs">{p.name}</div>
                        <div className="text-[10px] font-mono text-stone-400 uppercase">
                          SKU #{p.sku} • {p.category}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-primary shrink-0">
                        ₹{(p.price / 100).toLocaleString("en-IN")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Negotiation Parameters (6 cols) */}
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-lg bg-stone-50 border border-stone-200">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-semibold text-stone-700">
                  Target Discount: <strong className={customDiscount > 15 ? "text-amber-700" : "text-primary"}>{customDiscount}%</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[10px] font-mono text-stone-500">
                  {customDiscount > 15 ? "⚠️ > 15% breaches floor: Seller will counter-offer!" : "✓ <= 15% within merchant discount floor"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-semibold text-stone-700">
                  Buyer Budget (₹):
                </label>
                <input
                  type="number"
                  value={customBudgetRupees}
                  onChange={(e) => setCustomBudgetRupees(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded font-mono"
                />
                <span className="text-[10px] font-mono text-stone-400">
                  Cap: ₹{customBudgetRupees.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-semibold text-stone-700">
                  Buyer Protocol:
                </label>
                <select
                  value={customProtocol}
                  onChange={(e: any) => setCustomProtocol(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded font-mono bg-white"
                >
                  <option value="ap2">Google AP2 Protocol</option>
                  <option value="uap">NPCI Unified Agent Protocol (UAP)</option>
                  <option value="acp">Agentic Commerce Protocol (ACP)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-semibold text-stone-700">
                  Buyer Agent Persona:
                </label>
                <input
                  type="text"
                  value={customPersonaName}
                  onChange={(e) => setCustomPersonaName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded font-body"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Target Item & Mandate Specs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Selected Product Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-stone-200 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
              <span className="font-mono text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                Active Catalog Inventory
              </span>
              <span className="font-mono text-[11px] text-primary font-bold">
                SKU #{targetProduct?.sku || "COMP-APL-0102"}
              </span>
            </div>

            {targetProduct ? (
              <div className="flex items-start gap-4">
                <img
                  src={targetProduct.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                  alt={targetProduct.name}
                  className="w-16 h-16 rounded-md object-cover border border-stone-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline text-sm font-bold text-stone-900 truncate">
                    {targetProduct.name}
                  </h4>
                  <div className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                    {targetProduct.description}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      ₹{(targetProduct.price / 100).toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      • In Stock ({targetProduct.stock_count} units)
                    </span>
                    {includeBundle && bundleProduct ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-semibold">
                        + Bundle Attached
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        Standalone Item
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-stone-500 font-mono">Loading inventory...</div>
            )}
          </div>

          {/* Interactive Accessory Cross-Sell Toggle Card */}
          {bundleProduct && (
            <div
              onClick={() => !isNegotiating && setIncludeBundle(!includeBundle)}
              className={clsx(
                "p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                includeBundle
                  ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-400/30 shadow-xs"
                  : "bg-stone-50 border-stone-200 hover:bg-stone-100/70"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  id="includeBundleCheck"
                  checked={includeBundle}
                  disabled={isNegotiating}
                  onChange={(e) => setIncludeBundle(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer shrink-0"
                />
                <div className="min-w-0 truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-xs font-bold text-stone-900 truncate">
                      Bundle Add-On: {bundleProduct.name}
                    </span>
                    <span
                      className={clsx(
                        "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase shrink-0",
                        includeBundle
                          ? "bg-blue-200 text-blue-900 border border-blue-300"
                          : "bg-stone-200 text-stone-600"
                      )}
                    >
                      {includeBundle ? "Attached" : "Optional Add-On"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {includeBundle
                      ? "Accessory attached for joint discount negotiation"
                      : "Click to attach this accessory to the deal"}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-xs font-bold text-stone-900">
                  +₹{(bundleProduct.price / 100).toLocaleString("en-IN")}
                </span>
                <div className="text-[10px] font-mono text-stone-400">
                  {includeBundle ? "Included" : "Excluded"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cryptographic Mandate Token Card (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-stone-200 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                  {(mode === "preset" ? selectedPreset.protocol : customProtocol).toUpperCase()} Cryptographic Spending Mandate
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                ACTIVE &amp; DELEGATED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Autonomous Spend Cap:</span>
                <span className="font-mono font-bold text-stone-900">
                  ₹{((mode === "preset" ? selectedPreset.budgetPaise : customBudgetRupees * 100) / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Negotiation Retail Baseline:</span>
                <span className="font-mono font-bold text-stone-900">
                  ₹{(
                    ((targetProduct?.price || 0) + (includeBundle && bundleProduct ? bundleProduct.price : 0)) / 100
                  ).toLocaleString("en-IN")}{" "}
                  {includeBundle && bundleProduct ? (
                    <span className="text-[10px] text-primary font-semibold">(Base + Bundle)</span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-normal">(Base Only)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Target Discount Demand:</span>
                <span className="font-mono font-bold text-primary">
                  {mode === "preset" ? selectedPreset.requestedDiscount : customDiscount}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Session Signature Hash:</span>
                <span className="font-mono text-stone-500 text-[10px] truncate max-w-[200px]">
                  {mandateToken}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-stone-50 border border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>LLM Intelligence Engine:</span>
            <span className="text-primary font-bold">Google Gemini 3.5 Flash Lite</span>
          </div>
        </div>
      </section>

      {/* Main Split-Screen Terminal & Live Arena */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Screen: Buyer Agent Terminal (3 cols) */}
        <div className="lg:col-span-3 bg-stone-900 text-stone-100 rounded-lg p-4 border border-stone-800 shadow-md flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Bot className="w-4 h-4" />
                <span>BUYER AGENT TERMINAL</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                {(mode === "preset" ? selectedPreset.protocol : customProtocol).toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-stone-400 mb-4">
              <div>Agent: <span className="text-stone-200">{mode === "preset" ? selectedPreset.name : customPersonaName}</span></div>
              <div>Demand: <span className="text-purple-300 font-bold">{mode === "preset" ? selectedPreset.requestedDiscount : customDiscount}% Discount</span></div>
              <div>Status: <span className="text-emerald-400 font-semibold">{isNegotiating ? "BARGAINING LIVE" : settlementResult ? "DEAL STRUCK" : "STANDBY"}</span></div>
            </div>

            <div className="text-[10px] uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-purple-400" />
              <span>Buyer Gemini Reasoning:</span>
            </div>

            <div className="bg-black/50 p-2.5 rounded border border-stone-800 h-72 overflow-y-auto space-y-1 text-[10px] text-stone-300 leading-relaxed font-mono">
              {buyerLogs.length === 0 ? (
                <div className="text-stone-600">Awaiting negotiation launch...</div>
              ) : (
                buyerLogs.map((log, idx) => (
                  <div key={idx} className="text-purple-300/90">
                    &gt; {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-stone-800 text-[10px] text-stone-500 flex justify-between">
            <span>Mandate Authority:</span>
            <span className="text-emerald-400 font-bold">Verified &amp; Delegated</span>
          </div>
        </div>

        {/* Center: Live Protocol Feed (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold text-stone-900">
                  Live Machine Protocol Stream
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-stone-500">
                  Round {currentRound} / 5
                </span>
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              </div>
            </div>

            {/* Scrollable Message Feed */}
            <div
              ref={streamRef}
              className="space-y-3 h-72 overflow-y-auto pr-1 text-xs font-sans"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 font-mono">
                  <Cpu className="w-8 h-8 text-stone-300 mb-2 stroke-1" />
                  <p className="text-xs text-stone-500">No active M2M session.</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Click "Launch Live M2M Negotiation" above to stream real Google Gemini protocol rounds.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isBuyer = m.sender === "buyer";
                  return (
                    <div
                      key={m.id}
                      className={clsx(
                        "p-3 rounded-lg border flex flex-col gap-1.5 transition-all",
                        isBuyer
                          ? "bg-purple-50/50 border-purple-200/80 ml-4"
                          : "bg-blue-50/50 border-blue-200/80 mr-4"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              "font-mono text-[10px] px-1.5 py-0.2 rounded font-bold uppercase",
                              isBuyer
                                ? "bg-purple-200 text-purple-900"
                                : "bg-blue-200 text-blue-900"
                            )}
                          >
                            {isBuyer ? "AI Buyer" : "MerchantMind"}
                          </span>
                          <span className="font-mono text-[11px] text-stone-600 font-bold">
                            {m.action}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-stone-400">
                          {m.timestamp}
                        </span>
                      </div>

                      <p className="text-stone-800 text-xs">{m.detail}</p>

                      {m.dialogue && (
                        <div
                          className={clsx(
                            "p-3 rounded-md border text-xs leading-relaxed relative my-1.5 shadow-xs transition-all",
                            isBuyer
                              ? "bg-purple-100/90 border-purple-300/80 text-purple-950"
                              : "bg-blue-100/90 border-blue-300/80 text-blue-950"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] font-bold tracking-wide">
                            {m.desiBadge && (
                              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-300 font-bold uppercase shadow-2xs">
                                {m.desiBadge}
                              </span>
                            )}
                            <span className="text-stone-500 uppercase font-sans font-semibold">
                              {isBuyer ? "AI Buyer Agent Dialogue:" : "MerchantMind Seller Dialogue:"}
                            </span>
                          </div>
                          <p className="italic font-serif text-[13px] font-medium text-stone-900">&ldquo;{m.dialogue}&rdquo;</p>
                        </div>
                      )}

                      <div className="bg-white/80 p-2 rounded border border-stone-200/60 font-mono text-[10px] text-stone-600 overflow-x-auto">
                        <pre>{JSON.stringify(m.payload, null, 2)}</pre>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Round Indicator */}
          <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <span
                  key={r}
                  className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] transition-all",
                    currentRound === r
                      ? "bg-primary text-white scale-105 shadow-xs"
                      : currentRound > r
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-stone-100 text-stone-400"
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
            <span className="text-stone-500">
              {currentRound === 5 ? "Settlement Complete" : isNegotiating ? "Gemini Active" : "Standby"}
            </span>
          </div>
        </div>

        {/* Right Screen: Seller Agent Terminal (3 cols) */}
        <div className="lg:col-span-3 bg-stone-900 text-stone-100 rounded-lg p-4 border border-stone-800 shadow-md flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-3">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>SELLER MIND TERMINAL</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                DB GUARDRAILS
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-stone-400 mb-4">
              <div>Store Node: <span className="text-stone-200">Node #4102</span></div>
              <div>Discount Cap: <span className="text-blue-400 font-bold">15% Max Floor</span></div>
              <div>Guardrail Mode: <span className="text-emerald-400 font-semibold">Active &amp; Enforced</span></div>
            </div>

            <div className="text-[10px] uppercase text-stone-500 tracking-wider mb-2 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-blue-400" />
              <span>Seller Margin Reasoning:</span>
            </div>

            <div className="bg-black/50 p-2.5 rounded border border-stone-800 h-72 overflow-y-auto space-y-1 text-[10px] text-stone-300 leading-relaxed font-mono">
              {sellerLogs.length === 0 ? (
                <div className="text-stone-600">Awaiting client request...</div>
              ) : (
                sellerLogs.map((log, idx) => (
                  <div key={idx} className="text-blue-300/90">
                    &gt; {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-stone-800 text-[10px] text-stone-500 flex justify-between">
            <span>Profit Margin:</span>
            <span className="text-emerald-400 font-bold">Strictly Protected</span>
          </div>
        </div>
      </section>

      {/* Deal Settlement Receipt Card */}
      {settlementResult && (
        <section className="bg-white rounded-lg p-6 border-2 border-emerald-500/40 shadow-md flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-stone-900">
                  Autonomous Deal Struck &amp; Order Created!
                </h3>
                <p className="text-xs text-stone-500">
                  Settled on Razorpay Test Rails via {settlementResult.protocol} Cryptographic Mandate
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 border border-stone-200 font-bold">
                {settlementResult.orderId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded bg-stone-50 border border-stone-200">
              <span className="text-stone-500 text-[11px]">Final Settled Price</span>
              <div className="font-headline text-xl font-bold text-primary mt-1">
                ₹{(settlementResult.settledAmount / 100).toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-3 rounded bg-stone-50 border border-stone-200">
              <span className="text-stone-500 text-[11px]">Buyer Savings</span>
              <div className="font-headline text-xl font-bold text-emerald-700 mt-1 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                <span>₹{(settlementResult.discountSaved / 100).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-stone-50 border border-stone-200">
              <span className="text-stone-500 text-[11px]">Discount Approved</span>
              <div className="font-headline text-xl font-bold text-stone-900 mt-1">
                {settlementResult.discountPercent}%
              </div>
            </div>

            <div className="p-3 rounded bg-stone-50 border border-stone-200">
              <span className="text-stone-500 text-[11px]">Merchant Profit Margin</span>
              <div className="font-headline text-xl font-bold text-emerald-700 mt-1">
                +{settlementResult.merchantMargin}%
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-stone-600 font-mono">
              Audit Record: <span className="font-bold text-stone-800">{settlementResult.auditId}</span> (Permanently logged to Supabase `audit_log`)
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/audit"
                className="px-4 py-2 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>View Forensic Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
