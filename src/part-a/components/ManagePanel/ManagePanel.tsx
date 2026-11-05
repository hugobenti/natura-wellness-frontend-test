import { subscriptionContent } from "@/content/subscription";
import { managePanel } from "./ManagePanel.style";
import type { IManagePanelProps } from "./ManagePanel.type";

export function ManagePanel({ children }: IManagePanelProps) {
  return (
    <aside className={managePanel.panel}>
      <h2 className={managePanel.heading}>{subscriptionContent.manage.heading}</h2>
      <div className={managePanel.actions}>{children}</div>
    </aside>
  );
}
