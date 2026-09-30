import { formatTimestamp } from "@/lib/time";
import { findEpisode, loadCatalog } from "../catalog";
import { SEEK_EVENT } from "../events";
import { failure, text } from "../registry";
import type { WebMcpTool } from "../types";

type Navigate = (path: string) => void;
type PlayInput = { episode: string; atSeconds?: number };

export const playEpisodeTool = (navigate: Navigate): WebMcpTool<PlayInput> => ({
  name: "play_episode",
  title: "Play an episode",
  description:
    "Open an episode page for the user and start the video, optionally at a specific second (e.g. a startSeconds value from search_transcripts).",
  inputSchema: {
    type: "object",
    properties: {
      episode: { type: "string", description: "Episode slug or number" },
      atSeconds: {
        type: "number",
        description: "Where to start playback, in seconds (default 0)",
        minimum: 0,
      },
    },
    required: ["episode"],
  },
  annotations: { readOnlyHint: false },
  async execute({ episode, atSeconds = 0 }) {
    const found = await findEpisode(episode);
    if (!found) return failure(`No episode matches "${episode}".`);
    const path = new URL(found.url).pathname;
    const seconds = Math.max(0, Math.floor(atSeconds));
    if (window.location.pathname === path) {
      history.replaceState(null, "", `?t=${seconds}`);
      window.dispatchEvent(new CustomEvent(SEEK_EVENT, { detail: seconds }));
    } else navigate(`${path}?t=${seconds}`);
    return text(
      `Playing episode ${found.number}, "${found.title}", from ${formatTimestamp(seconds)}.`,
    );
  },
});

export const listProjectsTool: WebMcpTool = {
  name: "list_projects",
  title: "List projects",
  description:
    "List the open-source projects built on Building with Bob, with status, stack and URL.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  async execute() {
    return text((await loadCatalog()).projects);
  },
};
