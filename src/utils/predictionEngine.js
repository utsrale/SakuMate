// ========== FINANCE ENGINE ==========
// Kalkulasi untuk income+expense tracker

import { format, startOfDay, startOfWeek, startOfMonth, subDays, isAfter } from 'date-fns';

// ==================== BALANCE ====================

/**
 * Hitung saldo dari semua transaksi
 * Saldo = Σ income - Σ expense
 */
export function calculateBalance(transactions) {
  return transactions.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + tx.nominal : sum - tx.nominal;
  }, 0);
}

/**
 * Hitung total pemasukan dalam periode
 */
export function getTotalIncome(transactions) {
  return transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.nominal, 0);
}

/**
 * Hitung total pengeluaran dalam periode
 */
export function getTotalExpense(transactions) {
  return transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.nominal, 0);
}

// ==================== PERIOD FILTER ====================

export function filterByPeriod(transactions, period) {
  const now = new Date();
  return transactions.filter(tx => {
    const d = new Date(tx.timestamp);
    if (period === 'week') return d >= startOfWeek(now, { weekStartsOn: 1 });
    if (period === 'month') return d >= startOfMonth(now);
    if (period === 'today') return d >= startOfDay(now);
    return true; // 'all'
  });
}

// ==================== DAILY DATA ====================

/**
 * Daily net flow data for chart (income - expense per day)
 */
export function getDailyData(transactions, days = 14) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTx = transactions.filter(tx =>
      format(new Date(tx.timestamp), 'yyyy-MM-dd') === dateStr
    );
    const income = dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.nominal, 0);
    const expense = dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.nominal, 0);
    result.push({ label: format(date, 'dd/MM'), income, expense, net: income - expense, date: dateStr });
  }
  return result;
}

// ==================== FORMAT ====================

export function formatRupiah(amount) {
  const abs = Math.abs(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(abs);
}

export function formatRupiahSigned(amount) {
  const prefix = amount >= 0 ? '+' : '-';
  return `${prefix}${formatRupiah(Math.abs(amount))}`;
}

// ==================== CATEGORIES ====================

export const EXPENSE_CATEGORIES = [
  { id: 'makan', label: 'Makan', emoji: '🍜', color: '#ff6b6b' },
  { id: 'transport', label: 'Transport', emoji: '🚌', color: '#feca57' },
  { id: 'nongkrong', label: 'Nongkrong', emoji: '☕', color: '#48dbfb' },
  { id: 'belanja', label: 'Belanja', emoji: '🛍️', color: '#ff9ff3' },
  { id: 'tagihan', label: 'Tagihan', emoji: '📱', color: '#54a0ff' },
  { id: 'pendidikan', label: 'Pendidikan', emoji: '📚', color: '#5f27cd' },
  { id: 'kesehatan', label: 'Kesehatan', emoji: '💊', color: '#00d2d3' },
  { id: 'hiburan', label: 'Hiburan', emoji: '🎮', color: '#a29bfe' },
  { id: 'lainnya', label: 'Lainnya', emoji: '📦', color: '#b2bec3' },
];

export const INCOME_CATEGORIES = [
  { id: 'kiriman', label: 'Kiriman', emoji: '💸', color: '#1dd1a1' },
  { id: 'gaji', label: 'Gaji', emoji: '💼', color: '#00b894' },
  { id: 'freelance', label: 'Freelance', emoji: '💻', color: '#00cec9' },
  { id: 'beasiswa', label: 'Beasiswa', emoji: '🎓', color: '#6c5ce7' },
  { id: 'jual', label: 'Jual Barang', emoji: '🛒', color: '#fdcb6e' },
  { id: 'investasi', label: 'Investasi', emoji: '📈', color: '#55efc4' },
  { id: 'hadiah', label: 'Hadiah', emoji: '🎁', color: '#fd79a8' },
  { id: 'lainnya_in', label: 'Lainnya', emoji: '✨', color: '#74b9ff' },
];

// Keep backward compat
export const CATEGORIES = EXPENSE_CATEGORIES;

export function getCategoryById(id, type = 'expense') {
  const pool = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return pool.find(c => c.id === id) || (type === 'income' ? INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1] : EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]);
}
