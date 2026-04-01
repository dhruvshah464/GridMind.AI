"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Please complete all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <Section className="py-24 md:py-32 flex items-center justify-center min-h-[80vh]">
      <Container className="flex justify-center max-w-md w-full">
        <Card className="flex flex-col p-8 md:p-10 w-full glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[80px] bg-[var(--accent)]/10 blur-[80px] z-0 pointer-events-none" />

          <div className="relative z-10 flex flex-col w-full">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent)]/20">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-[var(--text-1)]">Get Started</h1>
              <p className="text-sm text-[var(--text-3)] mt-1">Create your GridMind.AI account</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm flex items-center gap-2 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /><p>{error}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-label">Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)]"
                  placeholder="Your name" />
              </div>
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>

            <div className="flex flex-col items-center gap-3 mt-8 pt-6 border-t border-[var(--border)] text-sm text-[var(--text-3)]">
              <p>Already have an account? <Link href="/login" className="text-[var(--accent)] hover:underline ml-1">Sign in</Link></p>
            </div>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
