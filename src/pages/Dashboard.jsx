import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { IoChevronForward, IoArrowUp, IoArrowDown, IoTrophyOutline } from 'react-icons/io5';
import {
    calculateBalance,
    getTotalIncome,
    getTotalExpense,
    filterByPeriod,
    formatRupiah,
    getCategoryById,
} from '../utils/predictionEngine';
import './Dashboard.css';

const STREAK_MILESTONES = [
    { days: 100, emoji: '💎', label: 'Legenda' },
    { days: 30, emoji: '🏆', label: 'Konsisten' },
    { days: 7, emoji: '🔥', label: 'On Fire' },
    { days: 3, emoji: '⭐', label: 'Semangat' },
];

function getMilestone(count) {
    return STREAK_MILESTONES.find(m => count >= m.days) || null;
}

export default function Dashboard({ profile, transactions, goals, streak, showToast }) {
    const navigate = useNavigate();

    const monthTx = useMemo(() => filterByPeriod(transactions, 'month'), [transactions]);
    const balance = useMemo(() => calculateBalance(transactions), [transactions]);
    const monthIncome = useMemo(() => getTotalIncome(monthTx), [monthTx]);
    const monthExpense = useMemo(() => getTotalExpense(monthTx), [monthTx]);
    const monthNet = monthIncome - monthExpense;

    const recentTx = transactions.slice(0, 5);
    const todayStr = format(new Date(), 'EEEE, dd MMMM yyyy', { locale: id });

    // Goals preview — top 2 incomplete
    const activeGoals = (goals || [])
        .filter(g => (g.savedAmount || 0) < g.targetAmount)
        .slice(0, 2);

    const milestone = getMilestone(streak?.count || 0);

    return (
        <div className="page-container">
            {/* Greeting */}
            <div className="dash-greeting">
                <div>
                    <h1 className="greeting-name">Halo, {profile.nama} 👋</h1>
                    <p className="greeting-date">{todayStr}</p>
                </div>
                <div className="greeting-avatar">{profile.avatarEmoji || '😊'}</div>
            </div>

            {/* ===== STREAK WIDGET ===== */}
            {(streak?.count || 0) > 0 && (
                <div className="streak-widget" onClick={() => showToast(
                    `${streak.count} hari berturut-turut! 🔥`,
                    `Rekor terbaik: ${streak.longest} hari`,
                    'success'
                )}>
                    <div className="streak-fire">🔥</div>
                    <div className="streak-info">
                        <span className="streak-count">{streak.count} hari</span>
                        <span className="streak-label">Streak mencatat</span>
                    </div>
                    {milestone && (
                        <div className="streak-badge">
                            <span>{milestone.emoji}</span>
                            <span className="streak-badge-label">{milestone.label}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Balance Card */}
            <div className={`balance-card ${balance < 0 ? 'negative' : ''}`}>
                <p className="balance-label">Saldo Total</p>
                <h2 className="balance-amount">
                    {balance < 0 && '-'}{formatRupiah(balance)}
                </h2>
                <p className="balance-subtitle">Dari semua pemasukan & pengeluaran</p>
            </div>

            {/* Month Summary */}
            <div className="month-summary">
                <div className="summary-card">
                    <div className="summary-icon income-icon"><IoArrowUp /></div>
                    <div className="summary-info">
                        <span className="summary-label">Pemasukan</span>
                        <span className="summary-value income-val">+{formatRupiah(monthIncome)}</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon expense-icon"><IoArrowDown /></div>
                    <div className="summary-info">
                        <span className="summary-label">Pengeluaran</span>
                        <span className="summary-value expense-val">-{formatRupiah(monthExpense)}</span>
                    </div>
                </div>
            </div>

            {/* Net */}
            <div className={`net-card card ${monthNet >= 0 ? 'net-positive' : 'net-negative'}`}>
                <span className="net-label">Net Bulan Ini</span>
                <span className="net-value">
                    {monthNet >= 0 ? '📈' : '📉'} {monthNet >= 0 ? '+' : ''}{formatRupiah(Math.abs(monthNet))}
                </span>
            </div>

            {/* ===== GOALS PREVIEW ===== */}
            {activeGoals.length > 0 && (
                <>
                    <div className="section-header">
                        <h3>🎯 Target Tabungan</h3>
                        <button className="link-btn" onClick={() => navigate('/goals')}>
                            Lihat Semua <IoChevronForward />
                        </button>
                    </div>
                    <div className="goals-preview">
                        {activeGoals.map(goal => {
                            const pct = Math.min(((goal.savedAmount || 0) / goal.targetAmount) * 100, 100);
                            return (
                                <div key={goal.id} className="goal-preview-card card" onClick={() => navigate('/goals')}>
                                    <div className="gp-left">
                                        <span className="gp-emoji">{goal.emoji}</span>
                                        <div>
                                            <span className="gp-name">{goal.nama}</span>
                                            <div className="progress-bar" style={{ width: '100px', height: '4px', marginTop: '4px' }}>
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent-success)' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="gp-right">
                                        <span className="gp-pct">{Math.round(pct)}%</span>
                                        <span className="gp-saved">{formatRupiah(goal.savedAmount || 0)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Recent Activity */}
            <div className="section-header">
                <h3>Aktivitas Terakhir</h3>
                {transactions.length > 5 && (
                    <button className="link-btn" onClick={() => navigate('/transactions')}>
                        Lihat Semua <IoChevronForward />
                    </button>
                )}
            </div>

            {recentTx.length === 0 ? (
                <div className="empty-state card">
                    <span className="empty-state-icon">✏️</span>
                    <p className="empty-state-text">Tap ➕ untuk mulai mencatat transaksi pertamamu!</p>
                </div>
            ) : (
                <div className="activity-list">
                    {recentTx.map(tx => {
                        const cat = getCategoryById(tx.kategori, tx.type);
                        const isIncome = tx.type === 'income';
                        return (
                            <div key={tx.id} className="activity-item card">
                                <div className={`activity-emoji ${isIncome ? 'emoji-income' : ''}`}>{cat.emoji}</div>
                                <div className="activity-info">
                                    <span className="activity-name">{cat.label}</span>
                                    <span className="activity-note">
                                        {tx.catatan || format(new Date(tx.timestamp), 'dd MMM, HH:mm')}
                                    </span>
                                </div>
                                <span className={`activity-amount ${isIncome ? 'income-amount' : 'expense-amount'}`}>
                                    {isIncome ? '+' : '-'}{formatRupiah(tx.nominal)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
