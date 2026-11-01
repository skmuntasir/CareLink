import { forwardRef } from 'react';
import Field from './Field';
import { fieldClasses } from './fieldStyles';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    className = '',
    wrapperClassName = '',
    icon: Icon,
    rightSlot,
    as: Component = 'input',
    id,
    required,
    ...props
  },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={wrapperClassName} required={required && !!label}>
      {(fieldId) => (
        <div className="relative">
          {Icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-subtle">
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
          )}
          <Component
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={error ? true : undefined}
            className={fieldClasses(!!error, cn(Icon && 'pl-10', rightSlot && 'pr-11', className))}
            {...props}
          />
          {rightSlot && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{rightSlot}</div>}
        </div>
      )}
    </Field>
  );
});

export default Input;
