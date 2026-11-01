import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500/10 text-brand-text">
        <Compass className="h-10 w-10" aria-hidden="true" />
      </span>
      <p className="font-display text-6xl font-semibold tracking-tight text-fg">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold text-fg">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you’re looking for doesn’t exist or has been moved.</p>
      <Button as={Link} to="/dashboard" className="mt-8" size="lg">
        Back to dashboard
      </Button>
    </div>
  );
}
