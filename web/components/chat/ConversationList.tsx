"use client";

import { MessageSquarePlus, MessagesSquare, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { SessionMeta } from "../../lib/chat-sessions";

const relativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(iso).toLocaleDateString();
};

export const ConversationList = ({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete
}: {
  sessions: SessionMeta[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) => (
  <div className="flex h-full flex-col">
    <button
      onClick={onNew}
      className="m-2 flex items-center justify-center gap-1.5 rounded-full border border-hud-cyanDim bg-hud-cyan/10 py-2 text-[11px] font-medium text-hud-cyan hover:bg-hud-cyan/20"
    >
      <MessageSquarePlus size={13} />
      Nueva conversación
    </button>
    <div className="flex-1 overflow-y-auto px-1.5 pb-2">
      {sessions.length === 0 && <p className="px-2 py-4 text-center text-[10px] text-hud-textDim">Sin conversaciones todavía</p>}
      {sessions.map((s) => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[11px]",
            s.id === activeId ? "bg-hud-cyan/10 text-hud-text" : "text-hud-textDim hover:bg-hud-panelAlt hover:text-hud-text"
          )}
        >
          <MessagesSquare size={13} className="shrink-0 opacity-60" />
          <div className="min-w-0 flex-1">
            <div className="truncate">{s.title}</div>
            <div className="text-[9px] text-hud-textDim">{relativeTime(s.updatedAt)}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(s.id);
            }}
            className="shrink-0 rounded p-1 text-hud-textDim opacity-0 hover:text-hud-red group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  </div>
);
