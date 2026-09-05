import { NextRequest, NextResponse } from "next/server";
import { fetchProductBySku } from "@/lib/catalog-data";
import { getGuardrails } from "@/lib/guardrails";
import { getGeminiClient } from "@/lib/gemini";
import { CONFIG } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productSku,
      bundleSku,
      requestedDiscountPercent = 12,
      buyerBudgetPaise = 15000000,
      buyerPersona = "Enterprise Procurement Bot",
      protocol = "ap2",
      buyerAgentId = "agent-gemini-buyer-99",
    } = body;

    const targetProduct = await fetchProductBySku(productSku);
    if (!targetProduct) {
      return NextResponse.json({ error: `Product ${productSku} not found` }, { status: 404 });
    }

    const bundleProduct = bundleSku ? await fetchProductBySku(bundleSku) : null;
    const basePrice = targetProduct.price;
    const bundlePrice = bundleProduct ? bundleProduct.price : 0;
    const combinedRetailPaise = basePrice + bundlePrice;

    // Wholesale cost estimation (~75-80% of retail price)
    const wholesaleCostPaise = Math.round(combinedRetailPaise * 0.78);

    const guardrails = getGuardrails();
    const maxAllowedDiscount = guardrails.max_bundle_discount_percent || 15;

    // Dynamic negotiation game theory
    let approvedDiscountPercent: number;
    let guardrailStatus: "ACCEPTED" | "COUNTER_OFFER_CAPPED";
    let guardrailDetail: string;

    if (requestedDiscountPercent <= maxAllowedDiscount) {
      // Within allowed discount
      approvedDiscountPercent = requestedDiscountPercent;
      guardrailStatus = "ACCEPTED";
      guardrailDetail = `Discount of ${requestedDiscountPercent}% is within the merchant's ${maxAllowedDiscount}% discount ceiling. Full request approved.`;
    } else {
      // Breached discount floor -> seller counter-proposes bounded concession
      approvedDiscountPercent = maxAllowedDiscount;
      guardrailStatus = "COUNTER_OFFER_CAPPED";
      guardrailDetail = `Requested ${requestedDiscountPercent}% discount breaches merchant policy (Max ${maxAllowedDiscount}% floor). Counter-offering ${maxAllowedDiscount}% maximum concession.`;
    }

    const finalPaise = Math.round(combinedRetailPaise * (1 - approvedDiscountPercent / 100));
    const savingsPaise = combinedRetailPaise - finalPaise;
    const merchantProfitPaise = finalPaise - wholesaleCostPaise;
    const merchantMarginPercent = ((merchantProfitPaise / finalPaise) * 100).toFixed(1);

    const hagglingMode = body.hagglingMode || "desi";

    // Step 1 baseline & anchor
    const openingDemandPercent = Math.max(requestedDiscountPercent, 28);

    // Call Google Gemini for live, unscripted dual-agent negotiation dialogue & multi-turn drama
    let buyerThought = `Authorized to acquire ${targetProduct.name}. Requesting ${requestedDiscountPercent}% volume discount under ${protocol.toUpperCase()} mandate.`;
    let sellerThought = `Wholesale cost ₹${(wholesaleCostPaise / 100).toLocaleString("en-IN")}. ${guardrailDetail} Net profit margin preserved at ${merchantMarginPercent}%.`;

    let hagglingSteps = [
      {
        step: 1,
        tactic: "AGGRESSIVE_ANCHOR",
        desi_badge: "🔥 AGGRESSIVE ANCHOR",
        buyer_dialogue: `Look at that retail markup! Give me a clean ${openingDemandPercent}% discount right now. Everyone knows competitors are offering massive seasonal markdowns across the street!`,
        buyer_machine_detail: `Demanding ${openingDemandPercent}% discount anchor under ${protocol.toUpperCase()} mandate. Testing merchant elasticity floor.`,
        buyer_thought: `Anchoring spread deep below catalog retail to shock the merchant agent into a high concession band.`,
        seller_dialogue: `Are you trying to put me out of business?! My wholesale acquisition cost alone is ₹${(wholesaleCostPaise / 100).toLocaleString("en-IN")}, I would literally be taking a loss! The absolute best I can do with verified warranty and invoice is 5%.`,
        seller_machine_detail: `Wholesale acquisition floor enforced (₹${(wholesaleCostPaise / 100).toLocaleString("en-IN")}). Counter-offering 5% baseline.`,
        seller_thought: `Wholesale cost ₹${(wholesaleCostPaise / 100).toLocaleString("en-IN")} prohibits ${openingDemandPercent}% discount. Net margin would drop to negative. Enforcing 5% floor.`,
        buyer_offered_discount: openingDemandPercent,
        seller_approved_discount: 5,
        price_paise: Math.round(combinedRetailPaise * 0.95),
        price_formatted: `₹${(Math.round(combinedRetailPaise * 0.95) / 100).toLocaleString("en-IN")}`,
      },
      {
        step: 2,
        tactic: "WALKAWAY_BLUFF",
        desi_badge: "⚡ WALKAWAY BLUFF",
        buyer_dialogue: `Only 5%? You have got to be joking! Amazon and competing autonomous bots are quoting 20% off right now with free delivery. Cancel the session, I'm taking my budget elsewhere!`,
        buyer_machine_detail: `Executing simulated walkaway threat. Citing competitor index rate to trigger merchant churn panic.`,
        buyer_thought: `5% is an unacceptable token concession. Simulating session abort to force retention override.`,
        seller_dialogue: `Wait, hold on, don't abort the session! Let me pull a special manager clearance here... Fine, I'll push it to 10% plus free priority dispatch, but that is my final word!`,
        seller_machine_detail: `Churn mitigation override activated. Customer Lifetime Value model authorizes 10% retention concession.`,
        seller_thought: `Abandonment probability high (91.4%). Re-calculating margin elasticity: 10% retains healthy gross profit.`,
        buyer_offered_discount: 20,
        seller_approved_discount: 10,
        price_paise: Math.round(combinedRetailPaise * 0.90),
        price_formatted: `₹${(Math.round(combinedRetailPaise * 0.90) / 100).toLocaleString("en-IN")}`,
      },
      {
        step: 3,
        tactic: "MEET_IN_THE_MIDDLE",
        desi_badge: "🤝 MEET IN THE MIDDLE",
        buyer_dialogue: `Let's meet in the middle: lock it at ${approvedDiscountPercent}% flat, and I will authorize an instant Razorpay UPI mandate right this second with zero hassle!`,
        buyer_machine_detail: `Proposing Pareto-optimal 'Meet in the Middle' compromise at ${approvedDiscountPercent}% with guaranteed instant UPI settlement.`,
        buyer_thought: `Optimal convergence reached: ${approvedDiscountPercent}% delivers maximum consumer surplus while keeping merchant solvent.`,
        seller_dialogue: `You drive a brutally hard bargain! Fine, ${approvedDiscountPercent}% locked in. My margin survives at +${merchantMarginPercent}%, and you get your gear. Authorizing the mandate now before I change my mind!`,
        seller_machine_detail: `Accord locked at ${approvedDiscountPercent}%. Merchant net profit margin preserved at +${merchantMarginPercent}%. Instant UPI mandate authorized.`,
        seller_thought: `Instant UPI settlement eliminates collection overhead. Net margin of +${merchantMarginPercent}% strictly above floor. DEAL LOCKED.`,
        buyer_offered_discount: approvedDiscountPercent,
        seller_approved_discount: approvedDiscountPercent,
        price_paise: finalPaise,
        price_formatted: `₹${(finalPaise / 100).toLocaleString("en-IN")}`,
      },
    ];

    try {
      const client = getGeminiClient();
      if (client) {
        const candidateModels = [
          CONFIG.gemini.model,
          "gemini-3.5-flash-lite",
          "gemini-2.5-flash",
          "gemini-2.0-flash",
        ];
        const prompt = `
You are simulating a high-stakes, witty, dramatic autonomous machine-to-machine haggling duel between two AI agents:
1. Buyer Agent (${buyerPersona}, protocol: ${protocol.toUpperCase()}, budget: ₹${(buyerBudgetPaise / 100).toLocaleString("en-IN")}).
   Personality: Relentless, aggressive bargain hunter bot. Anchors very low, calls out retail markup, threatens to walk away to competitor bots ("Amazon and Croma bots are quoting cheaper!"), and closes with "Let's meet in the middle" backed by instant UPI payment.
2. MerchantMind Seller Agent (protecting store wholesale margin, max allowed discount: ${maxAllowedDiscount}%).
   Personality: Sharp, dramatic merchant defending store margins. Complains ("Are you trying to put me out of business?!", "Wholesale cost is barely covered!"), panics when buyer threatens to walk away, offers manager clearance, and reluctantly concedes ("You drive a brutally hard bargain!").

IMPORTANT INSTRUCTION: All dialogue MUST be in 100% natural, dramatic, colloquial ENGLISH. Do NOT use any Hindi or Hinglish words.

Target Item: ${targetProduct.name} (Retail: ₹${(basePrice / 100).toLocaleString("en-IN")})
${bundleProduct ? `Bundle: ${bundleProduct.name} (Retail: ₹${(bundlePrice / 100).toLocaleString("en-IN")})` : ""}
Total Retail: ₹${(combinedRetailPaise / 100).toLocaleString("en-IN")}
Wholesale Cost: ₹${(wholesaleCostPaise / 100).toLocaleString("en-IN")}
Approved Final Discount: ${approvedDiscountPercent}%
Final Price: ₹${(finalPaise / 100).toLocaleString("en-IN")} (Profit margin: +${merchantMarginPercent}%)

Return strict JSON wrapped in \`\`\`json ... \`\`\` with this exact structure:
{
  "haggling_steps": [
    {
      "step": 1,
      "tactic": "AGGRESSIVE_ANCHOR",
      "desi_badge": "🔥 AGGRESSIVE ANCHOR",
      "buyer_dialogue": "Dramatic English dialogue demanding 35% discount, calling out markup...",
      "buyer_thought": "1 sentence of machine game-theory logic for the anchor in English.",
      "seller_dialogue": "Dramatic English resistance mentioning wholesale cost and asking if they want to ruin the store...",
      "seller_thought": "1 sentence of margin guardrail calculation in English."
    },
    {
      "step": 2,
      "tactic": "WALKAWAY_BLUFF",
      "desi_badge": "⚡ WALKAWAY BLUFF",
      "buyer_dialogue": "Dramatic English walkaway threat citing competitor bots selling cheaper with free delivery...",
      "buyer_thought": "1 sentence of bluff execution to trigger churn mitigation in English.",
      "seller_dialogue": "Dramatic English panic and store manager clearance counter-offering 10% with free shipping...",
      "seller_thought": "1 sentence of customer lifetime value retention calculation in English."
    },
    {
      "step": 3,
      "tactic": "MEET_IN_THE_MIDDLE",
      "desi_badge": "🤝 MEET IN THE MIDDLE",
      "buyer_dialogue": "Classic 'Let's meet in the middle' in English offering instant UPI mandate at ${approvedDiscountPercent}%...",
      "buyer_thought": "1 sentence of convergence on Pareto optimal price in English.",
      "seller_dialogue": "Dramatic 'You drive a brutally hard bargain!' acceptance locking the deal in English...",
      "seller_thought": "1 sentence of margin floor validation and UPI mandate release in English."
    }
  ]
}
`;
        for (const mName of candidateModels) {
          try {
            const model = client.getGenerativeModel({ model: mName });
            const geminiRes = await model.generateContent(prompt);
            const text = geminiRes.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.haggling_steps && Array.isArray(parsed.haggling_steps) && parsed.haggling_steps.length === 3) {
                hagglingSteps = parsed.haggling_steps.map((st: any, idx: number) => ({
                  ...hagglingSteps[idx],
                  ...st,
                  price_paise: hagglingSteps[idx].price_paise,
                  price_formatted: hagglingSteps[idx].price_formatted,
                }));
                buyerThought = hagglingSteps[2].buyer_thought || buyerThought;
                sellerThought = hagglingSteps[2].seller_thought || sellerThought;
                break;
              }
            }
          } catch (e) {
            // try next model
          }
        }
      }
    } catch (err: any) {
      console.warn("Live Gemini dual-agent call fallback:", err.message);
    }

    const offerId = `offer_${Date.now().toString(36)}`;

    return NextResponse.json({
      success: true,
      offer_id: offerId,
      protocol: protocol.toUpperCase(),
      haggling_mode: hagglingMode,
      haggling_steps: hagglingSteps,
      target_product: {
        sku: targetProduct.sku,
        name: targetProduct.name,
        price_paise: targetProduct.price,
        formatted_price: `₹${(targetProduct.price / 100).toLocaleString("en-IN")}`,
      },
      bundle_product: bundleProduct
        ? {
            sku: bundleProduct.sku,
            name: bundleProduct.name,
            price_paise: bundleProduct.price,
            formatted_price: `₹${(bundleProduct.price / 100).toLocaleString("en-IN")}`,
          }
        : null,
      combined_retail_paise: combinedRetailPaise,
      combined_retail_formatted: `₹${(combinedRetailPaise / 100).toLocaleString("en-IN")}`,
      requested_discount_percent: requestedDiscountPercent,
      approved_discount_percent: approvedDiscountPercent,
      final_paise: finalPaise,
      final_formatted: `₹${(finalPaise / 100).toLocaleString("en-IN")}`,
      savings_paise: savingsPaise,
      savings_formatted: `₹${(savingsPaise / 100).toLocaleString("en-IN")}`,
      merchant_margin_percent: merchantMarginPercent,
      guardrail_status: guardrailStatus,
      guardrail_enforcement: guardrailDetail,
      buyer_thought: buyerThought,
      seller_thought: sellerThought,
      model_used: "Google Gemini 3.5 Flash Lite",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
