/** Strip Markdown syntax (links, emphasis, tables) down to plain text for embedding. */
export const plain = (md: string) =>
  md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/:?-{3,}:?/g, "")
    .replace(/[*_`>#|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
