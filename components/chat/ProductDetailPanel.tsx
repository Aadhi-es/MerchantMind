"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { findProductBySku } from "@/lib/catalog-data";
import { ShoppingBag, Truck, ShieldCheck, Check, Sparkles, HelpCircle } from "lucide-react";

interface ProductDetailPanelProps {
  product: Product | null;
  onAddToCart: (product: Product, size?: string) => void;
  onSelectProduct: (product: Product) => void;
  inCart: boolean;
}

export function ProductDetailPanel({
  product,
  onAddToCart,
  onSelectProduct,
  inCart,
}: ProductDetailPanelProps) {
  const [selectedSize, setSelectedSize] = useState("Standard");
  const sizes = ["Standard", "Pro", "Bundle", "Extended"];

  if (!product) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-text-dim border-l border-white/[0.06] bg-black/20">
        <ShoppingBag className="w-10 h-10 mb-3 opacity-30 stroke-[1.5]" />
        <h3 className="text-sm font-medium text-text-secondary">Product Inspector</h3>
        <p className="text-xs text-text-dim mt-1 max-w-xs">
          Select or ask the agent about any product to inspect specifications, paired accessories, and sizing.
        </p>
      </div>
    );
  }

  // Resolve cross-sell products
  const crossSellProducts = product.pairs_with
    .map((sku) => findProductBySku(sku))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="h-full flex flex-col border-l border-white/[0.06] bg-[#0A0A0A]/40 overflow-y-auto p-5 space-y-5">
      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-card overflow-hidden bg-black/50 border border-white/[0.08]">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-dim text-sm">
            Image Placeholder
          </div>
        )}
        <div className="absolute top-3 right-3">
          <GlassBadge variant="gold" size="md">
            ₹{(product.price / 100).toLocaleString("en-IN")}
          </GlassBadge>
        </div>
      </div>

      {/* Title & SKU */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-text-dim mb-1">
          <span>{product.sku}</span>
          <span className="text-status-success flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            In Stock ({product.stock_count} units)
          </span>
        </div>
        <h3 className="font-heading text-lg font-bold text-text-primary leading-snug">
          {product.name}
        </h3>
        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{product.description}</p>
      </div>

      {/* Sizing Selector */}
      <div>
        <label className="block text-xs font-semibold text-text-primary mb-2">Select Edition / Variant</label>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                selectedSize === size
                  ? "bg-gold text-[#0F0F0F] border-gold font-bold shadow-[0_0_10px_rgba(212,168,83,0.3)]"
                  : "bg-white/[0.03] text-text-secondary border-white/[0.08] hover:border-white/[0.2]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Add to Cart Button */}
      <GlassButton
        variant={inCart ? "secondary" : "primary"}
        size="lg"
        className="w-full py-3 text-sm"
        onClick={() => onAddToCart(product, selectedSize)}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4 text-status-success" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4" />
            Add to Order • ₹{(product.price / 100).toLocaleString("en-IN")}
          </>
        )}
      </GlassButton>

      {/* Delivery & Assurance */}
      <div className="flex items-center gap-4 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-gold" />
          <span>Dispatch in 24h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
          <span>Razorpay Verified</span>
        </div>
      </div>

      {/* Key Features */}
      {product.features.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-primary mb-2">Key Specifications</h4>
          <ul className="space-y-1.5 text-xs text-text-secondary">
            {product.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Agent FAQs / Objection Responses */}
      {product.common_objections && product.common_objections.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-gold" />
            <span>Agent Intelligence Insights</span>
          </h4>
          <div className="space-y-2 text-xs">
            {product.common_objections.map((obj, idx) => {
              const answer = product.objection_responses?.[obj];
              if (!answer) return null;
              return (
                <div key={idx} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="font-medium text-text-primary text-[11px] mb-1">Q: {obj}</div>
                  <div className="text-text-secondary text-[11px] leading-relaxed">{answer}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Frequently Paired With (Cross-Sell Engine) */}
      {crossSellProducts.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <h4 className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Frequently Paired With</span>
          </h4>
          <div className="space-y-2">
            {crossSellProducts.map((cross) => (
              <GlassCard
                key={cross.sku}
                interactive
                onClick={() => onSelectProduct(cross)}
                className="p-2.5 flex items-center gap-3 border-white/[0.06] hover:border-gold/30"
              >
                {cross.images[0] && (
                  <img
                    src={cross.images[0]}
                    alt={cross.name}
                    className="w-12 h-12 rounded-lg object-cover bg-black/40"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">{cross.name}</div>
                  <div className="text-[11px] font-mono text-gold mt-0.5">
                    ₹{(cross.price / 100).toLocaleString("en-IN")}
                  </div>
                </div>
                <GlassButton
                  size="sm"
                  variant="gold"
                  className="text-[11px] px-2.5 py-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(cross);
                  }}
                >
                  + Add
                </GlassButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
