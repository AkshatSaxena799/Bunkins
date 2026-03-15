import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block' }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password, fullName);
      } else if (mode === 'forgot') {
        // Placeholder — would call forgot-password API
        setForgotSent(true);
        setLoading(false);
        return;
      }
      onClose();
    } catch (err) {
      const message = err.message || 'Something went wrong';
      if (mode === 'register' && /already exists|already registered/i.test(message)) {
        setError('This email already has an account. Please sign in instead.');
        setMode('login');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForgotSent(false);
  };

  return (
    <>
      <div className="modal-backdrop auth-modal-backdrop" onClick={onClose} />
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label="Sign in to Bunkins">
        {/* Header illustration */}
        <div className="auth-modal-hero">
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
          <div className="auth-modal-clouds" aria-hidden="true">
            <span className="auth-cloud auth-cloud-1" />
            <span className="auth-cloud auth-cloud-2" />
            <span className="auth-cloud auth-cloud-3" />
          </div>
          <img
            src="/bunkins-logo.png"
            alt="Bunkins"
            className="auth-modal-logo"
          />
          <p className="auth-modal-hero-tagline">
            {mode === 'register' ? 'Join the Bunkins family! 🌟' : mode === 'forgot' ? 'Reset your password' : 'Welcome back! 👋'}
          </p>
        </div>

        {/* Body */}
        <div className="auth-modal-body">
          {/* Tab switcher */}
          {mode !== 'forgot' && (
            <div className="auth-tabs">
              <button
                className={`auth-tab${mode === 'login' ? ' active' : ''}`}
                onClick={() => switchMode('login')}
              >Sign In</button>
              <button
                className={`auth-tab${mode === 'register' ? ' active' : ''}`}
                onClick={() => switchMode('register')}
              >Create Account</button>
            </div>
          )}

          {/* Forgot Password sent */}
          {mode === 'forgot' && forgotSent ? (
            <div className="auth-forgot-success">
              <span style={{ fontSize: '2.5rem' }}>📬</span>
              <h3>Check your inbox!</h3>
              <p>We've sent a password reset link to <strong>{email}</strong>.</p>
              <button className="auth-link-btn" onClick={() => switchMode('login')}>← Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <div className="auth-field">
                  <label htmlFor="auth-name">Full Name</label>
                  <div className="auth-input-wrap">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      className="auth-input"
                      placeholder="Your name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="auth-email">Email</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="auth-email"
                    type="email"
                    className="auth-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="auth-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="auth-password">Password</label>
                    {mode === 'login' && (
                      <button type="button" className="auth-link-btn" onClick={() => switchMode('forgot')}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === 'login' ? (
                  <><Sparkles size={15} /> Sign In</>
                ) : mode === 'register' ? (
                  <><Sparkles size={15} /> Create Account</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {mode === 'forgot' && (
                <button type="button" className="auth-link-btn" style={{ display: 'block', marginTop: 12 }} onClick={() => switchMode('login')}>
                  ← Back to Sign In
                </button>
              )}
            </form>
          )}

          {/* Google OAuth placeholder */}
          {mode !== 'forgot' && (
            <>
              <div className="auth-divider"><span>or</span></div>
              <button
                type="button"
                className="auth-google-btn"
                onClick={() => alert('Google sign-in coming soon!')}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

