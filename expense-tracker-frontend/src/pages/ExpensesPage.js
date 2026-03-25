import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];
const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CategoryBadge = ({ cat }) => (
  <span className={`badge badge-${cat?.toLowerCase()}`}>{cat}</span>
);

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await expenseAPI.getAll(filterCat || undefined);
      setExpenses(data);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [filterCat]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await expenseAPI.delete(deleteTarget.expenseId);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      fetchExpenses();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>All Expenses</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {expenses.length} record{expenses.length !== 1 ? 's' : ''} · Total: <strong style={{ color: 'var(--danger)' }}>₹{fmt(total)}</strong>
          </p>
        </div>
        <Link to="/expenses/add" className="btn btn-primary">＋ Add Expense</Link>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {filterCat && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterCat('')}>
            ✕ Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: 'grid', placeItems: 'center', height: 200, color: 'var(--text-muted)' }}>
            Loading…
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-sub">{filterCat ? `No expenses in "${filterCat}"` : 'Start by adding your first expense'}</div>
            <Link to="/expenses/add" className="btn btn-primary btn-sm">＋ Add Expense</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={exp.expenseId}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td><CategoryBadge cat={exp.category} /></td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description || '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem', whiteSpace: 'nowrap' }}>
                      {new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }} className="amount-red">₹{fmt(exp.amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <Link
                          to={`/expenses/edit/${exp.expenseId}`}
                          className="btn btn-success btn-sm btn-icon"
                          title="Edit"
                        >✏️</Link>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => setDeleteTarget(exp)}
                          title="Delete"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    Total ({expenses.length} items)
                  </td>
                  <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 700, borderTop: '1px solid var(--border)' }} className="amount-red">
                    ₹{fmt(total)}
                  </td>
                  <td style={{ borderTop: '1px solid var(--border)' }} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
            <div className="modal-title">Delete Expense?</div>
            <div className="modal-sub">
              This will permanently delete the <strong>{deleteTarget.category}</strong> expense of{' '}
              <strong className="amount-red">₹{fmt(deleteTarget.amount)}</strong>.
              This action cannot be undone.
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : '🗑 Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
