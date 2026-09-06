import { createWriteStream, existsSync } from "node:fs";
import { mkdir, chmod, rm } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const AdmZip = require("adm-zip");

const NATS_VERSION = "2.10.22";
const here = path.dirname(fileURLToPath(import.meta.url));
const binDir = path.join(here, "..", ".nats-bin");
const binPath = path.join(binDir, "nats-server");

const platformMap = { linux: "linux", darwin: "darwin", win32: "windows" };
const archMap = { x64: "amd64", arm64: "arm64" };

const plat = platformMap[process.platform];
const arch = archMap[process.arch];

if (!plat || !arch) {
  console.warn(`[setup-nats] unsupported platform ${process.platform}/${process.arch}, skipping bus bootstrap`);
  process.exit(0);
}

if (existsSync(binPath)) {
  console.log("[setup-nats] nats-server already present, skipping download");
  process.exit(0);
}

const assetName = `nats-server-v${NATS_VERSION}-${plat}-${arch}`;
const url = `https://github.com/nats-io/nats-server/releases/download/v${NATS_VERSION}/${assetName}.zip`;
const zipPath = path.join(binDir, "download.zip");

await mkdir(binDir, { recursive: true });

console.log(`[setup-nats] downloading ${url}`);
const res = await fetch(url);
if (!res.ok || !res.body) {
  console.warn(`[setup-nats] download failed (${res.status}); the message bus will be unavailable until this is retried`);
  process.exit(0);
}
await pipeline(res.body, createWriteStream(zipPath));

const zip = new AdmZip(zipPath);
const entry = zip.getEntries().find((e) => e.entryName.endsWith("/nats-server") || e.entryName === "nats-server");
if (!entry) {
  console.warn("[setup-nats] could not locate nats-server binary inside archive");
  process.exit(0);
}
zip.extractEntryTo(entry, binDir, false, true);
await rm(zipPath);
await chmod(binPath, 0o755);

const version = execFileSync(binPath, ["-v"]).toString().trim();
console.log(`[setup-nats] ready: ${version} at ${binPath}`);
