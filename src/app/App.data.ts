import { appContent } from "@/content/app";

import type { INavLink } from "./App.type";

export const navLinks: INavLink[] = [
  { part: "a", href: "?part=a&fixture=active", label: appContent.nav.partA },
  { part: "b", href: "?part=b", label: appContent.nav.partB },
];
