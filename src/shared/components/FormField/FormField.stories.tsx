import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FormField } from "./FormField";
import { formFieldStory } from "./FormField.stories.style";
import type { IFormFieldProps } from "./FormField.type";
import { useFormField } from "./useFormField";

type TDemoProps = Pick<IFormFieldProps, "label" | "hint" | "error" | "layout"> & {
  control: "textarea" | "input";
};

function Demo({ control, label, hint, error, layout }: TDemoProps) {
  const field = useFormField({ hint, error });
  const shared = {
    id: field.controlId,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid,
  };

  return (
    <div className={formFieldStory.frame}>
      <FormField field={field} label={label} hint={hint} error={error} layout={layout}>
        {control === "textarea" ? (
          <textarea {...shared} className={formFieldStory.textarea} />
        ) : (
          <input {...shared} type="number" className={formFieldStory.input} />
        )}
      </FormField>
    </div>
  );
}

const meta = {
  title: "Components/FormField",
  component: Demo,
  args: { control: "input", label: "Delivery note" },
} satisfies Meta<typeof Demo>;

export default meta;
type TStory = StoryObj<typeof meta>;

/** Hint text under the control, read with it by screen readers. */
export const WithHint: TStory = {
  args: { hint: "Tell the courier where to leave the parcel." },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByLabelText(args.label as string);

    await expect(control).not.toHaveAttribute("aria-invalid");
    await expect(control).toHaveAccessibleDescription(args.hint as string);
  },
};

/** Label and control in a row, as in "Delivered every". */
export const Inline: TStory = {
  args: { layout: "inline", label: "Delivered every", hint: "Weeks between deliveries." },
};

/** A native textarea with an error: the other reason a control needs its own border. */
export const TextareaWithError: TStory = {
  args: {
    control: "textarea",
    label: "Delivery note",
    error: "The note is too long.",
  },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByLabelText(args.label as string);
    const error = within(canvasElement).getByRole("alert");

    await expect(control.tagName).toBe("TEXTAREA");
    await expect(control).toHaveAttribute("aria-invalid", "true");
    await expect(control.getAttribute("aria-describedby")).toBe(error.id);
  },
};
