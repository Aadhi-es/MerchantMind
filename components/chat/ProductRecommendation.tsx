"use client";

import React from "react";
import { Product } from "@/types/product";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { Plus, Eye, Check } from "lucide-react";

interface ProductRecommendationProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  selectedSku?: string;
  cartSkus: string[];
}

export function ProductRecommendation({
  products,
  onSelectProduct,
  onAddToCart,
  selectedSku,
  cartSkus,
}: ProductRecommendationProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-3">
      {products.map((product) => {
        const isSelected = selectedSku === product.sku;
        const inCart = cartSkus.includes(product.sku);

        return (
          <GlassCard
            key={product.sku}
            variant={isSelected ? "active" : "default"}
            interactive
            onClick={() => onSelectProduct(product)}
            className="flex flex-col justify-between overflow-hidden p-3 group border-white/[0.07] hover:border-gold/40 transition-all"
          >
            {/* Image & Price Tag */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-black/40 mb-2.5">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-dim text-xs">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2">
                <GlassBadge variant="gold" size="sm" className="bg-[#0F0F0F]/80 backdrop-blur-md">
                  ₹{(product.price / 100).toLocaleString("en-IN")}
                </GlassBadge>
              </div>
              {product.tags.includes("wide-fit") && (
                <div className="absolute top-2 left-2">
                  <GlassBadge variant="neutral" size="sm" className="bg-[#0F0F0F]/80 backdrop-blur-md text-[10px]">
                    Wide Fit
                  </GlassBadge>
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="flex-1">
              <div className="text-[11px] font-mono text-text-dim mb-0.5">{product.sku}</div>
              <h4 className="text-xs font-semibold text-text-primary line-clamp-1 group-hover:text-gold transition-colors">
                {product.name}
              </h4>
              <p className="text-[11px] text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                {product.short_pitch}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/[0.05]">
              <GlassButton
                size="sm"
                variant="ghost"
                className="flex-1 text-[11px] py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProduct(product);
                }}
              >
                <Eye className="w-3 h-3" />
                Details
              </GlassButton>

              <GlassButton
                size="sm"
                variant={inCart ? "secondary" : "gold"}
                className="text-[11px] py-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                {inCart ? (
                  <>
                    <Check className="w-3 h-3 text-status-success" />
                    In Cart
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    Add
                  </>
                )}
              </GlassButton>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
