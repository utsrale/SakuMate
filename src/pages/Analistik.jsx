import { useMemo, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { format, differenceInDays, addDays } from 'date-fns';
import {
    filterByPeriod,
    getTotalIncome,
    getTotalExpense,
    getDailyData,
    formatRupiah,
    getCategoryById,
    calculateBalance,
} from '../utils/predictionEngine';
import './Analistik.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

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

    // ---- Future Balance Projection ----
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const [targetDate, setTargetDate] = useState('');

    const projection = useMemo(() => {
        if (!targetDate || transactions.length === 0) return null;
        const target = new Date(targetDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysAhead = differenceInDays(target, today);
        if (daysAhead <= 0) return null;

        // ---- LINEAR REGRESSION PROJECTION ----
        // 1. Get daily net flow for last 30 days
        const historyDays = 30;
        const daily = getDailyData(transactions, historyDays);

        // 2. Prepare data points (x = day index, y = cumulative balance change)
        // We want to find the trend of "daily balance change"
        // x=0 is 30 days ago, x=29 is today
        let cumulative = 0;
        const points = daily.map((d, i) => {
            cumulative += (d.income - d.expense);
            return { x: i, y: cumulative };
        });

        // 3. Calculate Least Squares Regression (y = mx + b)
        const n = points.length;
        const sumX = points.reduce((s, p) => s + p.x, 0);
        const sumY = points.reduce((s, p) => s + p.y, 0);
        const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
        const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

        // 4. Project future balance
        // Current balance is the starting point. 
        // We project "daysAhead" steps from now.
        // The slope represents "average daily net change" based on trend.
        const currentBalance = calculateBalance(transactions);
        const projectedChange = slope * daysAhead;
        const projectedBalance = currentBalance + projectedChange;

        // Avg stats for display (still useful context)
        const activeDays = daily.filter(d => d.expense > 0 || d.income > 0).length || 1;
        const avgDailyExpense = daily.reduce((s, d) => s + d.expense, 0) / activeDays;

        return { projectedBalance, daysAhead, avgDailyExpense, trend: slope };
    }, [targetDate, transactions]);

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

    // Doughnut chart data
    const doughnutData = useMemo(() => {
        if (catBreakdown.length === 0) return null;
        return {
            labels: catBreakdown.map(c => c.label),
            datasets: [{
                data: catBreakdown.map(c => c.amount),
                backgroundColor: catBreakdown.map(c => c.color),
                borderWidth: 0,
                hoverOffset: 6,
            }],
        };
    }, [catBreakdown]);

    const doughnutOpts = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                    label: (ctx) => ` ${formatRupiah(ctx.parsed)}`,
                },
            },
        },
    };

    // Daily bar chart
    const days = period === 'week' ? 7 : 14;
    const dailyData = useMemo(() => getDailyData(transactions, days), [transactions, days]);

    // Detect dark mode for chart tick colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const tickColor = isDark ? '#8a92a3' : '#9ba3b2';
    const gridColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';

    const barData = {
        labels: dailyData.map(d => d.label),
        datasets: [
            {
                label: 'Pemasukan',
                data: dailyData.map(d => d.income),
                backgroundColor: isDark ? 'rgba(29, 209, 161, 0.65)' : 'rgba(29, 209, 161, 0.75)',
                hoverBackgroundColor: 'rgba(29, 209, 161, 1)',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Pengeluaran',
                data: dailyData.map(d => d.expense),
                backgroundColor: isDark ? 'rgba(255, 107, 107, 0.65)' : 'rgba(255, 107, 107, 0.75)',
                hoverBackgroundColor: 'rgba(255, 107, 107, 1)',
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.85)',
                titleFont: { size: 12, weight: '600' },
                bodyFont: { size: 12 },
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: '500' }, color: tickColor },
                border: { display: false },
            },
            y: {
                grid: { color: gridColor, lineWidth: 1 },
                ticks: { display: false },
                border: { display: false },
            },
        },
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Analisis</h1>
            </div>

            {/* ===== FUTURE BALANCE PROJECTION ===== */}
            {transactions.length > 0 && (
                <div className="projection-card card">
                    <div className="projection-header">
                        <div>
                            <h3 className="projection-title">Proyeksi Saldo</h3>
                            <p className="projection-sub">Estimasi saldo di tanggal tertentu</p>
                        </div>
                        <span className="projection-badge">Beta</span>
                    </div>
                    <input
                        type="date"
                        className="input-field projection-input"
                        min={tomorrow}
                        value={targetDate}
                        onChange={e => setTargetDate(e.target.value)}
                    />
                    {projection && (
                        <div className="projection-result">
                            <div className="projection-result-row">
                                <span className="projection-label">Estimasi saldo</span>
                                <span className={`projection-value ${projection.projectedBalance >= 0 ? 'income-val' : 'expense-val'}`}>
                                    {projection.projectedBalance >= 0 ? '' : '-'}{formatRupiah(Math.abs(projection.projectedBalance))}
                                </span>
                            </div>
                            <div className="projection-meta">
                                <span>📊 {projection.daysAhead} hari ke depan</span>
                                <span>~{formatRupiah(projection.avgDailyExpense)}/hari keluar</span>
                            </div>
                            <p className="projection-disclaimer">* Estimasi menggunakan metode tren linear (regression)</p>
                        </div>
                    )}
                    {targetDate && !projection && (
                        <p className="projection-info">Pilih tanggal yang lebih dari hari ini</p>
                    )}
                </div>
            )}

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
                    <div className="chart-header">
                        <h3 className="chart-title">Tren Harian</h3>
                        <div className="chart-legend">
                            <span className="legend-item">
                                <span className="legend-dot income-dot" /> Masuk
                            </span>
                            <span className="legend-item">
                                <span className="legend-dot expense-dot" /> Keluar
                            </span>
                        </div>
                    </div>
                    <div className="bar-wrapper">
                        <Bar data={barData} options={barOpts} />
                    </div>
                </div>
            )}

            {/* Doughnut + Type Filter */}
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

            {/* Doughnut Chart */}
            {doughnutData && catBreakdown.length > 0 && (
                <div className="donut-section card">
                    <div className="donut-wrapper">
                        <Doughnut data={doughnutData} options={doughnutOpts} />
                        <div className="donut-center">
                            <span className="donut-total-label">Total</span>
                            <span className="donut-total-value">{formatRupiah(total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {catBreakdown.length === 0 ? (
                <div className="empty-state card">
                    <p className="empty-state-text">Belum ada data untuk periode ini</p>
                </div>
            ) : (
                <div className="cat-rows">
                    {catBreakdown.map((cat, i) => {
                        const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
                        const isIn = cat.type === 'income';
                        return (
                            <div key={i} className="cat-row card">
                                <div className="cat-row-left">
                                    <div className="cat-row-icon" style={{ background: `${cat.color}18` }}>
                                        {cat.emoji}
                                    </div>
                                    <div>
                                        <span className="cat-row-name">{cat.label}</span>
                                        <div className="cat-progress-bar">
                                            <div
                                                className="cat-progress-fill"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: cat.color,
                                                }}
                                            />
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
