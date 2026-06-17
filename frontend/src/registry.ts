import type { ToolDef } from "./tools/types";
import { tool as jsonstruct } from "./tools/jsonstruct";
import { tool as jwt } from "./tools/jwt";
import { tool as regex } from "./tools/regex";

// The central tool registry — frontend mirror of the backend registry.
// Add a tool: import its ToolDef and append one line here. Sidebar + routing
// are generated from this array, so nothing else needs to change.
export const tools: ToolDef[] = [jsonstruct, jwt, regex];

/** Path for a tool's page. */
export const toolPath = (id: string) => `/tools/${id}`;
