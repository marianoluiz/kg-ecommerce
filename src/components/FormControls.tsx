"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Modal } from "./Modal";

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

type SubmitButtonProps = {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
};

// Must sit inside a <form action={...}>: shows a spinner and disables itself while the action runs.
export function SubmitButton({ children, pendingLabel = "Saving…", className = "btn" }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`${className}${pending ? " is-pending" : ""}`} disabled={pending} aria-busy={pending}>
      {pending ? (
        <>
          <Spinner />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

type ConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  className?: string;
  children: ReactNode;
  // Optionally skip the dialog (e.g. only confirm for destructive choices).
  shouldConfirm?: (form: HTMLFormElement) => boolean;
};

// A form that asks "are you sure?" in a modal before running its action.
export function ConfirmForm({
  action,
  title,
  message,
  confirmLabel = "Confirm",
  className,
  children,
  shouldConfirm,
}: ConfirmFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = useRef(false);
  const [open, setOpen] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }
    if (shouldConfirm && !shouldConfirm(e.currentTarget)) return;
    e.preventDefault();
    setOpen(true);
  }

  function confirm() {
    setOpen(false);
    confirmed.current = true;
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={action} className={className} onSubmit={onSubmit}>
        {children}
      </form>
      <Modal open={open} title={title} onClose={() => setOpen(false)}>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="btn btn-solid" onClick={confirm}>{confirmLabel}</button>
        </div>
      </Modal>
    </>
  );
}
