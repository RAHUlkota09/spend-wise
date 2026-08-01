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
    if (!form.name || !form.name.trim()) e.name = 'Please enter your name';
    if (!form.email || !form.email.trim()) e.email = 'Please enter an email or username';
    if (!form.password) e.password = 'Please enter a password';
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { 
      setErrors(e); 
      return; 
    }
    setLoading(true);
    try {
      let emailInput = form.email.trim();
      if (!emailInput.includes('@')) {
        emailInput = `${emailInput}@example.com`;
      }
      const { data } = await authAPI.register({
        name: form.name.trim(), 
        email: emailInput, 
        password: form.password,
      });
      login({ userId: data.userId || Date.now(), name: data.name || form.name, email: data.email || emailInput }, data.token || 'jwt-token');
      toast.success('Account created successfully! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
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
            <label className="form-label">Email or Username</label>
            <input type="text" className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com or john" value={form.email} onChange={set('email')} />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Create a password" value={form.password} onChange={set('password')} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} />
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
