import type { Priority } from "@/types";

// P0 is the one place priority breaks the monochrome phosphor palette,
// reusing the alert-red already reserved for critical/destructive signals.
export const PRIORITY_COLOR: Record<Priority, string> = {
  p0: "text-alert",
  p1: "text-accent",
  p2: "text-text-muted",
  p3: "text-text-faint",
};

export const PRIORITY_TAG: Record<Priority, string> = {
  p0: "[P0]",
  p1: "[P1]",
  p2: "[P2]",
  p3: "[P3]",
};
