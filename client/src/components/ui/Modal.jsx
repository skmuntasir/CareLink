import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  hideClose = false,
  className = '',
}) {
  const panelRef = useRef(null);
  // Keep the latest onClose without re-running the open/close effect on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKey);

    // Lock background scroll while open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog
    const previouslyFocused = document.activeElement;
    const t = setTimeout(() => {
      const target = panelRef.current?.querySelector('[data-autofocus], input, textarea, select');
      (target || panelRef.current)?.focus();
    }, 30);

    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-950/60 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-pop-in flex-col rounded-t-3xl border border-line bg-surface shadow-lift focus:outline-none sm:rounded-3xl',
          SIZES[size] || SIZES.md,
          className
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6">
            <div className="min-w-0">
              {title && <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>}
              {description && <p className="mt-1 text-sm text-muted">{description}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 -mt-1 rounded-lg p-2 text-subtle transition-colors hover:bg-fg/[0.06] hover:text-fg"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
