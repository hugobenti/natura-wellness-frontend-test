import css from "@/styles/globals.css?raw";
import { readThemes } from "@/styles/themeTokens";

const themes = readThemes(css);

/** The theme picked in the Storybook toolbar; the brand theme when none matches. */
export function themeFor(name: unknown) {
  return themes.find((theme) => theme.name === name) ?? themes[0]!;
}
