import type { ComponentType } from "react";

// ToolDef is the frontend contract for a tool module — the mirror of the
// backend tool.Tool interface. One folder under src/tools = one ToolDef.
//
// Adding a tool: create src/tools/<id>/, export its ToolDef, then add one
// line to the registry array in registry.ts. Sidebar and routes derive from
// the registry automatically — no other file changes.
export interface ToolDef {
  /** Stable, URL-safe id. Must match the backend tool ID. */
  id: string;
  /** Human-readable label shown in the sidebar. */
  name: string;
  /** One-line summary. */
  description: string;
  /** The page component rendered at /tools/<id>. */
  Page: ComponentType;
}
