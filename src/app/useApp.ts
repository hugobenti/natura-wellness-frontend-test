import { navLinks } from "./App.data";
import type { TThemeName } from "@/styles/themes.type";
import type { TPart } from "./App.type";

/**
 * Which part of the test to show (`?part=a|b`, default a), the theme that part is drawn in (Part A
 * uses the brand theme, Part B its own) and the nav that switches between them.
 */
export function useApp() {
  const part: TPart = new URLSearchParams(window.location.search).get("part") === "b" ? "b" : "a";
  return {
    part,
    theme: part === "b" ? ("part-b" satisfies TThemeName) : undefined,
    links: navLinks.map((link) => ({ ...link, current: link.part === part })),
  };
}
