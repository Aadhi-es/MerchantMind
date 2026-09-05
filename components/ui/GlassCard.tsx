import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gold" | "subtle" | "alert" | "active";
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const base = "rounded-card backdrop-blur-md transition-all duration-200";

    const variants = {
      default: "bg-white/[0.035] border border-white/[0.08] text-text-primary",
      gold: "bg-gold-subtle/50 border border-gold/25 text-text-primary shadow-[0_0_15px_rgba(212,168,83,0.06)]",
      subtle: "bg-white/[0.015] border border-white/[0.04] text-text-primary",
      alert: "bg-status-errorBg/60 border border-status-error/30 text-text-primary",
      active: "bg-white/[0.06] border border-gold/40 text-text-primary shadow-[0_0_20px_rgba(212,168,83,0.08)]",
    };

    const interactiveStyles = interactive
      ? "hover:bg-white/[0.06] hover:border-white/[0.14] cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={twMerge(clsx(base, variants[variant], interactiveStyles, className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
