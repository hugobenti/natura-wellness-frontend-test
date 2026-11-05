import { subscriptionContent } from "@/content/subscription";
import { Button } from "@/shared/components/Button/Button";
import { RadioGroup } from "@/shared/components/RadioGroup/RadioGroup";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog/ResponsiveDialog";
import type { TPausePresetId } from "../../logic/pause.type";
import type { IPauseSheetProps } from "./PauseSheet.type";

export function PauseSheet({
  open,
  title,
  intro,
  value,
  options,
  onChange,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  keepLabel,
  onClose,
}: IPauseSheetProps) {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button fullWidth disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            {keepLabel}
          </Button>
        </>
      }
    >
      <p>{intro}</p>
      <RadioGroup<TPausePresetId | "">
        legend={subscriptionContent.pause.legend}
        name="pause-duration"
        appearance="list"
        value={value}
        options={options}
        onChange={(choice) => choice && onChange(choice)}
      />
    </ResponsiveDialog>
  );
}
