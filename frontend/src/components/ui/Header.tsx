"use client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Zap, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Insights", path: "/insights" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--border)] rounded-none">
      <Container className="flex h-14 items-center justify-between max-w-[1400px] mx-auto px-4 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center shadow-sm shadow-[var(--primary)]/20 group-hover:shadow-[var(--primary)]/40 transition-shadow">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-[var(--text-1)]">
              GridMind<span className="text-[var(--primary)]">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[var(--text-1)] bg-[var(--surface-2)]"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-white/[0.03]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* System Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full gm-surface-2">
            <div className={`status-dot ${user ? 'status-dot-active' : 'status-dot-primary'}`} />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text-2)]">
              {user ? 'Active' : 'Demo'}
            </span>
          </div>

          {/* Auth */}
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-[13px] font-medium text-[var(--text-2)]">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[var(--text-3)] hover:text-[var(--danger)] transition-colors p-1.5 rounded-lg hover:bg-white/[0.03]"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : !loading && !user ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[13px] font-medium text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                Sign in
              </Link>
              <Link href="/signup" className="text-[13px] font-medium bg-[var(--primary)] text-white px-4 py-1.5 rounded-lg hover:bg-[var(--primary-light)] transition-all shadow-sm shadow-[var(--primary)]/20">
                Get Started
              </Link>
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 text-[var(--text-2)] hover:text-[var(--text-1)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg ${
                pathname === link.path
                  ? "text-[var(--text-1)] bg-[var(--surface-2)]"
                  : "text-[var(--text-2)]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
