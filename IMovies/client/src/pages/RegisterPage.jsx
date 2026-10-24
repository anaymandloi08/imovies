import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Film, UserPlus, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register(name, email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Email may already be registered.'
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
              <h4 className="text-white fw-bold mb-1">Create Account</h4>
              <p className="text-muted small">Join IMovies for fast bookings and booking history</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-light small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-light small fw-semibold">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary border-opacity-50 text-secondary">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control bg-dark text-light border-secondary border-opacity-50"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <UserPlus size={18} />
                    <span>Create My Account</span>
                  </>
                )}
              </button>

              <div className="text-center text-muted small">
                Already have an account?{' '}
                <Link to={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="text-danger fw-semibold text-decoration-none hover-white">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
