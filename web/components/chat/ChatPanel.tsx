"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ShieldAlert, Radio, Bot, TriangleAlert, History, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { StreamingMarkdown } from "./MarkdownMessage";
import { ConversationList } from "./ConversationList";
import {
  type SessionMeta,
  listSessions,
  getActiveSessionId,
  setActiveSessionId,
  createSession,
  deleteSession,
  touchSession
} from "../../lib/chat-sessions";

type ChatMessage = {
  id: string;
  role: "user" | "system" | "blocked";
  text: string;
  at: string;
  fresh?: boolean;
};

const HELP_TEXT = "comandos: refrescar grafo · buscar <texto> · leer <path> · ejecutar <objetivo>";
const RESULT_TIMEOUT_MS = 20_000;

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const Avatar = ({ blocked }: { blocked?: boolean }) => (
  <div
    className={cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
      blocked ? "border-hud-red/50 bg-hud-red/10 text-hud-red" : "border-hud-cyanDim bg-hud-cyan/10 text-hud-cyan"
    )}
  >
    {blocked ? <ShieldAlert size={13} /> : <Bot size={13} />}
  </div>
);

const TypingBubble = () => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-end gap-1.5">
    <Avatar />
    <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-hud-border bg-hud-panelAlt px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-hud-textDim"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);

const Bubble = ({ message, showAvatar }: { message: ChatMessage; showAvatar: boolean }) => {
  const isUser = message.role === "user";
  const isBlocked = message.role === "blocked";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn("flex items-end gap-1.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (showAvatar ? <Avatar blocked={isBlocked} /> : <div className="w-7 shrink-0" />)}
      <div className={cn("flex max-w-[78%] flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2",
            isUser && "rounded-br-sm border border-hud-cyanDim/50 bg-hud-cyan/15 text-hud-text",
            !isUser && !isBlocked && "rounded-bl-sm border border-hud-border bg-hud-panelAlt text-hud-text",
            isBlocked && "rounded-bl-sm border border-hud-red/40 bg-hud-red/10 text-hud-text"
          )}
        >
          {isBlocked && (
            <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-hud-red">
              <TriangleAlert size={10} />
              firewall
            </div>
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed">{message.text}</p>
          ) : (
            <StreamingMarkdown text={message.text} animate={Boolean(message.fresh)} />
          )}
        </div>
        <span className="mt-0.5 px-1 text-[9px] text-hud-textDim">{formatTime(message.at)}</span>
      </div>
    </motion.div>
  );
};

