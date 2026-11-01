import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../Logo';
import Avatar from '../ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { NAV_BY_ROLE, ROLE_LABEL, isNavActive } from './nav';

export default function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo size="md" to="/dashboard" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">Menu</p>
        {items.map((item) => {
          const active = isNavActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-500/10 text-brand-text'
                  : 'text-muted hover:bg-fg/[0.05] hover:text-fg'
              )}
            >
              {active && (
                <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand-500" aria-hidden="true" />
              )}
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0 transition-colors',
                  active ? 'text-brand-text' : 'text-subtle group-hover:text-fg'
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="shrink-0 border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
              <p className="truncate text-xs text-muted">{ROLE_LABEL[user.role] || user.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-subtle transition-colors hover:bg-rose-500/10 hover:text-rose-500"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
