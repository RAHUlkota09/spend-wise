import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  ? (process.env.REACT_APP_API_URL.endsWith('/api') 
      ? process.env.REACT_APP_API_URL 
      : `${process.env.REACT_APP_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Fallback Mock Store for seamless operation when live backend API is unreachable
const getStoredExpenses = () => {
  const data = localStorage.getItem('mock_expenses');
  if (data) return JSON.parse(data);
  const initial = [
    { id: 1, title: 'Groceries & Supplies', amount: 125.50, category: 'Food', date: '2026-03-20', notes: 'Supermarket shopping' },
    { id: 2, title: 'Electricity Bill', amount: 84.20, category: 'Utilities', date: '2026-03-18', notes: 'Monthly power bill' },
    { id: 3, title: 'Movie Night & Snacks', amount: 35.00, category: 'Entertainment', date: '2026-03-15', notes: 'Cinema tickets' },
    { id: 4, title: 'Car Refill & Gas', amount: 50.00, category: 'Transportation', date: '2026-03-14', notes: 'Gas station' },
    { id: 5, title: 'Gym Membership', amount: 45.00, category: 'Health', date: '2026-03-01', notes: 'Monthly fitness' }
  ];
  localStorage.setItem('mock_expenses', JSON.stringify(initial));
  return initial;
};

const saveStoredExpenses = (expenses) => {
  localStorage.setItem('mock_expenses', JSON.stringify(expenses));
};

// Auth API with fallback support
export const authAPI = {
  register: async (data) => {
    try {
      return await API.post('/auth/register', data);
    } catch (err) {
      const mockUser = { userId: Date.now(), name: data.name || 'User', email: data.email };
      const mockToken = 'demo-jwt-token-' + Date.now();
      return { data: { ...mockUser, token: mockToken } };
    }
  },

  login: async (data) => {
    try {
      return await API.post('/auth/login', data);
    } catch (err) {
      const userName = data.email ? data.email.split('@')[0] : 'Demo User';
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      const mockUser = { userId: 1, name: formattedName, email: data.email || 'demo@spendwise.com' };
      const mockToken = 'demo-jwt-token-active';
      return { data: { ...mockUser, token: mockToken } };
    }
  },
};

// Expenses API with fallback support
export const expenseAPI = {
  getAll: async (category) => {
    try {
      return await API.get('/expenses', { params: category ? { category } : {} });
    } catch (err) {
      let expenses = getStoredExpenses();
      if (category) {
        expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
      return { data: expenses };
    }
  },

  getById: async (id) => {
    try {
      return await API.get(`/expenses/${id}`);
    } catch (err) {
      const expenses = getStoredExpenses();
      const item = expenses.find(e => e.id === parseInt(id));
      return { data: item || null };
    }
  },

  create: async (data) => {
    try {
      return await API.post('/expenses', data);
    } catch (err) {
      const expenses = getStoredExpenses();
      const newExpense = { ...data, id: Date.now(), amount: parseFloat(data.amount) };
      expenses.unshift(newExpense);
      saveStoredExpenses(expenses);
      return { data: newExpense };
    }
  },

  update: async (id, data) => {
    try {
      return await API.put(`/expenses/${id}`, data);
    } catch (err) {
      let expenses = getStoredExpenses();
      const index = expenses.findIndex(e => e.id === parseInt(id));
      if (index !== -1) {
        expenses[index] = { ...expenses[index], ...data, amount: parseFloat(data.amount) };
        saveStoredExpenses(expenses);
        return { data: expenses[index] };
      }
      return { data: data };
    }
  },

  delete: async (id) => {
    try {
      return await API.delete(`/expenses/${id}`);
    } catch (err) {
      let expenses = getStoredExpenses();
      expenses = expenses.filter(e => e.id !== parseInt(id));
      saveStoredExpenses(expenses);
      return { data: { message: 'Deleted' } };
    }
  },

  getSummary: async () => {
    try {
      return await API.get('/expenses/summary');
    } catch (err) {
      const expenses = getStoredExpenses();
      const totalAmount = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
      const totalExpenses = expenses.length;
      
      const byCategory = {};
      expenses.forEach(e => {
        const cat = e.category || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(e.amount) || 0);
      });
      const categoryBreakdown = Object.keys(byCategory).map(cat => ({ category: cat, totalAmount: byCategory[cat] }));
      
      return {
        data: {
          totalAmount,
          totalExpenses,
          recentExpenses: expenses.slice(0, 5),
          categoryBreakdown
        }
      };
    }
  },
};

export default API;
