"use client";

import React, { useState, useRef, useEffect } from "react";
import { Product, CartItem } from "@/types/product";
import { PRODUCTS, findProductBySku } from "@/lib/catalog-data";
import {
  Send,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Check,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  X,
} from "lucide-react";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedProducts?: Product[];
  upsell?: any;
  orderData?: any;
  paymentStatus?: "pending" | "paid" | "failed";
  timestamp: string;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_welcome",
      role: "assistant",
      content:
        "Welcome to MerchantMind. I am your autonomous commerce associate. Tell me what you're looking for, compare gear, inspect technical specs, or request an instant Razorpay checkout link.",
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0] || null);
  const [selectedSize, setSelectedSize] = useState<string>("Standard");
  const [hasCrossSell, setHasCrossSell] = useState(false);
  const [conversationId, setConversationId] = useState<string>("conv_node_4102");
  const [isMounted, setIsMounted] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"inspect" | "cart">("inspect");
  const [mobileShowRightPanel, setMobileShowRightPanel] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    setConversationId(`conv_${Date.now()}`);
    // Dynamically fetch live products from Supabase
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct(data.products[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = textToSend || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          conversationId,
          currentCartSkus: cart.map((c) => c.product.sku),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: data.reply || "Found verified options matching your requirements:",
        recommendedProducts: data.recommendedProducts || [],
        upsell: data.upsell || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.recommendedProducts?.[0]) {
        setSelectedProduct(data.recommendedProducts[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product, size = selectedSize, openCart = true) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.sku === product.sku);
      if (existing) {
        return prev.map((item) =>
          item.product.sku === product.sku
            ? { ...item, quantity: item.quantity + 1, selectedSize: size }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size }];
    });
    setSelectedProduct(product);
    showToast(`Added ${product.name} to cart`);
    if (openCart) {
      setActiveRightTab("cart");
    }
  };

  const handleUpdateQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.sku === sku) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
    showToast("Item removed from cart");
  };

  const handleClearCart = () => {
    setCart([]);
    showToast("Cart cleared");
  };

  const handleAcceptUpsell = (upgrade: Product, original: Product) => {
    setCart((prev) => {
      const filtered = prev.filter((item) => item.product.sku !== original.sku);
      return [...filtered, { product: upgrade, quantity: 1, selectedSize: selectedSize }];
    });
    setSelectedProduct(upgrade);
    setActiveRightTab("cart");

    setMessages((prev) => [
      ...prev,
      {
        id: `up_accepted_${Date.now()}`,
        role: "assistant",
        content: `Applied upgrade to ${upgrade.name} (+₹${((upgrade.price - original.price) / 100).toFixed(0)}). Cart updated with guaranteed stock allocation.`,
        timestamp: "Just now",
      },
    ]);
  };

  const handleInitiateCheckout = async (itemsOverride?: CartItem[]) => {
    let itemsToCheckout: CartItem[] = [];

    if (itemsOverride && itemsOverride.length > 0) {
      itemsToCheckout = itemsOverride;
    } else if (cart.length > 0) {
      itemsToCheckout = cart;
    } else if (selectedProduct) {
      itemsToCheckout = [
        { product: selectedProduct, quantity: 1, selectedSize },
        ...(hasCrossSell && crossSellItem ? [{ product: crossSellItem, quantity: 1, selectedSize: "Standard" }] : []),
      ];
    }

    if (itemsToCheckout.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToCheckout.map((c) => ({
            sku: c.product.sku,
            name: c.product.name,
            price: c.product.price,
            quantity: c.quantity,
          })),
          conversationId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const totalQty = itemsToCheckout.reduce((s, i) => s + i.quantity, 0);
        const orderMessage: Message = {
          id: `ord_${Date.now()}`,
          role: "assistant",
          content: `Created Razorpay checkout mandate for ${totalQty} item(s). Authorize via UPI, NetBanking, or Cards:`,
          orderData: {
            orderId: data.order.id,
            amount: data.order.amount,
            paymentUrl: data.paymentLink.short_url,
            paymentLinkId: data.paymentLink.id,
            items: itemsToCheckout.map((c) => ({
              name: c.product.name,
              price: c.product.price,
              quantity: c.quantity,
            })),
          },
          paymentStatus: "pending",
          timestamp: "Just now",
        };

        setMessages((prev) => [...prev, orderMessage]);
      } else {
        alert(data.error || "Order creation blocked by guardrail.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async (msgId: string, orderId: string, amount: number) => {
    try {
      const res = await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "success", orderId, conversationId, amount }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, paymentStatus: "paid" } : m))
        );

        setMessages((prev) => [
          ...prev,
          {
            id: `conf_${Date.now()}`,
            role: "assistant",
            content: `Payment confirmed ✓. Order #${orderId} verified via UPI.\nFull reasoning and telemetry recorded in the forensic audit trail.`,
            timestamp: "Just now",
          },
        ]);
        setCart([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulatePaymentFailure = async (msgId: string, orderId: string) => {
    try {
      const res = await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "failure",
          orderId,
          conversationId,
          errorCode: "GATEWAY_TIMEOUT",
          errorDescription: "Bank network timed out before debit confirmation.",
        }),
      });
      await res.json();

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, paymentStatus: "failed" } : m))
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `fail_${Date.now()}`,
          role: "assistant",
          content:
            "The bank network timed out before debit confirmation. No money was deducted from your account, and your cart is completely saved. Would you like a fresh replacement payment link?",
          timestamp: "Just now",
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryPayment = async (orderId: string, amount: number) => {
    try {
      const res = await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "retry", orderId, conversationId, amount }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `retry_${Date.now()}`,
            role: "assistant",
            content: "Generated fresh replacement checkout link for your order:",
            orderData: {
              orderId,
              amount,
              paymentUrl: data.paymentLink.short_url,
              paymentLinkId: data.paymentLink.id,
              items: [{ name: "Order Retry", price: amount, quantity: 1 }],
            },
            paymentStatus: "pending",
            timestamp: "Just now",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cartTotalPaise = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const crossSellItem = products.find((p) => selectedProduct?.pairs_with?.includes(p.sku)) || products[1] || null;
  const currentTotal = (selectedProduct?.price || 0) + (hasCrossSell && crossSellItem ? crossSellItem.price : 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full max-h-[calc(100vh-4rem)] bg-surface overflow-hidden relative">
      {/* Left Workspace: Conversational Arena (8/12 split) */}
      <div className="lg:col-span-8 flex flex-col h-full justify-between p-4 lg:p-6 bg-surface border-r border-stone-200/80 relative overflow-hidden min-h-0">
        {/* Top Sub-Bar of Chat Session */}
        <div className="shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-stone-200/80 bg-white/80 px-4 py-2.5 rounded-md border shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-xs bg-primary"></span>
              <span className="font-headline text-base text-on-surface font-semibold tracking-tight">
                MerchantMind Discourse
              </span>
            </div>
            <span className="text-stone-300 font-code text-xs">/</span>
            <div className="flex items-center gap-2">
              <span className="font-code text-xs text-on-surface-variant font-medium">SESSION #{isMounted ? conversationId.slice(-6).toUpperCase() : "LIVE"}</span>
              <span className="w-1 h-1 rounded-full bg-stone-300"></span>
              <span className="font-code text-xs text-primary font-semibold tracking-wider uppercase">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveRightTab("cart");
                setMobileShowRightPanel(true);
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-code font-semibold transition-all shadow-xs",
                activeRightTab === "cart"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white hover:bg-stone-50 border-stone-300 text-stone-800"
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Show Cart</span>
              <span
                className={clsx(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono",
                  activeRightTab === "cart" ? "bg-white text-primary" : "bg-primary text-white"
                )}
              >
                {cartItemsCount}
              </span>
              {cartTotalPaise > 0 && (
                <span
                  className={clsx(
                    "hidden sm:inline font-bold",
                    activeRightTab === "cart" ? "text-stone-100" : "text-primary"
                  )}
                >
                  • ₹{(cartTotalPaise / 100).toLocaleString("en-IN")}
                </span>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-container/70 border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-code text-[11px] text-primary font-semibold tracking-wider uppercase">
                Curator Active
              </span>
            </div>
            <Sliders className="w-4 h-4 text-stone-400 hover:text-stone-700 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Chat Timeline Stream */}
        <div className="flex-1 overflow-y-auto pr-2 py-2 flex flex-col gap-5 min-h-0">
          {messages.map((msg) => {
            const isUser = msg.role === "user";

            if (isUser) {
              return (
                <div key={msg.id} className="flex flex-col items-end gap-1.5 w-full pl-12 lg:pl-24">
                  <div className="flex items-center gap-2 text-on-surface-variant mb-0.5">
                    <span className="font-label text-xs font-medium text-stone-600">Shopper (App Verified)</span>
                    <span className="font-code text-[11px] text-stone-400">{msg.timestamp}</span>
                  </div>
                  <div className="p-3.5 rounded-md bg-stone-100 border border-stone-200 shadow-xs max-w-lg">
                    <p className="font-body text-sm text-on-surface leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex flex-col items-start gap-2 w-full pr-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-headline text-xs font-semibold text-primary tracking-wide">
                    Autonomous Retail Curator
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-code text-[10px] border border-stone-200">
                    v2.4 Core
                  </span>
                  <span className="font-code text-[11px] text-stone-400">{msg.timestamp}</span>
                </div>

                <div className="p-4 rounded-md bg-white border border-stone-200/90 shadow-sm w-full space-y-3">
                  <p className="font-headline text-stone-800 text-sm leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>

                  {/* 3 Product Cards Inline Grid */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full pt-1">
                      {msg.recommendedProducts.slice(0, 3).map((product) => {
                        const isSelected = selectedProduct?.sku === product.sku;

                        return (
                          <div
                            key={product.sku}
                            onClick={() => {
                              setSelectedProduct(product);
                              setActiveRightTab("inspect");
                              setMobileShowRightPanel(true);
                            }}
                            className={clsx(
                              "group cursor-pointer p-3 rounded-md transition-all flex flex-col justify-between shadow-xs relative border",
                              isSelected
                                ? "bg-surface-container-low border-2 border-primary"
                                : "bg-stone-50/70 hover:bg-white border-stone-200"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-xs bg-primary text-white font-label text-[10px] uppercase font-bold tracking-wider">
                                Inspected
                              </div>
                            )}

                            <div>
                              <div className="w-full h-32 rounded-xs bg-stone-100 overflow-hidden mb-2.5 relative border border-stone-200/60">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="flex items-baseline justify-between mb-1">
                                <h3 className="font-headline text-sm text-on-surface font-semibold truncate">
                                  {product.name}
                                </h3>
                              </div>
                              <p className="font-body text-xs text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
                                {product.short_pitch}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                              <div>
                                <span className="font-code text-sm text-primary font-bold">
                                  ₹{(product.price / 100).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(product);
                                    setActiveRightTab("inspect");
                                    setMobileShowRightPanel(true);
                                  }}
                                  className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-label text-[11px] font-medium transition-colors"
                                >
                                  Inspect
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product, "Standard", true);
                                    setMobileShowRightPanel(true);
                                  }}
                                  className="px-2.5 py-1 rounded bg-primary hover:bg-primary/90 text-white font-label text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>+ Add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Contextual Upsell Card */}
                  {msg.upsell && (
                    <div className="p-3.5 rounded-md bg-stone-50 border border-primary/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={msg.upsell.upsellProduct.images[0]}
                          alt={msg.upsell.upsellProduct.name}
                          className="w-12 h-12 rounded object-cover border border-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-label text-xs font-bold text-on-surface">
                              Suggested Upgrade: {msg.upsell.upsellProduct.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              Bounded (+{msg.upsell.deltaPercent}%)
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">{msg.upsell.reason}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptUpsell(msg.upsell.upsellProduct, msg.upsell.originalProduct)}
                        className="px-3 py-1.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all shrink-0"
                      >
                        Upgrade for +₹{(msg.upsell.priceDelta / 100).toFixed(0)}
                      </button>
                    </div>
                  )}

                  {/* Checkout Action Card */}
                  {msg.orderData && (
                    <div className="p-4 rounded-md bg-stone-50 border border-stone-300 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-headline text-sm font-semibold text-on-surface">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span>Razorpay Order #{msg.orderData.orderId}</span>
                        </div>
                        {msg.paymentStatus === "pending" && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-mono font-semibold">
                            Payment Pending
                          </span>
                        )}
                        {msg.paymentStatus === "paid" && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-mono font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid &amp; Captured
                          </span>
                        )}
                        {msg.paymentStatus === "failed" && (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-mono font-semibold">
                            Gateway Timeout
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono pt-1">
                        <span>Total Payable:</span>
                        <span className="text-base font-bold text-primary">
                          ₹{(msg.orderData.amount / 100).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {msg.paymentStatus === "pending" && (
                        <div className="space-y-2 pt-2 border-t border-stone-200">
                          <a
                            href={msg.orderData.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                          >
                            <span>Open Razorpay Payment Page</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-mono">
                            <span>Demo Triggers:</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleSimulatePaymentSuccess(msg.id, msg.orderData.orderId, msg.orderData.amount)
                                }
                                className="text-emerald-700 underline font-semibold hover:text-emerald-900"
                              >
                                [Simulate Success]
                              </button>
                              <button
                                onClick={() => handleSimulatePaymentFailure(msg.id, msg.orderData.orderId)}
                                className="text-red-700 underline font-semibold hover:text-red-900"
                              >
                                [Simulate Failure]
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.paymentStatus === "failed" && (
                        <div className="pt-2 border-t border-stone-200 space-y-2">
                          <p className="text-xs text-stone-600">
                            Bank network timed out before confirming debit. No money was deducted.
                          </p>
                          <button
                            onClick={() => handleRetryPayment(msg.orderData.orderId, msg.orderData.amount)}
                            className="w-full py-2 rounded bg-primary-container border border-primary/30 text-primary font-label text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Generate Fresh Payment Link
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stock verification line */}
                  <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>All models verified in stock, ready to dispatch by tomorrow.</span>
                    </div>
                    <span className="font-code text-[11px] text-stone-400">Deterministic Guardrails</span>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-stone-100 text-stone-600 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>MerchantMind analyzing inventory and policy bounds...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="shrink-0 flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-stone-200">
          {[
            "What products are currently in stock?",
            "Show me studio monitors and bluetooth speakers",
            "Best gear under ₹5,000",
            "Do you have noise cancelling headphones?",
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-md bg-white border border-stone-300 hover:border-primary text-stone-700 hover:text-primary font-label text-xs whitespace-nowrap transition-colors shadow-xs shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Bottom Chat Input Bar Dock */}
        <div className="shrink-0 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-1 rounded-md bg-white border border-stone-300 shadow-sm flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or negotiate specs..."
              className="flex-1 bg-transparent text-on-surface placeholder:text-stone-400 font-body text-sm px-3 focus:outline-none"
            />
            <div className="hidden md:flex items-center gap-1 px-1 text-stone-400">
              <kbd className="font-code text-[11px] bg-stone-100 border border-stone-200 px-1 py-0.5 rounded">⌘</kbd>
              <kbd className="font-code text-[11px] bg-stone-100 border border-stone-200 px-1 py-0.5 rounded">K</kbd>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-9 px-4 rounded-md bg-primary text-white font-label text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Workspace: Persistent Product Context & Quick-Action Panel (4/12 split) */}
      <div
        className={clsx(
          "bg-surface-container-low p-4 lg:p-6 flex-col justify-between overflow-y-auto min-h-0 border-l border-stone-200/50 z-30 transition-all",
          mobileShowRightPanel
            ? "fixed inset-0 flex bg-white lg:static lg:flex lg:col-span-4 lg:bg-surface-container-low"
            : "hidden lg:flex lg:col-span-4"
        )}
      >
        {/* Top Tab Switcher: Inspect Item vs Show Cart */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 shrink-0">
          <div className="flex items-center p-0.5 bg-stone-200/70 rounded-md border border-stone-300/70 w-full">
            <button
              type="button"
              onClick={() => setActiveRightTab("inspect")}
              className={clsx(
                "flex-1 py-1.5 px-2 rounded font-label text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                activeRightTab === "inspect"
                  ? "bg-white text-stone-900 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <span>🔍 Inspect Item</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab("cart")}
              className={clsx(
                "flex-1 py-1.5 px-2 rounded font-label text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative",
                activeRightTab === "cart"
                  ? "bg-white text-primary shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Show Cart</span>
              <span
                className={clsx(
                  "px-1.5 py-0.2 rounded-full font-code text-[10px] font-bold",
                  activeRightTab === "cart" ? "bg-primary text-white" : "bg-stone-300 text-stone-700"
                )}
              >
                {cartItemsCount}
              </span>
            </button>
          </div>
          {mobileShowRightPanel && (
            <button
              type="button"
              onClick={() => setMobileShowRightPanel(false)}
              className="lg:hidden ml-2 p-1.5 rounded-md hover:bg-stone-200 text-stone-600 shrink-0"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeRightTab === "cart" ? (
          /* SHOW CART VIEW */
          <div className="flex flex-col h-full justify-between min-h-0">
            <div className="flex flex-col gap-3 overflow-y-auto pr-1 min-h-0">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 shrink-0">
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface">Your Cart</h2>
                  <p className="font-code text-xs text-stone-500">
                    {cartItemsCount} item{cartItemsCount === 1 ? "" : "s"} • ₹{(cartTotalPaise / 100).toLocaleString("en-IN")}
                  </p>
                </div>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-stone-500 hover:text-red-600 font-label text-xs underline transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-stone-500">
                  <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 text-stone-400" />
                  </div>
                  <span className="font-headline text-sm font-bold text-stone-700">Your Cart is Empty</span>
                  <p className="font-body text-xs mt-1 text-stone-500 max-w-xs leading-relaxed">
                    Browse recommendations in the chat and click &quot;+ Add to Cart&quot; or inspect any product to build your order.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab("inspect")}
                    className="mt-4 px-3.5 py-1.5 rounded-md bg-white border border-stone-300 hover:border-primary text-stone-800 hover:text-primary font-label text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    Inspect Products
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.product.sku}
                      className="p-3 rounded-md bg-white border border-stone-200 shadow-xs flex flex-col gap-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <img
                          src={item.product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-headline text-xs font-bold text-on-surface truncate">
                            {item.product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-stone-100 border border-stone-200 font-code text-[10px] text-stone-600">
                              {item.selectedSize || "Standard"}
                            </span>
                            <span className="font-code text-xs text-primary font-bold">
                              ₹{(item.product.price / 100).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.product.sku)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity & Item Subtotal Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.sku, -1)}
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center font-bold text-stone-700 transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-code font-bold px-2 py-0.5 text-stone-800 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product.sku, 1)}
                            className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center font-bold text-stone-700 transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-[11px] text-stone-400 font-label">Subtotal:</span>
                          <span className="font-code font-bold text-on-surface">
                            ₹{((item.product.price * item.quantity) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer Summary & Multi-Item Checkout */}
            {cart.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-200 mt-3 shrink-0">
                <div className="p-3 rounded-md bg-white border border-stone-200 space-y-1.5 text-xs font-label">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Items Subtotal ({cartItemsCount}):</span>
                    <span className="font-code font-medium">₹{(cartTotalPaise / 100).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Razorpay Processing Fee:</span>
                    <span className="font-code text-emerald-700 font-semibold">₹0 (Complimentary)</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>GST / Taxes:</span>
                    <span className="font-code text-stone-500">Included</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 font-headline font-bold text-sm text-on-surface">
                    <span>Total Cart Value:</span>
                    <span className="text-primary font-code text-base">
                      ₹{(cartTotalPaise / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleInitiateCheckout()}
                  disabled={isLoading}
                  className="w-full py-3 rounded-md bg-primary text-white font-label text-sm font-semibold hover:bg-primary/95 transition-all shadow-sm flex items-center justify-center gap-2 tracking-wide cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Authorize Razorpay Mandate • ₹{(cartTotalPaise / 100).toLocaleString("en-IN")}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 py-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-label text-[11px] text-stone-500 tracking-wide font-medium">
                    Single combined payment link for {cartItemsCount} item(s)
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : selectedProduct ? (
          /* INSPECT PRODUCT VIEW */
          <>
            <div className="flex flex-col gap-4">
              {/* Inspector Subheader */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs text-on-surface uppercase tracking-wider font-bold">
                    Active Item Inspector
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700 font-code text-[11px] font-medium">
                  ID #{selectedProduct.sku}
                </span>
              </div>

              {/* High-res Product Showcase Card */}
              <div className="p-4 rounded-md bg-white border border-stone-200 shadow-sm flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-primary-container text-primary font-label text-[11px] font-bold tracking-wide border border-primary/20">
                    Active Selection
                  </span>
                  <span className="flex items-center gap-1.5 font-code text-xs text-stone-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    In Stock ({selectedProduct.stock_count} units)
                  </span>
                </div>

                <div className="w-full h-56 rounded-md bg-stone-50 border border-stone-200 relative overflow-hidden group">
                  <img
                    src={selectedProduct.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur border border-stone-200 px-2 py-0.5 rounded font-code text-[10px] text-stone-600">
                    360° Inspection Ready
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <h2 className="font-headline text-xl text-on-surface font-bold tracking-tight">
                      {selectedProduct.name}
                    </h2>
                  </div>

                  {/* Rating and Pricing Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="flex text-amber-500 text-xs">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current text-amber-500" />
                        ))}
                      </div>
                      <span className="font-code text-xs text-stone-500 font-medium">(4.9 • 124 reviews)</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="line-through text-stone-400 font-code text-xs">
                        ₹{((selectedProduct.compare_at_price || selectedProduct.price * 1.3) / 100).toFixed(0)}
                      </span>
                      <span className="font-code text-xs text-emerald-700 font-semibold">-24%</span>
                      <span className="font-headline text-xl text-primary font-bold">
                        ₹{(selectedProduct.price / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Size Selector Pills */}
                  <div className="flex flex-col gap-1.5 mb-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label text-xs text-stone-700 font-semibold">Select Variant / Size</span>
                      <span className="font-code text-xs text-primary underline cursor-pointer">Spec Sheet</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {["Standard", "Pro", "Custom", "Bundle"].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={clsx(
                            "py-1.5 rounded-md font-code text-xs transition-colors",
                            selectedSize === size
                              ? "bg-primary text-white border border-primary font-bold shadow-xs"
                              : "bg-stone-100 border border-stone-200 text-stone-800 hover:bg-stone-200 font-medium"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cross-Sell Upsell Box */}
                  {crossSellItem && (
                    <div className="p-2.5 rounded-md bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-md bg-white border border-stone-200 overflow-hidden flex-shrink-0">
                          <img src={crossSellItem.images?.[0]} alt={crossSellItem.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label text-xs text-on-surface font-semibold truncate max-w-[180px]">
                            {crossSellItem.name}
                          </span>
                          <span className="font-code text-[11px] text-primary font-medium">
                            +₹{(crossSellItem.price / 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHasCrossSell(!hasCrossSell)}
                        className={clsx(
                          "px-2.5 py-1 rounded-md font-label text-xs font-medium transition-colors shadow-xs",
                          hasCrossSell
                            ? "bg-primary-container border border-primary/30 text-primary font-bold"
                            : "bg-white border border-stone-300 hover:bg-stone-100 text-stone-800"
                        )}
                      >
                        {hasCrossSell ? "Added ✓" : "+ Quick Add"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Metric / Spec Breakdown Mini Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-md bg-white border border-stone-200 flex flex-col shadow-xs">
                  <span className="font-label text-[10px] text-stone-500 uppercase font-semibold">SKU Category</span>
                  <span className="font-headline text-xs text-on-surface font-bold mt-0.5 capitalize">{selectedProduct.category || "General"}</span>
                </div>
                <div className="p-2.5 rounded-md bg-white border border-stone-200 flex flex-col shadow-xs">
                  <span className="font-label text-[10px] text-stone-500 uppercase font-semibold">Inventory Status</span>
                  <span className="font-headline text-xs text-on-surface font-bold mt-0.5">{selectedProduct.in_stock ? "Live / In Stock" : "Restocking"}</span>
                </div>
              </div>
            </div>

            {/* Persistent Bottom CTA Zone */}
            <div className="flex flex-col gap-2 pt-4 border-t border-stone-200 mt-4 shrink-0">
              {cart.some((item) => item.product.sku === selectedProduct.sku) && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                  <span>✓ {cart.find((i) => i.product.sku === selectedProduct.sku)?.quantity} already in cart</span>
                  <button
                    type="button"
                    onClick={() => setActiveRightTab("cart")}
                    className="underline font-bold hover:text-emerald-950 cursor-pointer"
                  >
                    View Cart →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedProduct, selectedSize, true)}
                  className="py-2.5 px-3 rounded-md bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-900 font-label text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(selectedProduct, selectedSize, false);
                    handleInitiateCheckout([
                      { product: selectedProduct, quantity: 1, selectedSize },
                      ...(hasCrossSell && crossSellItem ? [{ product: crossSellItem, quantity: 1, selectedSize: "Standard" }] : []),
                    ]);
                  }}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-md bg-primary text-white font-label text-xs font-bold hover:bg-primary/95 transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Instant Buy</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 py-1">
                <span className="font-label text-[11px] text-stone-500 tracking-wide font-medium">
                  Instant Razorpay UPI / Card settlement guaranteed
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-stone-500">
            <ShoppingBag className="w-12 h-12 text-stone-300 mb-3" />
            <span className="font-headline text-base font-bold text-stone-700">Catalog Ready</span>
            <p className="font-code text-xs mt-1 text-stone-500 max-w-xs">
              Select or ask the AI curator for any product to inspect live details and initiate instant Razorpay checkout.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-5 right-5 z-50 px-4 py-2.5 rounded-md bg-stone-900 text-white font-mono text-xs shadow-xl border border-stone-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
