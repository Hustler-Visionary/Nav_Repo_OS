export type Intent =
  | { type: "refresh_graph" }
  | { type: "search"; term: string }
  | { type: "inspect_node"; query: string }
  | { type: "run_scenario"; goal: string };

export type FirewallResult = { allowed: true; intent: Intent } | { allowed: false; reason: string };

const MAX_INPUT_LENGTH = 240;

/** Argument charset allowlist: word chars, path separators, spaces and a small set of safe punctuation. No shell/SQL/script metacharacters. */
const SAFE_ARG = /^[\w\s./\-']{1,160}$/;

/**
 * Strict allowlist grammar for chat -> execution.
 *
 * This is the boundary between untrusted free text and real background
 * execution: nothing here interprets instructions from the text itself
 * (no LLM in this path). Input is matched against a fixed set of anchored
 * patterns; anything that is not an exact match for a known-safe command is
 * rejected. Executed actions are pre-defined, read-only domain functions --
 * never arbitrary code, eval, or shell execution -- so there is no
 * "instruction" for an injected payload to hijack even if it slipped through.
 */
const RULES: { pattern: RegExp; build: (m: RegExpMatchArray) => Intent | null }[] = [
  {
    pattern: /^(refresca|refrescar|refresh)(\s+(el\s+)?graf[oh])?$/i,
    build: () => ({ type: "refresh_graph" })
  },
  {
    pattern: /^(busca|buscar|search)\s+(.+)$/i,
    build: (m) => {
      const term = m[2]?.trim() ?? "";
      return SAFE_ARG.test(term) ? { type: "search", term } : null;
    }
  },
  {
    pattern: /^(lee|leer|inspecciona|inspect|read)\s+(.+)$/i,
    build: (m) => {
      const query = m[2]?.trim() ?? "";
      return SAFE_ARG.test(query) ? { type: "inspect_node", query } : null;
    }
  },
  {
    pattern: /^(ejecuta|ejecutar|corre|correr|run)\s+(escenario\s+|scenario\s+)?(.+)$/i,
    build: (m) => {
      const goal = m[3]?.trim() ?? "";
      return SAFE_ARG.test(goal) ? { type: "run_scenario", goal } : null;
    }
  }
];

const CONTROL_CHAR_PATTERN = new RegExp("[\u0000-\u001f\u007f]");

export const evaluateIntent = (rawInput: string): FirewallResult => {
  const input = rawInput.normalize("NFKC").trim();

  if (input.length === 0) {
    return { allowed: false, reason: "empty input" };
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return { allowed: false, reason: `input exceeds ${MAX_INPUT_LENGTH} chars` };
  }
  if (CONTROL_CHAR_PATTERN.test(input)) {
    return { allowed: false, reason: "control characters not allowed" };
  }

  for (const rule of RULES) {
    const match = input.match(rule.pattern);
    if (!match) continue;
    const intent = rule.build(match);
    if (!intent) return { allowed: false, reason: "argument failed safe-character allowlist" };
    return { allowed: true, intent };
  }

  return {
    allowed: false,
    reason:
      "unrecognized intent -- no free-text instruction is ever executed; use: refrescar grafo | buscar <texto> | leer <path> | ejecutar <objetivo>"
  };
};
