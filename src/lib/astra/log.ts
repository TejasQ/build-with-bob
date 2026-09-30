/** Degrade gracefully when Astra is unreachable, but never silently. */
export function logEmpty(error: unknown): [] {
  console.error(
    "Astra DB request failed:",
    error instanceof Error ? error.message : error,
  );
  return [];
}
