import { appContent } from "@/content/app";
import { themeNames } from "@/styles/themes";

import type { TFixture, INavLink } from "./App.type";

export const navLinks: INavLink[] = [
  { part: "a", label: appContent.nav.partA },
  { part: "b", label: appContent.nav.partB },
];

export const fixtureOptions: { value: TFixture; label: string }[] = [
  { value: "active", label: appContent.nav.fixtures.active },
  { value: "paused", label: appContent.nav.fixtures.paused },
  { value: "cancelled", label: appContent.nav.fixtures.cancelled },
  { value: "error", label: appContent.nav.fixtures.error },
];

export const themeOptions = themeNames.map((value) => ({
  value,
  label: value === "brand" ? appContent.nav.themes.brand : appContent.nav.themes.partB,
}));
