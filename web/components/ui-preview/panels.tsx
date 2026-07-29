"use client";

import type { ComponentType } from "react";
import { cn } from "../../lib/utils";

const toneClass = { low: "text-hud-cyan", medium: "text-hud-amber", high: "text-hud-red" } as const;
const toneBorder = { low: "border-hud-cyanDim/40", medium: "border-hud-amber/40", high: "border-hud-red/40" } as const;

const Panel = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="glass-panel rounded-xl p-3 text-hud-text">
    <div className="mb-2 flex items-baseline justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-hud-cyan">{title}</span>
      {subtitle && <span className="text-[9px] text-hud-textDim">{subtitle}</span>}
    </div>
    {children}
  </div>
);

const Stat = ({ label, value, tone }: { label: string; value: string | number; tone?: "low" | "medium" | "high" }) => (
  <div className="flex items-center justify-between border-b border-white/8 py-1 text-[11px] last:border-0">
    <span className="text-hud-textDim">{label}</span>
    <span className={cn("font-medium", tone ? toneClass[tone] : "text-hud-text")}>{value}</span>
  </div>
);

const Meter = ({ label, value }: { label: string; value: number }) => (
  <div className="py-1">
    <div className="mb-0.5 flex justify-between text-[10px] text-hud-textDim">
      <span>{label}</span>
      <span className="text-hud-text">{Math.round(value * 100)}%</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
      <div className="h-full rounded-full bg-hud-cyan shadow-[0_0_6px_rgba(34,211,238,0.6)]" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  </div>
);

const Pill = ({ children, tone = "low" as const }: { children: React.ReactNode; tone?: "low" | "medium" | "high" }) => (
  <span className={cn("inline-block rounded-full border px-1.5 py-0.5 text-[9px] uppercase tracking-wide backdrop-blur-sm", toneBorder[tone], toneClass[tone])}>{children}</span>
);

// ---- demo-kpis ----
type DemoKpis = Record<
  | "deliverySuccessRate"
  | "recoverySuccessRate"
  | "governanceEfficiency"
  | "escalationMitigationRate"
  | "operationalResilience"
  | "replayFidelity"
  | "reasoningConfidence"
  | "evolutionVelocity"
  | "workflowThroughput",
  number
>;

const DemoKpisPreview = ({ data }: { data: DemoKpis }) => (
  <Panel title="Executive Demo KPIs">
    {Object.entries(data).map(([key, value]) => (
      <Meter key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={value} />
    ))}
  </Panel>
);

// ---- evolution-surface ----
type RuleCandidate = { id: string; scope: string; nodeId?: string; summary: string; createdFrom: string; status: string };
type EvolutionProposal = { id: string; summary: string; proposedChange: string; affectedModules: string[]; risk: "low" | "medium" | "high"; status: string };

const EvolutionSurfacePreview = ({ data }: { data: { rules: RuleCandidate[]; proposals: EvolutionProposal[] } }) => (
  <Panel title="Evolution Surface" subtitle="rules + proposals, no auto-apply">
    <div className="mb-1 text-[10px] uppercase tracking-wide text-hud-textDim">Rule candidates</div>
    <div className="mb-3 space-y-1.5">
      {data.rules.map((r) => (
        <div key={r.id} className="glass-inset p-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-hud-text">{r.summary}</span>
            <Pill>{r.status}</Pill>
          </div>
          <div className="mt-0.5 text-[9px] text-hud-textDim">from {r.createdFrom}</div>
        </div>
      ))}
    </div>
    <div className="mb-1 text-[10px] uppercase tracking-wide text-hud-textDim">Evolution proposals</div>
    <div className="space-y-1.5">
      {data.proposals.map((p) => (
        <div key={p.id} className="glass-inset p-2 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-hud-text">{p.summary}</span>
            <Pill tone={p.risk}>{p.risk}</Pill>
          </div>
          <div className="mt-0.5 text-[9px] text-hud-textDim">{p.proposedChange}</div>
          <div className="mt-0.5 text-[9px] text-hud-textDim">modules: {p.affectedModules.join(", ")}</div>
        </div>
      ))}
    </div>
  </Panel>
);

