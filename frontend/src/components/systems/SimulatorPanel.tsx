"use client";

import { useState, memo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { Loader2, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";

export const SimulatorPanel = memo(function SimulatorPanel() {
  const { user } = useAuth();
  const [size, setSize] = useState("10");
  const [region, setRegion] = useState("California");
  const [usage, setUsage] = useState("800");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/simulate', {
        systemSize: parseFloat(size),
        region,
        monthlyUsage: parseFloat(usage)
      });
      setResult(res.data.data || res.data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col p-0 glass-panel h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">System Simulator</h3>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-5 relative flex-1 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-b-2xl">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)] mb-2" />
            <p className="text-label text-[var(--primary)]">Running Projections...</p>
          </div>
        )}

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-label">System Size</label>
              <span className="text-sm font-medium text-[var(--text-1)] text-mono">{size} kW</span>
            </div>
            <input
              type="range" min="1" max="100"
              value={size} onChange={(e) => setSize(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label">Region</label>
            <select
              value={region} onChange={(e) => setRegion(e.target.value)}
              className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-1)] appearance-none"
            >
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="New York">New York</option>
              <option value="Florida">Florida</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <label className="text-label">Monthly Usage</label>
              <span className="text-sm font-medium text-[var(--text-1)] text-mono">{usage} kWh</span>
            </div>
            <input
              type="range" min="100" max="5000" step="100"
              value={usage} onChange={(e) => setUsage(e.target.value)}
              className="w-full"
            />
          </div>

          <Button className="w-full mt-1 text-mono" onClick={runSimulation} disabled={loading}>
            Execute Simulation
          </Button>
        </div>

        {/* Results */}
        <div className={`flex flex-col transition-all duration-500 ${result ? 'opacity-100' : 'opacity-30'}`}>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-4" />
          <h4 className="text-label mb-3">Projection Results</h4>

          {result ? (
            <AnimatePresence>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1 p-3 gm-surface-2 rounded-xl">
                    <span className="text-label">ROI</span>
                    <span className="text-lg text-mono text-[var(--accent)] font-semibold">{result.roiYears} yr</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 gm-surface-2 rounded-xl">
                    <span className="text-label text-[var(--primary)]">Savings/Mo</span>
                    <span className="text-lg text-mono text-[var(--primary)] font-semibold">${result.savingsMonthly}</span>
                  </div>
                </div>

                {result.explanation && (
                  <div className="p-3 gm-surface-2 rounded-xl">
                    <p className="text-[var(--text-2)] text-xs leading-relaxed border-l-2 border-[var(--primary)] pl-2">
                      "{result.explanation}"
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-xs text-[var(--text-3)] text-mono italic">Awaiting simulation...</p>
          )}
        </div>
      </div>
    </Card>
  );
});
