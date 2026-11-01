import { HeartPulse, MessageSquareText, ShieldCheck } from 'lucide-react';
import Logo from '../Logo';
import ThemeToggle from '../ThemeToggle';

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified doctors', text: 'Every practitioner is reviewed and approved by our admin team.' },
  { icon: MessageSquareText, title: 'Secure consultations', text: 'Chat in real time and share files directly with your doctor.' },
  { icon: HeartPulse, title: 'Records & prescriptions', text: 'Track your vitals and keep every prescription in one place.' },
];

/** Split-screen layout shared by Login and Register. */
export default function AuthLayout({ children }) {
  return (
    <div className="app-bg flex min-h-screen">
      {/* Brand panel */}
      <aside className="relative hidden w-[46%] max-w-[640px] overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[110px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-accent-500/20 blur-[110px]" aria-hidden="true" />

        <div className="relative">
          <Logo size="md" onDark to="/" />
        </div>

        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Smarter healthcare.
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-300 bg-clip-text text-transparent">Connected care.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-300">
            Book trusted doctors, consult securely and manage your health records — all from one place.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="text-sm text-ink-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-500">© {new Date().getFullYear()} CareLink · CSE470 Project</p>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo size="sm" to="/" />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-md animate-slide-up">{children}</div>
        </div>
      </main>
    </div>
  );
}
