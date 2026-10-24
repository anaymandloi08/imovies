import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Film, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="glass-card p-4 p-md-5 shadow-2xl">
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center gap-2 brand-font fs-2 text-white text-decoration-none mb-2">
                <Film className="text-danger" size={32} />
                <span>I<span className="text-danger">Movies</span></span>
              </Link>
              <h4 className="text-white fw-bold mb-1">Welcome Back</h4>
              <p className="text-muted small">Sign in to book tickets and manage reservations</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between">
                  <label className="form-label text-light small fw-semibold">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-cinema w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              <div className="p-3 bg-dark rounded border border-secondary border-opacity-25 small text-center mb-3">
                <div className="text-info fw-bold mb-1">Demo Credentials:</div>
                <div className="text-muted">User: <code className="text-light">user@imovies.com</code> / <code className="text-light">Password123!</code></div>
              </div>

              <div className="text-center text-muted small">
                Don't have an account?{' '}
                <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="text-danger fw-semibold text-decoration-none hover-white">
                  Create Account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
