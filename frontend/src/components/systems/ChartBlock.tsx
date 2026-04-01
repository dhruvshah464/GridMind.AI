'use client';

import { Card } from "@/components/ui/Card";
import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from "recharts";
import { Brain } from "lucide-react";

// Stable mock data — generated once, not on every render
const STABLE_MOCK = Array.from({ length: 24 }).map((_, i) => {
  const hour = i;
  const baseLoad = 15;
  const morningPeak = hour >= 7 && hour <= 9 ? 18 : 0;
  const eveningPeak = hour >= 17 && hour <= 21 ? 22 : 0;
  const variation = Math.sin(i * 0.7) * 6;
  return {
    time: `${hour.toString().padStart(2, '0')}:00`,
    energy: Math.round((baseLoad + morningPeak + eveningPeak + variation) * 10) / 10,
  };
});

export function ChartBlock({ timeseries, predictionArray = [] }: { timeseries?: any[], predictionArray?: number[] }) {
  const { chartData, peakObject } = useMemo(() => {
    let data: any[] = [];
    if (timeseries && timeseries.length > 0) {
      data = timeseries.map((d: any) => ({
        time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        energy: d.consumptionKwh,
        predicted: null
      }));
    } else {
      data = STABLE_MOCK.map(d => ({ ...d, predicted: null }));
    }

    let peak: any = null;

    if (predictionArray && predictionArray.length > 0) {
      const lastTimeStr = data.length > 0 ? data[data.length - 1].time : "12:00";
      const lastEnergy = data.length > 0 ? data[data.length - 1].energy : 25;

      const connectionNode = { time: lastTimeStr, energy: null, predicted: lastEnergy };
      const predictions = predictionArray.map((val, i) => {
        const d = new Date();
        d.setHours(d.getHours() + i + 1);
        return {
          time: d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          energy: null,
          predicted: val
        };
      });

      data = [...data, connectionNode, ...predictions];

      let maxPred = -1;
      predictions.forEach(p => {
        if (p.predicted > maxPred) {
          maxPred = p.predicted;
          peak = p;
        }
      });
    }
    return { chartData: data, peakObject: peak };
  }, [timeseries, predictionArray]);

  return (
    <div className="w-full relative group">
      <Card className="w-full h-[380px] flex flex-col pt-6 px-0 pb-0 overflow-hidden glass-panel border-[var(--border)] relative">
        {/* Header */}
        <div className="px-6 mb-4 pb-4 border-b border-[var(--border)] flex justify-between items-center">
          <div>
            <h3 className="text-[var(--text-1)] text-base font-semibold tracking-tight">System Telemetry</h3>
            <p className="text-label mt-1 flex items-center gap-2">
              <span className="status-dot status-dot-active" />
              Live Flow Analysis
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg gm-surface-2 text-xs text-[var(--text-2)] font-medium flex items-center gap-2">
            <Brain className="w-3 h-3 text-[var(--primary)]" /> AI Modeling
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 w-full relative min-h-[250px]" style={{ willChange: 'transform' }}>
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 15, right: 25, left: 25, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  dy={10}
                  minTickGap={40}
                />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 15']} />

                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-panel p-3 rounded-xl flex flex-col gap-1.5 min-w-[140px] shadow-xl">
                          <span className="text-label mb-1">{label}</span>
                          {payload.map((p, i) => (
                            p.value != null && (
                              <div key={i} className="flex gap-2 justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                                  <span className="text-[var(--text-2)] text-xs font-medium">{String(p.name || p.dataKey)}</span>
                                </div>
                                <span className="text-[var(--text-1)] text-sm text-mono font-medium">{Number(p.value).toFixed(1)}</span>
                              </div>
                            )
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="energy"
                  name="Actual"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnergy)"
                  isAnimationActive={false}
                  activeDot={{ r: 4, fill: '#6366F1', stroke: 'var(--bg)', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="Forecast"
                  stroke="#10B981"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                  isAnimationActive={false}
                  activeDot={{ r: 4, fill: '#10B981', stroke: 'var(--bg)', strokeWidth: 2 }}
                />

                {peakObject && (
                  <ReferenceDot
                    x={peakObject.time}
                    y={peakObject.predicted}
                    r={5}
                    fill="#EF4444"
                    stroke="var(--bg)"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
