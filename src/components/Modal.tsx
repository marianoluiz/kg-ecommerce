"use client";

import { useEffect, type ReactNode } from "react";

type ModalProps = { open: boolean; title: string; onClose: () => void; children: ReactNode };

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
