import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters';
    if (form.username.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) return 'Username: only letters, numbers, _ and .';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    const users = JSON.parse(localStorage.getItem('cliqd_users') || '{}');
    if (Object.values(users).find(u => u.email === form.email)) return 'Email already registered';
    if (Object.values(users).find(u => u.username === form.username)) return 'Username already taken';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validateForm();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg">
          <div className="auth-orb auth-orb1" />
          <div className="auth-orb auth-orb2" />
        </div>
        <div className="auth-card fade-in">
          <div className="auth-logo">
            <span className="logo-mark">C</span>
            <span className="logo-text">cliqd</span>
          </div>
          <div className="success-screen">
            <div className="success-icon">🎉</div>
            <h1 className="auth-title">Welcome to Cliqd!</h1>
            <p className="auth-subtitle">Hey {form.name}, your account is ready.</p>
            <div className="success-spinner"><div className="spinner" /></div>
            <p style={{ color: 'var(--text3)', fontSize: '0.82rem', marginTop: '8px' }}>Redirecting you to the app...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb1" />
        <div className="auth-orb auth-orb2" />
      </div>
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <span className="logo-mark">C</span>
          <span className="logo-text">cliqd</span>
        </div>
        <h1 className="auth-title">Join Cliqd</h1>
        <p className="auth-subtitle">Tag products. Share style. Connect.</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" className="input-field" placeholder="Your name"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">@</span>
                <input
                  type="text" className="input-field with-prefix" placeholder="username"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })} required
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" className="input-field" placeholder="Min. 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Creating account...</> : 'Create Account →'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}


