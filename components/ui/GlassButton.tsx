import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "secondary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium rounded-card transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    const variants = {
      primary:
        "bg-gold text-[#0F0F0F] font-semibold hover:bg-gold-hover shadow-[0_0_15px_rgba(212,168,83,0.25)] border border-gold",
      gold:
        "bg-gold-subtle border border-gold/40 text-gold hover:bg-gold/15 hover:border-gold/60 shadow-[0_0_10px_rgba(212,168,83,0.1)]",
      secondary:
        "bg-white/[0.04] border border-white/[0.1] text-text-primary hover:bg-white/[0.08] hover:border-white/[0.18]",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
      danger:
        "bg-status-errorBg border border-status-error/40 text-status-error hover:bg-status-error/20",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(base, sizes[size], variants[variant], className))}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : null}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";
