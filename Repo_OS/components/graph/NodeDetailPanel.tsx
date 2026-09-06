"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { loader } from "@monaco-editor/react";
import { languageForPath } from "../../lib/language";
import { uiPreviewRegistry } from "../ui-preview/panels";
import { cn } from "../../lib/utils";
import type { GraphNode } from "../../lib/types";

if (typeof window !== "undefined") {
  loader.config({ paths: { vs: "/monaco/vs" } });

  (window as unknown as { MonacoEnvironment: { getWorkerUrl: (moduleId: string, label: string) => string } }).MonacoEnvironment = {
    getWorkerUrl: () => {
      const base = window.location.origin;
      const source = `self.MonacoEnvironment={baseUrl:'${base}/monaco/'};importScripts('${base}/monaco/vs/base/worker/workerMain.js');`;
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
    }
  };
}

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const riskTone = { low: "cyan", medium: "amber", high: "magenta" } as const;

const MetricBar = ({ label, value, max = 1 }: { label: string; value: number; max?: number }) => (
  <div className="flex items-center gap-2 text-[10px]">
    <span className="w-24 shrink-0 uppercase tracking-wide text-hud-textDim">{label}</span>
    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hud-panelAlt">
      <div className="h-full rounded-full bg-hud-cyan" style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
    <span className="w-10 text-right text-hud-text">{value}</span>
  </div>
);

type PreviewSample = { kind: string; data: unknown };

export const NodeDetailPanel = ({ node, onClose }: { node: GraphNode; onClose: () => void }) => {
  const [source, setSource] = useState<string | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [preview, setPreview] = useState<PreviewSample | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const uiScanDir = process.env.NEXT_PUBLIC_UI_SCAN_DIR || "src/components";
  const isUiNode = node.path.startsWith(`${uiScanDir}/`);

  useEffect(() => {
    setSource(null);
    setPreview(null);
    setPreviewError(null);

    if (!isUiNode) return;
    fetch(`/api/ui-preview?path=${encodeURIComponent(node.path)}`)
      .then((res) => res.json())
      .then((data: PreviewSample & { error?: string }) => {
        if (data.error) setPreviewError(data.error);
        else setPreview(data);
      })
      .catch((err) => setPreviewError(String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const loadSource = () => {
    if (source !== null || loadingSource) return;
    setLoadingSource(true);
    fetch(`/api/file?path=${encodeURIComponent(node.path)}`)
      .then((res) => res.json())
      .then((data: { content?: string; error?: string }) => setSource(data.content ?? `// ${data.error ?? "unavailable"}`))
      .catch((err) => setSource(`// failed to load: ${String(err)}`))
      .finally(() => setLoadingSource(false));
  };

  const PreviewComponent = preview ? uiPreviewRegistry[preview.kind] : undefined;

  return (
    <AnimatePresence>
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.18 }}
        className={cn("absolute right-3 top-3 z-20", isUiNode ? "w-[460px]" : "w-[420px]")}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{node.name}</CardTitle>
              <div className="mt-1 flex gap-1">
                <Badge tone="neutral">{node.artifactType}</Badge>
                <Badge tone={riskTone[node.risk]}>{node.status.toUpperCase()}</Badge>
                <Badge tone="neutral">{node.layer}</Badge>
              </div>
            </div>
            <button onClick={onClose} className="text-hud-textDim hover:text-hud-cyan">
              <X size={16} />
            </button>
          </CardHeader>

          <Tabs defaultValue={isUiNode ? "preview" : "code"}>
            <TabsList>
              {isUiNode && <TabsTrigger value="preview">Preview</TabsTrigger>}
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="runtime">Runtime</TabsTrigger>
              <TabsTrigger value="gnn">GNN</TabsTrigger>
            </TabsList>

            {isUiNode && (
              <TabsContent value="preview">
                <div className="glass-inset max-h-80 overflow-y-auto p-2">
                  {previewError && <p className="text-[11px] text-hud-red">preview unavailable: {previewError}</p>}
                  {!previewError && !preview && <p className="text-[10px] uppercase tracking-widest text-hud-textDim">Building live preview from real domain data...</p>}
                  {PreviewComponent && preview && <PreviewComponent data={preview.data} />}
                </div>
                <p className="mt-1 text-[9px] leading-relaxed text-hud-textDim">
                  Real React render of this component&apos;s design, populated with sample data generated by the actual src/domain factory functions &mdash; the underlying{" "}
                  {node.name} itself only returns a text string (no JSX), so this is REPO_OS&apos;s own visual interpretation of it, not that file&apos;s native output.
                </p>
              </TabsContent>
            )}

            <TabsContent value="code">
              <div onMouseEnter={loadSource} className="glass-inset h-64 overflow-hidden">
                {source === null ? (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-hud-textDim" onClick={loadSource}>
                    {loadingSource ? "Reading real file..." : "Hover or click to load source"}
                  </div>
                ) : (
                  <MonacoEditor
                    height="100%"
                    theme="vs-dark"
                    language={languageForPath(node.path)}
                    value={source}
                    options={{ readOnly: true, fontSize: 11, minimap: { enabled: false }, scrollBeyondLastLine: false }}
                  />
                )}
              </div>
              <p className="mt-1 text-[9px] text-hud-textDim">{node.path}</p>
            </TabsContent>

            <TabsContent value="runtime">
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between"><span className="text-hud-textDim">STATE</span><span>{node.status}</span></div>
                <div className="flex justify-between"><span className="text-hud-textDim">RISK</span><span>{node.risk}</span></div>
                <div className="flex justify-between"><span className="text-hud-textDim">COST</span><span>{node.cost}</span></div>
                <div className="flex justify-between"><span className="text-hud-textDim">CONFIDENCE</span><span>{node.confidence}</span></div>
                <div className="flex justify-between"><span className="text-hud-textDim">LOC</span><span>{node.loc}</span></div>
              </div>
            </TabsContent>

            <TabsContent value="gnn">
              <div className="mb-2 flex justify-between text-[10px] text-hud-textDim">
                <span>STATUS: STATIC_ANALYSIS</span>
                <span>BLAST_RADIUS: {node.blastRadius}</span>
              </div>
              <div className="space-y-2">
                <MetricBar label="in-degree" value={node.inDegree} max={12} />
                <MetricBar label="out-degree" value={node.outDegree} max={12} />
                <MetricBar label="blast radius" value={node.blastRadius} max={1} />
                <MetricBar label="confidence" value={node.confidence} max={1} />
              </div>
              <p className="mt-2 text-[9px] leading-relaxed text-hud-textDim">
                Heuristic metrics derived from real import coupling and file size &mdash; illustrative, not a trained model.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
