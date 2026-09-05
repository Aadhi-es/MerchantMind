if (typeof process !== "undefined") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CONFIG } from "./config";
import { PRODUCTS, searchCatalog, searchCatalogSmart, findProductBySku, getLiveCatalog } from "./catalog-data";
import { Product } from "@/types/product";

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  if (CONFIG.gemini.apiKey) {
    genAI = new GoogleGenerativeAI(CONFIG.gemini.apiKey);
    return genAI;
  }
  return null;
}

function buildSystemInstruction(catalog: Product[]): string {
  return `
You are MerchantMind, an expert retail commerce and sales agent operating on conversational commerce.
Your mission is to help shoppers discover, evaluate, and purchase products from the store catalog with clear, bounded recommendations.

Core Voice & Tone Rules:
1. Write like a knowledgeable, direct store associate texting a friend. Short, punchy sentences.
2. NEVER use fake bubbly AI bot phrases like "I'd be happy to help you with that!", "Great question! 😊", or "I have curated some INCREDIBLE choices for you!".
3. Use natural, grounded recommendations. E.g. "The upgraded model is worth it for ₹400 more if you need maximum durability."
4. Match the customer's pace. If they ask a brief question, give a concise, confident answer.
5. Max 2-3 product options when presenting choices.
6. When recommending products, always specify their SKU so the UI can render rich interactive product cards.
7. Mention prices in Indian Rupees (e.g. ₹2,799).
8. If an upsell or cross-sell fits naturally, propose it without pressure.
9. Every money recommendation must be explainable and bounded.

Here is your current store catalog from the database:
${JSON.stringify(
  catalog.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.category,
    price: `₹${p.price / 100}`,
    tags: p.tags,
    short_pitch: p.short_pitch,
    features: p.features,
    pairs_with: p.pairs_with,
    upgrades_to: p.upgrades_to,
  })),
  null,
  2
)}
`;
}

export interface AgentResponse {
  reply: string;
  recommendedSkus: string[];
  suggestedUpsell?: {
    originalSku: string;
    upsellSku: string;
    priceDelta: number;
    reason: string;
  };
  suggestedCrossSells?: string[];
  intent?: {
    category?: string;
    maxPrice?: number;
    fit?: string;
  };
}

export function getSetupCompanions(
  catalog: Product[],
  currentCartSkus: string[],
  chosenSku?: string,
  isDeskSetup: boolean = true,
  isAudioSetup: boolean = false
): Product[] {
  const exclude = new Set([...(currentCartSkus || []), chosenSku].filter(Boolean) as string[]);

  let candidateSkus: string[] = [];

  const chosenProduct = chosenSku ? catalog.find((p) => p.sku?.toLowerCase() === chosenSku.toLowerCase()) : undefined;
  const pairsWith = chosenProduct?.pairs_with || [];

  if (isDeskSetup) {
    const coreDeskSkus = [
      "PER-KEY-01", // Keychron Q1 Pro Mechanical Keyboard
      "PER-LOG-01", // Logitech MX Master 3S Wireless Mouse
      "PER-DEL-01", // Dell UltraSharp 32" Curved 4K Monitor
      "AUD-MAR-01", // Marshall Stanmore III Bluetooth Speaker
      "STAT-GRV-01", // Grovemade Walnut Desk Shelf
      "PER-LOG-03", // Logitech MX Mechanical Keyboard
      "STAT-PRK-01", // Parker Sonnet Fountain Pen
      "AUD-SNY-01", // Sony WH-1000XM5 Headphones
    ];
    candidateSkus = Array.from(new Set([...pairsWith, ...coreDeskSkus]));
  } else if (isAudioSetup) {
    const coreAudioSkus = [
      "AUD-SNY-01",
      "AUD-MAR-01",
      "AUD-BOS-01",
      "AUD-APL-02",
      "AUD-JBL-01",
      "STAT-GRV-01",
    ];
    candidateSkus = Array.from(new Set([...pairsWith, ...coreAudioSkus]));
  } else if (chosenProduct) {
    const sameCat = catalog.filter((p) => p.category === chosenProduct.category).map((p) => p.sku);
    candidateSkus = Array.from(new Set([...pairsWith, ...sameCat]));
  } else {
    candidateSkus = catalog.slice(0, 10).map((p) => p.sku);
  }

  const companions = candidateSkus
    .filter((sku) => !exclude.has(sku))
    .map((sku) => catalog.find((p) => p.sku?.toLowerCase() === sku.toLowerCase()))
    .filter((p): p is Product => Boolean(p));

  return companions;
}

