import { useMemo } from 'react';
import {
    filterByPeriod,
    getTotalIncome,
    getTotalExpense,
    formatRupiah,
    getCategoryById,
    EXPENSE_CATEGORIES,
} from '../utils/predictionEngine';
import './Budget.css';

export default function Budget({ profile, transactions }) {

    const monthTx = useMemo(() => filterByPeriod(transactions, 'month'), [transactions]);
    const totalIn = getTotalIncome(monthTx);
    const totalOut = getTotalExpense(monthTx);
    const net = totalIn - totalOut;

    // Category breakdown (expenses only)
    const catBreakdown = useMemo(() => {
        const map = {};
        monthTx.filter(tx => tx.type === 'expense').forEach(tx => {
            map[tx.kategori] = (map[tx.kategori] || 0) + tx.nominal;
        });
        return Object.entries(map)
            .map(([id, amount]) => ({ ...getCategoryById(id, 'expense'), amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [monthTx]);

    // Income breakdown
    const incomeBreakdown = useMemo(() => {
        const map = {};
        monthTx.filter(tx => tx.type === 'income').forEach(tx => {
            map[tx.kategori] = (map[tx.kategori] || 0) + tx.nominal;
        });
        return Object.entries(map)
            .map(([id, amount]) => ({ ...getCategoryById(id, 'income'), amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [monthTx]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Rangkuman</h1>
                <p className="page-subtitle">Bulan ini</p>
            </div>

            {/* Net Flow Card */}
            <div className={`net-flow-card ${net >= 0 ? 'positive' : 'negative'}`}>
                <p className="nf-label">Selisih Bulan Ini</p>
                <h2 className="nf-amount">
                    {net >= 0 ? '+' : ''}{formatRupiah(net)}
                </h2>
                <p className="nf-sub">{net >= 0 ? '🎉 Lebih banyak yang masuk!' : '⚠️ Pengeluaran melebihi pemasukan'}</p>
            </div>

            {/* Income vs Expense Bar */}
            {(totalIn > 0 || totalOut > 0) && (
                <div className="flow-bar-wrap card">
                    <div className="flow-bar-labels">
                        <span className="flow-label-in">↑ Masuk</span>
                        <span className="flow-label-out">↓ Keluar</span>
                    </div>
                    <div className="flow-bar">
                        {totalIn > 0 && (
                            <div
                                className="flow-fill income-fill"
                                style={{ width: `${(totalIn / (totalIn + totalOut)) * 100}%` }}
                            />
                        )}
                        {totalOut > 0 && (
                            <div
                                className="flow-fill expense-fill"
                                style={{ width: `${(totalOut / (totalIn + totalOut)) * 100}%` }}
                            />
                        )}
                    </div>
                    <div className="flow-bar-amounts">
                        <span className="income-val">+{formatRupiah(totalIn)}</span>
                        <span className="expense-val">-{formatRupiah(totalOut)}</span>
                    </div>
                </div>
            )}

            {/* Expense Breakdown */}
            {catBreakdown.length > 0 && (
                <>
                    <div className="section-header">
                        <h3>Pengeluaran per Kategori</h3>
                    </div>
                    <div className="breakdown-list">
                        {catBreakdown.map(cat => {
                            const pct = totalOut > 0 ? Math.round((cat.amount / totalOut) * 100) : 0;
                            return (
                                <div key={cat.id} className="breakdown-item card">
                                    <div className="bi-left">
                                        <span className="bi-emoji">{cat.emoji}</span>
                                        <div>
                                            <span className="bi-name">{cat.label}</span>
                                            <div className="progress-bar" style={{ width: '120px', height: '4px' }}>
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bi-right">
                                        <span className="bi-amount expense-val">-{formatRupiah(cat.amount)}</span>
                                        <span className="bi-pct">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Income Breakdown */}
            {incomeBreakdown.length > 0 && (
                <>
                    <div className="section-header">
                        <h3>Pemasukan per Sumber</h3>
                    </div>
                    <div className="breakdown-list">
                        {incomeBreakdown.map(cat => {
                            const pct = totalIn > 0 ? Math.round((cat.amount / totalIn) * 100) : 0;
                            return (
                                <div key={cat.id} className="breakdown-item card">
                                    <div className="bi-left">
                                        <span className="bi-emoji">{cat.emoji}</span>
                                        <div>
                                            <span className="bi-name">{cat.label}</span>
                                            <div className="progress-bar" style={{ width: '120px', height: '4px' }}>
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: cat.color }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bi-right">
                                        <span className="bi-amount income-val">+{formatRupiah(cat.amount)}</span>
                                        <span className="bi-pct">{pct}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {monthTx.length === 0 && (
                <div className="empty-state card">
                    <span className="empty-state-icon">📊</span>
                    <p className="empty-state-text">Belum ada transaksi bulan ini</p>
                </div>
            )}
        </div>
    );
}
