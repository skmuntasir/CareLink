import { forwardRef } from 'react';
import Field from './Field';
import { fieldClasses } from './fieldStyles';

const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', wrapperClassName = '', id, required, rows = 4, ...props },
  ref
) {
  return (
    <Field label={label} hint={hint} error={error} id={id} className={wrapperClassName} required={required && !!label}>
      {(fieldId) => (
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          className={fieldClasses(!!error, `resize-y leading-relaxed ${className}`)}
          {...props}
        />
      )}
    </Field>
  );
});

export default Textarea;
