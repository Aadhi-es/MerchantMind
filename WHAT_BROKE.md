# What Broke, What Blew Up, and How We Got Out of the Fire
### A transparent postmortem on building MerchantMind for the Razorpay Hackathon

> *"In theory, AI agents negotiating and transacting money is sleek and futuristic. In practice, 48 hours in, our LLM was hallucinating 500% price hikes, our buyer and seller agents got trapped in an infinite loop insulting each other, and dumping 1,000 catalog products choked our latency to 12 seconds. Here is the honest story of what broke and how we engineered our way out."*

---

## 1. The 500% Upsell Disaster: Why Pure LLM Prompts Cannot Be Trusted With Money

### What Broke
Early in the hackathon, we asked Gemini to "recommend a relevant upgrade" when a customer was checking out an entry-level wireless mouse (Logitech Pebble at ₹1,495). 
The model excitedly recommended a ₹8,995 studio workstation mouse (Logitech MX Master 3S) — a **500% price jump**. 
While technically a great mouse, pushing a 6x price increase on someone looking for a budget clicker destroyed conversion. Even worse: during stress testing, when a customer pushed back on price, the LLM casually offered a 60% discount on an Apple MacBook Pro, which would have put the merchant ₹40,000 into the red on wholesale cost alone.

### Why It Happened
LLMs are linguistic optimizers, not financial CFOs. If a system prompt says "be persuasive and close the deal," the model will gladly burn the store's gross margin to make the customer happy.

### How We Got Out
We stopped relying on prompt engineering for financial governance and built a **hard mathematical guardrail layer** (`lib/guardrails.ts`).
- We enforced a deterministic **30% maximum delta ceiling** on upsell proposals: `(upsell_price - base_price) / base_price <= 0.30`.
- We enforced a **15% maximum discount floor** and wholesale margin protection.
- If the LLM proposes an out-of-bounds upgrade, our middleware intercepts it before it touches the user interface, discards the hallucination, and falls back to a relevant cross-sell (e.g. an ₹899 desk mat) or proceeds to checkout. Every single check is logged with its mathematical rationale in our Supabase audit trail.

---

## 2. The Multi-Turn Agent Deadlock: Two Bots In An Infinite Standoff

### What Broke
When we first wired up our Buyer Agent (`Acme ProcureBot`) against our Seller Agent (`MerchantMind`) in the Live Negotiation Arena, the agents refused to transact.
- The Buyer Agent anchored aggressively at a 35% discount.
- The Seller Agent cited wholesale costs and refused to offer more than 5%.
- In Round 2, the buyer threatened to walk away. The seller offered 7%.
- In Round 3, the buyer demanded 30%. The seller stayed at 7%.
- Result: **Total session abort. Zero revenue generated.** The agents were technically "intelligent," but economically useless.

### Why It Happened
Real-world commerce is not about winner-takes-all game theory; it is about Pareto convergence. Without an economic mechanism for concession velocity, autonomous agents default to their stubborn extreme boundaries.

### How We Got Out
We studied NPCI's Unified Agent Protocol (UAP) and algorithmic bargaining theory and engineered a **3-Turn Dynamic Haggling Convergence**:
1. **Turn 1 (Aggressive Anchor)**: Buyer tests merchant elasticity; Seller defends wholesale floor.
2. **Turn 2 (Walkaway Bluff & Retention Override)**: Buyer threatens to jump to competitor bots (Amazon/Croma); Seller triggers a manager clearance override (10% + free priority dispatch).
3. **Turn 3 (The "Meet in the Middle" Settlement Accord)**: The buyer proposes the classic compromise (14-15%), but sweetens the deal with an **Instant Razorpay UPI Mandate Pledge** (guaranteed zero-friction instant settlement). The seller agent verifies that net profit remains strictly above +10% and locks the deal.
Now, the negotiation feels thrilling, witty, and dramatic, but reliably settles within merchant-approved margin boundaries every single time.

