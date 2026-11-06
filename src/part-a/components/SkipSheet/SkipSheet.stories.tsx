import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { SkipSheet } from "./SkipSheet";
import { skipSheet } from "./SkipSheet.style";

const meta = {
  title: "Part A/SkipSheet",
  component: SkipSheet,
  args: {
    open: true,
    phase: "conflict",
    conflict: {
      messages: [
        "Next charge moved from Wed, Nov 11 to Fri, Nov 13",
        "Charge after skipping moved from Fri, Dec 11 to Sun, Dec 13",
        "Total changed from $101.87 to $76.41",
        "Vitamin D, 60 softgels removed",
      ],
      nextDateChanged: true,
      skipDateChanged: true,
      totalChanged: true,
    },
    changeItems: [
      { key: "0-date", message: "Next charge moved from Wed, Nov 11 to Fri, Nov 13" },
      { key: "1-skip", message: "Charge after skipping moved from Fri, Dec 11 to Sun, Dec 13" },
      { key: "2-total", message: "Total changed from $101.87 to $76.41" },
      { key: "3-item", message: "Vitamin D, 60 softgels removed" },
    ],
    factStyles: {
      nextBoxLabel: skipSheet.changedLabel,
      oldDate: skipSheet.oldDate,
      newDate: skipSheet.changedValue,
      chargeLabel: skipSheet.changedLabel,
      amount: skipSheet.changedValue,
    },
    oldDate: "Fri, Nov 13",
    newDate: "Sun, Dec 13",
    amount: "$76.41",
    confirmLabel: "Skip this box",
    chargeLabel: "Charged on Sun, Dec 13",
    nothingNote: "Nothing is sent or charged on Fri, Nov 13.",
    errorBody: "Nothing changed: you'll still be charged on Fri, Nov 13.",
    onConfirm: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof SkipSheet>;

export default meta;
type TStory = StoryObj<typeof meta>;

export const ChangedConflict: TStory = {
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Skip your next box?",
    });
    await expect(within(dialog).getByRole("status")).toHaveTextContent(
      "Vitamin D, 60 softgels removed",
    );
    await expect(within(dialog).getByRole("button", { name: "Skip this box" })).toBeEnabled();
  },
};
