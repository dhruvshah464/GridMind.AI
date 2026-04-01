'use client';

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Brain, ArrowRight, Zap, Target, Activity, Info } from "lucide-react";
import React, { useEffect, useState, useCallback, memo } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export const AIInsightCard = memo(function AIInsightCard() {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const fetchDecision = useCallback(async () => {
    try {
      const res = await api.get('/ai/decision');
      if (res.data.success) {
        setInsight(res.data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecision();
    const interval = setInterval(fetchDecision, 10000); // 10s instead of 5s
    return () => clearInterval(interval);
  }, [fetchDecision]);

  const applyOptimization = async () => {
    setOptimizing(true);
    try {
      const res = await api.post('/ai/optimize', { autoMode: true });
      if (res.data.success) {
        setInsight(res.data.data);
      }
    } catch {
      // Silent fail
    } finally {
      setTimeout(() => setOptimizing(false), 600);
    }
  };

  if (loading) {
    return (
      <div className="gm-surface p-8 flex items-center justify-center min-h-[140px]">
        <div className="flex items-center gap-3 text-[var(--text-3)]">
          <Brain className="w-5 h-5 animate-pulse" />
          <span className="text-sm text-mono">Initializing AI Engine...</span>
        </div>
      </div>
    );
  }

  if (!insight) return null;

  const confidencePct = Math.round((insight.mlPrediction?.confidence || insight.confidence || 0.6) * 100);
  const riskLevel = insight.riskAssessment?.level || 'normal';
  const riskColor = riskLevel === 'critical' ? 'var(--danger)' : riskLevel === 'elevated' ? 'var(--amber)' : 'var(--accent)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <Card className="relative overflow-hidden glass-panel p-0 w-full">
        {/* Scan line effect */}
        <div className="absolute top-0 left-0 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent animate-scan-line" />

        <div className="p-6 flex flex-col gap-5">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl gm-surface-2 ${insight.anomaly?.status ? 'border-[var(--danger)]/40' : ''}`}>
                <Brain className={`w-5 h-5 ${insight.anomaly?.status ? 'text-[var(--danger)] animate-pulse' : 'text-[var(--primary)]'}`} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-label flex items-center gap-2">
                  <span className={`status-dot ${insight.anomaly?.status ? 'status-dot-danger' : 'status-dot-active'}`} />
                  {insight.mlPrediction ? 'ML Prediction Active' : 'Heuristic Analysis'}
                </span>
                <h3 className="text-sm font-medium text-[var(--text-1)] mt-1">{insight.prediction}</h3>
              </div>
            </div>

            {/* Risk Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg gm-surface-2" style={{ borderColor: `${riskColor}30` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: riskColor }} />
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: riskColor }}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Action + Impact Row */}
          <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
            <div className="flex-1">
              <span className="text-label mb-1.5 block">Recommended Action</span>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[var(--amber)]" />
                <span className="text-sm font-medium text-[var(--text-1)]">{insight.action}</span>
              </div>
              {insight.actionReason && (
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="flex items-center gap-1 mt-2 text-xs text-[var(--text-3)] hover:text-[var(--primary)] transition-colors"
                >
                  <Info className="w-3 h-3" />
                  {showExplanation ? 'Hide' : 'Why this?'}
                </button>
              )}
              <AnimatePresence>
                {showExplanation && insight.actionReason && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-[var(--text-2)] mt-2 pl-5 border-l border-[var(--primary)]/30 leading-relaxed"
                  >
                    {insight.actionReason}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Impact + Confidence */}
            <div className="flex items-center gap-4 xl:gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-label">Impact</span>
                <span className="text-sm text-mono font-semibold text-[var(--accent)]">{insight.impact}</span>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[100px]">
                <div className="flex justify-between items-center">
                  <span className="text-label flex items-center gap-1">
                    <Target className="w-3 h-3" /> Confidence
                  </span>
                  <span className="text-xs text-mono text-[var(--text-2)]">{confidencePct}%</span>
                </div>
                <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyOptimization}
                disabled={optimizing}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  optimizing
                    ? 'gm-surface-2 text-[var(--text-3)] cursor-default'
                    : 'bg-[var(--primary-glow)] hover:bg-[var(--primary)]/20 border-[var(--primary)]/30 text-[var(--text-1)] shadow-sm'
                }`}
              >
                {optimizing ? (
                  <><Activity className="w-4 h-4 animate-spin" /> Applying...</>
                ) : (
                  <>Optimize <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>

          {/* Schedule (if auto mode) */}
          {insight.schedule && insight.schedule.length > 0 && (
            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
              <span className="text-label shrink-0 mt-0.5">Schedule:</span>
              <div className="flex flex-wrap gap-2">
                {insight.schedule.map((s: any, idx: number) => (
                  <span key={idx} className="text-xs gm-surface-2 rounded-md px-2.5 py-1 text-mono text-[var(--text-2)]">
                    {s.time} · {s.device}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});
