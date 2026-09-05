import { Product } from "@/types/product";

// Dynamic in-memory cache synced with Supabase catalog
export let cachedCatalog: Product[] = [];

// PRODUCTS reference that stays synced with cachedCatalog
export const PRODUCTS: Product[] = new Proxy([] as Product[], {
  get(target, prop, receiver) {
    if (prop === "length") return cachedCatalog.length;
    if (typeof prop === "string" && !isNaN(Number(prop))) {
      return cachedCatalog[Number(prop)];
    }
    const val = Reflect.get(cachedCatalog, prop);
    if (typeof val === "function") {
      return val.bind(cachedCatalog);
    }
    return val;
  },
});

export async function getLiveCatalog(): Promise<Product[]> {
  try {
    const { getSupabase } = await import("./supabase");
    const client = getSupabase();
    if (client) {
      const { data, error } = await client
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedCatalog = data as Product[];
        return cachedCatalog;
      }
    }
  } catch (e) {
    // fallback
  }
  return cachedCatalog;
}

export function findProductBySku(sku: string): Product | undefined {
  if (!sku) return undefined;
  return cachedCatalog.find((p) => p.sku?.toLowerCase() === sku.toLowerCase());
}

export async function fetchProductBySku(sku: string): Promise<Product | undefined> {
  if (!sku) return undefined;
  const inCache = findProductBySku(sku);
  if (inCache) return inCache;

  try {
    const { getSupabase } = await import("./supabase");
    const client = getSupabase();
    if (client) {
      const { data, error } = await client
        .from("products")
        .select("*")
        .eq("sku", sku)
        .maybeSingle();

      if (!error && data) {
        return data as Product;
      }
    }
  } catch (e) {}

  return undefined;
}

export const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
  "what", "which", "who", "whom", "this", "that", "these", "those", "am",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but",
  "if", "or", "because", "as", "until", "while", "of", "at", "by", "for",
  "with", "about", "against", "between", "into", "through", "during", "before",
  "after", "above", "below", "to", "from", "up", "down", "in", "out", "on",
  "off", "over", "under", "again", "further", "then", "once", "here", "there",
  "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should",
  "now", "want", "need", "show", "looking", "give", "find", "get", "buy",
  "like", "good", "best", "please", "tell", "recommend"
]);

export const ALIASES: Record<string, string[]> = {
  glotech: ["logitech"],
  logi: ["logitech"],
  lenevo: ["lenovo"],
  firdge: ["refrigerator", "fridge"],
  fridges: ["refrigerator", "fridge"],
  washmings: ["washing", "washer"],
  washers: ["washing", "washer"],
  stationary: ["stationery", "pen", "notebook"],
  mac: ["macbook", "apple"],
};

export function searchCatalogSmart(catalog: Product[], query: string, category?: string, maxPrice?: number): Product[] {
  let pool = catalog;
  if (category) {
    pool = pool.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (maxPrice) {
    pool = pool.filter((p) => p.price <= maxPrice);
  }

  const normalized = (query || "").trim();
  if (!normalized) return pool;

  const rawTokens = normalized
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (rawTokens.length === 0) {
    return pool.slice(0, 10);
  }

  const expandedTokens: string[] = [];
  for (const t of rawTokens) {
    expandedTokens.push(t);
    if (ALIASES[t]) {
      expandedTokens.push(...ALIASES[t]);
    }
  }

  const scored = pool
    .map((p) => {
      let score = 0;
      const nameLower = (p.name || "").toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      const tagsLower = (p.tags || []).map((t) => t.toLowerCase());
      const catLower = (p.category || "").toLowerCase();
      const subLower = (p.subcategory || "").toLowerCase();
      const pitchLower = (p.short_pitch || "").toLowerCase();

      for (const token of expandedTokens) {
        if (nameLower.includes(token)) score += 12;
        if (tagsLower.some((t) => t.includes(token))) score += 7;
        if (subLower.includes(token) || catLower.includes(token)) score += 5;
        if (pitchLower.includes(token)) score += 4;
        if (descLower.includes(token)) score += 2;
      }
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);

  return scored;
}

export function searchCatalog(query: string, category?: string, maxPrice?: number): Product[] {
  return searchCatalogSmart(cachedCatalog, query, category, maxPrice);
}


