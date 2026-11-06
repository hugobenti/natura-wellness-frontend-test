export interface ISubscriptionDiff {
  messages: string[];
  nextDateChanged: boolean;
  skipDateChanged: boolean;
  totalChanged: boolean;
}
