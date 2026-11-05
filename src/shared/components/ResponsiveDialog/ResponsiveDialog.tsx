import { responsiveDialogContent } from "@/content/components/responsiveDialog";
import { Icon } from "@/shared/icons/Icon";
import { Button } from "../Button/Button";
import { responsiveDialog } from "./ResponsiveDialog.style";
import type { IResponsiveDialogProps } from "./ResponsiveDialog.type";
import { useResponsiveDialog } from "./useResponsiveDialog";

/** A native modal dialog: a bottom sheet on phones, a centered modal from `sm`. */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: IResponsiveDialogProps) {
  const { ref, titleId, descriptionId } = useResponsiveDialog({ open, onClose });

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={responsiveDialog.dialog}
    >
      <header className={responsiveDialog.header}>
        <h2 id={titleId} className={responsiveDialog.title}>
          {title}
        </h2>
        <Button
          variant="quiet"
          size="icon"
          aria-label={responsiveDialogContent.closeLabel}
          onClick={onClose}
        >
          <Icon name="close" />
        </Button>
      </header>
      {description && (
        <p id={descriptionId} className={responsiveDialog.description}>
          {description}
        </p>
      )}
      <div className={responsiveDialog.body}>{children}</div>
      {footer && <footer className={responsiveDialog.footer}>{footer}</footer>}
    </dialog>
  );
}
