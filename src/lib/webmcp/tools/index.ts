import type { WebMcpTool } from "../types";
import { getEpisodeTool, listEpisodesTool } from "./episodes";
import { getGuideTool } from "./guides";
import { listProjectsTool, playEpisodeTool } from "./navigation";
import { searchTranscriptsTool } from "./search";
import { getTranscriptTool } from "./transcript";

export function createTools(navigate: (path: string) => void): WebMcpTool[] {
  return [
    searchTranscriptsTool,
    listEpisodesTool,
    getEpisodeTool,
    getTranscriptTool,
    getGuideTool,
    playEpisodeTool(navigate),
    listProjectsTool,
  ] as WebMcpTool[];
}
