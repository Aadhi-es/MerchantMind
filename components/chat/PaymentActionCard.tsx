"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { CreditCard, ExternalLink, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface PaymentActionCardProps {
  orderData: {
    orderId: string;
    amount: number; // in paise
    paymentUrl: string;
    paymentLinkId: string;
    items: Array<{ name: string; price: number; quantity: number }>;
  };
  onSimulateSuccess: () => void;
  onSimulateFailure: () => void;
  paymentStatus: "pending" | "paid" | "failed";
  onRetryPayment?: () => void;
  failureExplanation?: string;
}

export function PaymentActionCard({
  orderData,
  onSimulateSuccess,
  onSimulateFailure,
  paymentStatus,
  onRetryPayment,
  failureExplanation,
}: PaymentActionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <GlassCard variant="default" className="p-4 my-3 max-w-xl border-white/[0.12]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold text-text-primary">Razorpay Order Checkout</span>
        </div>
        <div>
          {paymentStatus === "pending" && (
            <GlassBadge variant="warning" size="sm">
              Waiting for Payment
            </GlassBadge>
          )}
          {paymentStatus === "paid" && (
            <GlassBadge variant="success" size="sm">
              <CheckCircle2 className="w-3 h-3" />
              Paid & Verified ✓
            </GlassBadge>
          )}
          {paymentStatus === "failed" && (
            <GlassBadge variant="error" size="sm">
              <AlertTriangle className="w-3 h-3" />
              Payment Unsuccessful
            </GlassBadge>
          )}
        </div>
      </div>

      {/* Items Summary */}
      <div className="py-2.5 space-y-1.5 text-xs">
        {orderData.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-text-secondary">
            <span>
              {item.name} <span className="text-text-dim">× {item.quantity}</span>
            </span>
            <span className="font-mono text-text-primary">
              ₹{((item.price * item.quantity) / 100).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
        <div className="flex justify-between font-semibold pt-2 border-t border-white/[0.05] text-text-primary text-sm">
          <span>Total Payable</span>
          <span className="text-gold font-mono text-base">
            ₹{(orderData.amount / 100).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Failure message if failed */}
      {paymentStatus === "failed" && (
        <div className="p-3 rounded-lg bg-status-errorBg border border-status-error/30 text-xs text-text-primary my-2.5 space-y-1.5">
          <div className="font-semibold text-status-error flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Bank Gateway Timeout
          </div>
          <p className="text-[11px] text-text-secondary">
            {failureExplanation ||
              "Your bank network timed out before confirming the debit. No money was deducted. Your cart is preserved."}
          </p>
          {onRetryPayment && (
            <GlassButton size="sm" variant="gold" onClick={onRetryPayment} className="mt-2 text-xs py-1">
              <RefreshCw className="w-3 h-3" />
              Generate Fresh Payment Link
            </GlassButton>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {paymentStatus === "pending" && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2.5">
          <a
            href={orderData.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-card bg-gold hover:bg-gold-hover text-[#0F0F0F] font-semibold text-xs transition-all shadow-[0_0_15px_rgba(212,168,83,0.25)]"
          >
            <span>Open Razorpay Payment Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Test & Demo Simulators */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-text-dim border-t border-white/[0.04]">
            <span>Demo Triggers:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSimulateSuccess}
                className="hover:text-status-success underline transition-colors"
              >
                [Simulate Success]
              </button>
              <button
                type="button"
                onClick={onSimulateFailure}
                className="hover:text-status-error underline transition-colors"
              >
                [Simulate Failure]
              </button>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
