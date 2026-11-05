import { navLinks } from "./App.data";
import type { TPart } from "./App.type";

/** Which part of the test to show (`?part=a|b`, default a) and the nav that switches between them. */
export function useApp() {
  const part: TPart = new URLSearchParams(window.location.search).get("part") === "b" ? "b" : "a";
  return {
    part,
    links: navLinks.map((link) => ({ ...link, current: link.part === part })),
  };
}
