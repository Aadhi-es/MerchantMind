import { MerchantGuardrails } from "@/types/audit";

export const DEFAULT_GUARDRAILS: MerchantGuardrails = {
  max_single_transaction: 50000000, // ₹5,00,000 in paise (realistic for laptops, appliances, flagship gear)
  max_daily_agent_revenue: 200000000, // ₹20,00,000 in paise
  max_upsell_delta_percent: 30, // Max 30% price increase for an upsell
  max_crosssell_items: 2, // Maximum 2 cross-sell items recommended
  max_bundle_discount_percent: 15, // Maximum 15% discount for negotiations
  daily_campaign_budget: 5000000, // ₹50,000
  blocked_categories: ["alcohol", "tobacco", "pharmaceuticals", "supplements"],
  operating_hours: {
    start: "09:00",
    end: "23:00",
    timezone: "Asia/Kolkata",
  },
  allow_agent_purchases: true,
  require_agent_authorization: true,
};

let currentGuardrails = { ...DEFAULT_GUARDRAILS };

export function getGuardrails(): MerchantGuardrails {
  return currentGuardrails;
}

export function updateGuardrails(newConfig: Partial<MerchantGuardrails>): MerchantGuardrails {
  currentGuardrails = { ...currentGuardrails, ...newConfig };
  return currentGuardrails;
}

/**
 * Validates whether an upsell is bounded within merchant policy (e.g. <= 30% increase)
 */
export function validateUpsell(
  originalPrice: number,
  upsellPrice: number
): { passed: boolean; deltaPercent: number; limit: number; details: string } {
  const delta = upsellPrice - originalPrice;
  const deltaPercent = (delta / originalPrice) * 100;
  const limit = currentGuardrails.max_upsell_delta_percent;

  const passed = delta > 0 && deltaPercent <= limit;
  return {
    passed,
    deltaPercent: Math.round(deltaPercent * 10) / 10,
    limit,
    details: passed
      ? `Upsell delta of ₹${(delta / 100).toFixed(0)} (${deltaPercent.toFixed(1)}%) is within the ${limit}% merchant safety cap.`
      : `Blocked: Upsell delta of ₹${(delta / 100).toFixed(0)} (${deltaPercent.toFixed(1)}%) exceeds the ${limit}% merchant limit.`,
  };
}

/**
 * Validates that an order amount doesn't breach the single transaction cap
 */
export function validateOrderAmount(amount: number): { passed: boolean; limit: number; details: string } {
  const limit = currentGuardrails.max_single_transaction;
  const passed = amount <= limit;
  return {
    passed,
    limit,
    details: passed
      ? `Order total of ₹${(amount / 100).toFixed(0)} is below the single transaction ceiling of ₹${(limit / 100).toFixed(0)}.`
      : `Blocked: Order total of ₹${(amount / 100).toFixed(0)} exceeds the maximum safety cap of ₹${(limit / 100).toFixed(0)}.`,
  };
}

/**
 * Validates agent negotiated discounts
 */
export function validateDiscount(requestedDiscountPercent: number): {
  approvedPercent: number;
  capped: boolean;
  limit: number;
  details: string;
} {
  const limit = currentGuardrails.max_bundle_discount_percent;
  if (requestedDiscountPercent <= limit) {
    return {
      approvedPercent: requestedDiscountPercent,
      capped: false,
      limit,
      details: `Discount of ${requestedDiscountPercent}% approved within merchant maximum of ${limit}%.`,
    };
  }

  return {
    approvedPercent: limit,
    capped: true,
    limit,
    details: `Counter-offer: Requested discount of ${requestedDiscountPercent}% capped at merchant maximum of ${limit}%.`,
  };
}
