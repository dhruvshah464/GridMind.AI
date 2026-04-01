"use client";

import { Card } from "@/components/ui/Card";
import { Zap, CheckCircle2, TrendingUp, ArrowRight, DollarSign } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState, memo } from "react";
import api from "@/lib/api";

export const StrategicImpactCard = memo(function StrategicImpactCard() {
  const { user } = useAuth();
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await api.get('/ai/forecast?region=California');
        if (res.data.success) setForecast(res.data.data);
      } catch { /* silent */ }
    };
    fetchForecast();
  }, []);

  const dailySavings = forecast ? (forecast.projectedSavings / 30).toFixed(2) : '12.40';
  const monthlySavings = forecast ? forecast.projectedSavings.toFixed(2) : '342.00';
  const savingsPercent = forecast?.savingsPercent || 20;
  const currency = forecast?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-label">Practical Intelligence</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Savings Metrics */}
        <Card className="p-5 flex flex-col gap-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[80px] bg-[var(--accent)]/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-label">Projected Savings</span>
          </div>
          <div className="flex flex-col gap-1 relative z-10">
            <span className="text-2xl font-bold text-mono text-[var(--text-1)]">
              {currency}{dailySavings} <span className="text-sm font-normal text-[var(--text-3)]">/ day</span>
            </span>
            <span className="text-base font-medium text-mono text-[var(--accent)]">
              {currency}{monthlySavings} <span className="text-xs font-normal text-[var(--text-3)]">/ month</span>
            </span>
          </div>
          {forecast && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
              <DollarSign className="w-3 h-3 text-[var(--text-3)]" />
              <span className="text-xs text-[var(--text-2)]">
                Baseline: {currency}{forecast.baselineCost.toFixed(2)} → Optimized: {currency}{forecast.optimizedCost.toFixed(2)}
              </span>
            </div>
          )}
        </Card>

        {/* AI Actions Taken */}
        <Card className="p-5 flex flex-col gap-4 glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[120px] h-[80px] bg-[var(--primary)]/10 blur-[50px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-label">AI Actions Today</span>
          </div>
          <ul className="flex flex-col gap-2.5 relative z-10">
            <li className="flex items-start gap-2 text-sm text-[var(--text-2)]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
              Shifted HVAC cycles to off-peak tariff periods.
            </li>
            <li className="flex items-start gap-2 text-sm text-[var(--text-2)]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
              Delayed EV charging by 2 hours for {savingsPercent}% cost reduction.
            </li>
            <li className="flex items-start gap-2 text-sm text-[var(--text-2)]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
              Optimized solar export thresholds by 14%.
            </li>
          </ul>
        </Card>
      </div>

      {/* Priority Action */}
      <Card className="p-4 flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4 glass-panel relative overflow-hidden group border-[var(--primary)]/20">
        <div className="absolute top-0 left-0 w-0.5 h-full bg-[var(--primary)]" />
        <div className="flex flex-col gap-1.5 pl-3">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[var(--amber)] animate-pulse-dot" />
            <span className="text-label text-[var(--primary)]">Priority Action</span>
          </div>
          <p className="text-sm text-[var(--text-2)]">
            Run high-load appliances at <span className="text-mono text-[var(--amber)]">02:00 AM</span> for projected <span className="font-semibold text-[var(--accent)]">{savingsPercent}% savings</span>.
          </p>
        </div>
        <button
          disabled={!user}
          className="shrink-0 flex items-center gap-2 gm-surface-2 hover:border-[var(--primary)]/30 text-[var(--text-1)] px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {user ? 'Queue Schedule' : 'Login to Queue'}
          <ArrowRight className="w-3.5 h-3.5 text-[var(--text-3)]" />
        </button>
      </Card>
    </div>
  );
});
