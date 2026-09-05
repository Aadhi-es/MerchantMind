import { NextRequest, NextResponse } from "next/server";
import { logPaymentConfirmed, logPaymentFailed, logPaymentRetried } from "@/lib/audit-logger";
import { createRazorpayPaymentLink } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "success", // "success" | "failure" | "retry"
      orderId = `order_${Date.now()}`,
      conversationId = `conv_${Date.now()}`,
      amount = 279900,
      errorCode = "GATEWAY_TIMEOUT",
      errorDescription = "Bank network timed out before debit confirmation. No money was deducted.",
    } = body;

    if (type === "success") {
      const paymentId = `pay_sim_${Date.now().toString(36)}`;
      await logPaymentConfirmed(conversationId, orderId, paymentId, amount, "UPI (Google Pay)");

      return NextResponse.json({
        success: true,
        status: "paid",
        paymentId,
        message: "Payment captured successfully via UPI. Order confirmed.",
      });
    }

    if (type === "failure") {
      await logPaymentFailed(conversationId, orderId, errorCode, errorDescription, 1);

      return NextResponse.json({
        success: false,
        status: "failed",
        errorCode,
        errorDescription,
        calmExplanation: "Payment didn't go through — your bank timed out before confirming. No money was deducted from your account. Your cart is saved.",
        retryActionAvailable: true,
      });
    }

    if (type === "retry") {
      const retryLinkRes = await createRazorpayPaymentLink({
        amount,
        description: `Retry Payment for Order ${orderId}`,
      });

      await logPaymentRetried(
        conversationId,
        orderId,
        retryLinkRes.paymentLink.id,
        retryLinkRes.paymentLink.short_url
      );

      return NextResponse.json({
        success: true,
        status: "retry_link_created",
        paymentLink: retryLinkRes.paymentLink,
        message: "Fresh payment link generated for same order without cart alteration.",
      });
    }

    return NextResponse.json({ error: "Invalid simulation type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
