import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { page, userEvent as browserUser } from "vitest/browser";
import { Button } from "../Button/Button";
import { ResponsiveDialog } from "./ResponsiveDialog";
import { responsiveDialogStory } from "./ResponsiveDialog.stories.style";
import type { IResponsiveDialogProps } from "./ResponsiveDialog.type";

const title = "Skip next shipment?";

type TDemoProps = Pick<IResponsiveDialogProps, "onClose"> &
  Partial<Pick<IResponsiveDialogProps, "title" | "description">>;

/** Story-local parent: it owns `open`, as a real screen would. */
function Demo({ onClose, title: dialogTitle = title, description }: TDemoProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={responsiveDialogStory.frame}>
      <Button onClick={() => setOpen(true)}>Skip next shipment</Button>
      <ResponsiveDialog
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title={dialogTitle}
        description={description}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Skip shipment
            </Button>
          </>
        }
      >
        <p>Your next box will not be sent. The following one is unchanged.</p>
      </ResponsiveDialog>
    </div>
  );
}

const meta = {
  title: "Components/ResponsiveDialog",
  component: ResponsiveDialog,
  args: { open: false, onClose: fn(), title },
  render: (args) => (
    <Demo onClose={args.onClose} title={args.title} description={args.description} />
  ),
} satisfies Meta<typeof ResponsiveDialog>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** A confirmation with a description; the safe choice comes first. */
export const Confirmation: TStory = {
  args: { description: "You can skip again whenever you like." },
};

/** Escape closes the dialog through `onClose` and focus returns to the trigger. */
export const EscClosesAndReturnsFocus: TStory = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Skip next shipment" });

    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole("dialog", { name: title });
    await waitFor(() => expect(dialog).toBeVisible());

    // A real key press: the synthetic one from storybook/test never fires the native cancel event.
    await browserUser.keyboard("{Escape}");
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog", { name: title })).toBeNull(),
    );
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expect(document.activeElement).toBe(trigger);

    await userEvent.click(trigger);
    const reopened = await within(document.body).findByRole("dialog", { name: title });
    await waitFor(() => expect(reopened).toBeVisible());
  },
};

/** At 375px wide the dialog sits on the bottom edge. */
export const BottomSheetOnPhone: TStory = {
  play: async ({ canvasElement }) => {
    await page.viewport(375, 812);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Skip next shipment" }),
    );
    const dialog = await within(document.body).findByRole("dialog", { name: title });
    await waitFor(() => expect(dialog.getBoundingClientRect().bottom).toBe(window.innerHeight));
  },
};

/** From 1280px wide the dialog is centered, clear of the bottom edge. */
export const CenteredOnDesktop: TStory = {
  play: async ({ canvasElement }) => {
    await page.viewport(1280, 800);
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Skip next shipment" }),
    );
    const dialog = await within(document.body).findByRole("dialog", { name: title });
    await waitFor(() =>
      expect(dialog.getBoundingClientRect().bottom).toBeLessThan(window.innerHeight),
    );
  },
};
