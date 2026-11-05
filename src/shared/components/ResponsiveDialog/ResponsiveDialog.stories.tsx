import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { ResponsiveDialog } from "./ResponsiveDialog";
import { responsiveDialogStory } from "./ResponsiveDialog.stories.style";
import type { IResponsiveDialogProps } from "./ResponsiveDialog.type";

const title = "Skip next shipment?";

/** `vitest/browser` only exists under the Vitest runner; plain Storybook gets null. */
async function loadBrowserApi() {
  try {
    return await import("vitest/browser");
  } catch {
    return null;
  }
}

/** Runs `check` at a viewport size (Vitest only), then restores the original size. */
async function atViewport(width: number, height: number, check: () => Promise<void>) {
  const browser = await loadBrowserApi();
  if (!browser) return;
  const original = { width: window.innerWidth, height: window.innerHeight };
  await browser.page.viewport(width, height);
  try {
    await check();
  } finally {
    await browser.page.viewport(original.width, original.height);
  }
}

type TDemoProps = Pick<IResponsiveDialogProps, "onClose"> & {
  /** Keeps the dialog open on every close request, as a parent with a pending action would. */
  pending?: boolean;
} & Partial<Pick<IResponsiveDialogProps, "title" | "description">>;

/** Story-local parent: it owns `open`, as a real screen would. */
function Demo({ onClose, title: dialogTitle = title, description, pending }: TDemoProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={responsiveDialogStory.frame}>
      <Button onClick={() => setOpen(true)}>Skip next shipment</Button>
      <ResponsiveDialog
        open={open}
        onClose={() => {
          onClose();
          if (!pending) setOpen(false);
        }}
        title={dialogTitle}
        description={description}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button variant="destructive" pending={pending} onClick={() => setOpen(false)}>
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
  argTypes: { open: { control: false } },
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

    // Under Vitest, a real key press (the synthetic one never fires the native cancel event);
    // elsewhere, dispatch the native cancel event the browser would.
    const browser = await loadBrowserApi();
    if (browser) await browser.userEvent.keyboard("{Escape}");
    else dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
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
    await atViewport(375, 812, async () => {
      await userEvent.click(
        within(canvasElement).getByRole("button", { name: "Skip next shipment" }),
      );
      const dialog = await within(document.body).findByRole("dialog", { name: title });
      await waitFor(() => expect(dialog.getBoundingClientRect().bottom).toBe(window.innerHeight));
    });
  },
};

/** From 1280px wide the dialog is centered, clear of the bottom edge. */
export const CenteredOnDesktop: TStory = {
  play: async ({ canvasElement }) => {
    await atViewport(1280, 800, async () => {
      await userEvent.click(
        within(canvasElement).getByRole("button", { name: "Skip next shipment" }),
      );
      const dialog = await within(document.body).findByRole("dialog", { name: title });
      await waitFor(() =>
        expect(dialog.getBoundingClientRect().bottom).toBeLessThan(window.innerHeight),
      );
    });
  },
};

/** While an action is pending the parent ignores `onClose`: repeated Escape never closes the dialog. */
export const StaysOpenWhilePending: TStory = {
  render: (args) => <Demo onClose={args.onClose} title={args.title} pending />,
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Skip next shipment" }),
    );
    const dialog = await within(document.body).findByRole("dialog", { name: title });
    await waitFor(() => expect(dialog).toBeVisible());

    const browser = await loadBrowserApi();
    for (let press = 0; press < 3; press += 1) {
      if (browser) await browser.userEvent.keyboard("{Escape}");
      else dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    }

    await waitFor(() => expect(args.onClose).toHaveBeenCalled());
    await expect(dialog).toHaveAttribute("open");
    await expect(dialog).toBeVisible();
  },
};
