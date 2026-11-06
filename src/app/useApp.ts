import { themeNames } from "@/styles/themes";
import type { TThemeName } from "@/styles/themes.type";

import { fixtureOptions, navLinks, themeOptions } from "./App.data";
import type { TFixture, TPart } from "./App.type";

/** The part, fixture, theme, navigation links, and query-preserving select handlers for the app shell. */
export function useApp() {
  const params = new URLSearchParams(window.location.search);
  const part: TPart = params.get("part") === "b" ? "b" : "a";
  const fixture =
    fixtureOptions.find(({ value }) => value === params.get("fixture"))?.value ?? "active";
  const theme =
    themeNames.find((name) => name === params.get("theme")) ?? (part === "b" ? "part-b" : "brand");

  const links = navLinks.map((link) => {
    const query = new URLSearchParams({ part: link.part });
    if (link.part === "a") query.set("fixture", part === "a" ? fixture : "active");
    return { ...link, href: `?${query.toString()}`, current: link.part === part };
  });

  const onFixtureChange = (value: TFixture) => {
    const next = new URLSearchParams(window.location.search);
    next.set("part", "a");
    next.set("fixture", value);
    window.location.search = next.toString();
  };

  const onThemeChange = (value: TThemeName) => {
    const next = new URLSearchParams(window.location.search);
    const defaultTheme = part === "b" ? "part-b" : "brand";
    if (value === defaultTheme) next.delete("theme");
    else next.set("theme", value);
    window.location.search = next.toString();
  };

  return {
    part,
    fixture,
    theme,
    links,
    fixtureOptions,
    onFixtureChange,
    themeOptions,
    onThemeChange,
  };
}
