import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Food: '#f59e0b', Travel: '#6366f1', Shopping: '#ec4899',
  Bills: '#0ea5e9', Entertainment: '#a855f7', Health: '#10b981',
  Education: '#f97316', Other: '#64748b',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CategoryBadge = ({ cat }) => (
  <span className={`badge badge-${cat?.toLowerCase()}`}>{cat}</span>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expenseAPI.getSummary()
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: 300, color: 'var(--text-muted)' }}>
      Loading dashboard…
    </div>
  );

  const pieData = summary?.categoryBreakdown
    ? Object.entries(summary.categoryBreakdown).map(([name, value]) => ({ name, value: Number(value) }))
    : [];

  const barData = summary?.recentExpenses?.map(e => ({
    name: e.category,
    amount: Number(e.amount),
  })) || [];

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>
            Good day, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Here's your expense overview</p>
        </div>
        <Link to="/expenses/add" className="btn btn-primary">＋ Add Expense</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">₹{fmt(summary?.totalExpenses)}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card monthly">
          <div className="stat-label">This Month</div>
          <div className="stat-value">₹{fmt(summary?.monthlyExpenses)}</div>
          <div className="stat-sub">Current month</div>
        </div>
        <div className="stat-card count">
          <div className="stat-label">Categories</div>
          <div className="stat-value">{pieData.length}</div>
          <div className="stat-sub">Active categories</div>
        </div>
      </div>

      {/* Charts + Recent */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Pie Chart */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Spending by Category</span>
          </div>
          {pieData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🥧</div>
              <div className="empty-title">No data yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                     paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`₹${fmt(v)}`, 'Amount']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          {pieData.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {pieData.map(e => (
                <span key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[e.name] || '#64748b', display: 'inline-block' }} />
                  {e.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Recent Spending</span>
          </div>
          {barData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-title">No expenses yet</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  formatter={(v) => [`₹${fmt(v)}`, 'Amount']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent expenses table */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Recent Expenses</span>
          <Link to="/expenses" className="btn btn-secondary btn-sm">View All →</Link>
        </div>
        {!summary?.recentExpenses?.length ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No expenses yet</div>
            <div className="empty-sub">Start adding your daily expenses to track them here</div>
            <Link to="/expenses/add" className="btn btn-primary btn-sm">＋ Add First Expense</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentExpenses.map(exp => (
                  <tr key={exp.expenseId}>
                    <td><CategoryBadge cat={exp.category} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{exp.description || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
                      {new Date(exp.expenseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }} className="amount-red">₹{fmt(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
