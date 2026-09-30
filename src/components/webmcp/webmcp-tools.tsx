"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerTools } from "@/lib/webmcp/registry";
import { createTools } from "@/lib/webmcp/tools";

/** Exposes the site's capabilities to in-browser AI agents via WebMCP (no-op if unsupported). */
export function WebMcpTools() {
  const router = useRouter();
  useEffect(() => registerTools(createTools((path) => router.push(path))), [router]);
  return null;
}
