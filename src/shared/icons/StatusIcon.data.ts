import type { TStatus } from "./StatusIcon.type";

/** Path data per status, drawn on a 24px grid. Each status has its own shape, so color is never the only signal. */
export const statusIconPaths: Record<TStatus, readonly string[]> = {
  // check in a circle
  active: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m8 12.5 3 3 5-6"],
  // two bars
  paused: ["M9 5v14", "M15 5v14"],
  // × in a circle
  cancelled: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "m9 9 6 6", "m15 9-6 6"],
  // ! in a triangle
  danger: ["M12 3.5 22 20.5H2L12 3.5Z", "M12 10v4.5", "M12 17.5v.01"],
};
