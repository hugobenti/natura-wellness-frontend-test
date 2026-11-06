export type TPart = "a" | "b";

export type TFixture = "active" | "paused" | "cancelled" | "error";

export interface INavLink {
  part: TPart;
  label: string;
}
