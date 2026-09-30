import { renderOg } from "./render";
import { PageCard } from "./templates/page";

type Spec = Parameters<typeof PageCard>[0];

/** Build the default export for a static page's opengraph-image.tsx. */
export const staticOg = (spec: Spec | (() => Spec)) => async () =>
  renderOg(await PageCard(typeof spec === "function" ? spec() : spec));
