import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

// One-click demo accounts shown under the sign-in button.
const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@gmail.com', password: 'Admin@123' },
  { label: 'Patient', email: 'patient@gmail.com', password: 'Patient@123' },
  { label: 'Doctor', email: 'doctor@gmail.com', password: 'Doctor@123' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = location.state?.from?.pathname;
  const destination = redirectTo && redirectTo !== '/login' ? redirectTo : '/dashboard';

  // Already signed in (e.g. opened /login while logged in) → go straight to the app.
  // While a submit is in flight, handleSubmit performs the navigation instead.
  if (user && !loading) return <Navigate to={destination} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">Welcome back</h2>
        <p className="mt-2 text-muted">Sign in to continue to your CareLink workspace.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate={false}>
        {error && <Alert tone="danger">{error}</Alert>}

        <Input
          label="Email address"
          id="email"
          type="email"
          autoComplete="email"
          required
          icon={Mail}
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Password"
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          required
          icon={Lock}
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg p-2 text-subtle transition-colors hover:text-fg"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          }
        />

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-dashed border-line p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-subtle">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Demo
        </p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.label}
              type="button"
              onClick={() => {
                setError('');
                setFormData({ email: acc.email, password: acc.password });
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-left text-xs transition-colors hover:border-brand-500/50"
            >
              <span className="font-semibold text-fg">{acc.label}</span>
              <span className="truncate text-subtle">
                {acc.email} · {acc.password}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-subtle">Click an account to fill the form, then press Sign in.</p>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-text hover:underline">
          Create one
        </Link>
      </p>

    </AuthLayout>
  );
}
