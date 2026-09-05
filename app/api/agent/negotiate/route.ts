import { NextRequest, NextResponse } from "next/server";
import { findProductBySku, fetchProductBySku } from "@/lib/catalog-data";
import { Product } from "@/types/product";
import { validateDiscount } from "@/lib/guardrails";
import { logAudit } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items = [], // SKUs
      requested_discount_percent = 10,
      buyer_agent_id = "agent-buyer-007",
      authorization_ref = "ap2_mandate_token_test",
    } = body;

    const resolvedItems: Product[] = (
      await Promise.all(items.map((sku: string) => fetchProductBySku(sku)))
    ).filter((p: Product | undefined): p is Product => Boolean(p));

    if (resolvedItems.length === 0) {
      return NextResponse.json({ error: "No valid items specified for negotiation" }, { status: 400 });
    }

    const originalTotal = resolvedItems.reduce((acc: number, item: any) => acc + item.price, 0);

    // Bounded check via merchant guardrails
    const discountCheck = validateDiscount(requested_discount_percent);
    const finalDiscountPercent = discountCheck.approvedPercent;
    const discountedTotal = Math.round(originalTotal * (1 - finalDiscountPercent / 100));

    const offerId = `offer_${Date.now().toString(36)}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    await logAudit({
      conversation_id: offerId,
      customer_id: buyer_agent_id,
      action_type: "agent_negotiated",
      action_details: {
        buyer_agent_id,
        items,
        original_total: originalTotal,
        requested_discount: `${requested_discount_percent}%`,
        granted_discount: `${finalDiscountPercent}%`,
        discounted_total: discountedTotal,
        reasoning: discountCheck.details,
      },
      revenue_impact: -Math.round(originalTotal - discountedTotal),
      guardrail_check: {
        guardrail: "max_bundle_discount_percent",
        passed: !discountCheck.capped,
        limit: discountCheck.limit,
        actual: requested_discount_percent,
        details: discountCheck.details,
      },
      agent_type: "agent",
    });

    return NextResponse.json({
      status: discountCheck.capped ? "counter_offer" : "accepted",
      offer_id: offerId,
      original_total_paise: originalTotal,
      offered_discount_percent: finalDiscountPercent,
      offered_total_paise: discountedTotal,
      offered_total_formatted: `₹${(discountedTotal / 100).toFixed(0)}`,
      valid_until: expiresAt,
      guardrail_enforcement: discountCheck.details,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
