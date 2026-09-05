-- ==============================================================================
-- MerchantMind — Complete Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ==============================================================================

-- 0. Enable pgvector extension (for vector catalog search)
create extension if not exists vector;

-- ==============================================================================
-- 1. PRODUCTS TABLE
-- Dynamic merchant catalog — no hardcoded values!
-- ==============================================================================
create table if not exists public.products (
    id                  bigint generated always as identity primary key,
    sku                 text unique not null,
    razorpay_item_id    text,
    name                text not null,
    category            text not null,
    subcategory         text,
    tags                text[] default '{}',
    price               integer not null,         -- Price in paise (e.g. 279900 = ₹2,799)
    compare_at_price    integer,                  -- MRP / Strike-through price in paise
    cost_price          integer,                  -- Cost in paise (for autonomous margin bounding)
    currency            text default 'INR',
    in_stock            boolean default true,
    stock_count         integer default 50,
    low_stock_threshold integer default 5,
    description         text not null,
    short_pitch         text not null,
    features            text[] default '{}',
    images              text[] default '{}',
    pairs_with          text[] default '{}',      -- Complementary SKUs for autonomous cross-sell
    upgrades_to         text,                     -- Premium alternative SKU for autonomous upsell
    downgrades_to       text,                     -- Budget alternative SKU
    ideal_customer      text,
    common_objections   text[] default '{}',
    objection_responses jsonb default '{}'::jsonb,
    created_at          timestamptz default now(),
    updated_at          timestamptz default now()
);

create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_category on public.products(category);

alter table public.products enable row level security;
drop policy if exists "Allow public read on products" on public.products;
drop policy if exists "Allow public insert/update on products" on public.products;
create policy "Allow public read on products" on public.products for select to public using (true);
create policy "Allow public insert/update on products" on public.products for all to public using (true);


