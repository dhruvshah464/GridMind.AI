"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to authenticate.");
    } finally { setLoading(false); }
  };

  const handleDemoLogin = () => { setEmail("demo@gridmind.com"); setPassword("demo123"); };

  return (
    <Section className="py-24 md:py-32 flex items-center justify-center min-h-[80vh]">
      <Container className="flex justify-center max-w-md w-full">
        <Card className="flex flex-col p-8 md:p-10 w-full glass-panel relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[80px] bg-[var(--primary)]/15 blur-[80px] z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col w-full">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--primary)]/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[var(--text-1)]">Welcome back</h1>
              <p className="text-sm text-[var(--text-3)] mt-1">Sign in to GridMind.AI</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm flex items-center gap-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /><p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)]"
                  placeholder="name@company.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)]"
                  placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full mt-2 h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>

            <div className="flex flex-col items-center gap-3 mt-8 pt-6 border-t border-[var(--border)] text-sm text-[var(--text-3)]">
              <p>No account? <Link href="/signup" className="text-[var(--primary)] hover:underline ml-1">Create one</Link></p>
              <button onClick={handleDemoLogin} type="button" className="text-xs text-[var(--text-3)] hover:text-[var(--primary)] underline transition-colors text-mono">
                Use Demo Credentials
              </button>
            </div>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
