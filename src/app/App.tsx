import { SubscriptionCard } from "@/part-a/SubscriptionCard";
import { BuyBox } from "@/part-b/BuyBox";
import { cx } from "@/shared/utils/cx";

import { app } from "./App.style";
import { useApp } from "./useApp";

export function App() {
  const { part, theme, links } = useApp();
  return (
    <div data-theme={theme} className={app.shell}>
      <nav className={app.nav}>
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            aria-current={link.current ? "page" : undefined}
            className={cx(app.link, link.current && app.linkCurrent)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <main>{part === "a" ? <SubscriptionCard /> : <BuyBox />}</main>
    </div>
  );
}
