import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Field from './Field';
import { fieldClasses } from './fieldStyles';

const Select = forwardRef(function Select(
  { label, error, hint, children, className = '', wrapperClassName = '', id, required, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={wrapperClassName} required={required && !!label}>
      {(fieldId) => (
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={error ? true : undefined}
            className={fieldClasses(!!error, `appearance-none pr-10 ${className}`)}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            aria-hidden="true"
          />
        </div>
      )}
    </Field>
  );
});

export default Select;