// ---- executive-operations ----
type Workflow = { id: string; objective: { businessGoal: string }; governanceState: string; riskProfile: "low" | "medium" | "high"; confidenceProfile: number; phases: { state: string }[] };

const ExecutiveOperationsPreview = ({ data }: { data: { workflows: Workflow[] } }) => {
  const active = data.workflows.filter((w) => w.governanceState === "IN_PROGRESS").length;
  const blocked = data.workflows.filter((w) => w.governanceState === "BLOCKED" || w.governanceState === "ESCALATED").length;
  const avgConfidence = data.workflows.length ? data.workflows.reduce((a, w) => a + w.confidenceProfile, 0) / data.workflows.length : 0;
  return (
    <Panel title="Executive Operations Panel">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <div className="glass-inset py-2">
          <div className="text-lg font-semibold text-hud-cyan">{active}</div>
          <div className="text-[9px] text-hud-textDim">active</div>
        </div>
        <div className="glass-inset py-2">
          <div className="text-lg font-semibold text-hud-red">{blocked}</div>
          <div className="text-[9px] text-hud-textDim">blocked</div>
        </div>
        <div className="glass-inset py-2">
          <div className="text-lg font-semibold text-hud-green">{Math.round(avgConfidence * 100)}%</div>
          <div className="text-[9px] text-hud-textDim">confidence</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {data.workflows.map((w) => {
          const done = w.phases.filter((p) => p.state === "COMPLETED").length;
          return (
            <div key={w.id} className="glass-inset p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-hud-text">{w.objective.businessGoal}</span>
                <Pill tone={w.riskProfile}>{w.governanceState}</Pill>
              </div>
              <Meter label={`phases ${done}/${w.phases.length}`} value={w.phases.length ? done / w.phases.length : 0} />
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// ---- operational-hud ----
type OperationalHudData = {
  state: { repoSlice: { repoMode: string }; governanceSlice: { state: string }; traceSlice: { events: unknown[] } };
  graph: { nodes: { state: string; ownerAgent: string }[] };
  throughputPerSec: number;
};

const OperationalHudPreview = ({ data }: { data: OperationalHudData }) => {
  const { state, graph, throughputPerSec } = data;
  const executing = graph.nodes.filter((n) => n.state === "EXECUTING").length;
  const blocked = graph.nodes.filter((n) => n.state === "BLOCKED").length;
  const escalated = graph.nodes.filter((n) => n.state === "ESCALATED").length;
  const activeAgents = new Set(graph.nodes.map((n) => n.ownerAgent)).size;
  return (
    <Panel title="Operational HUD" subtitle="top bar strip">
      <div className="flex flex-wrap gap-2">
        <Pill>mode:{state.repoSlice.repoMode}</Pill>
        <Pill>gov:{state.governanceSlice.state}</Pill>
        <Pill tone={executing > 0 ? "low" : "medium"}>active:{executing}</Pill>
        <Pill tone={blocked > 0 ? "high" : "low"}>blocked:{blocked}</Pill>
        <Pill tone={escalated > 0 ? "high" : "low"}>escalations:{escalated}</Pill>
        <Pill>agents:{activeAgents}</Pill>
        <Pill>throughput:{throughputPerSec}/s</Pill>
        <Pill>events:{state.traceSlice.events.length}</Pill>
      </div>
    </Panel>
  );
};

// ---- diff-preview ----
type ChangePreview = { commandId: string; affectedFiles: string[]; beforeAfterConceptual: string[]; risk: "low" | "medium" | "high"; cost: string; confidence: number; expectedTraces: string[]; rollbackPlan: string };

const DiffPreviewPanelPreview = ({ data }: { data: ChangePreview }) => (
  <Panel title="Diff Preview Panel" subtitle={data.commandId}>
    <Stat label="Affected files" value={data.affectedFiles.join(", ")} />
    <Stat label="Risk" value={data.risk} tone={data.risk} />
    <Stat label="Cost" value={data.cost} />
    <Meter label="Confidence" value={data.confidence} />
    <div className="mt-2 space-y-1 glass-inset p-2 text-[10px] text-hud-textDim">
      {data.beforeAfterConceptual.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
    <div className="mt-2 text-[10px] text-hud-textDim">rollback: {data.rollbackPlan}</div>
  </Panel>
);

// ---- strategic (shared shape) ----
type OrganizationGraph = {
  resilienceScore: number;
  synchronization: number;
  organizations: { name: string; divisions: { name: string; performance: number }[]; governanceMesh: { active: boolean; saturation: number }; evolutionMesh: { momentum: number } }[];
};
type StrategicKpis = {
  organizationResilienceScore: number;
  strategicRecoveryVelocity: number;
  governanceEffectiveness: number;
  synchronizationFidelity: number;
  operationalIntelligenceScore: number;
  evolutionEmergenceVelocity: number;
  escalationMitigationEfficiency: number;
  replayExplainabilityScore: number;
};

const KpiGrid = ({ kpis }: { kpis: StrategicKpis }) => (
  <>
    {Object.entries(kpis).map(([key, value]) => (
      <Meter key={key} label={key.replace(/([A-Z])/g, " $1").trim()} value={value} />
    ))}
  </>
);

const StrategicOperationsPreview = ({ data }: { data: { graph: OrganizationGraph; kpis: StrategicKpis } }) => (
  <Panel title="Strategic Operations Center">
    <KpiGrid kpis={data.kpis} />
    <div className="mt-2 space-y-1">
      {data.graph.organizations.map((org) => (
        <div key={org.name} className="glass-inset p-2 text-[11px]">
          <div className="text-hud-text">{org.name}</div>
          {org.divisions.map((d) => (
            <Meter key={d.name} label={d.name} value={d.performance} />
          ))}
        </div>
      ))}
    </div>
  </Panel>
);

const ExecutiveCommandCenterPreview = ({ data }: { data: { graph: OrganizationGraph; kpis: StrategicKpis; heatmaps: Record<string, number[]> } }) => (
  <Panel title="Executive Command Center">
    <KpiGrid kpis={data.kpis} />
    <div className="mt-2 text-[10px] uppercase tracking-wide text-hud-textDim">Heatmaps</div>
    <div className="mt-1 grid grid-cols-2 gap-1.5 text-[10px]">
      {Object.entries(data.heatmaps).map(([key, values]) => (
        <div key={key} className="glass-inset px-2 py-1">
          <div className="text-hud-textDim">{key.replace(/Map$/, "")}</div>
          <div className="text-hud-cyan">{values.map((v) => v.toFixed(2)).join(", ") || "--"}</div>
        </div>
      ))}
    </div>
  </Panel>
);

const InvestorDemoPreview = ({ data }: { data: { graph: OrganizationGraph; kpis: StrategicKpis } }) => (
  <Panel title="Investor Demo Mode">
    <p className="mb-2 text-[11px] italic text-hud-textDim">
      &ldquo;Autonomous coordination + governed resilience + deterministic replay.&rdquo;
    </p>
    <KpiGrid kpis={data.kpis} />
  </Panel>
);

// ---- loop-diagnostic ----
type ExecutionNodeLite = { id: string; state: string; retries: number };

const LoopDiagnosticPreview = ({ data }: { data: { nodes: ExecutionNodeLite[] } }) => {
  const signatures = data.nodes.filter((n) => n.retries >= 3 || n.state === "FAILED");
  return (
    <Panel title="Loop Diagnostic Panel">
      {signatures.length === 0 ? (
        <div className="rounded-lg border border-hud-cyanDim/30 bg-hud-cyan/5 p-3 text-center text-[11px] text-hud-cyan backdrop-blur-sm">LOOP OK</div>
      ) : (
        <div className="space-y-1">
          {signatures.map((n) => (
            <div key={n.id} className="rounded-lg border border-hud-red/30 bg-hud-red/10 p-2 text-[11px] text-hud-red backdrop-blur-sm">
              LOOP ALERT: {n.id} retries:{n.retries} state:{n.state}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

// ---- governance-overlay ----
type ExecutionNodeFull = { id: string; state: string; approvalRequired: boolean; verificationRequired: boolean };

const overlayFor = (n: ExecutionNodeFull) => {
  const overlays: string[] = [];
  if (n.state === "BLOCKED") overlays.push("semantic firewall blocked");
  if (n.approvalRequired && n.state === "WAITING_APPROVAL") overlays.push("approval required");
  if (n.state === "FAILED") overlays.push("validation failed");
  if (n.verificationRequired && n.state === "VERIFYING") overlays.push("verification pending");
  if (n.state === "ESCALATED") overlays.push("escalation active");
  if (n.state === "COMPLETED") overlays.push("rollback ready");
  return overlays;
};

const GovernanceOverlayPreview = ({ data }: { data: ExecutionNodeFull }) => {
  const overlays = overlayFor(data);
  return (
    <Panel title="Governance Overlay" subtitle={data.id}>
      {overlays.length === 0 ? (
        <div className="text-[11px] text-hud-textDim">no overlays active</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {overlays.map((o) => (
            <Pill key={o} tone="high">
              {o}
            </Pill>
          ))}
        </div>
      )}
    </Panel>
  );
};

// ---- reasoning-inspector ----
type Narrative = { id: string; kind: string; text: string };

const ReasoningInspectorPreview = ({ data }: { data: { narratives: Narrative[] } }) => (
  <Panel title="Reasoning Inspector Panel">
    <div className="space-y-1.5">
      {data.narratives.map((n) => (
        <div key={n.id} className="glass-inset p-2 text-[11px]">
          <Pill>{n.kind}</Pill>
          <p className="mt-1 text-hud-text">{n.text}</p>
        </div>
      ))}
    </div>
  </Panel>
);

// ---- replay-theater ----
type CinematicBeat = { id: string; type: string; intensity: number; timestamp: number };
type CinematicTimeline = { sceneId: string; beats: CinematicBeat[] };

const ReplayTheaterPreview = ({ data }: { data: { timeline: CinematicTimeline; speed: number; focus: string } }) => (
  <Panel title="Replay Theater" subtitle={`scene:${data.timeline.sceneId} · speed:${data.speed}x · focus:${data.focus}`}>
    <div className="flex items-end gap-2">
      {data.timeline.beats.map((b) => (
        <div key={b.id} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-16 w-full items-end rounded-md bg-white/5">
            <div className="w-full rounded-md bg-hud-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ height: `${b.intensity * 100}%` }} />
          </div>
          <span className="text-[9px] text-hud-textDim">{b.type}</span>
        </div>
      ))}
    </div>
  </Panel>
);

// ---- repo-canvas ----
type RepoNodeLite = { id: string; name: string; layer: string; artifactType: string; risk: "low" | "medium" | "high"; confidence: number };

const RepoCanvasPreview = ({ data }: { data: { nodes: RepoNodeLite[]; selectedNodeId?: string; zoom: number; search: string } }) => (
  <Panel title="Repo Canvas" subtitle={`zoom:${data.zoom.toFixed(2)}`}>
    <div className="space-y-1">
      {data.nodes.map((n) => (
        <div
          key={n.id}
          className={cn(
            "flex items-center justify-between rounded-sm border px-2 py-1.5 text-[11px]",
            n.id === data.selectedNodeId ? "border-hud-cyan bg-hud-cyan/10" : "border-white/8 bg-white/5"
          )}
        >
          <span>
            {n.id === data.selectedNodeId ? "▶ " : "• "}
            [{n.layer}] {n.name} ({n.artifactType})
          </span>
          <Pill tone={n.risk}>risk:{n.risk}</Pill>
        </div>
      ))}
    </div>
  </Panel>
);

// ---- node-editor ----
type RepoNodeFull = {
  path: string;
  language?: string;
  artifactType: string;
  risk: "low" | "medium" | "high";
  confidence: number;
  cost: string;
  description: string;
  responsibilities: string[];
  architectureNotes: string[];
  dependencies: string[];
};

const NodeEditorPreview = ({ data }: { data: { node: RepoNodeFull; tab: string } }) => (
  <Panel title="Node Editor" subtitle={data.node.path}>
    <div className="mb-2 flex flex-wrap gap-1.5">
      <Pill>{data.node.language ?? "plain"}</Pill>
      <Pill>{data.node.artifactType}</Pill>
      <Pill tone={data.node.risk}>risk:{data.node.risk}</Pill>
      <Pill>cost:{data.node.cost}</Pill>
    </div>
    <p className="mb-2 text-[11px] text-hud-text">{data.node.description}</p>
    <div className="mb-1 text-[10px] uppercase tracking-wide text-hud-textDim">Responsibilities</div>
    <ul className="mb-2 list-inside list-disc text-[11px] text-hud-textDim">
      {data.node.responsibilities.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
    <div className="mb-1 text-[10px] uppercase tracking-wide text-hud-textDim">Architecture notes</div>
    <ul className="list-inside list-disc text-[11px] text-hud-textDim">
      {data.node.architectureNotes.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  </Panel>
);

// ---- product-shell ----
type VerticalSliceStep = { name: string; status: string; details: string };
type ProductShellData = {
  shell: { title: string };
  scenario: { humanGoal: string; approvalState: string; ledgerEntryId: string; executiveSummary: string; steps: VerticalSliceStep[] };
};

const ProductShellPreview = ({ data }: { data: ProductShellData }) => (
  <Panel title={data.shell.title} subtitle={`goal: ${data.scenario.humanGoal}`}>
    <div className="mb-2 flex gap-1.5">
      <Pill tone={data.scenario.approvalState === "approved" ? "low" : "medium"}>{data.scenario.approvalState}</Pill>
      <Pill>ledger:{data.scenario.ledgerEntryId || "none"}</Pill>
    </div>
    <div className="space-y-1">
      {data.scenario.steps.map((s) => (
        <div key={s.name} className="flex items-center justify-between glass-inset px-2 py-1 text-[11px]">
          <span className="text-hud-text">{s.name}</span>
          <span className={s.status === "completed" ? "text-hud-green" : "text-hud-textDim"}>{s.status}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-[10px] text-hud-textDim">{data.scenario.executiveSummary}</p>
  </Panel>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uiPreviewRegistry: Record<string, ComponentType<any>> = {
  "demo-kpis": DemoKpisPreview,
  "evolution-surface": EvolutionSurfacePreview,
  "executive-operations": ExecutiveOperationsPreview,
  "operational-hud": OperationalHudPreview,
  "diff-preview": DiffPreviewPanelPreview,
  "investor-demo": InvestorDemoPreview,
  "loop-diagnostic": LoopDiagnosticPreview,
  "governance-overlay": GovernanceOverlayPreview,
  "reasoning-inspector": ReasoningInspectorPreview,
  "replay-theater": ReplayTheaterPreview,
  "strategic-operations": StrategicOperationsPreview,
  "executive-command-center": ExecutiveCommandCenterPreview,
  "repo-canvas": RepoCanvasPreview,
  "node-editor": NodeEditorPreview,
  "product-shell": ProductShellPreview
};
