"use client";

import { useEffect, useState, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ChartBlock } from "@/components/systems/ChartBlock";
import { MetricCard } from "@/components/systems/MetricCard";
import { AIInsightCard } from "@/components/systems/AIInsightCard";
import { SimulatorPanel } from "@/components/systems/SimulatorPanel";
import { AIChatConsole } from "@/components/systems/AIChatConsole";
import { StrategicImpactCard } from "@/components/systems/StrategicImpactCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { ArrowUpRight, CheckCircle2, Zap, Activity, AlertTriangle, Power } from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoMode, setAutoMode] = useState(false);

  const toggleAutoMode = async () => {
    if (!user) { alert("Authentication required to modify grid state."); return; }
    const nextMode = !autoMode;
    setAutoMode(nextMode);
    try { await api.post('/ai/optimize', { autoMode: nextMode }); } 
    catch { setAutoMode(autoMode); }
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const dbResponse = await api.get('/energy/dashboard');
      let combinedData = dbResponse.data;

      try {
        const aiResponse = await api.get('/ai/decision');
        if (aiResponse.data.success && aiResponse.data.data.predictionArray) {
          combinedData.predictionArray = aiResponse.data.data.predictionArray;
          if (aiResponse.data.data.schedule?.length > 0) setAutoMode(true);
        }
      } catch {}
      setData(combinedData);
    } catch {
      console.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 12000); // 12s unified poll
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (loading) {
    return (
      <Section className="py-12 flex justify-center min-h-[60vh]">
        <DashboardSkeleton />
      </Section>
    );
  }

  const metrics = data?.metrics || { totalConsumption: 124.5, totalSolar: 94.2 };

  const activeAlerts = [
    { id: 1, severity: 'high', title: "HVAC Anomaly Detected", cause: "Compressor inefficiency", action: "Run maintenance cycle", impact: "Save $12/day", color: "var(--danger)" },
    { id: 2, severity: 'medium', title: "Solar Output Drop", cause: "Cloud cover projected", action: "Engage battery storage", impact: "Maintain uptime", color: "var(--amber)" },
    { id: 3, severity: 'low', title: "Grid Rate Opportunity", cause: "Off-peak tariff incoming", action: "Pre-load EV chargers", impact: "Optimal rate sync", color: "var(--primary)" },
  ];

  return (
    <Section className="pt-8 pb-12 relative">
      {/* Auto mode glow */}
      {autoMode && (
        <div className="fixed inset-0 z-[-10] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[150px]" />
        </div>
      )}

      <Container className="flex flex-col gap-6 max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-5 border-b border-[var(--border)] relative"
        >
          <div className="flex flex-col gap-1">
            {!user && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full gm-surface-2 border-[var(--amber)]/20 text-[var(--amber)] text-xs font-medium mb-3 w-max">
                <span className="status-dot status-dot-warning" />
                Demo Mode
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--text-1)]">
              System Overview
            </h1>
            <p className="text-sm text-[var(--text-2)] flex items-center gap-2 mt-1">
              <span className="status-dot status-dot-active" />
              GridMind Intelligence Active
            </p>
          </div>

          {/* Auto Mode Toggle */}
          <div className={`flex items-center gap-4 gm-surface p-2 rounded-2xl ${!user ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 px-4 py-1.5">
              <span className="text-xs uppercase font-semibold tracking-widest text-[var(--text-2)]">
                {user ? 'Autonomous' : 'Auth Required'}
              </span>
              <button
                onClick={toggleAutoMode}
                className={`relative w-12 h-6 rounded-full p-0.5 transition-all duration-300 ${autoMode ? 'bg-[var(--primary)]' : 'bg-white/[0.06] border border-[var(--border)]'}`}
              >
                <motion.div
                  className={`w-5 h-5 rounded-full shadow ${autoMode ? 'bg-white' : 'bg-white/30'}`}
                  animate={{ x: autoMode ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Split View */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT: AI Command (60%) */}
          <div className="w-full xl:w-[60%] flex flex-col gap-6">
            <ErrorBoundary componentName="Strategic Impact">
              <StrategicImpactCard />
            </ErrorBoundary>
            <ErrorBoundary componentName="AI Insight Engine">
              <AIInsightCard />
            </ErrorBoundary>
            <ErrorBoundary componentName="AI Chat Console">
              <AIChatConsole />
            </ErrorBoundary>

            {/* Alerts */}
            <div className="flex flex-col gap-3">
              <h3 className="text-label">Live Intelligence Feed</h3>
              <AnimatePresence>
                {activeAlerts.map((alert, i) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="glass-panel p-4 rounded-xl group hover:border-[var(--border-hover)] transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-0.5 h-full rounded-full" style={{ background: alert.color }} />
                    <div className="flex items-start gap-3 pl-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: alert.color }} />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium" style={{ color: alert.color }}>{alert.title}</h4>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="flex flex-col">
                            <span className="text-label">Cause</span>
                            <span className="text-[var(--text-2)] mt-0.5">{alert.cause}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-label">Action</span>
                            <span className="text-[var(--text-1)] font-medium mt-0.5">{alert.action}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-label">Impact</span>
                            <span className="text-[var(--accent)] text-mono font-medium mt-0.5">{alert.impact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: System Reality (40%) */}
          <div className="w-full xl:w-[40%] flex flex-col gap-4">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Generation"
                value={`${metrics.totalConsumption.toFixed(1)} kWh`}
                trend="12%"
                trendUp={true}
                icon={<Zap className="w-3.5 h-3.5 text-[var(--amber)]" />}
              />
              <MetricCard
                title="Efficiency"
                value={`${metrics.totalSolar ? (metrics.totalSolar / metrics.totalConsumption * 100).toFixed(1) : 98.2}%`}
                trend="Optimal"
                trendUp={true}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)]" />}
              />
              <MetricCard
                title="Energy Cost"
                value="$42.1k"
                trend="4.2%"
                trendUp={false}
                icon={<ArrowUpRight className="w-3.5 h-3.5 text-[var(--danger)]" />}
              />
              <MetricCard
                title="Active Nodes"
                value="14"
                trend="Online"
                trendUp={true}
                icon={<Power className="w-3.5 h-3.5 text-[var(--text-1)]" />}
              />
            </div>

            {/* Simulator */}
            <div className="h-[360px]">
              <ErrorBoundary componentName="Simulator">
                <SimulatorPanel />
              </ErrorBoundary>
            </div>

            {/* Chart */}
            <ErrorBoundary componentName="Telemetry Chart">
              <ChartBlock timeseries={data?.timeseries} predictionArray={data?.predictionArray} />
            </ErrorBoundary>

            {/* Power Matrix */}
            <Card className="flex flex-col glass-panel p-5 relative overflow-hidden">
              <h3 className="text-label mb-4">Power Distribution</h3>
              <div className="flex flex-col gap-4 w-full">
                {[
                  { label: "Campus North", pct: 45, value: `${(metrics.totalConsumption * 0.45).toFixed(1)} kWh`, color: "var(--primary)" },
                  { label: "Storage Farm A", pct: 35, value: `${(metrics.totalConsumption * 0.35).toFixed(1)} kWh`, color: "var(--amber)" },
                  { label: "Grid Export", pct: 20, value: `${(metrics.totalConsumption * 0.20).toFixed(1)} kWh`, color: "var(--accent)" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[var(--text-2)] text-xs text-mono">{item.label}</span>
                      <div className="text-right">
                        <span className="text-[var(--text-1)] text-mono text-sm font-medium">{item.value}</span>
                        <span className="text-label ml-2">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
