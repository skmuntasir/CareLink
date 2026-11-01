import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { fieldClasses } from '../components/ui/fieldStyles';
import { cn } from '../utils/cn';

/**
 * App-wide feedback layer. Replaces window.alert / confirm / prompt:
 *
 *   const { toast, confirm, prompt } = useUI();
 *   toast.success('Saved');
 *   if (await confirm({ title: 'Delete?', tone: 'danger' })) { ... }
 *   const reason = await prompt({ title: 'Reject doctor', label: 'Reason', required: true });
 */
const UIContext = createContext(null);

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
};

const TOAST_STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-500' },
  error: { icon: XCircle, color: 'text-rose-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-500' },
  info: { icon: Info, color: 'text-sky-500' },
};

function ToastItem({ toast, onDismiss }) {
  const { icon: Icon, color } = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-2xl border border-line bg-surface/95 p-4 shadow-lift backdrop-blur-xl"
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', color)} aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words text-sm text-fg">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mr-1 -mt-1 rounded-lg p-1.5 text-subtle transition-colors hover:bg-fg/[0.06] hover:text-fg"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DialogHost({ dialog, onClose }) {
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset the input every time a new dialog opens
  useEffect(() => {
    setValue(dialog?.defaultValue || '');
    setTouched(false);
  }, [dialog]);

  if (!dialog) return null;

  const isPrompt = dialog.kind === 'prompt';
  const invalid = isPrompt && dialog.required && !value.trim();

  const submit = (e) => {
    e?.preventDefault();
    if (isPrompt) {
      setTouched(true);
      if (invalid) return;
      onClose(value.trim());
    } else {
      onClose(true);
    }
  };

  const confirmVariant = dialog.tone === 'danger' ? 'danger' : dialog.tone === 'warning' ? 'warning' : 'primary';

  return (
    <Modal
      open
      size="sm"
      title={dialog.title}
      description={isPrompt ? undefined : dialog.message}
      onClose={() => onClose(isPrompt ? null : false)}
      hideClose
      footer={
        <>
          <Button variant="secondary" onClick={() => onClose(isPrompt ? null : false)}>
            {dialog.cancelText || 'Cancel'}
          </Button>
          <Button variant={confirmVariant} onClick={submit} data-autofocus={!isPrompt ? true : undefined}>
            {dialog.confirmText || (isPrompt ? 'Submit' : 'Confirm')}
          </Button>
        </>
      }
    >
      {isPrompt && (
        <form onSubmit={submit} className="space-y-2">
          {dialog.message && <p className="text-sm text-muted">{dialog.message}</p>}
          {dialog.label && (
            <label htmlFor="ui-prompt-input" className="block text-sm font-medium text-fg">
              {dialog.label}
              {dialog.required && <span className="ml-0.5 text-rose-500">*</span>}
            </label>
          )}
          <textarea
            id="ui-prompt-input"
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dialog.placeholder}
            className={fieldClasses(touched && invalid, 'resize-none')}
          />
          {touched && invalid && <p className="text-xs text-rose-500">This field is required.</p>}
        </form>
      )}
    </Modal>
  );
}

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration = 4500) => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, message: String(message ?? '') }]);
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(
    () => ({
      success: (m, d) => push('success', m, d),
      error: (m, d) => push('error', m, d ?? 6000),
      info: (m, d) => push('info', m, d),
      warning: (m, d) => push('warning', m, d),
      dismiss,
    }),
    [push, dismiss]
  );

  const open = useCallback(
    (kind, opts) =>
      new Promise((resolve) => {
        // If a dialog is already open, cancel it first
        resolverRef.current?.(kind === 'prompt' ? null : false);
        resolverRef.current = resolve;
        setDialog({ kind, ...opts });
      }),
    []
  );

  const confirm = useCallback((opts) => open('confirm', opts), [open]);
  const prompt = useCallback((opts) => open('prompt', opts), [open]);

  const closeDialog = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const value = useMemo(() => ({ toast, confirm, prompt }), [toast, confirm, prompt]);

  return (
    <UIContext.Provider value={value}>
      {children}
      <DialogHost dialog={dialog} onClose={closeDialog} />
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] flex flex-col items-stretch gap-3 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-auto sm:w-[26rem]"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </UIContext.Provider>
  );
}
