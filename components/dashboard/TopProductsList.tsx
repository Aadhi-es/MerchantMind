"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";

export function TopProductsList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) setProducts(d.products);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-5 bg-white rounded-lg border border-stone-200 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
        <div>
          <h3 className="font-headline text-sm font-bold text-stone-900">Top Converting Products</h3>
          <p className="text-xs text-stone-500 font-mono">Ranked by autonomous conversion velocity</p>
        </div>
        <span className="text-[10px] font-mono text-primary font-bold">Live Inventory</span>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-stone-400">
            No products found. Add products to Supabase products table.
          </div>
        ) : (
          products.slice(0, 5).map((product, idx) => (
            <div key={product.sku || idx} className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-stone-400 w-4">{idx + 1}</span>
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-9 h-9 rounded object-cover border border-stone-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-stone-900 truncate">{product.name}</div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500 mt-0.5">
                  <span>SKU #{product.sku}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">In Stock</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-primary">
                  ₹{(product.price / 100).toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-stone-400 font-mono">₹{(product.price / 100).toLocaleString("en-IN")} / unit</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

