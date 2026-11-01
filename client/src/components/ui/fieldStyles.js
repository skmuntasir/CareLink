import { cn } from '../../utils/cn';

// Shared look for text-like controls
export const fieldClasses = (hasError, extra = '') =>
  cn(
    'block w-full rounded-xl border bg-surface-2/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-subtle',
    'transition-colors duration-150 focus:outline-none focus:ring-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    hasError
      ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/25'
      : 'border-line hover:border-fg/20 focus:border-brand-500 focus:ring-brand-500/25',
    extra
  );
