import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & { variant?: "primary" | "outline" };

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition";

const variants = {
  primary: "bg-bob-gradient text-white hover:brightness-110",
  outline: "border-bob-gradient text-foreground hover:bg-nav-hover",
};

/** IBM Bob-style pill button: blue→purple gradient fill, or gradient hairline border. */
export function ButtonLink({ variant = "primary", className = "", ...props }: Props) {
  return <Link {...props} className={`${base} ${variants[variant]} ${className}`} />;
}
