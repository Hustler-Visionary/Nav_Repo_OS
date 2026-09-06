export type EvidenceSource = "real-repo" | "mock-repo";
export type EvidenceHash = { algorithm: "sha256"; value: string };
export type EvidenceConfidence = { trustScore: number; stalenessScore: number; sourceConfidence: number; integrityStatus: "verified" | "failed" };
export type EvidenceItem = { id: string; sourcePath: string; sourceHash: EvidenceHash; readTimestamp: string; providerId: string };
export type EvidenceBundle = { id: string; path: string; items: EvidenceItem[]; confidence: EvidenceConfidence; receiptId: string };
export type EvidenceReceipt = { id: string; event: string; timestamp: string; details: string };
