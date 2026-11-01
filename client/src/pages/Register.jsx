import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Stethoscope, User, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { cn } from '../utils/cn';

const ROLES = [
  { value: 'PATIENT', label: 'Patient', hint: 'Find doctors & book care', icon: UserRound },
  { value: 'DOCTOR', label: 'Doctor', hint: 'Offer consultations', icon: Stethoscope },
];

export default function Register() {
  const navigate = useNavigate();
  const { user, register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PATIENT' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already signed in → go straight to the app (submit handles its own navigation)
  if (user && !loading) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const created = await register(formData);
      // New doctors start by completing their professional profile
      navigate(created.role === 'DOCTOR' ? '/doctor/profile' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">Create your account</h2>
        <p className="mt-2 text-muted">Join CareLink as a patient or a doctor. Doctors require verification.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <Alert tone="danger">{error}</Alert>}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-fg">I am registering as</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, hint, icon: Icon }) => {
              const active = formData.role === value;
              return (
                <label
                  key={value}
                  className={cn(
                    'relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 transition-all',
                    active
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20'
                      : 'border-line bg-surface-2/40 hover:border-fg/20'
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={active}
                    onChange={() => setFormData({ ...formData, role: value })}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl',
                      active ? 'bg-brand-500 text-ink-950' : 'bg-fg/[0.06] text-muted'
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fg">{label}</span>
                    <span className="block text-xs text-muted">{hint}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {formData.role === 'DOCTOR' && (
            <p className="mt-2 text-xs text-brand-text">Doctors must submit a profile &amp; documents for verification.</p>
          )}
        </fieldset>

        <Input
          label="Full name"
          id="name"
          type="text"
          autoComplete="name"
          required
          icon={User}
          placeholder="Your full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

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
          autoComplete="new-password"
          required
          minLength={6}
          icon={Lock}
          placeholder="At least 6 characters"
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
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
