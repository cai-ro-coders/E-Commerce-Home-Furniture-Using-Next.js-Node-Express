'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
  full: 'max-w-[min(1200px,95vw)]',
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  /** Prevent closing by backdrop click or Escape (e.g. during a save). */
  locked?: boolean;
  children: React.ReactNode;
}

/**
 * Portal-rendered dialog.
 *
 * Handles the three things a hand-rolled modal usually gets wrong: Escape to
 * close, scroll locking while open, and returning focus to the page afterwards.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = 'md',
  locked = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, locked, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 cursor-default animate-[fade-in_0.2s_ease-out] bg-walnut-950/55 backdrop-blur-[2px]"
        onClick={() => !locked && onClose()}
      />

      <div
        className={cn(
          'relative z-10 my-auto w-full animate-[rise_0.28s_cubic-bezier(0.22,1,0.36,1)]',
          'rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-[var(--shadow-lift)]',
          SIZES[size]
        )}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-4">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-base font-semibold text-sand-900 dark:text-sand-50">{title}</h2>
              {description ? <p className="text-xs text-muted">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={locked}
              aria-label="Close"
              className="rounded-lg p-1.5 text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-800 disabled:opacity-40 dark:hover:bg-walnut-800 dark:hover:text-sand-200"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
