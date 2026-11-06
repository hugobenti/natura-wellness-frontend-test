import { appContent } from "@/content/app";
import { SubscriptionCard } from "@/part-a/SubscriptionCard";
import { BuyBox } from "@/part-b/BuyBox";
import { Select } from "@/shared/components/Select/Select";
import { cx } from "@/shared/utils/cx";

import { app } from "./App.style";
import { useApp } from "./useApp";

export function App() {
  const {
    part,
    theme,
    links,
    fixture,
    fixtureOptions,
    onFixtureChange,
    themeOptions,
    onThemeChange,
  } = useApp();

  return (
    <div data-theme={theme} className={app.shell}>
      <nav aria-label={appContent.nav.label} className={app.nav}>
        <div className={app.partLinks}>
          {links.map((link) => (
            <a
              key={link.part}
              href={link.href}
              aria-current={link.current ? "page" : undefined}
              className={cx(app.link, link.current && app.linkCurrent)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className={app.controls}>
          {part === "a" && (
            <Select
              label={appContent.nav.fixtureLabel}
              layout="inline"
              value={fixture}
              onChange={onFixtureChange}
              options={fixtureOptions}
            />
          )}
          <Select
            label={appContent.nav.themeLabel}
            layout="inline"
            value={theme}
            onChange={onThemeChange}
            options={themeOptions}
          />
        </div>
      </nav>
      <main>{part === "a" ? <SubscriptionCard /> : <BuyBox />}</main>
    </div>
  );
}
