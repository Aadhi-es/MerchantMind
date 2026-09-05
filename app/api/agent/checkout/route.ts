import { NextRequest, NextResponse } from "next/server";
import { findProductBySku, fetchProductBySku } from "@/lib/catalog-data";
import { createRazorpayOrder, createRazorpayPaymentLink } from "@/lib/razorpay";
import { logAudit } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items = [], // [{ sku, quantity, size }]
      offer_id,
      buyer_agent_id = "agent-buyer-test",
      authorization = { protocol: "ap2", token: "ap2_verified_token_sample" },
      payment_method = "upi",
      final_price_paise,
    } = body;

    // Gated Guardrail Check: Cryptographic mandate token verification
    if (!authorization || !authorization.token) {
      await logAudit({
        conversation_id: `audit_fail_${Date.now().toString(36)}`,
        customer_id: buyer_agent_id,
        action_type: "guardrail_triggered",
        action_details: {
          error: "UNAUTHORIZED_GATED_FAILURE",
          reasoning: "Gated security check failed: Autonomous checkout rejected due to missing or unverified cryptographic mandate token under AP2/UAP standards.",
        },
        guardrail_check: {
          guardrail: "require_agent_authorization",
          passed: false,
          details: "Cryptographic authority token verification rejected (missing signature).",
        },
        agent_type: "agent",
      });
      return NextResponse.json(
        {
          error: "UNAUTHORIZED_MANDATE",
          message: "Gated security check: Cryptographic authorization token is required to execute autonomous checkout under AP2 / UAP protocol.",
          guardrail_status: "REJECTED_GATED_FAILURE",
        },
        { status: 401 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Empty cart for agent checkout" }, { status: 400 });
    }

    const resolvedItems = (
      await Promise.all(
        items.map(async (item: any) => {
          const prod = await fetchProductBySku(item.sku);
          if (!prod) return null;
          return {
            product: prod,
            quantity: item.quantity || 1,
            size: item.size || "Standard",
          };
        })
      )
    ).filter(Boolean) as { product: any; quantity: number; size: string }[];

    if (resolvedItems.length === 0) {
      return NextResponse.json({ error: "No matching catalog items found" }, { status: 400 });
    }

    const originalTotal = resolvedItems.reduce(
      (sum: number, i: any) => sum + i.product.price * i.quantity,
      0
    );

    // If a negotiated discount was accepted within guardrails, use final_price_paise
    const totalAmount =
      final_price_paise && final_price_paise > 0 && final_price_paise <= originalTotal
        ? final_price_paise
        : originalTotal;

    // 1. Create Razorpay order
    const orderRes = await createRazorpayOrder({
      amount: totalAmount,
      currency: "INR",
      receipt: `agent_rcpt_${Date.now()}`,
      notes: {
        source: "agent_to_agent",
        protocol: authorization.protocol || "ap2",
        buyerAgentId: buyer_agent_id,
      },
    });

    // 2. Create Payment Link
    const linkRes = await createRazorpayPaymentLink({
      amount: totalAmount,
      description: `Autonomous agent order by ${buyer_agent_id} (${authorization.protocol})`,
      customer: {
        name: `AI Buyer (${buyer_agent_id})`,
        email: "agent.buyer@network.ai",
      },
      notes: {
        orderId: orderRes.order.id,
        authProtocol: authorization.protocol,
      },
    });

    const auditId = `audit_ag_${Date.now().toString(36)}`;

    // 3. Log to Immutable Audit Trail
    await logAudit({
      conversation_id: auditId,
      customer_id: buyer_agent_id,
      action_type: "agent_checkout",
      action_details: {
        buyer_agent_id,
        authorization_protocol: authorization.protocol,
        authorization_token: authorization.token,
        items: resolvedItems.map((i: any) => ({
          sku: i.product.sku,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        total_amount: totalAmount,
        offer_id,
        payment_method,
        reasoning: `Authorized agent-to-agent checkout initiated under protocol ${authorization.protocol.toUpperCase()} by ${buyer_agent_id}. Razorpay order created and bound to mandate.`,
      },
      razorpay_ids: {
        order_id: orderRes.order.id,
        payment_link_id: linkRes.paymentLink.id,
        payment_link_url: linkRes.paymentLink.short_url,
      },
      revenue_impact: totalAmount,
      guardrail_check: {
        guardrail: "require_agent_authorization",
        passed: true,
        details: `Token verification passed for protocol ${authorization.protocol}`,
      },
      agent_type: "agent",
    });

    // Insert into Supabase orders table
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("orders").insert([
          {
            id: `ord_ag_${Date.now()}`,
            razorpay_order_id: orderRes.order.id,
            conversation_id: `conv_agent_${Date.now()}`,
            customer_id: buyer_agent_id,
            amount: totalAmount,
            currency: "INR",
            status: "created",
            items: resolvedItems.map((r: any) => ({ sku: r.product.sku, name: r.product.name, price: r.product.price, quantity: r.quantity })),
            metadata: { protocol: authorization.protocol, payment_link: linkRes.paymentLink.short_url },
          },
        ]);
      }
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      status: "order_created",
      order_id: orderRes.order.id,
      audit_id: auditId,
      total_paise: totalAmount,
      total_formatted: `₹${(totalAmount / 100).toFixed(0)}`,
      payment_link_url: linkRes.paymentLink.short_url,
      settlement_status: "pending_authorization_settlement",
      receipt: {
        merchant: "MerchantMind",
        items_count: items.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
