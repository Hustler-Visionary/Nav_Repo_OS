export type GraphNode = {
  id: string;
  path: string;
  name: string;
  layer: string;
  artifactType: "schema" | "service" | "agent" | "module" | "contract";
  status: "implemented";
  risk: "low" | "medium" | "high";
  confidence: number;
  cost: "low" | "medium" | "high";
  loc: number;
  inDegree: number;
  outDegree: number;
  blastRadius: number;
};

export type GraphEdge = { from: string; to: string };

export type RepoGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  scannedRoot: string;
};
