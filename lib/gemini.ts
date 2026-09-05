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

export async function processConversation(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  currentCartSkus: string[] = []
): Promise<AgentResponse> {
  const client = getGeminiClient();
  const lastUserMsg = messages[messages.length - 1]?.content || "";

  // 1. Fetch live catalog dynamically from Supabase
  const liveCatalog = await getLiveCatalog();
  const directMatches = searchCatalogSmart(liveCatalog, lastUserMsg);
  const candidateSlice = directMatches.length > 0 ? directMatches.slice(0, 12) : liveCatalog.slice(0, 8);

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

        const prompt = `
The customer sent: "${lastUserMsg}".
Current items in customer's cart: ${JSON.stringify(currentCartSkus)}.
Catalog candidates matching their query: ${JSON.stringify(
          candidateSlice.map((m) => ({ sku: m.sku, name: m.name, price: `₹${m.price / 100}`, tags: m.tags, pitch: m.short_pitch, upgrades_to: m.upgrades_to }))
        )}.

Respond to the customer directly following your persona.
At the very end of your response, output a strict JSON block wrapped in \`\`\`json ... \`\`\` with this structure:
{
  "recommendedSkus": ["SKU-1", "SKU-2"],
  "suggestedUpsell": {
    "originalSku": "SKU-...",
    "upsellSku": "SKU-...",
    "priceDelta": 40000,
    "reason": "..."
  } or null,
  "suggestedCrossSells": ["SKU-..."]
}
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

        // If no SKUs extracted, populate from direct matches
        if (recommendedSkus.length === 0 && directMatches.length > 0) {
          recommendedSkus = directMatches.slice(0, 3).map((m) => m.sku);
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
  return generateIntelligentFallback(lastUserMsg, directMatches, liveCatalog);
}

function generateIntelligentFallback(
  userMessage: string,
  directMatches: Product[],
  liveCatalog: Product[]
): AgentResponse {
  const q = userMessage.toLowerCase().trim();

  // 1. Conversational greetings & assistant discovery
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

  // 2. Direct matches found
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

  // 3. Search query with no direct matches, but catalog has inventory
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

  // 4. Truly empty catalog
  return {
    reply:
      "Welcome to MerchantMind. Our live inventory catalog is currently syncing. Feel free to seed demo items in Settings or check back in a moment.",
    recommendedSkus: [],
    suggestedCrossSells: [],
  };
}
