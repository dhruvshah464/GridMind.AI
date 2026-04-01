'use client';

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ChartBlock } from "@/components/systems/ChartBlock";
import { FlowDiagram } from "@/components/systems/FlowDiagram";
import { MetricCard } from "@/components/systems/MetricCard";
import { ArrowRight, BarChart3, Brain, Shield, Zap } from "lucide-react";
import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <Section className="py-24 md:py-32 lg:py-40 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--primary)]/10 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-[var(--accent)]/8 blur-[100px] -z-10 pointer-events-none" />
        
        <Container className="flex flex-col items-center justify-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gm-surface-2 text-[var(--text-2)] text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
              Autonomous Energy Intelligence
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-8">
              <span className="text-[var(--text-1)]">Your energy,</span>
              <br />
              <span className="gradient-text">optimized by AI.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-[var(--text-2)] max-w-2xl mb-12 leading-relaxed">
              GridMind.AI predicts demand, automates load scheduling, and reduces your electricity bills — all in real-time using multi-layer artificial intelligence.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="min-w-[180px]">
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="min-w-[180px]">
                  Create Account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Features */}
      <Section className="py-24 border-t border-[var(--border)]">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp} className="order-2 lg:order-1 flex flex-col gap-6">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-1)]">
                Intelligence inside every watt.
              </h2>
              <p className="text-[var(--text-2)] text-lg leading-relaxed">
                Connect your energy systems to our AI runtime. We capture analytics, detect anomalies, and optimize consumption — automatically.
              </p>
              <div className="flex flex-col gap-4 mt-4">
                {[
                  { icon: BarChart3, text: "Real-time telemetry and forecasting" },
                  { icon: Brain, text: "Multi-layer AI decision engine" },
                  { icon: Shield, text: "Anomaly detection and risk scoring" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[var(--text-1)] font-medium">
                    <div className="w-8 h-8 rounded-lg gm-surface-2 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[var(--primary)]" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className="order-1 lg:order-2">
              <ChartBlock />
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Pipeline */}
      <Section className="py-24 border-t border-[var(--border)]">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp}>
              <FlowDiagram />
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-1)]">
                See exactly where your energy flows.
              </h2>
              <p className="text-[var(--text-2)] text-lg leading-relaxed">
                From solar panels to battery storage to your appliances — GridMind maps your entire energy infrastructure and optimizes every node.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-max flex items-center gap-2">
                  Explore System <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* Metrics */}
      <Section className="py-28 border-t border-[var(--border)]">
        <Container>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp} className="flex flex-col gap-6 lg:pr-12">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-1)]">
                Metrics that drive decisions.
              </h2>
              <p className="text-[var(--text-2)] text-lg leading-relaxed">
                Access financial and energy performance data in real-time. Built for grid operators and homeowners who demand precision.
              </p>
              <Link href="/dashboard">
                <Button variant="outline">Access Dashboard</Button>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MetricCard title="System Uptime" value="99.9%" trend="0.1" trendUp />
              <MetricCard title="Cost Savings" value="$1.4K" trend="12.5" trendUp />
              <MetricCard title="Carbon Offset" value="840 kg" trend="4.2" trendUp className="sm:col-span-2" />
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </div>
  );
}