type ResultPayload = { ok: boolean; summary: string };

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
  const [pendingCount, setPendingCount] = useState(0);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [sessions, setSessions] = useState<SessionMeta[]>([]);
  const [activeId, setActiveId] = useState("");
  const [showList, setShowList] = useState(false);

  // The bus can resolve an intent (no I/O, e.g. run_scenario) faster than this
  // tab's own POST /api/chat/intent round-trip finishes, so the SSE "result"
  // can arrive before we know our own intent id. earlyResults buffers those;
  // pendingResolvers holds the callback for ids we're already waiting on.
  // Whichever side (the fetch response or the SSE event) arrives second is
  // the one that actually resolves the message -- no race window either way.
  const earlyResults = useRef(new Map<string, ResultPayload>());
  const pendingResolvers = useRef(new Map<string, (payload: ResultPayload) => void>());
  const pendingCountRef = useRef(0);
  const timeouts = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const activeIdRef = useRef("");
  const logRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pushMessage = (msg: Omit<ChatMessage, "id" | "at"> & { at?: string }) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: msg.at ?? new Date().toISOString() }
    ]);
  };

  const adjustPending = (delta: number) => {
    pendingCountRef.current += delta;
    setPendingCount(pendingCountRef.current);
  };

  const clearIntentTimeout = (id: string) => {
    const t = timeouts.current.get(id);
    if (t) {
      clearTimeout(t);
      timeouts.current.delete(id);
    }
  };

  /** Abandons any in-flight tracking for the session being left. The worker still finishes and persists the result server-side regardless. */
  const abandonInFlight = () => {
    earlyResults.current.clear();
    pendingResolvers.current.clear();
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current.clear();
    pendingCountRef.current = 0;
    setPendingCount(0);
  };

  const loadHistory = (id: string) => {
    setHistoryLoaded(false);
    fetch(`/api/chat/history?sessionId=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data: { entries?: { role: ChatMessage["role"]; text: string; at: string }[] }) => {
        const entries = data.entries ?? [];
        setMessages(entries.map((entry, i) => ({ ...entry, id: `history-${i}-${entry.at}` })));
      })
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoaded(true));
  };

  const switchSession = (id: string) => {
    if (id === activeIdRef.current) {
      setShowList(false);
      return;
    }
    abandonInFlight();
    activeIdRef.current = id;
    setActiveId(id);
    setActiveSessionId(id);
    loadHistory(id);
    setShowList(false);
  };

  const handleNewChat = () => {
    const id = createSession();
    setSessions(listSessions());
    abandonInFlight();
    activeIdRef.current = id;
    setActiveId(id);
    setMessages([]);
    setHistoryLoaded(true);
    setShowList(false);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    if (id !== activeIdRef.current) {
      setSessions(listSessions());
      return;
    }
    const remaining = listSessions();
    const next = remaining[0]?.id ?? createSession();
    abandonInFlight();
    activeIdRef.current = next;
    setActiveId(next);
    setSessions(listSessions());
    loadHistory(next);
  };

  useEffect(() => {
    const id = getActiveSessionId();
    activeIdRef.current = id;
    setActiveId(id);
    setSessions(listSessions());
    loadHistory(id);
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/chat/stream");

    es.addEventListener("ready", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { busOnline: boolean };
      setBusOnline(data.busOnline);
    });

    es.addEventListener("bus_offline", () => setBusOnline(false));

    es.addEventListener("result", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { intentId: string; payload: ResultPayload };
      const resolver = pendingResolvers.current.get(data.intentId);
      if (resolver) {
        pendingResolvers.current.delete(data.intentId);
        resolver(data.payload);
      } else {
        // Our own fetch() hasn't returned yet; hold onto it and let submit() pick it up.
        earlyResults.current.set(data.intentId, data.payload);
        setTimeout(() => earlyResults.current.delete(data.intentId), 30_000);
      }
    });

    es.addEventListener("blocked", (e) => {
      const data = JSON.parse((e as MessageEvent).data) as { text: string; reason: string };
      pushMessage({ role: "blocked", text: `"${data.text}" — ${data.reason}`, fresh: true });
    });

    return () => es.close();
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pendingCount]);

  const submit = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    pushMessage({ role: "user", text });
    touchSession(activeIdRef.current, text);
    setSessions(listSessions());

    try {
      const res = await fetch("/api/chat/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sessionId: activeIdRef.current })
      });
      const data = (await res.json()) as { blocked: boolean; reason?: string; id?: string };

      if (data.blocked) {
        // When the bus is online, the firewall's own audit event on the SSE
        // stream renders this (so every viewer sees the same decision). When
        // the bus is down that event can never arrive, so render directly.
        if (!busOnline) pushMessage({ role: "blocked", text: data.reason ?? "blocked", fresh: true });
        return;
      }

      if (data.id) {
        const id = data.id;
        const already = earlyResults.current.get(id);
        if (already) {
          // The worker finished and the SSE event beat this fetch() back.
          earlyResults.current.delete(id);
          pushMessage({ role: already.ok ? "system" : "blocked", text: already.summary, fresh: true });
        } else {
          adjustPending(1);
          pendingResolvers.current.set(id, (payload) => {
            adjustPending(-1);
            clearIntentTimeout(id);
            pushMessage({ role: payload.ok ? "system" : "blocked", text: payload.summary, fresh: true });
          });
          timeouts.current.set(
            id,
            setTimeout(() => {
              if (!pendingResolvers.current.delete(id)) return;
              adjustPending(-1);
              pushMessage({ role: "blocked", text: `no response from the worker after ${RESULT_TIMEOUT_MS / 1000}s — is it still running?`, fresh: true });
            }, RESULT_TIMEOUT_MS)
          );
        }
      }
    } catch (err) {
      pushMessage({ role: "blocked", text: `request failed: ${String(err)}`, fresh: true });
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  let lastRole: ChatMessage["role"] | null = null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-sm border border-hud-border bg-hud-panel">
      <div className="flex items-center gap-2 border-b border-hud-border px-2.5 py-2">
        {showList ? (
          <button onClick={() => setShowList(false)} className="text-hud-textDim hover:text-hud-cyan">
            <ArrowLeft size={16} />
          </button>
        ) : (
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-hud-cyanDim bg-hud-cyan/10 text-hud-cyan">
              <Bot size={15} />
            </div>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-hud-panel",
                busOnline ? "bg-hud-green" : "bg-hud-red"
              )}
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold text-hud-text">{showList ? "Conversaciones" : "REPO_OS Agent"}</div>
          {!showList && (
            <div className="flex items-center gap-1 text-[9px] text-hud-textDim">
              <Radio size={9} />
              {busOnline === null ? "conectando..." : busOnline ? "en línea" : "bus fuera de línea"}
            </div>
          )}
        </div>
        {!showList && (
          <div className="flex items-center gap-1 text-hud-textDim">
            <button onClick={handleNewChat} title="Nueva conversación" className="rounded p-1 hover:text-hud-cyan">
              <MessageSquarePlus size={15} />
            </button>
            <button onClick={() => setShowList(true)} title="Historial" className="rounded p-1 hover:text-hud-cyan">
              <History size={15} />
            </button>
          </div>
        )}
      </div>

      {showList ? (
        <ConversationList sessions={sessions} activeId={activeId} onSelect={switchSession} onNew={handleNewChat} onDelete={handleDeleteSession} />
      ) : (
        <>
          <div ref={logRef} className="flex-1 space-y-2.5 overflow-y-auto px-2.5 py-3">
            {!historyLoaded && <p className="text-center text-[9px] uppercase tracking-widest text-hud-textDim">cargando sesión...</p>}
            {historyLoaded && messages.length === 0 && (
              <div className="flex items-end gap-1.5">
                <Avatar />
                <div className="max-w-[78%] rounded-2xl rounded-bl-sm border border-hud-border bg-hud-panelAlt px-3 py-2 text-[11px] leading-relaxed text-hud-textDim">
                  {HELP_TEXT}
                </div>
              </div>
            )}
            {messages.map((m) => {
              const showAvatar = m.role !== "user" && m.role !== lastRole;
              lastRole = m.role;
              return <Bubble key={m.id} message={m} showAvatar={showAvatar} />;
            })}
            <AnimatePresence>{pendingCount > 0 && <TypingBubble key="typing" />}</AnimatePresence>
          </div>

          <div className="flex items-end gap-1.5 border-t border-hud-border p-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={onInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Escribe un mensaje..."
              className="min-w-0 flex-1 resize-none rounded-2xl border border-hud-border bg-hud-bg px-3 py-2 text-[12px] text-hud-text placeholder:text-hud-textDim focus:border-hud-cyan focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hud-cyanDim bg-hud-cyan/10 text-hud-cyan transition-colors hover:bg-hud-cyan/20 disabled:opacity-30"
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
