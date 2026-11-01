import { Menu } from 'lucide-react';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';
import NotificationBell from '../notifications/NotificationBell';

const today = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Logo size="sm" to="/dashboard" />
        </div>
        <p className="hidden text-sm font-medium text-muted lg:block">{today()}</p>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
