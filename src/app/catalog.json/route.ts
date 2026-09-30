import { buildCatalog } from "@/lib/feeds/catalog";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildCatalog());
}
