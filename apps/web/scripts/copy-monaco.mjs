import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "..", "node_modules", "monaco-editor", "min", "vs");
const dest = path.join(here, "..", "public", "monaco", "vs");

await mkdir(path.dirname(dest), { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`monaco assets copied to ${dest}`);
