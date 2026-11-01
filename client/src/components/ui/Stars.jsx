import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

// Read-only star display
export function Stars({ value = 0, size = 'h-4 w-4', className = '' }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${rounded} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(size, n <= rounded ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-subtle/50')}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

// Interactive rating input with hover preview
export function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="rounded-lg p-1 transition-transform duration-150 hover:scale-110"
          >
            <Star
              className={cn(
                'h-9 w-9 transition-colors',
                n <= active ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-subtle/50'
              )}
            />
          </button>
        ))}
      </div>
      <p className="mt-1 h-5 text-sm font-medium text-muted">{LABELS[active] || 'Select a rating'}</p>
    </div>
  );
}
