import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, limit, total, onChange, noun = 'results' }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-5 sm:flex-row">
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-fg">{from}–{to}</span> of{' '}
        <span className="font-medium text-fg">{total}</span> {noun}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1} icon={ChevronLeft}>
          Previous
        </Button>
        <span className="px-2 text-sm tabular-nums text-muted">
          {page} / {pages}
        </span>
        <Button variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pages}>
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
