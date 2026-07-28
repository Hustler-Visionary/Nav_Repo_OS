"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

type TabsContextValue = { value: string; setValue: (value: string) => void };
const TabsContext = createContext<TabsContextValue | null>(null);

export const Tabs = ({
  defaultValue,
  className,
  children
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex gap-1 border-b border-hud-border px-2 py-1", className)}>{children}</div>
);

export const TabsTrigger = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const ctx = useContext(TabsContext);
  if (!ctx) return null;
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "rounded-sm px-2 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors",
        active ? "bg-hud-cyan/10 text-hud-cyan" : "text-hud-textDim hover:text-hud-text"
      )}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }: { value: string; children: React.ReactNode }) => {
  const ctx = useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;
  return <div className="px-3 py-2">{children}</div>;
};
