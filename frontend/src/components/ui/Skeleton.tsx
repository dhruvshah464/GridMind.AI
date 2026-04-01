'use client';

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'heading' | 'card' | 'circle' | 'chart' | 'metric';
  count?: number;
}

export function Skeleton({ className, variant = 'text', count = 1 }: SkeletonProps) {
  const variants: Record<string, string> = {
    text: 'h-3.5 w-full rounded-md',
    heading: 'h-6 w-3/5 rounded-md',
    card: 'h-[120px] w-full rounded-xl',
    circle: 'h-10 w-10 rounded-full',
    chart: 'h-[300px] w-full rounded-xl',
    metric: 'h-[80px] w-full rounded-xl',
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn("skeleton", variants[variant])} />
      ))}
    </div>
  );
}

/** Full-page skeleton for dashboard loading state */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Header area */}
      <div className="flex justify-between items-end pb-5 border-b border-[var(--border)]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="heading" />
          <Skeleton variant="text" className="w-48" />
        </div>
        <Skeleton className="w-40 h-10 rounded-xl" />
      </div>

      {/* Content split */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left */}
        <div className="w-full xl:w-[60%] flex flex-col gap-4">
          {/* Impact cards */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="metric" />
            <Skeleton variant="metric" />
          </div>
          {/* AI Insight */}
          <Skeleton className="h-[140px] rounded-xl" />
          {/* Chat */}
          <Skeleton className="h-[200px] rounded-xl" />
          {/* Alerts */}
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" className="w-32" />
            <Skeleton className="h-[80px] rounded-xl" />
            <Skeleton className="h-[80px] rounded-xl" />
          </div>
        </div>

        {/* Right */}
        <div className="w-full xl:w-[40%] flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="metric" />
            <Skeleton variant="metric" />
            <Skeleton variant="metric" />
            <Skeleton variant="metric" />
          </div>
          <Skeleton variant="chart" />
          <Skeleton variant="chart" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for insights page */
export function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-end pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col gap-2">
          <Skeleton variant="heading" />
          <Skeleton variant="text" className="w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Skeleton variant="chart" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="metric" />
            <Skeleton variant="metric" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton variant="text" className="w-24" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
