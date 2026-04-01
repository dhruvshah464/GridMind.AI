'use client';

import { Card } from "@/components/ui/Card";
import { Zap, Battery, Home, ArrowRight } from "lucide-react";

const nodes = [
  { icon: Zap, label: "Solar Array", sublabel: "12.4 kW", color: "var(--amber)" },
  { icon: Battery, label: "Battery Storage", sublabel: "94% SoC", color: "var(--accent)" },
  { icon: Home, label: "Load Center", sublabel: "Active", color: "var(--primary)" },
];

export function FlowDiagram() {
  return (
    <Card className="glass-panel p-6">
      <h3 className="text-label mb-6">Energy Flow Pipeline</h3>
      <div className="flex flex-col gap-3">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Node */}
            <div className="flex items-center gap-3 flex-1 gm-surface-2 p-3 rounded-xl group hover:border-[var(--border-hover)] transition-all">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${node.color}15`, border: `1px solid ${node.color}30` }}
              >
                <node.icon className="w-4 h-4" style={{ color: node.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--text-1)]">{node.label}</span>
                <span className="text-xs text-mono text-[var(--text-3)]">{node.sublabel}</span>
              </div>
            </div>

            {/* Connector */}
            {i < nodes.length - 1 && (
              <div className="flex items-center">
                <div className="w-6 h-px bg-[var(--border)]" />
                <ArrowRight className="w-4 h-4 text-[var(--text-3)]" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
