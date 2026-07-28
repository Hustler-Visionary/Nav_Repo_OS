"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ShieldAlert, Radio } from "lucide-react";
import { cn } from "../../lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "system" | "blocked" | "pending";
  text: string;
  at: string;
};

const HELP_TEXT = "comandos: refrescar grafo · buscar <texto> · leer <path> · ejecutar <objetivo>";

const timeLabel = () => new Date().toLocaleTimeString();

/**
 * Chat is intentionally its own isolated module: it never calls domain
 * functions directly. Every message goes POST /api/chat/intent -> semantic
 * firewall (allowlist grammar, no LLM, no free-text-as-instructions) -> if
 * allowed, published onto the NATS JetStream bus -> a separate background
 * worker process executes the real domain function and returns a result over
 * SSE. A rejected message never reaches the bus.
 */
export const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busOnline, setBusOnline] = useState<boolean | null>(null);
  const ownIntentIds = useRef(new Set<string>());
  const logRef = useRef<HTMLDivElement>(null);

  const pushMessage = (msg: Omit<ChatMessage, "id" | "at">) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: timeLabel() }]);
  };

  useEffect(() => {
    const es = new EventSource("/api/chat/stream");

    es.addEventListener("ready", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { busOnline: boolean };
      setBusOnline(data.busOnline);
    });

    es.addEventListener("bus_offline", () => setBusOnline(false));

    es.addEventListener("result", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { intentId: string; payload: { ok: boolean; summary: string } };
      if (!ownIntentIds.current.has(data.intentId)) return;
      ownIntentIds.current.delete(data.intentId);
      pushMessage({ role: data.payload.ok ? "system" : "blocked", text: data.payload.summary });
    });

    es.addEventListener("blocked", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { text: string; reason: string };
      pushMessage({ role: "blocked", text: `firewall blocked "${data.text}" — ${data.reason}` });
    });

    return () => es.close();
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushMessage({ role: "user", text });

    try {
      const res = await fetch("/api/chat/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = (await res.json()) as { blocked: boolean; reason?: string; id?: string };

      // Blocked messages are rendered once, from the audit event on the SSE
      // stream below, so every viewer (not just this tab) sees the same
      // firewall decision instead of two separate sources of truth.
      if (data.blocked) return;

      if (data.id) {
        ownIntentIds.current.add(data.id);
        pushMessage({ role: "pending", text: `dispatched to bus (${data.id.slice(0, 8)}) — executing in background...` });
      }
    } catch (err) {
      pushMessage({ role: "blocked", text: `request failed: ${String(err)}` });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-sm border border-hud-border bg-hud-panel">
      <div className="flex items-center justify-between border-b border-hud-border px-2 py-1.5">
        <span className="text-[10px] uppercase tracking-widest text-hud-textDim">Intent Console</span>
        <span className={cn("flex items-center gap-1 text-[9px] uppercase", busOnline ? "text-hud-green" : "text-hud-red")}>
          <Radio size={10} />
          {busOnline === null ? "connecting" : busOnline ? "bus online" : "bus offline"}
        </span>
      </div>

      <div ref={logRef} className="flex-1 space-y-2 overflow-y-auto px-2 py-2">
        {messages.length === 0 && <p className="text-[10px] leading-relaxed text-hud-textDim">{HELP_TEXT}</p>}
        {messages.map((m) => (
          <div key={m.id} className="text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5">
              {m.role === "blocked" && <ShieldAlert size={11} className="text-hud-red" />}
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wide",
                  m.role === "user" && "text-hud-cyan",
                  m.role === "system" && "text-hud-green",
                  m.role === "pending" && "text-hud-amber",
                  m.role === "blocked" && "text-hud-red"
                )}
              >
                {m.role === "user" ? "USER" : m.role === "blocked" ? "FIREWALL" : "SYSTEM"}
              </span>
              <span className="text-[9px] text-hud-textDim">{m.at}</span>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-hud-text">{m.text}</pre>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 border-t border-hud-border p-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="buscar governance..."
          className="min-w-0 flex-1 rounded-sm border border-hud-border bg-hud-bg px-2 py-1 text-[11px] text-hud-text placeholder:text-hud-textDim focus:border-hud-cyan focus:outline-none"
        />
        <button
          onClick={submit}
          className="flex shrink-0 items-center justify-center rounded-sm border border-hud-cyanDim bg-hud-cyan/10 p-1.5 text-hud-cyan hover:bg-hud-cyan/20"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};