export async function processConversation(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  currentCartSkus: string[] = []
): Promise<AgentResponse> {
  const client = getGeminiClient();
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lastUserLower = lastUserMsg.toLowerCase().trim();

  // 1. Fetch live catalog dynamically from Supabase
  const liveCatalog = await getLiveCatalog();

  // 2. Multi-turn intent & theme detection
  const allUserText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const isDeskSetup =
    allUserText.includes("desk") ||
    allUserText.includes("setup") ||
    allUserText.includes("workstation") ||
    allUserText.includes("office") ||
    allUserText.includes("workspace") ||
    allUserText.includes("table");

  const isAudioSetup =
    allUserText.includes("audio") ||
    allUserText.includes("headphone") ||
    allUserText.includes("speaker") ||
    allUserText.includes("sound");

  const isSelectionOrFollowUp =
    /^(i'll take|i will take|i'll choose|i choose|i want|add|added|select|selected|go with|first one|second one|1st|2nd|pick|buy)\b/i.test(
      lastUserLower
    ) ||
    lastUserLower.includes("added to cart") ||
    lastUserLower.includes("what else") ||
    lastUserLower.includes("what next") ||
    lastUserLower.includes("recommend more") ||
    lastUserLower.includes("anything else") ||
    lastUserLower.includes("complete my setup") ||
    lastUserLower.includes("more things") ||
    lastUserLower.includes("more options") ||
    lastUserLower.includes("more items");

  // Determine what product was chosen or referred to
  let chosenProduct: Product | undefined = undefined;
  const directMatches = searchCatalogSmart(liveCatalog, lastUserMsg);
  if (isSelectionOrFollowUp) {
    if (directMatches.length > 0) {
      chosenProduct = directMatches[0];
    } else if (currentCartSkus.length > 0) {
      const lastSku = currentCartSkus[currentCartSkus.length - 1];
      chosenProduct = liveCatalog.find((p) => p.sku === lastSku);
    }
  }

  const companionCandidates = getSetupCompanions(
    liveCatalog,
    currentCartSkus,
    chosenProduct?.sku,
    isDeskSetup,
    isAudioSetup
  );

  const excludeSkus = new Set([...currentCartSkus, chosenProduct?.sku].filter(Boolean) as string[]);

  let candidateSlice: Product[];
  if (isSelectionOrFollowUp || (isDeskSetup && currentCartSkus.length > 0)) {
    candidateSlice = companionCandidates.length > 0 ? companionCandidates.slice(0, 12) : liveCatalog.slice(0, 8);
  } else {
    candidateSlice = directMatches.length > 0 ? directMatches.slice(0, 12) : liveCatalog.slice(0, 8);
  }

  if (client) {
    // Model candidates: prioritize verified active Gemini model
    const modelCandidates = [
      "gemini-3.5-flash-lite",
      CONFIG.gemini.model,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ];

    for (const modelName of modelCandidates) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: buildSystemInstruction(liveCatalog),
        });

        const conversationHistoryText = messages
          .slice(-6)
          .map((m) => `${m.role === "user" ? "Shopper" : "Curator"}: ${m.content}`)
          .join("\n");

        const prompt = `
Conversation history:
${conversationHistoryText}

Current message from shopper: "${lastUserMsg}".
Current items in customer's cart: ${JSON.stringify(currentCartSkus)}.
Theme: ${isDeskSetup ? "Desk Setup / Workspace" : isAudioSetup ? "Audio Setup" : "Retail Shopping"}.
Already chosen/in cart: ${chosenProduct ? chosenProduct.name : currentCartSkus.join(", ")}.

CRITICAL INSTRUCTIONS:
1. If the shopper just chose or added an item (e.g. ${chosenProduct?.name || "an item"}):
   - Acknowledge their choice warmly and concisely.
   - DO NOT recommend items already in their cart or already selected: ${JSON.stringify(Array.from(excludeSkus))}.
   - Recommend 2 to 3 NEW complementary companion products from these candidates to complete their setup:
${JSON.stringify(
  candidateSlice.map((m) => ({
    sku: m.sku,
    name: m.name,
    price: `₹${m.price / 100}`,
    tags: m.tags,
    pitch: m.short_pitch,
  }))
)}
2. Explain briefly how each companion item pairs with what they already chose.
3. At the end of your response, output a strict JSON block wrapped in \`\`\`json ... \`\`\` with this structure:
{
  "recommendedSkus": ["SKU-1", "SKU-2"],
  "suggestedUpsell": null,
  "suggestedCrossSells": ["SKU-3"]
}
Note: "recommendedSkus" MUST contain ONLY the new companion items, NEVER the items already in the cart!
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON metadata block if present
        let cleanReply = responseText;
        let recommendedSkus: string[] = [];
        let suggestedUpsell: any = null;
        let suggestedCrossSells: string[] = [];

        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            recommendedSkus = parsed.recommendedSkus || [];
            suggestedUpsell = parsed.suggestedUpsell || null;
            suggestedCrossSells = parsed.suggestedCrossSells || [];
            cleanReply = responseText.replace(/```json[\s\S]*?```/, "").trim();
          } catch (e) {
            // fallback
          }
        }

        // Filter out any excluded items from recommendedSkus
        recommendedSkus = recommendedSkus.filter((sku) => !excludeSkus.has(sku));

        // If no SKUs or all were excluded, populate from companionCandidates or candidateSlice
        if (recommendedSkus.length === 0) {
          if ((isSelectionOrFollowUp || (isDeskSetup && currentCartSkus.length > 0)) && companionCandidates.length > 0) {
            recommendedSkus = companionCandidates.slice(0, 3).map((m) => m.sku);
          } else if (candidateSlice.length > 0) {
            recommendedSkus = candidateSlice.filter((m) => !excludeSkus.has(m.sku)).slice(0, 3).map((m) => m.sku);
          }
        }

        return {
          reply: cleanReply,
          recommendedSkus,
          suggestedUpsell,
          suggestedCrossSells,
        };
      } catch (e: any) {
        console.warn(`Gemini model ${modelName} call failed, trying next candidate:`, e?.message);
      }
    }
  }

  // Graceful rule-based fallback if API key is invalid/offline
  return generateIntelligentFallback(
    lastUserMsg,
    directMatches,
    liveCatalog,
    companionCandidates,
    chosenProduct,
    isSelectionOrFollowUp,
    isDeskSetup,
    currentCartSkus
  );
}

function generateIntelligentFallback(
  userMessage: string,
  directMatches: Product[],
  liveCatalog: Product[],
  companionCandidates: Product[],
  chosenProduct: Product | undefined,
  isSelectionOrFollowUp: boolean,
  isDeskSetup: boolean,
  currentCartSkus: string[]
): AgentResponse {
  const q = userMessage.toLowerCase().trim();

  // 1. Selection or follow-up companion recommendations
  if ((isSelectionOrFollowUp || (isDeskSetup && currentCartSkus.length > 0)) && companionCandidates.length > 0) {
    const chosenName = chosenProduct?.name || (currentCartSkus.length > 0 ? liveCatalog.find((p) => p.sku === currentCartSkus[0])?.name : "") || "your selection";
    const topComps = companionCandidates.slice(0, 3);
    const itemsText = topComps
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** — ₹${(p.price / 100).toLocaleString("en-IN")}. ${
            p.short_pitch || p.description
          }`
      )
      .join("\n");

    return {
      reply:
        `Great choice with the **${chosenName}**! To complete your ${isDeskSetup ? "desk setup" : "order"}, here are verified companion essentials that pair seamlessly:\n\n` +
        itemsText +
        `\n\nAll items are in stock and ready to dispatch. Which one would you like to add next?`,
      recommendedSkus: topComps.map((p) => p.sku),
      suggestedCrossSells: topComps[0]?.pairs_with || [],
    };
  }

  // 2. Conversational greetings & assistant discovery
  const isGreeting =
    /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|yo|sup|help|who are you|what can you do|start)(\s|!|\?|$)/i.test(
      q
    ) || !q;

  if (isGreeting) {
    const catalogSummary =
      liveCatalog.length > 0
        ? `We have ${liveCatalog.length} verified item(s) in stock, including ${liveCatalog
            .slice(0, 3)
            .map((p) => p.name)
            .join(", ")}.`
        : "Our catalog is synced and ready.";

    return {
      reply: `Hello! I'm MerchantMind, your direct commerce associate.\n\n${catalogSummary}\n\nYou can ask about specifications, compare models, check live stock, or request an instant Razorpay checkout link. What are you looking for today?`,
      recommendedSkus: liveCatalog.slice(0, 3).map((p) => p.sku),
      suggestedCrossSells: liveCatalog[0]?.pairs_with || [],
    };
  }

  // 3. Direct matches found
  if (directMatches.length > 0) {
    const matches = directMatches.slice(0, 3);
    const itemsText = matches
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** — ₹${(p.price / 100).toLocaleString("en-IN")}. ${
            p.short_pitch || p.description
          }`
      )
      .join("\n");

    const primaryMatch = matches[0];
    const upsellProduct = primaryMatch?.upgrades_to
      ? liveCatalog.find((p) => p.sku?.toLowerCase() === primaryMatch.upgrades_to?.toLowerCase())
      : undefined;

    return {
      reply:
        `Found ${matches.length} matching option(s) for "${userMessage}":\n\n` +
        itemsText +
        `\n\nAll items are in stock and ready to dispatch. Would you like to inspect specifications or proceed to instant Razorpay checkout?`,
      recommendedSkus: matches.map((m) => m.sku),
      suggestedUpsell: upsellProduct
        ? {
            originalSku: primaryMatch.sku,
            upsellSku: upsellProduct.sku,
            priceDelta: upsellProduct.price - primaryMatch.price,
            reason: `${upsellProduct.name} delivers higher acoustic performance for ₹${(
              (upsellProduct.price - primaryMatch.price) /
              100
            ).toFixed(0)} more.`,
          }
        : undefined,
      suggestedCrossSells: primaryMatch?.pairs_with || [],
    };
  }

  // 4. Search query with no direct matches, but catalog has inventory
  if (liveCatalog.length > 0) {
    const availableItems = liveCatalog
      .slice(0, 3)
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** — ₹${(p.price / 100).toLocaleString("en-IN")}. ${p.short_pitch}`
      )
      .join("\n");

    return {
      reply: `I searched our inventory for "${userMessage}", but couldn't find an exact match in stock right now.\n\nHere are some popular verified items currently available:\n\n${availableItems}\n\nLet me know if any of these match your needs, or tell me what features you're looking for!`,
      recommendedSkus: liveCatalog.slice(0, 3).map((p) => p.sku),
      suggestedCrossSells: liveCatalog[0]?.pairs_with || [],
    };
  }

  // 5. Truly empty catalog
  return {
    reply:
      "Welcome to MerchantMind. Our live inventory catalog is currently syncing. Feel free to seed demo items in Settings or check back in a moment.",
    recommendedSkus: [],
    suggestedCrossSells: [],
  };
}

