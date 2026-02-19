import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { IoArrowBack, IoSearch, IoTrashOutline, IoArrowDown, IoArrowUp } from 'react-icons/io5';
import { formatRupiah, getCategoryById, calculateBalance, getTotalIncome, getTotalExpense } from '../utils/predictionEngine';
import './Transactions.css';

const FILTERS = [
    { id: 'all', label: 'Semua' },
    { id: 'income', label: '↑ Masuk' },
    { id: 'expense', label: '↓ Keluar' },
];

export default function Transactions({ transactions, removeTransaction }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const balance = useMemo(() => calculateBalance(transactions), [transactions]);
    const totalIn = useMemo(() => getTotalIncome(transactions), [transactions]);
    const totalOut = useMemo(() => getTotalExpense(transactions), [transactions]);

    const filtered = useMemo(() => {
        let list = transactions;
        if (filter !== 'all') list = list.filter(tx => tx.type === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(tx => {
                const cat = getCategoryById(tx.kategori, tx.type);
                return cat.label.toLowerCase().includes(q) || (tx.catatan && tx.catatan.toLowerCase().includes(q));
            });
        }
        return list;
    }, [transactions, filter, search]);

    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach(tx => {
            const key = format(new Date(tx.timestamp), 'yyyy-MM-dd');
            if (!groups[key]) groups[key] = { date: new Date(tx.timestamp), items: [] };
            groups[key].items.push(tx);
        });
        return Object.values(groups).sort((a, b) => b.date - a.date);
    }, [filtered]);

    const dateLabel = (d) => {
        if (isToday(d)) return 'Hari Ini';
        if (isYesterday(d)) return 'Kemarin';
        return format(d, 'EEEE, dd MMMM', { locale: localeId });
    };

    return (
        <div className="page-container tx-page">
            {/* Header */}
            <div className="tx-header">
                <button className="tx-back" onClick={() => navigate(-1)}>
                    <IoArrowBack />
                </button>
                <h1 className="page-title">Transaksi</h1>
                <span className="tx-count">{filtered.length}</span>
            </div>

            {/* Quick Stats */}
            <div className="tx-stats card">
                <div className="txs">
                    <span className="txs-label">Saldo</span>
                    <span className={`txs-val ${balance >= 0 ? 'income-val' : 'expense-val'}`}>{formatRupiah(balance)}</span>
                </div>
                <div className="txs-div" />
                <div className="txs">
                    <span className="txs-label">↑ Masuk</span>
                    <span className="txs-val income-val">+{formatRupiah(totalIn)}</span>
                </div>
                <div className="txs-div" />
                <div className="txs">
                    <span className="txs-label">↓ Keluar</span>
                    <span className="txs-val expense-val">-{formatRupiah(totalOut)}</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {FILTERS.map(f => (
                    <button
                        key={f.id}
                        className={`filter-tab ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="tx-search-wrap">
                <IoSearch className="tx-search-icon" />
                <input
                    className="input-field tx-search"
                    placeholder="Cari kategori atau catatan..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* List */}
            {grouped.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-state-icon">🔍</span>
                    <p className="empty-state-text">{search ? 'Tidak ada hasil' : 'Belum ada transaksi'}</p>
                </div>
            ) : (
                grouped.map(group => (
                    <div key={group.date.toISOString()} className="tx-group">
                        <h3 className="tx-date-label">{dateLabel(group.date)}</h3>
                        <div className="tx-list">
                            {group.items.map(tx => {
                                const cat = getCategoryById(tx.kategori, tx.type);
                                const isIncome = tx.type === 'income';
                                return (
                                    <div key={tx.id} className="tx-item card">
                                        <div className={`tx-emoji ${isIncome ? 'tx-emoji-income' : 'tx-emoji-expense'}`}>
                                            {cat.emoji}
                                        </div>
                                        <div className="tx-info">
                                            <div className="tx-name-row">
                                                <span className="tx-name">{cat.label}</span>
                                                <span className={`tx-type-badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                                                    {isIncome ? '↑ Masuk' : '↓ Keluar'}
                                                </span>
                                            </div>
                                            <span className="tx-note">
                                                {tx.catatan || format(new Date(tx.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <span className={`tx-amount ${isIncome ? 'income-val' : 'expense-val'}`}>
                                            {isIncome ? '+' : '-'}{formatRupiah(tx.nominal)}
                                        </span>
                                        <button className="tx-del" onClick={() => removeTransaction(tx.id)}>
                                            <IoTrashOutline />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
