"use client";

import { useEffect, useState } from "react";
import { uiPreviewRegistry } from "./panels";

type SampleMap = Record<string, { kind: string; data: unknown }>;

/** One dashboard row: file paths rendered side by side, e.g. [wide, narrow] or [1,1,1]. */
const LAYOUT: string[][] = [
  ["src/components/hud/OperationalHUD.ts"],
  ["src/components/canvas/RepoCanvas.tsx", "src/components/editor/NodeEditor.tsx"],
  ["src/components/node/GovernanceOverlay.ts", "src/components/loop-prevention/LoopDiagnosticPanel.ts", "src/components/inspector/DiffPreviewPanel.ts"],
  ["src/components/strategic/ExecutiveCommandCenter.ts", "src/components/strategic/StrategicOperationsCenter.ts", "src/components/investor/InvestorDemoMode.ts"],
  ["src/components/executive/ExecutiveOperationsPanel.ts", "src/components/reasoning/ReasoningInspectorPanel.ts", "src/components/replay/ReplayTheater.ts"],
  ["src/components/product/ProductShell.tsx", "src/components/evolution/EvolutionSurface.ts", "src/components/demo/ExecutiveDemoMode.ts"]
];

/**
 * Assembles the real per-file preview components (from panels.tsx, same
 * ones NodeDetailPanel shows one at a time) into a single mockup of what
 * the actual TST Autonomous product dashboard would look like -- HUD strip,
 * canvas + editor, governance/executive panels -- all still backed by real
 * src/domain sample data, fetched once via /api/ui-preview/all.
 */
export const AssembledInterface = () => {
  const [samples, setSamples] = useState<SampleMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ui-preview/all")
      .then((res) => res.json())
      .then((data: { samples: SampleMap }) => setSamples(data.samples))
      .catch((err) => setError(String(err)));
  }, []);

  if (error) return <div className="p-4 text-[11px] text-hud-red">failed to load: {error}</div>;
  if (!samples) return <div className="p-4 text-[10px] uppercase tracking-widest text-hud-textDim">Assembling interface from real domain data...</div>;

  return (
    <div className="h-full space-y-3 overflow-y-auto p-4">
      {LAYOUT.map((row, i) => (
        <div key={i} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
          {row.map((path) => {
            const sample = samples[path];
            if (!sample) return null;
            const Preview = uiPreviewRegistry[sample.kind];
            if (!Preview) return null;
            return (
              <div key={path} title={path}>
                <Preview data={sample.data} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
