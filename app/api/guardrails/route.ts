import { NextRequest, NextResponse } from "next/server";
import { getGuardrails, updateGuardrails } from "@/lib/guardrails";

export async function GET() {
  return NextResponse.json({ guardrails: getGuardrails() });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateGuardrails(body);
    return NextResponse.json({ success: true, guardrails: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
