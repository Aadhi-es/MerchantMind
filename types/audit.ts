export type AuditActionType =
  | "intent_parsed"
  | "catalog_search"
  | "products_shown"
  | "upsell_evaluated"
  | "upsell_offered"
  | "upsell_accepted"
  | "upsell_declined"
  | "crosssell_offered"
  | "checkout_initiated"
  | "payment_link_created"
  | "payment_confirmed"
  | "payment_failed"
  | "payment_retried"
  | "order_confirmed"
  | "followup_scheduled"
  | "agent_query_received"
  | "agent_checkout"
  | "agent_negotiated"
  | "guardrail_triggered"
  | "error_occurred";

export interface AuditLogEntry {
  id?: number | string;
  created_at?: string;
  conversation_id: string;
  customer_id?: string;
  action_type: AuditActionType;
  action_details: Record<string, any>;
  razorpay_ids?: {
    order_id?: string;
    payment_id?: string;
    payment_link_id?: string;
    payment_link_url?: string;
    receipt?: string;
    error_code?: string;
    error_description?: string;
  };
  revenue_impact?: number; // paise
  guardrail_check?: {
    guardrail?: string;
    passed: boolean;
    limit?: any;
    actual?: any;
    details?: string;
  };
  agent_type?: "human" | "agent";
}

export interface MerchantGuardrails {
  max_single_transaction: number; // paise (e.g. 1000000 = ₹10,000)
  max_daily_agent_revenue: number; // paise
  max_upsell_delta_percent: number; // e.g. 30%
  max_crosssell_items: number; // e.g. 2
  max_bundle_discount_percent: number; // e.g. 15%
  daily_campaign_budget: number; // paise
  blocked_categories: string[];
  operating_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  allow_agent_purchases: boolean;
  require_agent_authorization: boolean;
}
