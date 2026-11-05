// Part A: build the "Manage my subscription" page here.
// Data comes from getSubscription() and skipNextShipment() in ../api/mockApi.
// Anything beyond skipping can live in local state; other products are in `catalog` in ../api/fixtures.

import { subscriptionContent } from "@/content/subscription";

export function SubscriptionCard() {
  return <h1>{subscriptionContent.title}</h1>;
}
