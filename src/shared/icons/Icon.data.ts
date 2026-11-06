import type { TIconName } from "./Icon.type";

const circle = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z";

/** Path data per icon, drawn on a 24px grid. Statuses each have their own shape, so color is never the only signal. */
export const iconPaths: Record<TIconName, readonly string[]> = {
  check: ["m5 12.5 4.5 4.5L19 7"],
  // check in a circle
  "check-circle": [circle, "m8 12.5 3 3 5-6"],
  // two bars
  pause: ["M9 5v14", "M15 5v14"],
  // × in a circle
  "x-circle": [circle, "m9 9 6 6", "m15 9-6 6"],
  // ! in a triangle
  "alert-triangle": ["M12 3.5 22 20.5H2L12 3.5Z", "M12 10v4.5", "M12 17.5v.01"],
  // i in a circle
  info: [circle, "M12 11v5", "M12 8v.01"],
  "arrow-left": ["M19 12H5", "m11 6-6 6 6 6"],
  "chevron-down": ["m6 9 6 6 6-6"],
  minus: ["M5 12h14"],
  plus: ["M5 12h14", "M12 5v14"],
  // five-point star; pass `filled` to paint it solid
  star: ["m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z"],
  close: ["M18 6 6 18", "m6 6 12 12"],
};
