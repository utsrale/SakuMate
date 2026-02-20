import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
    IoArrowBack, IoSearch, IoTrashOutline,
    IoCreateOutline, IoClose, IoArrowDown, IoArrowUp,
} from 'react-icons/io5';
import { WalletIcon } from '../components/WalletIcon';
import {
    formatRupiah, getCategoryById, calculateBalance,
    getTotalIncome, getTotalExpense,
    EXPENSE_CATEGORIES, INCOME_CATEGORIES,
} from '../utils/predictionEngine';
import './Transactions.css';

const FILTERS = [
    { id: 'all', label: 'Semua' },
    { id: 'income', label: '↑ Masuk' },
    { id: 'expense', label: '↓ Keluar' },
];

const fmt = (v) => {
    const n = v.replace(/\D/g, '');
    return n ? parseInt(n).toLocaleString('id-ID') : '';
};

export default function Transactions({ transactions, removeTransaction, updateTransaction, wallets = [] }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    // Edit modal state
    const [editTx, setEditTx] = useState(null);
    const [editKategori, setEditKategori] = useState('');
    const [editNominal, setEditNominal] = useState('');
    const [editCatatan, setEditCatatan] = useState('');
    const [editType, setEditType] = useState('expense');
    const [editWalletId, setEditWalletId] = useState('');

    // Delete confirm state
    const [confirmId, setConfirmId] = useState(null);

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

    // Open edit modal
    const openEdit = (tx) => {
        setEditTx(tx);
        setEditType(tx.type);
        setEditKategori(tx.kategori);
        setEditNominal(tx.nominal.toLocaleString('id-ID'));
        setEditCatatan(tx.catatan || '');
        setEditWalletId(tx.walletId || '');
    };

    const closeEdit = () => setEditTx(null);

    const handleSaveEdit = async () => {
        if (!editKategori || !editNominal) return;
        await updateTransaction(editTx.id, {
            type: editType,
            kategori: editKategori,
            nominal: parseInt(editNominal.replace(/\D/g, '')),
            catatan: editCatatan.trim(),
            walletId: editWalletId,
        });
        closeEdit();
    };

    const handleTypeSwitch = (t) => {
        setEditType(t);
        setEditKategori('');
    };

    // Delete with confirm
    const handleDelete = (id) => setConfirmId(id);
    const confirmDelete = async () => {
        await removeTransaction(confirmId);
        setConfirmId(null);
    };

    const editCategories = editType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const isEditIncome = editType === 'income';

    const getWallet = (id) => wallets.find(w => w.id === id);

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
                                            {getWallet(tx.walletId) && (
                                                <span className="tx-wallet-badge" style={{ color: getWallet(tx.walletId).color }}>
                                                    {getWallet(tx.walletId).icon} {getWallet(tx.walletId).name}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`tx-amount ${isIncome ? 'income-val' : 'expense-val'}`}>
                                            {isIncome ? '+' : '-'}{formatRupiah(tx.nominal)}
                                        </span>
                                        <div className="tx-actions">
                                            <button className="tx-edit" onClick={() => openEdit(tx)}>
                                                <IoCreateOutline />
                                            </button>
                                            <button className="tx-del" onClick={() => handleDelete(tx.id)}>
                                                <IoTrashOutline />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* ===== DELETE CONFIRM MODAL ===== */}
            {confirmId && (
                <div className="modal-overlay" onClick={() => setConfirmId(null)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="confirm-icon">🗑️</div>
                        <h3 className="confirm-title">Hapus Transaksi?</h3>
                        <p className="confirm-desc">Transaksi ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
                        <div className="confirm-actions">
                            <button className="btn-cancel" onClick={() => setConfirmId(null)}>Batal</button>
                            <button className="btn-danger" onClick={confirmDelete}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT MODAL ===== */}
            {editTx && (
                <div className="modal-overlay" onClick={closeEdit}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Transaksi</h3>
                            <button className="modal-close" onClick={closeEdit}><IoClose /></button>
                        </div>

                        {/* Type Toggle */}
                        <div className="type-toggle">
                            <button
                                className={`type-btn ${!isEditIncome ? 'active expense' : ''}`}
                                onClick={() => handleTypeSwitch('expense')}
                            >
                                <IoArrowDown /> Pengeluaran
                            </button>
                            <button
                                className={`type-btn ${isEditIncome ? 'active income' : ''}`}
                                onClick={() => handleTypeSwitch('income')}
                            >
                                <IoArrowUp /> Pemasukan
                            </button>
                        </div>

                        {/* Wallet Selector */}
                        {wallets.length > 0 && (
                            <div className="form-group">
                                <label className="label">Sumber Dana</label>
                                <div className="wallet-selector">
                                    {wallets.map(w => (
                                        <button
                                            key={w.id}
                                            className={`wallet-chip ${editWalletId === w.id ? 'selected' : ''}`}
                                            onClick={() => setEditWalletId(w.id)}
                                            style={editWalletId === w.id ? {
                                                background: `${w.color}20`,
                                                borderColor: w.color,
                                                color: w.color,
                                            } : {}}
                                        >
                                            <span className="wallet-chip-icon"><WalletIcon icon={w.icon} size={16} /></span>
                                            <span className="wallet-chip-name">{w.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category Grid */}
                        <div className="form-group">
                            <label className="label">Kategori</label>
                            <div className="cat-grid">
                                {editCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`cat-chip ${editKategori === cat.id ? 'selected' : ''}`}
                                        onClick={() => setEditKategori(cat.id)}
                                        style={editKategori === cat.id ? {
                                            background: `${cat.color}20`,
                                            borderColor: cat.color,
                                            color: cat.color,
                                        } : {}}
                                    >
                                        <span className="cat-emoji">{cat.emoji}</span>
                                        <span className="cat-name">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="form-group">
                            <label className="label">Nominal</label>
                            <div className="amount-input-wrapper">
                                <span className="amount-prefix">Rp</span>
                                <input
                                    className={`input-field amount-input ${isEditIncome ? 'income-input' : 'expense-input'}`}
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="50.000"
                                    value={editNominal}
                                    onChange={e => setEditNominal(fmt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-group">
                            <label className="label">Catatan (opsional)</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="Tambahkan catatan..."
                                value={editCatatan}
                                onChange={e => setEditCatatan(e.target.value)}
                            />
                        </div>

                        <button
                            className={`btn-primary ${isEditIncome ? 'btn-income' : ''}`}
                            onClick={handleSaveEdit}
                            disabled={!editKategori || !editNominal}
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
