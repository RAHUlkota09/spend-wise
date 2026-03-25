import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

const today = () => new Date().toISOString().split('T')[0];

export default function AddExpensePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: '', amount: '', description: '', expenseDate: today(),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    expenseAPI.getById(id)
      .then(({ data }) => {
        setForm({
          category: data.category,
          amount: data.amount,
          description: data.description || '',
          expenseDate: data.expenseDate,
        });
      })
      .catch(() => {
        toast.error('Failed to load expense');
        navigate('/expenses');
      })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Category is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount > 0';
    if (!form.expenseDate) e.expenseDate = 'Date is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const payload = {
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description || null,
        expenseDate: form.expenseDate,
      };
      if (isEdit) {
        await expenseAPI.update(id, payload);
        toast.success('Expense updated!');
      } else {
        await expenseAPI.create(payload);
        toast.success('Expense added!');
      }
      navigate('/expenses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (ev) => {
    setForm(f => ({ ...f, [field]: ev.target.value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  if (fetching) return (
    <div style={{ display: 'grid', placeItems: 'center', height: 300, color: 'var(--text-muted)' }}>
      Loading expense…
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Link to="/expenses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
            ← Expenses
          </Link>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isEdit ? 'Edit' : 'Add'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          {isEdit ? '✏️  Edit Expense' : '＋  Add New Expense'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 2 }}>
          {isEdit ? 'Update the details below' : 'Fill in the details to record an expense'}
        </p>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={form.category}
                onChange={set('category')}
              >
                <option value="">— Select a category —</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem', pointerEvents: 'none'
                }}>₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.amount ? 'error' : ''}`}
                  style={{ paddingLeft: 30 }}
                  placeholder="0.00"
                  value={form.amount}
                  onChange={set('amount')}
                />
              </div>
              {errors.amount && <p className="form-error">{errors.amount}</p>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <textarea
                className="form-textarea"
                placeholder="What was this expense for?"
                value={form.description}
                onChange={set('description')}
                maxLength={500}
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className={`form-input ${errors.expenseDate ? 'error' : ''}`}
                value={form.expenseDate}
                max={today()}
                onChange={set('expenseDate')}
              />
              {errors.expenseDate && <p className="form-error">{errors.expenseDate}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading
                  ? (isEdit ? 'Updating…' : 'Adding…')
                  : (isEdit ? '✓  Update Expense' : '＋  Add Expense')}
              </button>
              <Link to="/expenses" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>

        {/* Category reference */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>
            Categories
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {CATEGORIES.map(c => (
              <span
                key={c}
                className={`badge badge-${c.toLowerCase()}`}
                style={{ cursor: 'pointer' }}
                onClick={() => { setForm(f => ({ ...f, category: c })); setErrors(e => ({ ...e, category: '' })); }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
