import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { searchCatalogSmart } from "@/lib/catalog-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ products: [], source: "in-memory-empty" });
    }

    let dbQuery = client.from("products").select("*").order("id", { ascending: true });

    if (category) {
      dbQuery = dbQuery.eq("category", category);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.warn("Supabase products fetch warning:", error.message);
      return NextResponse.json({ products: [], source: "error", error: error.message });
    }

    let products: Product[] = (data as Product[]) || [];

    if (query) {
      products = searchCatalogSmart(products, query);
    }

    return NextResponse.json({
      products,
      count: products.length,
      source: "supabase",
    });
  } catch (e: any) {
    console.error("GET /api/products error:", e);
    return NextResponse.json({ error: e?.message || "Internal server error", products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = getSupabase();

    if (!client) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    const itemsToInsert = Array.isArray(body) ? body : [body];

    const { data, error } = await client
      .from("products")
      .upsert(itemsToInsert, { onConflict: "sku" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: data?.length || 0, data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to insert product" }, { status: 500 });
  }
}

