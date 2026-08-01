import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email || !form.email.trim()) {
      e.email = 'Please enter your email or username';
    }
    if (!form.password) {
      e.password = 'Please enter your password';
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
      const { data } = await authAPI.login({ email: emailInput, password: form.password });
      login({ userId: data.userId || 1, name: data.name || 'User', email: data.email || emailInput }, data.token || 'jwt-token');
      toast.success(`Welcome back, ${data.name || 'User'}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Please try again.');
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account to manage your expenses</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com or admin"
              value={form.email}
              onChange={set('email')}
              autoFocus
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={set('password')}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in…' : '→  Sign In'}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary btn-full" 
            style={{ 
              marginTop: 12, 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15))', 
              color: '#38bdf8', 
              border: '1px solid rgba(56, 189, 248, 0.3)', 
              padding: '12px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              login({ userId: 1, name: 'Rahul (Demo User)', email: 'demo@spendwise.com' }, 'demo-jwt-token-active');
              toast.success('Welcome to SpendWise Demo! 🎉');
              navigate('/dashboard');
            }}
          >
            ⚡ Quick Demo Sign In (1-Click Access)
          </button>
        </form>

        <div className="divider" style={{ marginTop: 24 }}>or</div>
        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
