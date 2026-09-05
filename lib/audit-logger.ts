import { insertAuditEntry } from "./supabase";
import { AuditLogEntry } from "@/types/audit";

export async function logAudit(entry: AuditLogEntry) {
  return await insertAuditEntry(entry);
}

export async function logIntentParsed(
  conversationId: string,
  userMessage: string,
  parsedIntent: {
    product_type?: string;
    max_price?: number;
    fit?: string;
    category?: string;
    features?: string[];
    query?: string;
  }
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "intent_parsed",
    action_details: {
      raw_message: userMessage,
      parsed_intent: parsedIntent,
      reasoning: `Extracted intent for category '${parsedIntent.category || "any"}' with constraints: fit=${parsedIntent.fit || "any"}, max_price=${parsedIntent.max_price ? "₹" + parsedIntent.max_price / 100 : "unspecified"}.`,
    },
    agent_type: "human",
  });
}

export async function logUpsellEvaluated(
  conversationId: string,
  originalSku: string,
  upsellSku: string,
  originalPrice: number,
  upsellPrice: number,
  guardrailResult: { passed: boolean; deltaPercent: number; limit: number; details: string },
  customerNeedMatch: string
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "upsell_evaluated",
    action_details: {
      original_sku: originalSku,
      upsell_sku: upsellSku,
      original_price: originalPrice,
      upsell_price: upsellPrice,
      price_delta: upsellPrice - originalPrice,
      delta_percent: guardrailResult.deltaPercent,
      customer_need_match: customerNeedMatch,
      reasoning: `Customer selected ${originalSku}. Evaluated upgrade ${upsellSku} for ₹${(upsellPrice - originalPrice) / 100} more (+${guardrailResult.deltaPercent}%). Guardrail check: ${guardrailResult.passed ? "PASSED" : "BLOCKED"}.`,
    },
    guardrail_check: {
      guardrail: "max_upsell_delta_percent",
      passed: guardrailResult.passed,
      limit: guardrailResult.limit,
      actual: guardrailResult.deltaPercent,
      details: guardrailResult.details,
    },
    agent_type: "human",
  });
}

export async function logCheckoutInitiated(
  conversationId: string,
  orderId: string,
  paymentLinkId: string,
  paymentUrl: string,
  totalAmount: number,
  items: Array<{ sku: string; name: string; price: number; quantity: number }>
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "checkout_initiated",
    action_details: {
      items,
      total_amount: totalAmount,
      currency: "INR",
      payment_url: paymentUrl,
      reasoning: `Customer initiated checkout for ${items.length} item(s). Created Razorpay order and payment link. Total: ₹${(totalAmount / 100).toFixed(0)}.`,
    },
    razorpay_ids: {
      order_id: orderId,
      payment_link_id: paymentLinkId,
      payment_link_url: paymentUrl,
    },
    revenue_impact: totalAmount,
    agent_type: "human",
  });
}

export async function logPaymentConfirmed(
  conversationId: string,
  orderId: string,
  paymentId: string,
  amount: number,
  method: string
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "payment_confirmed",
    action_details: {
      status: "captured",
      method,
      amount,
      reasoning: `Razorpay webhook/callback confirmed payment ${paymentId} for order ${orderId} via ${method}. Order marked completed.`,
    },
    razorpay_ids: {
      order_id: orderId,
      payment_id: paymentId,
    },
    revenue_impact: amount,
    agent_type: "human",
  });
}

export async function logPaymentFailed(
  conversationId: string,
  orderId: string,
  errorCode: string,
  errorDescription: string,
  attemptNumber: number
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "payment_failed",
    action_details: {
      error_code: errorCode,
      error_description: errorDescription,
      attempt_number: attemptNumber,
      action_taken: "graceful_recovery_offered",
      reasoning: `Payment attempt ${attemptNumber} for order ${orderId} failed due to '${errorCode}: ${errorDescription}'. Agent offered non-panicking explanation and a fresh retry link.`,
    },
    razorpay_ids: {
      order_id: orderId,
      error_code: errorCode,
      error_description: errorDescription,
    },
    agent_type: "human",
  });
}

export async function logPaymentRetried(
  conversationId: string,
  orderId: string,
  newPaymentLinkId: string,
  newPaymentUrl: string
) {
  return await logAudit({
    conversation_id: conversationId,
    action_type: "payment_retried",
    action_details: {
      new_payment_link_id: newPaymentLinkId,
      new_payment_url: newPaymentUrl,
      reasoning: `Customer requested retry after previous failure. Generated clean replacement payment link for existing order ${orderId}.`,
    },
    razorpay_ids: {
      order_id: orderId,
      payment_link_id: newPaymentLinkId,
      payment_link_url: newPaymentUrl,
    },
    agent_type: "human",
  });
}
