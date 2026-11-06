import { Button } from "@/shared/components/Button/Button";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog/ResponsiveDialog";
import type { IActivationDialogProps } from "./ActivationDialog.type";

export function ActivationDialog({
  open,
  title,
  description,
  confirmLabel,
  keepLabel,
  onConfirm,
  onClose,
}: IActivationDialogProps) {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            {keepLabel}
          </Button>
        </>
      }
    />
  );
}
