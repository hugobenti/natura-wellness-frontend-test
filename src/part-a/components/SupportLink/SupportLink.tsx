import { subscriptionContent } from "@/content/subscription";
import { supportLink } from "./SupportLink.style";

export function SupportLink() {
  return (
    <a href={subscriptionContent.support.href} className={supportLink.base}>
      {subscriptionContent.support.label}
    </a>
  );
}
