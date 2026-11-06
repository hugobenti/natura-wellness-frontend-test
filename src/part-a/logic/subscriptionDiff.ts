import { subscriptionContent } from "@/content/subscription";
import { formatMoney } from "@/shared/logic/money";
import { addDays, formatDay } from "./dates";
import type { ISubscriptionView } from "./subscriptionView.type";
import type { ISubscriptionDiff } from "./subscriptionDiff.type";

export function diffSubscription(
  before: ISubscriptionView,
  after: ISubscriptionView,
  now: Date,
): ISubscriptionDiff {
  const copy = subscriptionContent.skip;
  const messages: string[] = [];
  const nextDateChanged =
    (before.nextChargeAt ? formatDay(before.nextChargeAt, now) : null) !==
    (after.nextChargeAt ? formatDay(after.nextChargeAt, now) : null);
  const beforeSkip = before.nextChargeAt && addDays(before.nextChargeAt, before.intervalDays);
  const afterSkip = after.nextChargeAt && addDays(after.nextChargeAt, after.intervalDays);
  const skipDateChanged =
    (beforeSkip ? formatDay(beforeSkip, now) : null) !==
    (afterSkip ? formatDay(afterSkip, now) : null);
  const totalChanged = before.pricing.totalCents !== after.pricing.totalCents;
  if (before.status !== after.status) messages.push(copy.statusChanged(after.status));
  if (nextDateChanged && before.nextChargeAt && after.nextChargeAt) {
    messages.push(
      copy.nextChargeChanged(
        formatDay(before.nextChargeAt, now),
        formatDay(after.nextChargeAt, now),
      ),
    );
  }
  if (skipDateChanged && beforeSkip && afterSkip) {
    messages.push(copy.skipChargeChanged(formatDay(beforeSkip, now), formatDay(afterSkip, now)));
  }
  if (totalChanged)
    messages.push(
      copy.totalChanged(
        formatMoney(before.pricing.totalCents),
        formatMoney(after.pricing.totalCents),
      ),
    );
  const previous = new Map(
    before.lines.filter((line) => !line.skipped).map((line) => [line.sku, line]),
  );
  const current = new Map(
    after.lines.filter((line) => !line.skipped).map((line) => [line.sku, line]),
  );
  for (const [sku, line] of previous) {
    const updated = current.get(sku);
    if (!updated) messages.push(copy.itemRemoved(line.name));
    else if (updated.quantity !== line.quantity)
      messages.push(copy.quantityChanged(line.name, line.quantity, updated.quantity));
  }
  for (const [sku, line] of current) {
    if (!previous.has(sku)) messages.push(copy.itemAdded(line.name));
  }
  return { messages, nextDateChanged, skipDateChanged, totalChanged };
}
