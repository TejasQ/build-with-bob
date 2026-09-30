import { createTools } from "@/lib/webmcp/tools";

export function ToolTable() {
  const tools = createTools(() => {});
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Tool</th>
            <th className="px-4 py-3 font-semibold">Parameters</th>
            <th className="px-4 py-3 font-semibold">What it does</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tools.map((t) => (
            <tr key={t.name} className="align-top">
              <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                {t.name}
                {t.annotations?.readOnlyHint && (
                  <span className="block pt-1 font-sans text-muted-foreground">
                    read-only
                  </span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {Object.keys(t.inputSchema.properties).join(", ") || "none"}
              </td>
              <td className="px-4 py-3 font-light">{t.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
