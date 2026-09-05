export interface AgentQueryRequest {
  category?: string;
  max_price?: number; // paise
  min_price?: number;
  in_stock?: boolean;
  tags?: string[];
  limit?: number;
  sort?: "price_asc" | "price_desc" | "relevance";
}

export interface AgentNegotiateRequest {
  items: string[]; // array of SKUs
  requested_discount_percent: number;
  buyer_agent_id: string;
  authorization_ref?: string;
}

export interface AgentCheckoutRequest {
  items: Array<{
    sku: string;
    quantity: number;
    size?: string;
  }>;
  offer_id?: string;
  buyer_agent_id: string;
  authorization: {
    protocol: "ap2" | "acp" | "uap" | "custom";
    token: string;
    scope?: string;
    max_amount?: number;
  };
  delivery_address?: {
    street: string;
    city: string;
    pincode: string;
    phone?: string;
  };
  payment_method?: "upi" | "card" | "netbanking";
}
