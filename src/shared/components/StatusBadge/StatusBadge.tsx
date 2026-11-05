import { statusBadgeContent } from "@/content/components/statusBadge";
import { Badge } from "../Badge/Badge";
import { statusBadgeIcon } from "./StatusBadge.data";
import type { IStatusBadgeProps } from "./StatusBadge.type";

/** A subscription status as icon plus word. */
export function StatusBadge({ status }: IStatusBadgeProps) {
  return (
    <Badge tone={status} icon={statusBadgeIcon[status]}>
      {statusBadgeContent.label[status]}
    </Badge>
  );
}
