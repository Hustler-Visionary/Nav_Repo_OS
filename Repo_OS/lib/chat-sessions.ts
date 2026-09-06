export type SessionMeta = { id: string; title: string; updatedAt: string };

const INDEX_KEY = "repo-os-chat-sessions";
const ACTIVE_KEY = "repo-os-chat-active-session";
export const DEFAULT_SESSION_TITLE = "Nueva conversación";

const readIndex = (): SessionMeta[] => {
  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as SessionMeta[]) : [];
  } catch {
    return [];
  }
};

const writeIndex = (sessions: SessionMeta[]) => {
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(sessions));
};

/** Newest first, like claude.ai's conversation list. */
export const listSessions = (): SessionMeta[] => readIndex().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

export const setActiveSessionId = (id: string) => {
  window.localStorage.setItem(ACTIVE_KEY, id);
};

export const createSession = (): string => {
  const id = crypto.randomUUID();
  const sessions = readIndex();
  sessions.push({ id, title: DEFAULT_SESSION_TITLE, updatedAt: new Date().toISOString() });
  writeIndex(sessions);
  setActiveSessionId(id);
  return id;
};

/** Returns the last-active session, or the most recently updated one, creating a first session if none exist yet. */
export const getActiveSessionId = (): string => {
  const active = window.localStorage.getItem(ACTIVE_KEY);
  const sessions = readIndex();
  if (active && sessions.some((s) => s.id === active)) return active;
  if (sessions.length > 0) {
    const mostRecent = listSessions()[0]!.id;
    setActiveSessionId(mostRecent);
    return mostRecent;
  }
  return createSession();
};

export const deleteSession = (id: string) => {
  writeIndex(readIndex().filter((s) => s.id !== id));
};

/** Bumps updatedAt, and auto-titles from the first user message (like a simplified version of claude.ai's chat naming). */
export const touchSession = (id: string, firstMessageText?: string) => {
  const sessions = readIndex();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  const entry = sessions[idx]!;
  const shouldRetitle = Boolean(firstMessageText) && entry.title === DEFAULT_SESSION_TITLE;
  sessions[idx] = {
    ...entry,
    title: shouldRetitle ? firstMessageText!.slice(0, 48) : entry.title,
    updatedAt: new Date().toISOString()
  };
  writeIndex(sessions);
};
