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
    // The modal backdrop reports its pointer events on the dialog itself, outside the dialog's box.
    const outsideBox = (event: MouseEvent) => {
      const box = dialog.getBoundingClientRect();
      return (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      );
    };
    // A press that starts inside (selecting text) and ends on the backdrop must not close it.
    let pressedBackdrop = false;
    const handlePointerDown = (event: PointerEvent) => {
      pressedBackdrop = event.target === dialog && outsideBox(event);
    };
    const handleClick = (event: MouseEvent) => {
      const backdropClick = pressedBackdrop && event.target === dialog && outsideBox(event);
      pressedBackdrop = false;
      if (backdropClick) onCloseRef.current();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("pointerdown", handlePointerDown);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("pointerdown", handlePointerDown);
      dialog.removeEventListener("click", handleClick);
    };
  }, []);

  return { ref, titleId, descriptionId };
}
