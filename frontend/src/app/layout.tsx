import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/ui/Header";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GridMind.AI | Autonomous Energy Intelligence",
  description: "The AI-powered platform that optimizes electricity usage, predicts demand, and automates energy savings in real-time.",
  keywords: ["energy optimization", "AI", "smart grid", "energy intelligence", "electricity savings"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased bg-[var(--bg)] text-[var(--text-1)]`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow flex flex-col relative z-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
