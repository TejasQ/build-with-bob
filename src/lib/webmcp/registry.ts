import type { ModelContext, ToolResult, WebMcpTool } from "./types";

/** Spec location is document.modelContext; Chrome 146–149 shipped navigator.modelContext. */
export function getModelContext(): ModelContext | null {
  if (typeof window === "undefined") return null;
  const doc = document as Document & { modelContext?: ModelContext };
  const nav = navigator as Navigator & { modelContext?: ModelContext };
  return doc.modelContext ?? nav.modelContext ?? null;
}

/** Registers tools; returns a cleanup that unregisters them (AbortSignal, with legacy fallback). */
export function registerTools(tools: WebMcpTool[]): () => void {
  const context = getModelContext();
  if (!context) return () => {};
  const controller = new AbortController();
  for (const tool of tools) {
    try {
      const pending = context.registerTool(tool, { signal: controller.signal });
      if (pending instanceof Promise)
        pending.catch((e) => console.warn(`WebMCP: ${tool.name}`, e));
    } catch (error) {
      console.warn(`WebMCP: could not register ${tool.name}`, error);
    }
  }
  return () => {
    controller.abort();
    tools.forEach((t) => context.unregisterTool?.(t.name));
  };
}

export const text = (value: unknown): ToolResult => ({
  content: [
    {
      type: "text",
      text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
    },
  ],
});

export const failure = (message: string): ToolResult => ({
  ...text(message),
  isError: true,
});
