'use client';

import { cn } from "@/lib/utils";
import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, trendUp, icon, className }: MetricCardProps) {
  return (
    <div className={cn("gm-surface p-4 flex flex-col gap-3 group glass-panel-hover", className)}>
      <div className="flex items-center justify-between">
        <span className="text-label">{title}</span>
        {icon && <div className="opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-semibold text-[var(--text-1)] text-mono tracking-tight">{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-medium text-mono px-2 py-0.5 rounded-md",
            trendUp !== false
              ? "text-[var(--accent)] bg-[var(--accent-glow)]"
              : "text-[var(--danger)] bg-[var(--danger)]/10"
          )}>
            {trendUp !== false ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
