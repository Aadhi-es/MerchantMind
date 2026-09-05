import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { MEGA_CATALOG } from "@/lib/mega-catalog";

export async function POST() {
  try {
    const client = getSupabase();
    if (!client) {
      return NextResponse.json({ error: "Supabase client not initialized" }, { status: 500 });
    }

    // Clean any legacy generic items first
    await client.from("products").delete().like("sku", "PROD-%");

    // Upsert the authentic multi-brand catalog (Apple, Lenovo, Samsung, Logitech, Dyson, Parker, etc.)
    const { data, error } = await client
      .from("products")
      .upsert(MEGA_CATALOG, { onConflict: "sku" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      products: data,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to seed products" }, { status: 500 });
  }
}
