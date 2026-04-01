"use client";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ChartBlock } from "@/components/systems/ChartBlock";
import { TrendingUp, History, Zap, Activity, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { InsightsSkeleton } from "@/components/ui/Skeleton";

export default function InsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [dashRes, forecastRes] = await Promise.all([
          api.get('/energy/dashboard'),
          api.get('/ai/forecast?region=California')
        ]);
        setData(dashRes.data);
        if (forecastRes.data.success) setForecast(forecastRes.data.data);

        // Try to get real decision history
        try {
          const decRes = await api.get('/ai/decisions');
          if (decRes.data.success) setDecisions(decRes.data.data);
        } catch {}
      } catch {}
      setLoading(false);
    };
    fetchInsights();
  }, []);

  if (authLoading || loading) {
    return (
      <Section className="py-24 flex justify-center min-h-[50vh]">
        <Container className="max-w-[1200px] w-full">
          <InsightsSkeleton />
        </Container>
      </Section>
    );
  }

  // Fallback logs if no real decisions
  const logs = decisions.length > 0
    ? decisions.map((d: any) => ({
        time: new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: d.action,
        reason: d.prediction,
        savings: d.impact
      }))
    : [
        { time: "14:20", action: "HVAC load reduced by 20%", reason: "Pre-cooling cycle complete", savings: "+0.8 kWh" },
        { time: "11:05", action: "Solar export maximized", reason: "Peak grid buy-back rate", savings: "+$4.10" },
        { time: "08:30", action: "EV Charging paused", reason: "Grid instability detected", savings: "Safety Protocol" },
        { time: "02:00", action: "Smart Appliances engaged", reason: "Off-peak tariff active", savings: "+$2.50" },
      ];

  const currency = forecast?.currency === 'INR' ? '₹' : '$';

  return (
    <Section className="py-8 md:py-12 relative">
      <Container className="max-w-[1200px]">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">System Insights</h1>
            <p className="text-[var(--text-3)] text-sm mt-1.5 text-mono uppercase tracking-wider">Historical Telemetry & Decisions</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 gm-surface-2 px-3 py-1.5 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-mono text-xs text-[var(--accent)] font-medium">32% Efficiency Gain</span>
          </div>
        </div>

        {!user && (
          <div className="mb-6 p-3 gm-surface-2 border-[var(--amber)]/20 text-[var(--amber)] text-sm rounded-xl flex items-center gap-3">
            <Zap className="w-4 h-4 shrink-0" />
            Demo Mode — Login to see personalized analytics.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <ErrorBoundary componentName="Telemetry Chart">
              <ChartBlock timeseries={data?.timeseries} predictionArray={data?.predictionArray} />
            </ErrorBoundary>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-5 glass-panel">
                <h4 className="text-label mb-2">30-Day Savings</h4>
                <p className="text-2xl text-mono font-bold text-[var(--text-1)]">
                  {forecast ? `${currency}${forecast.projectedSavings.toFixed(2)}` : '$412.50'}
                </p>
              </Card>
              <Card className="p-5 glass-panel">
                <h4 className="text-label mb-2">Carbon Offset</h4>
                <p className="text-2xl text-mono font-bold text-[var(--amber)]">1.2 Tons</p>
              </Card>
            </div>

            {/* Bill Forecast */}
            {forecast && (
              <Card className="p-5 glass-panel">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-[var(--primary)]" />
                  <h4 className="text-label text-[var(--primary)]">Bill Forecast</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <span className="text-label">Baseline</span>
                    <p className="text-lg text-mono font-semibold text-[var(--text-1)] mt-1">{currency}{forecast.baselineCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-label text-[var(--accent)]">Optimized</span>
                    <p className="text-lg text-mono font-semibold text-[var(--accent)] mt-1">{currency}{forecast.optimizedCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-label">Savings</span>
                    <p className="text-lg text-mono font-semibold text-[var(--amber)] mt-1">{forecast.savingsPercent}%</p>
                  </div>
                </div>
                {forecast.explanation && (
                  <p className="text-xs text-[var(--text-2)] border-l-2 border-[var(--primary)]/30 pl-3 leading-relaxed">{forecast.explanation}</p>
                )}
              </Card>
            )}
          </div>

          {/* Decision Log */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <h3 className="text-label flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Decision Log
            </h3>

            <Card className="flex flex-col gap-0 p-0 glass-panel overflow-hidden">
              {logs.map((log, i) => (
                <div key={i} className={`p-4 flex flex-col gap-2 ${i !== logs.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-label px-2 py-0.5 gm-surface-2 rounded text-[10px]">{log.time}</span>
                    <span className={`text-[10px] text-mono tracking-wide ${log.savings.includes('+') ? 'text-[var(--accent)]' : 'text-[var(--text-3)]'}`}>
                      {log.savings}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-1)] font-medium">{log.action}</p>
                    <p className="text-xs text-[var(--text-3)] mt-0.5">{log.reason}</p>
                  </div>
                </div>
              ))}
            </Card>

            <button className="text-xs text-[var(--primary)] hover:underline text-mono text-center mt-1 w-full py-2 gm-surface-2 rounded-xl transition-colors">
              Export Audit Log
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
