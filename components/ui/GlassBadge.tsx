import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "error" | "warning" | "gold" | "neutral";
  size?: "sm" | "md";
}

export function GlassBadge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: GlassBadgeProps) {
  const base = "inline-flex items-center font-mono font-medium rounded-full border";

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const variants = {
    success: "bg-status-successBg text-status-success border-status-success/30",
    error: "bg-status-errorBg text-status-error border-status-error/30",
    warning: "bg-status-warningBg text-status-warning border-status-warning/30",
    gold: "bg-gold-subtle text-gold border-gold/30",
    neutral: "bg-white/[0.04] text-text-secondary border-white/[0.08]",
  };

  return (
    <span className={twMerge(clsx(base, sizes[size], variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
