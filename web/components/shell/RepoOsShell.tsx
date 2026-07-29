"use client";

import { useEffect, useMemo, useState } from "react";
import { Settings, Power, Folder, LayoutPanelTop, History as HistoryIcon, Share2 } from "lucide-react";
import { RepoGraphCanvas } from "../graph/RepoGraphCanvas";
import { ChatPanel } from "../chat/ChatPanel";
import type { RepoGraph } from "../../lib/types";

const navItems = [
  { key: "root", label: "Explore Repository", icon: Folder },
  { key: "ui", label: "UI", icon: LayoutPanelTop },
  { key: "history", label: "HISTORY", icon: HistoryIcon },
  { key: "network", label: "NETWORK", icon: Share2 }
];

const topTabs = ["CLUSTER", "NODES", "TERMINAL", "METRICS"];

type GraphView = { graph: RepoGraph | null; error: string | null; loaded: boolean };

const emptyView: GraphView = { graph: null, error: null, loaded: false };

export const RepoOsShell = () => {
  const [views, setViews] = useState<Record<"root" | "ui", GraphView>>({
    root: emptyView,
    ui: emptyView
  });
  const [activeNav, setActiveNav] = useState("root");

  const fetchView = (key: "root" | "ui", scope?: "ui") => {
    fetch(scope ? `/api/graph?scope=${scope}` : "/api/graph")
      .then((res) => res.json())
      .then((data: RepoGraph | { error: string }) =>
        setViews((prev) => ({
          ...prev,
          [key]: "error" in data ? { graph: null, error: data.error, loaded: true } : { graph: data, error: null, loaded: true }
        }))
      )
      .catch((err) => setViews((prev) => ({ ...prev, [key]: { graph: null, error: String(err), loaded: true } })));
  };

  // Root graph (src/domain) loads immediately, like before. The UI graph
  // (src/components) is fetched lazily the first time that tab is opened,
  // then cached so switching back and forth is instant.
  useEffect(() => {
    fetchView("root");
  }, []);

  useEffect(() => {
    if (activeNav === "ui" && !views.ui.loaded) fetchView("ui", "ui");
  }, [activeNav, views.ui.loaded]);

  const isGraphView = activeNav === "root" || activeNav === "ui";
  const currentView = activeNav === "ui" ? views.ui : views.root;
  const { graph, error } = currentView;

  const stats = useMemo(() => {
    if (!graph) return null;
    const connected = graph.nodes.filter((n) => n.inDegree + n.outDegree > 0).length;
    const connectivity = graph.nodes.length ? Math.round((connected / graph.nodes.length) * 1000) / 10 : 0;
    const layers = new Set(graph.nodes.map((n) => n.layer)).size;
    return { nodes: graph.nodes.length, edges: graph.edges.length, connectivity, layers };
  }, [graph]);

  return (
    <div className="hud-scanlines flex h-screen w-screen flex-col overflow-hidden bg-hud-bg text-hud-text">
      <header className="flex items-center justify-between border-b border-hud-border px-4 py-2">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold tracking-[0.2em] text-hud-cyan">REPO_OS</span>
          <nav className="flex gap-4 text-[11px] tracking-wider text-hud-textDim">
            {topTabs.map((tab, i) => (
              <span key={tab} className={i === 0 ? "border-b border-hud-cyan pb-1 text-hud-cyan" : "cursor-default opacity-60"}>
                {tab}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-hud-textDim">
          <Settings size={15} />
          <Power size={15} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-48 shrink-0 flex-col border-r border-hud-border px-3 py-3">
          <div className="mb-4">
            <div className="text-sm font-semibold text-hud-text">NODE_MANAGER</div>
            <div className="text-[9px] text-hud-textDim">v0.9.4 // STABLE</div>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[11px] tracking-wide ${
                  activeNav === key ? "bg-hud-cyan/10 text-hud-cyan" : "text-hud-textDim hover:text-hud-text"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 flex-1 overflow-hidden">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-hud-textDim">Activity Log</div>
            <div className="space-y-1.5 text-[10px] text-hud-textDim">
              {graph ? (
                <>
                  <div><span className="text-hud-cyan">{new Date().toLocaleTimeString()}</span> graph_loaded: {graph.nodes.length} nodes</div>
                  <div><span className="text-hud-cyan">{new Date().toLocaleTimeString()}</span> layers indexed: {stats?.layers}</div>
                  <div><span className="text-hud-cyan">{new Date().toLocaleTimeString()}</span> source: {graph.scannedRoot}</div>
                </>
              ) : (
                <div>scanning {activeNav === "ui" ? "src/components" : "src/domain"}...</div>
              )}
            </div>
          </div>
        </aside>

        <main className="relative flex-1">
          {isGraphView ? (
            <RepoGraphCanvas key={activeNav} graph={graph} error={error} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-hud-textDim">
              {activeNav.toUpperCase()} view not implemented yet
            </div>
          )}
        </main>

        <aside className="flex w-80 shrink-0 flex-col gap-3 border-l border-hud-border px-3 py-3">
          <div className="flex shrink-0 gap-3">
            <div className="flex-1 rounded-sm border border-hud-border bg-hud-panel p-2">
              <div className="text-[10px] uppercase tracking-widest text-hud-textDim">System Status</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[10px] text-hud-textDim">Connectivity</span>
                <span className="text-lg font-semibold text-hud-green">{stats ? `${stats.connectivity}%` : "--"}</span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-hud-textDim">
                <span>Nodes</span>
                <span className="text-hud-text">{stats?.nodes ?? "--"}</span>
              </div>
              <div className="flex justify-between text-[10px] text-hud-textDim">
                <span>Edges</span>
                <span className="text-hud-text">{stats?.edges ?? "--"}</span>
              </div>
            </div>

            <div className="flex-1 rounded-sm border border-hud-border bg-hud-panel p-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-hud-textDim">
                <span>Data Stream</span>
                <span className="h-1.5 w-1.5 rounded-full bg-hud-green" />
              </div>
              <div className="mt-1 text-[10px] text-hud-textDim">Layers: <span className="text-hud-text">{stats?.layers ?? "--"}</span></div>
              <div className="text-[10px] text-hud-textDim">Mode: <span className="text-hud-cyan">read-only-real</span></div>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <ChatPanel />
          </div>
        </aside>
      </div>

      <footer className="flex items-center justify-between border-t border-hud-border px-4 py-1 text-[10px] text-hud-textDim">
        <span>REPO_OS // HUD</span>
        <span>STATUS: {error ? "ERROR" : graph ? "OPTIMAL" : "SYNCING"} &middot; ENCRYPTION: SHA-256 &middot; THREAT: LOW</span>
        <span>LOGS &middot; DIAGNOSTICS &middot; UPLINK</span>
      </footer>
    </div>
  );
};
