import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, createRazorpayPaymentLink } from "@/lib/razorpay";
import { validateOrderAmount } from "@/lib/guardrails";
import { logCheckoutInitiated } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items = [], conversationId = `conv_${Date.now()}` } = body;

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (item.price || item.product?.price || 0) * (item.quantity || 1),
      0
    );

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    // 1. Guardrail Check: Single transaction ceiling
    const guardrailCheck = validateOrderAmount(totalAmount);
    if (!guardrailCheck.passed) {
      return NextResponse.json(
        {
          error: guardrailCheck.details,
          guardrailBlocked: true,
        },
        { status: 403 }
      );
    }

    // 2. Create Razorpay order
    const orderRes = await createRazorpayOrder({
      amount: totalAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        conversationId,
        itemsCount: String(items.length),
      },
    });

    const description = `Order for ${items.length} item(s): ${items
      .map((i: any) => i.name || i.product?.name)
      .slice(0, 2)
      .join(", ")}`;

    // 3. Create Razorpay payment link
    const linkRes = await createRazorpayPaymentLink({
      amount: totalAmount,
      description,
      notes: {
        orderId: orderRes.order.id,
        conversationId,
      },
    });

    // 4. Log to Audit Trail
    await logCheckoutInitiated(
      conversationId,
      orderRes.order.id,
      linkRes.paymentLink.id,
      linkRes.paymentLink.short_url,
      totalAmount,
      items.map((i: any) => ({
        sku: i.sku || i.product?.sku,
        name: i.name || i.product?.name,
        price: i.price || i.product?.price,
        quantity: i.quantity || 1,
      }))
    );

    // 5. Insert into Supabase orders table
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("orders").insert([
          {
            id: `ord_${Date.now()}`,
            razorpay_order_id: orderRes.order.id,
            conversation_id: conversationId,
            customer_id: "customer_web",
            amount: totalAmount,
            currency: "INR",
            status: "created",
            items: items,
            metadata: { payment_link: linkRes.paymentLink.short_url },
          },
        ]);
      }
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      order: orderRes.order,
      paymentLink: linkRes.paymentLink,
      guardrailCheck,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