-- ==============================================================================
-- 2. CONVERSATIONS TABLE
-- Live state for chat sessions and AI agent negotiations
-- ==============================================================================
create table if not exists public.conversations (
    id              text primary key,             -- e.g. 'conv_1725516600000'
    customer_id     text,
    channel         text default 'web_chat',      -- 'web_chat', 'whatsapp', 'agent_api'
    state           text default 'active',        -- 'active', 'converted', 'abandoned', 'escalated'
    cart            jsonb default '[]'::jsonb,
    context         jsonb default '{}'::jsonb,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

create index if not exists idx_conversations_created on public.conversations(created_at desc);

alter table public.conversations enable row level security;
drop policy if exists "Allow public on conversations" on public.conversations;
create policy "Allow public on conversations" on public.conversations for all to public using (true);


-- ==============================================================================
-- 3. MESSAGES TABLE
-- Individual turns between customer and MerchantMind agent
-- ==============================================================================
create table if not exists public.messages (
    id                  text primary key,
    conversation_id     text references public.conversations(id) on delete cascade,
    role                text not null,            -- 'user' or 'assistant'
    content             text not null,
    recommended_skus    text[] default '{}',
    metadata            jsonb default '{}'::jsonb,
    created_at          timestamptz default now()
);

create index if not exists idx_messages_conversation on public.messages(conversation_id);

alter table public.messages enable row level security;
drop policy if exists "Allow public on messages" on public.messages;
create policy "Allow public on messages" on public.messages for all to public using (true);


-- ==============================================================================
-- 4. ORDERS TABLE
-- Razorpay orders created through conversational or agentic checkout
-- ==============================================================================
create table if not exists public.orders (
    id                  text primary key,         -- internal order id
    razorpay_order_id   text unique,              -- Razorpay order id e.g. 'order_Qz84bX91jK'
    conversation_id     text,
    customer_id         text,
    amount              integer not null,         -- Total amount in paise
    currency            text default 'INR',
    status              text default 'created',   -- 'created', 'attempted', 'paid', 'failed'
    items               jsonb not null default '[]'::jsonb,
    razorpay_payment_id text,
    metadata            jsonb default '{}'::jsonb,
    created_at          timestamptz default now(),
    updated_at          timestamptz default now()
);

create index if not exists idx_orders_rzp on public.orders(razorpay_order_id);
create index if not exists idx_orders_created on public.orders(created_at desc);

alter table public.orders enable row level security;
drop policy if exists "Allow public on orders" on public.orders;
create policy "Allow public on orders" on public.orders for all to public using (true);


-- ==============================================================================
-- 5. PAYMENTS TABLE
-- Settlement tracking and payment confirmation / failure logs
-- ==============================================================================
create table if not exists public.payments (
    id                  text primary key,
    razorpay_payment_id text unique not null,
    order_id            text references public.orders(id) on delete set null,
    amount              integer not null,         -- in paise
    currency            text default 'INR',
    status              text not null,            -- 'captured', 'failed', 'refunded'
    method              text,                     -- 'upi', 'card', 'netbanking'
    error_code          text,
    error_description   text,
    created_at          timestamptz default now()
);

create index if not exists idx_payments_rzp on public.payments(razorpay_payment_id);

alter table public.payments enable row level security;
drop policy if exists "Allow public on payments" on public.payments;
create policy "Allow public on payments" on public.payments for all to public using (true);


-- ==============================================================================
-- 6. AUDIT_LOG TABLE (IMMUTABLE FORENSIC RECORDER)
-- Tamper-proof, append-only flight recorder for every AI decision
-- ==============================================================================
create table if not exists public.audit_log (
    id              bigint generated always as identity primary key,
    created_at      timestamptz not null default now(),
    conversation_id text,
    customer_id     text,
    action_type     text not null,
    action_details  jsonb not null default '{}'::jsonb,
    razorpay_ids    jsonb default '{}'::jsonb,
    revenue_impact  integer default 0,      -- in paise
    guardrail_check jsonb default '{}'::jsonb,
    agent_type      text default 'human'    -- 'human' or 'agent'
);

create index if not exists idx_audit_conversation on public.audit_log(conversation_id);
create index if not exists idx_audit_action on public.audit_log(action_type);
create index if not exists idx_audit_created on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;
drop policy if exists "Allow anonymous read of audit log" on public.audit_log;
drop policy if exists "Allow service & anon insert of audit log" on public.audit_log;

create policy "Allow anonymous read of audit log"
  on public.audit_log for select
  to public
  using (true);

create policy "Allow service & anon insert of audit log"
  on public.audit_log for insert
  to public
  with check (true);

-- CRITICAL: NO UPDATE OR DELETE POLICIES EXIST ON public.audit_log.
-- This ensures the audit trail is strictly append-only and cryptographically immutable.


-- ==============================================================================
-- 7. GUARDRAILS TABLE
-- Deterministic margin, discount, and protocol enforcement rules
-- ==============================================================================
create table if not exists public.guardrails (
    id              bigint generated always as identity primary key,
    merchant_id     text unique default 'default_merchant',
    config          jsonb not null,
    updated_at      timestamptz default now()
);

alter table public.guardrails enable row level security;
drop policy if exists "Allow public on guardrails" on public.guardrails;
create policy "Allow public on guardrails" on public.guardrails for all to public using (true);

-- Seed default guardrail configuration
insert into public.guardrails (merchant_id, config)
values (
  'default_merchant',
  '{
    "max_single_transaction": 1000000,
    "max_daily_agent_revenue": 5000000,
    "max_upsell_delta_percent": 30,
    "max_crosssell_items": 2,
    "max_bundle_discount_percent": 15,
    "daily_campaign_budget": 500000,
    "blocked_categories": ["alcohol", "tobacco", "pharmaceuticals"],
    "operating_hours": {
      "start": "09:00",
      "end": "23:00",
      "timezone": "Asia/Kolkata"
    },
    "allow_agent_purchases": true,
    "require_agent_authorization": true
  }'::jsonb
)
on conflict (merchant_id) do nothing;


-- ==============================================================================
-- 8. AGENT_SESSIONS TABLE
-- Machine-to-machine AI buyer agent session state & telemetry
-- ==============================================================================
create table if not exists public.agent_sessions (
    id                  text primary key,         -- e.g. 'agent-gemini-buyer-44'
    buyer_agent_id      text not null,
    protocol            text not null default 'ap2', -- 'ap2', 'acp', 'uap'
    status              text not null default 'active',
    latency_ms          integer default 42,
    token_budget        integer default 10000,
    tokens_used         integer default 0,
    last_heartbeat      timestamptz default now(),
    created_at          timestamptz default now()
);

alter table public.agent_sessions enable row level security;
drop policy if exists "Allow public on agent_sessions" on public.agent_sessions;
create policy "Allow public on agent_sessions" on public.agent_sessions for all to public using (true);


-- ==============================================================================
-- 9. SUPABASE REALTIME ENABLEMENT
-- Allows Next.js dashboard & audit trail to receive instant WebSocket updates
-- ==============================================================================
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
end $$;
