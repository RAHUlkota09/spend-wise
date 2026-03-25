import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.register({
        name: form.name, email: form.email, password: form.password,
      });
      login({ userId: data.userId, name: data.name, email: data.email }, data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💸</div>
          <span className="auth-logo-text">SpendWise</span>
        </div>

        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start tracking your expenses for free</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Doe" value={form.name} onChange={set('name')} autoFocus />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Creating account…' : '→  Create Account'}
          </button>
        </form>

        <div className="divider" style={{ marginTop: 24 }}>or</div>
        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
