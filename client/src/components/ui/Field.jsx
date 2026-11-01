import { useId } from 'react';
import { cn } from '../../utils/cn';

// Label + control + hint/error wrapper. `children` receives the generated id.
export default function Field({ label, hint, error, id, className = '', children, required }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-fg">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children(fieldId)}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-subtle">{hint}</p>
      )}
    </div>
  );
}
