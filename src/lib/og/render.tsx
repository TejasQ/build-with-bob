import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { fonts } from "./assets";
import { og } from "./theme";

export const ogSize = { width: og.width, height: og.height };
export const ogContentType = "image/png";

export function renderOg(element: ReactElement) {
  return new ImageResponse(element, { ...ogSize, fonts });
}
