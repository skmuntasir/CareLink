import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '../utils/cn';

// index.html applies the saved theme (default: dark) before first paint,
// so the <html> class is the source of truth.
const readInitial = () => document.documentElement.classList.contains('dark');

export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(readInitial);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-muted transition-colors hover:bg-fg/[0.06] hover:text-fg',
        className
      )}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
