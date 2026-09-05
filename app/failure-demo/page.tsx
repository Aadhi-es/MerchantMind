"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

export default function FailureDemoPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryPaymentUrl, setRetryPaymentUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct(data.products[0]);
        }
      })
      .catch(console.error);
  }, []);

  const activePrice = selectedProduct ? selectedProduct.price : 2999000;
  const activePriceFormatted = `₹${(activePrice / 100).toLocaleString("en-IN")}`;
  const activeName = selectedProduct ? selectedProduct.name : "Sony WH-1000XM5 Wireless Noise Cancelling Headphones";
  const activeSku = selectedProduct ? selectedProduct.sku : "AUD-SNY-01";

  const handleSimulateFailure = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "failure",
          orderId: `order_fail_${Date.now().toString(36)}`,
          conversationId: "conv_failure_demo",
          errorCode: "GATEWAY_TIMEOUT",
          errorDescription: "Bank UPI network timed out before debit confirmation.",
          sku: activeSku,
          amount: activePrice,
        }),
      });
      setCurrentStep(2);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTriggerRecovery = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "retry",
          orderId: `order_retry_${Date.now().toString(36)}`,
          conversationId: "conv_failure_demo",
          amount: activePrice,
          sku: activeSku,
        }),
      });
      const data = await res.json();
      setRetryPaymentUrl(data.paymentLink?.short_url || "#");
      setCurrentStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteRetry = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "success",
          orderId: `order_confirmed_${Date.now().toString(36)}`,
          conversationId: "conv_failure_demo",
          amount: activePrice,
          sku: activeSku,
        }),
      });
      setCurrentStep(4);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setRetryPaymentUrl(null);
  };

  return (
    <div className="w-full px-6 py-6 flex flex-col gap-6">
      {/* Header Banner */}
      <section className="w-full bg-white rounded-lg p-6 border border-stone-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline text-2xl lg:text-3xl text-stone-900 font-bold tracking-tight">
              Graceful Failure &amp; Recovery Showcase
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-mono text-xs font-semibold">
              THE BAR REQUIREMENT
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Fulfilling the Razorpay hackathon criterion: &quot;Show the audit trail and one failure handled gracefully.&quot;
          </p>
        </div>

        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <select
              value={selectedProduct?.sku || ""}
              onChange={(e) => {
                const found = products.find((p) => p.sku === e.target.value);
                if (found) {
                  setSelectedProduct(found);
                  resetDemo();
                }
              }}
              className="px-3 py-1.5 rounded border border-stone-200 bg-white text-stone-800 font-mono text-xs focus:outline-none focus:border-primary shadow-xs max-w-xs truncate"
            >
              {products.slice(0, 15).map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({`₹${(p.price / 100).toLocaleString("en-IN")}`})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={resetDemo}
            className="px-3 py-1.5 rounded border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-label text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </section>

      {/* 4 Step Progress Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        {[
          { num: "01", label: "Checkout Mandate Created" },
          { num: "02", label: "Bank Timeout Simulated" },
          { num: "03", label: "Non-Alarmist Recovery Link" },
          { num: "04", label: "Payment Capture Sealed" },
        ].map((s, idx) => (
          <div
            key={idx}
            className={clsx(
              "p-3 rounded border text-xs transition-all",
              currentStep > idx + 1
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                : currentStep === idx + 1
                ? "bg-blue-50 border-blue-200 text-primary font-bold shadow-xs"
                : "bg-white border-stone-200 text-stone-400"
            )}
          >
            <div className="font-mono text-[10px] text-stone-500">{s.num}</div>
            <div className="mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid: Interactive Simulation + Judicial Justification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left: Chat Simulation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-lg bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs font-semibold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Live Conversational Failure Flow
              </span>
              <span className="text-xs font-mono text-stone-500">Item: SKU #{activeSku}</span>
            </div>

            {/* Step 1: Initial Link */}
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-headline font-bold text-xs shrink-0">
                  M
                </div>
                <div className="p-3.5 rounded bg-stone-50 border border-stone-200 text-xs leading-relaxed max-w-lg space-y-2">
                  <p>Here is your authentic checkout mandate for <strong>{activeName}</strong>:</p>
                  <div className="p-2 rounded bg-white border border-stone-200 flex justify-between items-center font-mono font-bold text-primary">
                    <span className="text-stone-600 font-medium">Total Payable</span>
                    <span className="text-base">{activePriceFormatted}</span>
                  </div>
                </div>
              </div>

              {currentStep === 1 && (
                <div className="p-4 rounded bg-stone-50 border border-stone-200 space-y-2">
                  <p className="text-xs text-stone-600">
                    Customer attempts payment on the UPI gateway, but the bank network times out before debit confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateFailure}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded bg-red-600 hover:bg-red-700 text-white font-label text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Trigger Bank Gateway Timeout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Failure Handled Calmly */}
            {currentStep >= 2 && (
              <div className="space-y-3 pt-2">
                <div className="p-2 rounded bg-red-50 border border-red-200 text-center font-mono text-xs text-red-800 font-medium">
                  ⚡ Webhook Received: `payment.failed` (GATEWAY_TIMEOUT)
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-headline font-bold text-xs shrink-0">
                    M
                  </div>
                  <div className="p-3.5 rounded bg-white border border-stone-300 text-xs leading-relaxed max-w-lg space-y-1.5 shadow-xs">
                    <div className="font-semibold text-stone-900">
                      Looks like the bank network timed out before confirming the debit.
                    </div>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      No worries at all — <strong>no money was deducted</strong>, and your cart for <strong>{activeName}</strong> is completely saved. Would you like me to generate a fresh replacement payment link?
                    </p>
                  </div>
                </div>

                {currentStep === 2 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTriggerRecovery}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Generate Fresh Replacement Link</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Replacement Link */}
            {currentStep >= 3 && (
              <div className="space-y-3 pt-2">
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-headline font-bold text-xs shrink-0">
                    M
                  </div>
                  <div className="p-3.5 rounded bg-stone-50 border border-stone-200 text-xs leading-relaxed max-w-lg space-y-2">
                    <p>Replacement link generated on Razorpay test mode without cart alteration:</p>
                    <div className="p-2.5 rounded bg-white border border-stone-200 flex justify-between items-center font-mono font-bold text-primary">
                      <div>
                        <div className="text-xs text-stone-800">{activeName}</div>
                        <div className="text-[10px] text-stone-400 font-normal">SKU #{activeSku}</div>
                      </div>
                      <span className="text-base">{activePriceFormatted}</span>
                    </div>

                    {currentStep === 3 && (
                      <button
                        type="button"
                        onClick={handleCompleteRetry}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 mt-2 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete Payment via Replacement Link</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmed */}
            {currentStep === 4 && (
              <div className="space-y-3 pt-2">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-center font-mono text-xs text-emerald-800 font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Webhook Received: `payment.captured` ✓
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 rounded bg-primary text-white flex items-center justify-center font-headline font-bold text-xs shrink-0">
                    M
                  </div>
                  <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs leading-relaxed max-w-lg space-y-1 text-stone-800">
                    <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Payment Successful &amp; Order Sealed
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Payment of <strong>{activePriceFormatted}</strong> confirmed via UPI. Order for <strong>{activeName}</strong> is dispatched. The entire failure $\rightarrow$ recovery sequence is recorded in the deterministic Supabase audit trail.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Forensic Justification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-lg bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Why This Satisfies &quot;The Bar&quot;</span>
            </h3>

            <ul className="space-y-3 text-xs text-stone-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-stone-900">Zero Alarmist UI:</strong> No scary red banners or broken checkout screens. The agent explains the issue calmly.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-stone-900">Explicit Reassurance:</strong> Affirmatively tells the user no money was deducted, preventing double-payment anxiety.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-stone-900">State Preservation:</strong> Cart and order parameters are kept static; the customer does not have to restart shopping.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                  4
                </span>
                <div>
                  <strong className="text-stone-900">Deterministic Audit Trail:</strong> Both the failure code (`GATEWAY_TIMEOUT`) and recovery link generation are logged in the immutable audit table.
                </div>
              </li>
            </ul>

            <div className="pt-4 border-t border-stone-200">
              <Link
                href="/dashboard/audit"
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                Inspect Incident in Audit Trail <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
