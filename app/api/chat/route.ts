import { NextRequest, NextResponse } from "next/server";
import { processConversation } from "@/lib/gemini";
import { getLiveCatalog, findProductBySku } from "@/lib/catalog-data";
import { Product } from "@/types/product";
import { validateUpsell } from "@/lib/guardrails";
import { logIntentParsed, logUpsellEvaluated } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], conversationId = `conv_${Date.now()}`, currentCartSkus = [] } = body;

    const lastMessage = messages[messages.length - 1]?.content || "";

    // 1. Infer category dynamically without shoe bias
    const lower = lastMessage.toLowerCase();
    const inferredCategory =
      lower.includes("audio") || lower.includes("speaker") || lower.includes("headphone")
        ? "audio"
        : lower.includes("cable") || lower.includes("stand") || lower.includes("mouse") || lower.includes("keyboard")
        ? "accessories"
        : lower.includes("watch") || lower.includes("fitness")
        ? "wearables"
        : "electronics";

    await logIntentParsed(conversationId, lastMessage, {
      category: inferredCategory,
      query: lastMessage,
    });

    // 2. Fetch live catalog and process conversation
    const liveCatalog = await getLiveCatalog();
    const result = await processConversation(messages, currentCartSkus);

    // 3. Resolve recommended products from live catalog
    const recommendedProducts: Product[] = result.recommendedSkus
      .map((sku) => liveCatalog.find((p) => p.sku?.toLowerCase() === sku.toLowerCase()) || findProductBySku(sku))
      .filter((p: Product | undefined): p is Product => Boolean(p));

    // 4. If an upsell is suggested, evaluate it against merchant guardrails
    let evaluatedUpsell = null;
    if (result.suggestedUpsell) {
      const orig =
        liveCatalog.find((p) => p.sku?.toLowerCase() === result.suggestedUpsell!.originalSku.toLowerCase()) ||
        findProductBySku(result.suggestedUpsell.originalSku);
      const up =
        liveCatalog.find((p) => p.sku?.toLowerCase() === result.suggestedUpsell!.upsellSku.toLowerCase()) ||
        findProductBySku(result.suggestedUpsell.upsellSku);

      if (orig && up) {
        const guardrailCheck = validateUpsell(orig.price, up.price);

        await logUpsellEvaluated(
          conversationId,
          orig.sku,
          up.sku,
          orig.price,
          up.price,
          guardrailCheck,
          result.suggestedUpsell.reason
        );

        if (guardrailCheck.passed) {
          evaluatedUpsell = {
            originalProduct: orig,
            upsellProduct: up,
            priceDelta: up.price - orig.price,
            deltaPercent: guardrailCheck.deltaPercent,
            reason: result.suggestedUpsell.reason,
          };
        }
      }
    }

    // 5. Resolve cross-sells
    const crossSellProducts: Product[] = (result.suggestedCrossSells || [])
      .map((sku) => liveCatalog.find((p) => p.sku?.toLowerCase() === sku.toLowerCase()) || findProductBySku(sku))
      .filter((p: Product | undefined): p is Product => Boolean(p));

    return NextResponse.json({
      reply: result.reply,
      recommendedProducts,
      upsell: evaluatedUpsell,
      crossSells: crossSellProducts,
      conversationId,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "Something went wrong while processing your request. I've noted it down, please try asking again.",
        recommendedProducts: [],
      },
      { status: 500 }
    );
  }
}
