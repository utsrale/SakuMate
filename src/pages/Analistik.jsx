import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
} from 'chart.js';
import { format, subDays, startOfWeek, startOfMonth } from 'date-fns';
import {
    filterByPeriod,
    getTotalIncome,
    getTotalExpense,
    getDailyData,
    formatRupiah,
    getCategoryById,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
} from '../utils/predictionEngine';
import './Analistik.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const PERIODS = [
    { id: 'week', label: 'Minggu Ini' },
    { id: 'month', label: 'Bulan Ini' },
    { id: 'all', label: 'Semua' },
];

const TYPES = [
    { id: 'all', label: 'Semua' },
    { id: 'expense', label: 'Pengeluaran' },
    { id: 'income', label: 'Pemasukan' },
];

export default function Analistik({ transactions }) {
    const [period, setPeriod] = useState('month');
    const [viewType, setViewType] = useState('all');

    const periodTx = useMemo(() => filterByPeriod(transactions, period), [transactions, period]);

    const filteredTx = useMemo(() => {
        if (viewType === 'all') return periodTx;
        return periodTx.filter(tx => tx.type === viewType);
    }, [periodTx, viewType]);

    const totalIn = useMemo(() => getTotalIncome(periodTx), [periodTx]);
    const totalOut = useMemo(() => getTotalExpense(periodTx), [periodTx]);

    // Category breakdown
    const catBreakdown = useMemo(() => {
        const map = {};
        filteredTx.forEach(tx => {
            const key = `${tx.type}_${tx.kategori}`;
            if (!map[key]) map[key] = { ...getCategoryById(tx.kategori, tx.type), type: tx.type, amount: 0 };
            map[key].amount += tx.nominal;
        });
        return Object.values(map).sort((a, b) => b.amount - a.amount);
    }, [filteredTx]);

    const total = filteredTx.reduce((s, tx) => s + tx.nominal, 0);

    // Daily bar chart
    const days = period === 'week' ? 7 : 14;
    const dailyData = useMemo(() => getDailyData(transactions, days), [transactions, days]);

    const barData = {
        labels: dailyData.map(d => d.label),
        datasets: [
            {
                label: 'Pemasukan',
                data: dailyData.map(d => d.income),
                backgroundColor: 'rgba(29, 209, 161, 0.7)',
                borderRadius: 4,
            },
            {
                label: 'Pengeluaran',
                data: dailyData.map(d => d.expense),
                backgroundColor: 'rgba(255, 107, 107, 0.7)',
                borderRadius: 4,
            },
        ],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
            y: { display: false },
        },
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Analisis</h1>
            </div>

            {/* Period Tabs */}
            <div className="period-tabs">
                {PERIODS.map(p => (
                    <button
                        key={p.id}
                        className={`period-tab ${period === p.id ? 'active' : ''}`}
                        onClick={() => setPeriod(p.id)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Income/Expense Summary */}
            <div className="stats-row">
                <div className="stat-box">
                    <span className="stat-sign income-val">↑</span>
                    <span className="stat-amount income-val">{formatRupiah(totalIn)}</span>
                    <span className="stat-label-sm">Pemasukan</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-box">
                    <span className="stat-sign expense-val">↓</span>
                    <span className="stat-amount expense-val">{formatRupiah(totalOut)}</span>
                    <span className="stat-label-sm">Pengeluaran</span>
                </div>
            </div>

            {/* Bar Chart */}
            {transactions.length > 0 && (
                <div className="chart-section card">
                    <div className="chart-legend">
                        <span className="legend-dot income-dot" /> Masuk
                        <span className="legend-dot expense-dot" style={{ marginLeft: 12 }} /> Keluar
                    </div>
                    <div className="bar-wrapper">
                        <Bar data={barData} options={barOpts} />
                    </div>
                </div>
            )}

            {/* Type filter tabs */}
            <div className="type-filter-tabs">
                {TYPES.map(t => (
                    <button
                        key={t.id}
                        className={`type-filter-tab ${viewType === t.id ? 'active' : ''}`}
                        onClick={() => setViewType(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Category Breakdown */}
            {catBreakdown.length === 0 ? (
                <div className="empty-state card">
                    <span className="empty-state-icon">📊</span>
                    <p className="empty-state-text">Belum ada data</p>
                </div>
            ) : (
                <div className="cat-rows">
                    {catBreakdown.map((cat, i) => {
                        const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
                        const isIn = cat.type === 'income';
                        return (
                            <div key={i} className="cat-row card">
                                <div className="cat-row-left">
                                    <div className={`cat-row-icon ${isIn ? 'icon-income' : 'icon-expense'}`}>
                                        {cat.emoji}
                                    </div>
                                    <div>
                                        <span className="cat-row-name">{cat.label}</span>
                                        <div className="progress-bar" style={{ width: '100px', height: '3px', marginTop: '4px' }}>
                                            <div className="progress-fill" style={{ width: `${pct}%`, background: isIn ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="cat-row-right">
                                    <span className={`cat-row-amount ${isIn ? 'income-val' : 'expense-val'}`}>
                                        {isIn ? '+' : '-'}{formatRupiah(cat.amount)}
                                    </span>
                                    <span className="cat-row-pct">{pct}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
