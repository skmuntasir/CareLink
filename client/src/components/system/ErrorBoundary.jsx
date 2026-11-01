import React from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="app-bg flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lift">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <TriangleAlert className="h-7 w-7" />
          </span>
          <h2 className="font-display text-2xl font-semibold text-fg">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted">
            We hit an unexpected problem. Reloading the page usually fixes it.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <div className="mt-5 rounded-xl bg-surface-2 p-4 text-left">
              <p className="break-words font-mono text-xs text-rose-500">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted">Component stack</summary>
                  <pre className="mt-2 max-h-40 overflow-auto text-[11px] text-subtle">{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-b from-brand-400 to-brand-500 px-5 text-sm font-semibold text-ink-950 transition hover:from-brand-300 hover:to-brand-400"
          >
            <RefreshCw className="h-4 w-4" /> Reload page
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
