"use client";

import { useState, useRef, useEffect, memo } from "react";
import { Card } from "@/components/ui/Card";
import { Send, Bot } from "lucide-react";

export const AIChatConsole = memo(function AIChatConsole() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'GridMind Intelligence online. Ask me anything about your energy system — optimization strategies, cost analysis, or solar recommendations.' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.body) throw new Error("No body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let assistantMessage = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        const lines = chunkText.split("\n").filter(line => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                assistantMessage += parsed.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: assistantMessage };
                  return newMsgs;
                });
              }
            } catch {}
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "GridMind AI is temporarily offline. Your energy data is still being monitored." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[380px] p-0 overflow-hidden glass-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">AI Console</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-dot status-dot-active" />
          <span className="text-label">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg gm-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-[var(--primary)]" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[var(--primary)]/15 text-[var(--text-1)] border border-[var(--primary)]/20 rounded-tr-sm'
                : 'gm-surface-2 text-[var(--text-2)] rounded-tl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-6 h-6 rounded-lg gm-surface-2 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <Bot className="w-3 h-3 text-[var(--primary)]" />
            </div>
            <div className="px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-3)] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-3)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-3)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] shrink-0">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            disabled={loading}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask GridMind AI..."
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl pl-4 pr-12 py-2.5 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-[var(--primary)]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </Card>
  );
});
