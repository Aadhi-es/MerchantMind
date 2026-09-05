import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/catalog-data";
import { logAudit } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const maxPriceStr = searchParams.get("max_price");
    const maxPrice = maxPriceStr ? parseInt(maxPriceStr, 10) : undefined;
    const tagsParam = searchParams.get("tags");
    const query = searchParams.get("q") || "";
    const buyerAgentId = req.headers.get("x-agent-id") || "ai-buyer-agent";

    const results = searchCatalog(query, category, maxPrice);

    // Filter by tags if specified
    const filtered = tagsParam
      ? results.filter((p) => tagsParam.split(",").some((t) => p.tags.includes(t.trim())))
      : results;

    const queryId = `query_${Date.now().toString(36)}`;

    // Log the agent query into the immutable audit trail
    await logAudit({
      conversation_id: queryId,
      customer_id: buyerAgentId,
      action_type: "agent_query_received",
      action_details: {
        buyer_agent: buyerAgentId,
        query_params: { category, max_price: maxPrice, tags: tagsParam, q: query },
        results_count: filtered.length,
        matched_skus: filtered.map((p) => p.sku),
      },
      agent_type: "agent",
    });

    return NextResponse.json({
      merchant: "MerchantMind",
      protocol_supported: ["ACP", "AP2", "UAP"],
      query_id: queryId,
      total_results: filtered.length,
      results: filtered.map((p) => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        price_paise: p.price,
        price_formatted: `₹${(p.price / 100).toFixed(0)}`,
        currency: p.currency,
        in_stock: p.in_stock,
        stock_count: p.stock_count,
        tags: p.tags,
        features: p.features,
        description: p.description,
        pairs_with: p.pairs_with,
        upgrades_to: p.upgrades_to,
        endpoints: {
          negotiate: "/api/agent/negotiate",
          checkout: "/api/agent/checkout",
        },
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