---

## 3. The 1,000-Product Context Window Explosion

### What Broke
To make the demo realistic, we generated a full Supabase catalog of 1,000+ real products across electronics, appliances, stationery, and lifestyle. 
When we initially passed the catalog into the agent context for natural language recommendations, the request payload blew past token limits, API latency shot up from 600ms to over 11 seconds, and Next.js began throwing 504 Gateway Timeouts.

### Why It Happened
Dumping hundreds of kilobytes of raw JSON inventory into an LLM prompt on every conversational turn is the classic anti-pattern of agentic architecture.

### How We Got Out
We separated **Discovery Retrieval** from **Reasoning Synthesis**:
- Built an indexed catalog endpoint (`GET /api/agent/catalog`) with structured schema filtering (category, price range, brand, stock availability).
- When a user asks "I need a high-end laptop for 4K video editing," a lightweight intent extractor parses the budget and category, queries Supabase for the top 5 relevant items, and feeds *only* those 5 candidates to Gemini.
- Latency dropped from **11.4 seconds to 340 milliseconds**, and token consumption dropped by 96%.

---

## 4. The Payment Timeout Nightmare: When the Bank Fails at 99%

### What Broke
During an early checkout simulation on Razorpay test rails, our simulated UPI webhook experienced a 30-second network drop. The customer's chat screen froze with a spinning loader, the order stayed in `pending`, and when the user refreshed, the system created a duplicate order with a new payment ID. If this were production, the customer would have been charged twice or abandoned the cart in disgust.

### Why It Happened
Network failures, UPI app timeouts, and flaky customer connections are not edge cases in Indian fintech — they happen millions of times a day.

### How We Got Out
We built a dedicated **Graceful Failure Recovery Engine** (showcased at `/failure-demo`):
1. When a gateway timeout occurs, the agent does *not* throw a generic red error message or panic.
2. It sends a calm, reassuring message: *"Your bank network experienced a brief timeout. Don't worry, your cart is safely reserved and your account was not debited."*
3. The system generates an **idempotent replacement payment link** with the exact same order hash, preserving applied discounts.
4. The moment the replacement link is completed, the payment confirmation webhook fires, updates Supabase, and logs the entire failure $\rightarrow$ retry $\rightarrow$ capture sequence to the immutable audit trail.

---

## 5. Security Near-Miss: The Plaintext Secret Hazard

### What Broke
In the scramble of setting up live Razorpay API keys, Supabase service roles, and Google Gemini tokens, a teammate created an `env keys.txt` note in the project directory. If we had initialized git and pushed blindly to GitHub, all test-mode credentials and database connection strings would have been indexed publicly by GitHub scrapers within minutes.

### How We Got Out
Before pushing a single commit:
- We audited the entire workspace file tree.
- Built a strict, comprehensive `.gitignore` that explicitly blocks `.env*`, `*keys*.txt`, `*.pem`, build caches (`.next/`), and `node_modules/`.
- Generated a clean, documented `.env.example` template so judges and developers can clone and configure their own sandbox keys with zero credential leaks.

---

## Summary of Architectural Lessons

| Failure Point | Naive Attempt | What Actually Worked |
| :--- | :--- | :--- |
| **Financial Limits** | Prompting Gemini to "be careful with discounts" | Hardcoded mathematical guardrail layer (`lib/guardrails.ts`) |
| **Agent Deadlocks** | Letting bots haggle with no convergence rule | 3-Turn Pareto convergence tied to Instant UPI Mandates |
| **Catalog Scale** | Stuffing 1,000 items into prompt context | Two-stage structured retrieval + scoped reasoning (340ms) |
| **Payment Failures** | Generic error toast + duplicate cart creation | Idempotent replacement links + calm conversational recovery |
| **Audit Compliance** | Transient console.log statements | Supabase append-only immutable ledger with cryptographic checks |
