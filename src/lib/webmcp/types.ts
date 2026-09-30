/** Minimal WebMCP types (W3C WebML CG draft: https://webmachinelearning.github.io/webmcp/). */
export type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

export type ToolAnnotations = {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
  consequentialHint?: boolean;
};

export type JsonSchema = {
  type: "object";
  properties: Record<
    string,
    { type: string; description: string; minimum?: number; maximum?: number }
  >;
  required?: string[];
};

export type WebMcpTool<Input = Record<string, unknown>> = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: ToolAnnotations;
  execute: (input: Input) => Promise<ToolResult>;
};

export type ModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => unknown;
  unregisterTool?: (name: string) => void;
};

declare module "react" {
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: "" | boolean;
  }
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    toolparamdescription?: string;
  }
}

export type AgentSubmitEvent = SubmitEvent & {
  agentInvoked?: boolean;
  respondWith?: (response: Promise<unknown>) => void;
};
