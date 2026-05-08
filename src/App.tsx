import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { fetchAllowedOrigins } from './lib/api';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthUser {
  id: string;
  email: string;
}

const FALLBACK_RETURN_TO = 'https://planary.ch';

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function useAllowedOrigins() {
  const [origins, setOrigins] = useState<string[]>([]);

  useEffect(() => {
    let isActive = true;
    void fetchAllowedOrigins()
      .then((payload) => {
        if (isActive) {
          setOrigins(payload.appOrigins.map(normalizeOrigin));
        }
      })
      .catch(() => {
        if (isActive) {
          setOrigins([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return origins;
}

function resolveReturnTo(rawValue: string | null, allowedOrigins: string[]) {
  if (!rawValue) {
    return FALLBACK_RETURN_TO;
  }

  try {
    const url = new URL(rawValue);
    const normalizedOrigin = normalizeOrigin(url.origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return url.toString();
    }
  } catch {
    return FALLBACK_RETURN_TO;
  }

  return FALLBACK_RETURN_TO;
}

async function redirectWithSession(returnTo: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.refresh_token) {
    window.location.assign(returnTo);
    return;
  }

  const url = new URL(returnTo);
  url.hash = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  }).toString();
  window.location.assign(url.toString());
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Planary Auth
        </Link>
        <span className="badge">Shared Login</span>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

function AuthCard({
  mode,
  onAuthenticated,
  allowedOrigins,
}: {
  mode: AuthMode;
  onAuthenticated: (user: AuthUser) => void;
  allowedOrigins: string[];
}) {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const returnTo = useMemo(
    () => resolveReturnTo(searchParams.get('returnTo'), allowedOrigins),
    [allowedOrigins, searchParams],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.session?.user) {
          onAuthenticated({ id: data.session.user.id, email: data.session.user.email ?? email });
          await redirectWithSession(returnTo);
          return;
        }
        setMessage('Account created. Check your email to confirm and then return to your Planary app.');
      } else if (mode === 'login') {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (!data.user) throw new Error('No user returned from Supabase');
        onAuthenticated({ id: data.user.id, email: data.user.email ?? email });
        await redirectWithSession(returnTo);
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset?returnTo=${encodeURIComponent(returnTo)}`,
        });
        if (resetError) throw resetError;
        setMessage('Password reset email sent. Follow the link and return here to finish.');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  const heading =
    mode === 'login'
      ? 'Sign in to Planary'
      : mode === 'signup'
        ? 'Create your Planary account'
        : 'Reset your password';

  return (
    <section className="card">
      <p className="kicker">auth.planary.ch</p>
      <h1>{heading}</h1>
      <p className="lead">
        One account for every Planary app. Your session starts here and app data stays in each app’s own database.
      </p>
      <p className="return-to">After auth, you’ll go back to: {returnTo}</p>

      {message ? <p className="message success">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        {mode !== 'reset' ? (
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>
        ) : null}

        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting
            ? 'Working...'
            : mode === 'login'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Send reset email'}
        </button>
      </form>

      <div className="links">
        {mode !== 'login' ? <Link to={`/?returnTo=${encodeURIComponent(returnTo)}`}>Back to sign in</Link> : null}
        {mode !== 'signup' ? <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link> : null}
        {mode !== 'reset' ? <Link to={`/reset?returnTo=${encodeURIComponent(returnTo)}`}>Forgot password?</Link> : null}
      </div>
    </section>
  );
}

function ResetComplete({ allowedOrigins }: { allowedOrigins: string[] }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = useMemo(
    () => resolveReturnTo(searchParams.get('returnTo'), allowedOrigins),
    [allowedOrigins, searchParams],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Password updated. Redirecting you back to your app...');
      window.setTimeout(() => {
        void redirectWithSession(returnTo);
      }, 1200);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not update password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="card">
      <p className="kicker">Finish reset</p>
      <h1>Set a new password</h1>
      <p className="lead">Use a fresh password, then jump straight back into the Planary app you came from.</p>
      {message ? <p className="message success">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}
      <form onSubmit={handleSubmit} className="form">
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Save password'}
        </button>
      </form>
      <button className="secondary" onClick={() => navigate('/')}>
        Cancel
      </button>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const allowedOrigins = useAllowedOrigins();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      const sessionUser = data.session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? '' } : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email ?? '' } : null);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.title = 'Planary Auth';
  }, [location.pathname]);

  if (loading) {
    return (
      <AuthLayout>
        <section className="card">
          <h1>Loading auth session...</h1>
        </section>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Routes>
        <Route
          path="/"
          element={<AuthCard mode="login" onAuthenticated={setUser} allowedOrigins={allowedOrigins} />}
        />
        <Route
          path="/signup"
          element={<AuthCard mode="signup" onAuthenticated={setUser} allowedOrigins={allowedOrigins} />}
        />
        <Route
          path="/forgot-password"
          element={<Navigate to="/reset" replace />}
        />
        <Route
          path="/reset"
          element={<ResetComplete allowedOrigins={allowedOrigins} />}
        />
        <Route
          path="/success"
          element={
            <section className="card">
              <p className="kicker">Authenticated</p>
              <h1>You are signed in</h1>
              <p className="lead">{user ? `Signed in as ${user.email}.` : 'Session is active.'}</p>
            </section>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthLayout>
  );
}
