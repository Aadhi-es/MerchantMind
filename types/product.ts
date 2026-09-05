export interface Product {
  sku: string;
  razorpay_item_id?: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number; // in paise (e.g. 279900 = ₹2,799)
  compare_at_price?: number;
  cost_price?: number;
  currency: string;
  in_stock: boolean;
  stock_count: number;
  low_stock_threshold: number;
  description: string;
  short_pitch: string;
  features: string[];
  images: string[];
  pairs_with: string[]; // SKUs of cross-sell products
  upgrades_to?: string; // SKU of higher-tier product for upsell
  downgrades_to?: string;
  ideal_customer?: string;
  common_objections?: string[];
  objection_responses?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}
