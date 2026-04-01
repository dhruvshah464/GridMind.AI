"use client";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserCircle, Settings2, ShieldCheck, Power, Lock } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [autoMode, setAutoMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const devices = [
    { id: "dev_1", name: "HVAC System Core", status: "online", load: "High" },
    { id: "dev_2", name: "Tesla Powerwall", status: "online", load: "Charging" },
    { id: "dev_3", name: "EV Charger Port", status: "standby", load: "Idle" },
    { id: "dev_4", name: "Main Solar Inverter", status: "online", load: "Peak Export" },
  ];

  const Toggle = ({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled: boolean }) => (
    <button
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full p-0.5 transition-all duration-200 ${value ? 'bg-[var(--accent)]' : 'bg-white/[0.06] border border-[var(--border)]'} disabled:opacity-40`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <Section className="py-8 md:py-12">
      <Container className="max-w-[900px]">
        <div className="flex justify-between items-end mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-1)]">System Configuration</h1>
            <p className="text-[var(--text-3)] text-sm mt-1.5 text-mono uppercase tracking-wider">Environment & Hardware</p>
          </div>
        </div>

        {!user && (
          <div className="mb-6 p-3 gm-surface-2 border-[var(--amber)]/20 text-[var(--amber)] text-sm rounded-xl flex items-center gap-3">
            <Lock className="w-4 h-4 shrink-0" />
            Read-only in Demo Mode. Login to modify settings.
          </div>
        )}

        <div className="flex flex-col gap-10">
          {/* Profile */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-1/3">
              <h3 className="text-base font-medium text-[var(--text-1)] flex items-center gap-2 mb-2">
                <UserCircle className="w-4 h-4 text-[var(--primary)]" /> Profile
              </h3>
              <p className="text-sm text-[var(--text-3)] leading-relaxed">Identity and notification settings.</p>
            </div>
            <Card className="md:w-2/3 glass-panel p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label">Name</label>
                  <input disabled value={user?.name || "Demo User"} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text-2)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-label">Email</label>
                  <input disabled value={user?.email || "demo@gridmind.com"} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--text-2)]" />
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <Button disabled={!user} size="sm" variant="outline" className="text-mono text-xs">Update Password</Button>
              </div>
            </Card>
          </div>

          {/* Intelligence */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-1/3">
              <h3 className="text-base font-medium text-[var(--text-1)] flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-[var(--amber)]" /> AI Preferences
              </h3>
              <p className="text-sm text-[var(--text-3)] leading-relaxed">Control AI behavior and notification thresholds.</p>
            </div>
            <Card className="md:w-2/3 glass-panel p-0 overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--text-1)] text-sm">Autonomous Mode</span>
                  <span className="text-xs text-[var(--text-3)]">AI executes decisions without human confirmation.</span>
                </div>
                <Toggle value={autoMode} onChange={() => setAutoMode(!autoMode)} disabled={!user} />
              </div>
              <div className="flex justify-between items-center p-5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-[var(--text-1)] text-sm">Critical Alerts</span>
                  <span className="text-xs text-[var(--text-3)]">Push notifications for tier-1 grid events.</span>
                </div>
                <Toggle value={notifications} onChange={() => setNotifications(!notifications)} disabled={!user} />
              </div>
            </Card>
          </div>

          {/* Devices */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="md:w-1/3">
              <h3 className="text-base font-medium text-[var(--text-1)] flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[var(--accent)]" /> Hardware Nodes
              </h3>
              <p className="text-sm text-[var(--text-3)] leading-relaxed">Connected devices in your energy mesh.</p>
            </div>
            <div className="md:w-2/3 flex flex-col gap-2">
              {devices.map((device, i) => (
                <Card key={i} className="flex justify-between items-center p-3 glass-panel glass-panel-hover cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gm-surface-2 flex items-center justify-center">
                      <Power className={`w-3.5 h-3.5 ${device.status === 'online' ? 'text-[var(--accent)]' : 'text-[var(--amber)]'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-1)]">{device.name}</span>
                      <span className="text-label mt-0.5">{device.id}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--primary)] font-medium gm-surface-2 px-2 py-1 rounded-md">{device.load}</span>
                </Card>
              ))}
              <Button disabled={!user} variant="outline" className="w-full mt-1 text-mono text-xs border-dashed">
                + Register New Device
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
