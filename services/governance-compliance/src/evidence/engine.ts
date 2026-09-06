import { createHash } from "node:crypto";
import type { EvidenceBundle, EvidenceConfidence, EvidenceHash, EvidenceItem } from "./types.js";

export const hashFileContent = (content: string): EvidenceHash => ({ algorithm: "sha256", value: createHash("sha256").update(content).digest("hex") });

export const hashEvidenceBundle = (bundle: EvidenceBundle): EvidenceHash => {
  const payload = JSON.stringify({ path: bundle.path, items: bundle.items.map((i) => i.sourceHash.value), confidence: bundle.confidence });
  return hashFileContent(payload);
};

export const verifyEvidenceIntegrity = (bundle: EvidenceBundle, expectedHash: EvidenceHash): boolean => hashEvidenceBundle(bundle).value === expectedHash.value;

export const detectEvidenceDrift = (oldBundle: EvidenceBundle, newBundle: EvidenceBundle): { drifted: boolean; reason: string } => {
  const oldHash = hashEvidenceBundle(oldBundle).value;
  const newHash = hashEvidenceBundle(newBundle).value;
  return oldHash === newHash ? { drifted: false, reason: "no drift" } : { drifted: true, reason: "bundle hash changed" };
};

export const calculateEvidenceConfidence = (params: { hashVerified: boolean; metadataAvailable: boolean; dependenciesResolved: boolean; changelogAvailable: boolean; fileAgeDays: number; providerTrust: number }): EvidenceConfidence => {
  const base = (params.hashVerified ? 0.25 : 0) + (params.metadataAvailable ? 0.2 : 0) + (params.dependenciesResolved ? 0.2 : 0) + (params.changelogAvailable ? 0.15 : 0) + params.providerTrust * 0.2;
  const stalenessScore = Math.max(0, 1 - params.fileAgeDays / 365);
  return { trustScore: Math.min(1, base), stalenessScore, sourceConfidence: params.providerTrust, integrityStatus: params.hashVerified ? "verified" : "failed" };
};

export const createEvidenceBundle = (path: string, providerId: string, content: string, confidence: EvidenceConfidence): EvidenceBundle => {
  const item: EvidenceItem = { id: `ev-${path}`, sourcePath: path, sourceHash: hashFileContent(content), readTimestamp: new Date().toISOString(), providerId };
  return { id: `bundle-${path}`, path, items: [item], confidence, receiptId: `receipt-${path}` };
};

export const replayEvidenceRead = (bundle: EvidenceBundle): string => `replay:${bundle.path}:${bundle.items[0]?.sourceHash.value ?? ""}`;
export const compareEvidenceBundles = (a: EvidenceBundle, b: EvidenceBundle): string => detectEvidenceDrift(a, b).reason;
export const explainEvidenceDrift = (a: EvidenceBundle, b: EvidenceBundle): string => detectEvidenceDrift(a, b).drifted ? `drift detected for ${a.path}` : "no drift";
