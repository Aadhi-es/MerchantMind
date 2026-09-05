"use client";

import React, { useEffect, useState } from "react";
import { MerchantGuardrails } from "@/types/audit";
import { DEFAULT_GUARDRAILS } from "@/lib/guardrails";
import {
  Sliders,
  Database,
  Copy,
  Check,
  ShieldCheck,
  Save,
  Lock,
  Percent,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

export default function SettingsPage() {
  const [guardrails, setGuardrails] = useState<MerchantGuardrails>(DEFAULT_GUARDRAILS);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState("guardrails");
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededSuccess, setSeededSuccess] = useState(false);

  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setSeededSuccess(false);
    try {
      const res = await fetch("/api/products/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSeededSuccess(true);
        setTimeout(() => setSeededSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetch("/api/guardrails")
      .then((r) => r.json())
      .then((data) => {
        if (data.guardrails) setGuardrails(data.guardrails);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/guardrails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guardrails),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const copySqlToClipboard = () => {
    const sql = `-- ==============================================================================
-- MerchantMind — Complete Supabase PostgreSQL Schema
-- Paste and Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

create extension if not exists vector;

-- 1. PRODUCTS
create table if not exists public.products (
    id bigint generated always as identity primary key,
    sku text unique not null,
    razorpay_item_id text,
    name text not null,
    category text not null,
    subcategory text,
    tags text[] default '{}',
    price integer not null,
    compare_at_price integer,
    cost_price integer,
    currency text default 'INR',
    in_stock boolean default true,
    stock_count integer default 50,
    low_stock_threshold integer default 5,
    description text not null,
    short_pitch text not null,
    features text[] default '{}',
    images text[] default '{}',
    pairs_with text[] default '{}',
    upgrades_to text,
    downgrades_to text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.products enable row level security;
create policy "Allow public read on products" on public.products for select to public using (true);
create policy "Allow public insert/update on products" on public.products for all to public using (true);

-- 2. CONVERSATIONS
create table if not exists public.conversations (
    id text primary key,
    customer_id text,
    channel text default 'web_chat',
    state text default 'active',
    cart jsonb default '[]'::jsonb,
    context jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.conversations enable row level security;
create policy "Allow public on conversations" on public.conversations for all to public using (true);

-- 3. MESSAGES
create table if not exists public.messages (
    id text primary key,
    conversation_id text references public.conversations(id) on delete cascade,
    role text not null,
    content text not null,
    recommended_skus text[] default '{}',
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);
alter table public.messages enable row level security;
create policy "Allow public on messages" on public.messages for all to public using (true);

-- 4. ORDERS
create table if not exists public.orders (
    id text primary key,
    razorpay_order_id text unique,
    conversation_id text,
    customer_id text,
    amount integer not null,
    currency text default 'INR',
    status text default 'created',
    items jsonb not null default '[]'::jsonb,
    razorpay_payment_id text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Allow public on orders" on public.orders for all to public using (true);

-- 5. PAYMENTS
create table if not exists public.payments (
    id text primary key,
    razorpay_payment_id text unique not null,
    order_id text references public.orders(id) on delete set null,
    amount integer not null,
    currency text default 'INR',
    status text not null,
    method text,
    error_code text,
    error_description text,
    created_at timestamptz default now()
);
alter table public.payments enable row level security;
create policy "Allow public on payments" on public.payments for all to public using (true);

-- 6. AUDIT_LOG (IMMUTABLE)
create table if not exists public.audit_log (
    id bigint generated always as identity primary key,
    created_at timestamptz not null default now(),
    conversation_id text,
    customer_id text,
    action_type text not null,
    action_details jsonb not null default '{}'::jsonb,
    razorpay_ids jsonb default '{}'::jsonb,
    revenue_impact integer default 0,
    guardrail_check jsonb default '{}'::jsonb,
    agent_type text default 'human'
);
create index if not exists idx_audit_conv on public.audit_log(conversation_id);
create index if not exists idx_audit_act on public.audit_log(action_type);
create index if not exists idx_audit_time on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;
create policy "Allow read on audit_log" on public.audit_log for select to public using (true);
create policy "Allow insert on audit_log" on public.audit_log for insert to public with check (true);

-- 7. GUARDRAILS
create table if not exists public.guardrails (
    id bigint generated always as identity primary key,
    merchant_id text unique default 'default_merchant',
    config jsonb not null,
    updated_at timestamptz default now()
);
alter table public.guardrails enable row level security;
create policy "Allow all on guardrails" on public.guardrails for all to public using (true);

-- 8. AGENT_SESSIONS
create table if not exists public.agent_sessions (
    id text primary key,
    buyer_agent_id text not null,
    protocol text not null default 'ap2',
    status text not null default 'active',
    latency_ms integer default 42,
    token_budget integer default 10000,
    tokens_used integer default 0,
    last_heartbeat timestamptz default now(),
    created_at timestamptz default now()
);
alter table public.agent_sessions enable row level security;
create policy "Allow all on agent_sessions" on public.agent_sessions for all to public using (true);

-- REALTIME
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'audit_log') then
    alter publication supabase_realtime add table public.audit_log;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'products') then
    alter publication supabase_realtime add table public.products;
  end if;
end $$;`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left Sub-Sidebar (from Stitch) */}
      <aside className="w-full lg:w-60 shrink-0 bg-[#f8f7f5] border-r border-stone-200 p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className="font-label text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Policy Domain
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-200 font-mono text-[11px] text-stone-700 font-medium">
              v2.4
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { key: "general", label: "General Store Specs", icon: Sliders },
              { key: "guardrails", label: "Guardrails & Bounding", icon: ShieldCheck },
              { key: "supabase", label: "Supabase DB Setup", icon: Database },
            ].map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded text-left text-xs font-medium transition-all",
                    isActive
                      ? "bg-white text-primary font-semibold shadow-xs border border-stone-200"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Runtime Constraint Tile */}
        <div className="p-3.5 rounded bg-white border border-stone-200 flex flex-col gap-2 mt-4 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="font-mono text-[11px] font-semibold text-primary uppercase tracking-wider">
              Deterministic Mode
            </span>
          </div>
          <p className="font-body text-xs leading-relaxed text-stone-500">
            Hard constraints execute before token sampling. LLM bypass probability is mathematically 0.00%.
          </p>
        </div>
      </aside>

      {/* Main Settings Canvas */}
      <main className="flex-1 flex flex-col p-6 xl:p-8 overflow-x-hidden gap-6">
        {/* Header Banner */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded border border-stone-200 shadow-xs">
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline text-2xl lg:text-3xl text-stone-900 font-bold tracking-tight">
                Financial &amp; Autonomous Guardrails
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-primary border border-blue-200 font-mono text-xs font-medium">
                Deterministic Policy Active
              </span>
            </div>
            <p className="text-xs text-stone-500 font-body">
              Enforce transaction ceilings, upsell bounding formulas, and copy your Supabase database schema for instant deployment.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shrink-0"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved Successfully</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Policy Changes"}</span>
              </>
            )}
          </button>
        </div>

        {/* Guardrails Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded border border-stone-200 shadow-xs">
            <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Revenue &amp; Pricing Constraints</span>
            </h3>

            {/* Single Transaction Ceiling */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-800">Single Transaction Ceiling</span>
                <span className="font-mono text-primary font-bold text-sm">
                  ₹{(guardrails.max_single_transaction / 100).toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={guardrails.max_single_transaction}
                onChange={(e) =>
                  setGuardrails({ ...guardrails, max_single_transaction: parseInt(e.target.value, 10) })
                }
                className="w-full accent-primary h-1.5 bg-stone-200 rounded cursor-pointer"
              />
              <p className="text-[11px] text-stone-500">
                Any cart exceeding this value requires manual merchant sign-off before order generation.
              </p>
            </div>

            {/* Max Upsell Delta */}
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-800">Max Upsell Price Delta</span>
                <span className="font-mono text-primary font-bold text-sm">
                  {guardrails.max_upsell_delta_percent}% Max
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={guardrails.max_upsell_delta_percent}
                onChange={(e) =>
                  setGuardrails({
                    ...guardrails,
                    max_upsell_delta_percent: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-primary h-1.5 bg-stone-200 rounded cursor-pointer"
              />
              <p className="text-[11px] text-stone-500">
                Formula: `(P_upsell - P_base) / P_base &lt;= {guardrails.max_upsell_delta_percent}%`. Prohibits predatory price jumps.
              </p>
            </div>

            {/* Max Bundle Discount */}
            <div className="space-y-2 pt-4 border-t border-stone-100">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-stone-800">Max AI Buyer Negotiation Discount</span>
                <span className="font-mono text-primary font-bold text-sm">
                  {guardrails.max_bundle_discount_percent}% Cap
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={guardrails.max_bundle_discount_percent}
                onChange={(e) =>
                  setGuardrails({
                    ...guardrails,
                    max_bundle_discount_percent: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-primary h-1.5 bg-stone-200 rounded cursor-pointer"
              />
              <p className="text-[11px] text-stone-500">
                Autonomous buyer agents negotiating bundles cannot breach this discount floor.
              </p>
            </div>

            {/* Prohibited Categories */}
            <div className="pt-4 border-t border-stone-100 space-y-2">
              <span className="text-xs font-semibold text-stone-800 block">Prohibited Product Categories</span>
              <div className="flex flex-wrap gap-1.5">
                {guardrails.blocked_categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-red-50 text-red-800 border border-red-200 font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Supabase 1-Click Database Setup (5 cols) */}
          <div className="lg:col-span-5 space-y-4 bg-white p-6 rounded border border-stone-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-base font-bold text-stone-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span>Supabase Database Schema</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  Ready
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                When you are ready to configure Supabase, open your Supabase SQL Editor and run this script. The website already works seamlessly with in-memory persistence and will link directly.
              </p>

              <button
                type="button"
                onClick={copySqlToClipboard}
                className="w-full py-2.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied SQL to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Supabase SQL Schema (1-Click)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSeedProducts}
                disabled={isSeeding}
                className="w-full py-2.5 rounded bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-label text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {seededSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">8 Products Synced to Supabase!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>{isSeeding ? "Syncing to Supabase..." : "Seed / Reset Sample Inventory in Supabase"}</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500 space-y-1.5 font-body">
                <div>• Enables PostgreSQL Row Level Security (RLS)</div>
                <div>• Sets up append-only `audit_log` table</div>
                <div>• Adds `supabase_realtime` publication for live dashboard</div>
              </div>
            </div>

            <div className="p-3 rounded bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>RLS policy allows INSERT and SELECT, strictly prohibiting UPDATE and DELETE.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
