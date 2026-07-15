import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

export default function ResetPassword() {
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    // Supabase redirects expired/already-used recovery links back here with
    // the failure reason in the hash fragment (e.g. #error=access_denied&error_code=otp_expired).
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('error')) {
      setLinkInvalid(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          on<span className="auth-logo-dot">·</span>track
        </Link>
        <h2 className="auth-title">Set a new password</h2>
        {!linkInvalid && <p className="auth-sub">Choose a new password for your account.</p>}

        {linkInvalid ? (
          <div className="auth-success">
            <p>This reset link is invalid or has expired.</p>
            <p>
              <Link to="/forgot-password">Request a new one</Link>.
            </p>
          </div>
        ) : done ? (
          <div className="auth-success">
            <p>Your password has been updated.</p>
            <p>
              <Link to="/login">Sign in</Link> with your new password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-label">
              New password
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                autoFocus
              />
            </label>
            <label className="auth-label">
              Confirm new password
              <input
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
