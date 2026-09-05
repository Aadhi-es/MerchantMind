# MerchantMind — Autonomous Revenue Growth Agent for Razorpay Merchants

> **Track 01:** AI Growth & Agentic Commerce  
> **Core Objective:** Grow merchant revenue with conversational checkout, intelligent upsells, and make stores sellable to AI buyers end-to-end on Razorpay test rails.  
> **The Bar:** Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully.

---

## Quick Start (Run Locally)

The application is fully built, self-contained, and ready to run with a single command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## The 5 Core Views

| Route | View | Description |
|---|---|---|
| `/` | **Shop & Conversational Checkout** | 70/30 split view: left conversational sales agent (Gemini Flash Lite) with inline product recommendations, contextual upsell offers, and Razorpay payment links; right product inspector with specifications, sizing, and pairs-with cross-sells. |
| `/dashboard` | **Merchant Analytics** | Real-time merchant command center showing Revenue Velocity, Conversions Today, Incremental Upsell Yield, and live activity stream. |
| `/dashboard/audit` | **Forensic Audit Trail** | Cryptographically append-only chronological log of every recommendation, intent extraction, guardrail evaluation, order creation, and payment verification. Expandable JSON reasoning payload for every decision. |
| `/failure-demo` | **Graceful Failure Showcase** | Dedicated interactive walkthrough satisfying the hackathon bar: order creation $\rightarrow$ simulated bank timeout failure $\rightarrow$ calm, non-alarmist explanation $\rightarrow$ fresh replacement link $\rightarrow$ payment capture logged in audit trail. |
| `/agent-monitor` | **AI Buyer Commerce Console** | Telemetry for external AI buyer agents querying the store via ACP/AP2/UAP protocols. Includes 1-click **"Run Simulated AI Buyer"** button executing discovery $\rightarrow$ negotiation $\rightarrow$ autonomous checkout. |
| `/settings` | **Guardrails & Supabase Setup** | Interactive sliders to configure financial limits (max single transaction, max upsell delta %, bundle discounts) and **1-Click Copy** for the Supabase SQL schema. |

---

## Design System: Minimalist Dark Glassmorphism

Built strictly to the **MerchantMind UI Design System**:
- **Background:** `#0F0F0F` deep charcoal with subtle radial ambient glow.
- **Accents:** `#D4A853` warm muted gold (classic financial discipline, no neon/purple AI slop).
- **Cards:** Frosted glassmorphism (`backdrop-blur-md`, `bg-white/[0.04]`, `border-white/[0.08]`).
- **Typography:** `Space Grotesk` headings + `Inter` body text + `JetBrains Mono` telemetry.

---

## Supabase Database Configuration

The application currently operates with a **dual-layer architecture**: it connects to Supabase using the credentials in `.env.local` and seamlessly falls back to in-memory persistence until tables are initialized.

When you are ready to configure Supabase:
1. Open your [Supabase SQL Editor](https://app.supabase.com).
2. Copy the contents of [`supabase/schema.sql`](./supabase/schema.sql) (or click the **"Copy Supabase SQL Schema"** button on the `/settings` page).
3. Paste and run it in Supabase.
4. The application will instantly begin persisting all audit entries, products, and realtime updates directly to Supabase with PostgreSQL Row Level Security (RLS) enforcing append-only immutability.

---

## Machine-to-Machine (Agent-to-Agent) REST API

External AI buyer agents can transact with MerchantMind programmatically:

- **Catalog Discovery:** `GET /api/agent/catalog?category=accessories&q=logitech`
- **Bundle Negotiation:** `POST /api/agent/negotiate` (bounded to merchant maximum discount)
- **Autonomous Checkout:** `POST /api/agent/checkout` (verifies cryptographic mandate tokens like AP2 / ACP)

---

## The "2 AM Story" (For Video Presentation)

During initial testing of the upsell engine, the LLM proposed an upgrade from an entry-level wireless mouse (Logitech Pebble at ₹1,495) to a high-end studio workstation mouse (Logitech MX Master 3S at ₹8,995) — a 500% price jump. While technically a top-tier peripheral, pushing a 6x price increase creates immediate customer sticker shock and drops conversion to near zero.

We introduced the **Financial Guardrail Layer** (`lib/guardrails.ts`), enforcing a strict 30% delta ceiling on all upsell proposals. Now, when an upsell is considered, the agent mathematically validates that `(upsell - original) / original <= 0.30`. If it breaches the cap, the system automatically suppresses the aggressive upsell and falls back to a relevant cross-sell (e.g., leather desk mat for ₹799) or proceeds directly to checkout. The entire evaluation is logged in the audit trail with the guardrail validation badge.

---

## 🛠️ Postmortem, Failure Recovery & Submission Docs
- **What Broke & How We Solved It:** Read the transparent engineering postmortem in [`WHAT_BROKE.md`](./WHAT_BROKE.md).


