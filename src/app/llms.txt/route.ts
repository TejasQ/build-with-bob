import { logEmpty } from "@/lib/astra/log";
import { listIndexableQueries } from "@/lib/astra/queries";
import { llmsIndex } from "@/lib/feeds/llms";

export const revalidate = 3600;

export async function GET() {
  const questions = await listIndexableQueries(100).catch(logEmpty);
  return new Response(llmsIndex(questions), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
