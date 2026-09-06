const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  json: "json",
  md: "markdown",
  mdx: "markdown",
  css: "css",
  scss: "scss",
  html: "html",
  yml: "yaml",
  yaml: "yaml",
  sh: "shell",
  sql: "sql",
  py: "python",
  go: "go",
  rs: "rust"
};

/** Monaco language id for a file path, resolved from its extension. Unknown extensions fall back to plaintext. */
export const languageForPath = (path: string): string => {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGE_BY_EXTENSION[ext] ?? "plaintext";
};
