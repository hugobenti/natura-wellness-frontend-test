import { useEffect, useId, useRef, useState } from "react";
import type { IUseResponsiveDialogArgs } from "./ResponsiveDialog.type";

/** Drives a native modal `dialog` from `open`; the parent stays the source of truth. */
export function useResponsiveDialog({ open, onClose }: IUseResponsiveDialogArgs) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  // Bumped when the browser closes the dialog while `open` is still true, to re-open it.
  const [nativeCloses, setNativeCloses] = useState(0);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    openRef.current = open;
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open, nativeCloses]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    const handleClose = () => {
      if (!openRef.current) return;
      onCloseRef.current();
      setNativeCloses((count) => count + 1);
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  return { ref, titleId, descriptionId };
}
