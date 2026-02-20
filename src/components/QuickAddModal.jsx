import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IoClose, IoArrowDown, IoArrowUp, IoAdd } from 'react-icons/io5';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/predictionEngine';
import { WALLET_ICONS, WALLET_COLORS } from '../db';
import { WalletIcon, WALLET_ICON_MAP } from '../components/WalletIcon';
import './QuickAddModal.css';

export default function QuickAddModal({ isOpen, onClose, onAdd, wallets = [], defaultWalletId, addWallet, showToast }) {
    const [type, setType] = useState('expense');
    const [kategori, setKategori] = useState('');
    const [nominal, setNominal] = useState('');
    const [catatan, setCatatan] = useState('');
    const [walletId, setWalletId] = useState(defaultWalletId || '');

    // Quick add wallet state
    const [isAddingWallet, setIsAddingWallet] = useState(false);
    const [newWName, setNewWName] = useState('');
    const [newWIcon, setNewWIcon] = useState(WALLET_ICONS[0]);
    const [newWColor, setNewWColor] = useState(WALLET_COLORS[0]);

    // Sync default wallet when it changes
    useEffect(() => {
        if (defaultWalletId && !walletId) {
            setWalletId(defaultWalletId);
        }
    }, [defaultWalletId]);

    const fmt = (v) => {
        const n = v.replace(/\D/g, '');
        return n ? parseInt(n).toLocaleString('id-ID') : '';
    };

    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleTypeSwitch = (t) => {
        setType(t);
        setKategori('');
    };

    const handleSubmit = () => {
        if (!kategori || !nominal) return;
        onAdd({
            id: uuidv4(),
            type,
            kategori,
            nominal: parseInt(nominal.replace(/\D/g, '')),
            catatan: catatan.trim(),
            walletId: walletId || defaultWalletId,
            timestamp: new Date().toISOString(),
        });
        // Reset
        setType('expense');
        setKategori('');
        setNominal('');
        setCatatan('');
        setWalletId(defaultWalletId || '');
        setIsAddingWallet(false);
        onClose();
    };

    const handleQuickAddWallet = async () => {
        if (!newWName) return;
        const newId = await addWallet({
            name: newWName,
            icon: newWIcon,
            color: newWColor
        });
        setWalletId(newId);
        setIsAddingWallet(false);
        setNewWName('');
        if (showToast) showToast('Wallet Ditambah!', `"${newWName}" siap digunakan`, 'success');
    };

    if (!isOpen) return null;

    const selectedCat = categories.find(c => c.id === kategori);
    const isIncome = type === 'income';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Tambah Transaksi</h3>
                    <button className="modal-close" onClick={onClose}><IoClose /></button>
                </div>

                {/* Type Toggle */}
                <div className="type-toggle">
                    <button
                        className={`type-btn ${!isIncome ? 'active expense' : ''}`}
                        onClick={() => handleTypeSwitch('expense')}
                    >
                        <IoArrowDown /> Pengeluaran
                    </button>
                    <button
                        className={`type-btn ${isIncome ? 'active income' : ''}`}
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
                                    className={`wallet-chip ${walletId === w.id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setWalletId(w.id);
                                        setIsAddingWallet(false);
                                    }}
                                    style={walletId === w.id ? {
                                        background: `${w.color}20`,
                                        borderColor: w.color,
                                        color: w.color,
                                    } : {}}
                                >
                                    <span className="wallet-chip-icon"><WalletIcon icon={w.icon} size={16} /></span>
                                    <span className="wallet-chip-name">{w.name}</span>
                                </button>
                            ))}
                            <button
                                className={`wallet-chip add-chip ${isAddingWallet ? 'selected' : ''}`}
                                onClick={() => setIsAddingWallet(!isAddingWallet)}
                            >
                                <IoAdd /> Baru
                            </button>
                        </div>

                        {isAddingWallet && (
                            <div className="quick-wallet-form card">
                                <div className="form-group">
                                    <input
                                        className="input-field"
                                        value={newWName}
                                        onChange={e => setNewWName(e.target.value)}
                                        placeholder="Nama dompet baru..."
                                        autoFocus
                                    />
                                </div>
                                <div className="picker-row">
                                    <div className="mini-picker">
                                        {WALLET_ICONS.slice(0, 8).map(ic => (
                                            <button
                                                key={ic}
                                                className={`mini-opt ${newWIcon === ic ? 'sel' : ''}`}
                                                onClick={() => setNewWIcon(ic)}
                                                title={WALLET_ICON_MAP[ic]?.label}
                                            >
                                                <WalletIcon icon={ic} size={16} />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mini-picker">
                                        {WALLET_COLORS.slice(0, 6).map(c => (
                                            <button
                                                key={c}
                                                className={`mini-color-opt ${newWColor === c ? 'sel' : ''}`}
                                                onClick={() => setNewWColor(c)}
                                                style={{ background: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="quick-wallet-actions">
                                    <button className="btn-secondary btn-sm" onClick={() => setIsAddingWallet(false)}>Batal</button>
                                    <button className="btn-primary btn-sm" onClick={handleQuickAddWallet} disabled={!newWName}>Tambah</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Category Grid */}
                <div className="form-group">
                    <label className="label">Kategori</label>
                    <div className="cat-grid">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`cat-chip ${kategori === cat.id ? 'selected' : ''}`}
                                onClick={() => setKategori(cat.id)}
                                style={kategori === cat.id ? {
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
                            className={`input-field amount-input ${isIncome ? 'income-input' : 'expense-input'}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="50.000"
                            value={nominal}
                            onChange={e => setNominal(fmt(e.target.value))}
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                    <label className="label">Catatan (opsional)</label>
                    <input
                        className="input-field"
                        type="text"
                        placeholder={isIncome ? 'Kiriman bulan Februari...' : 'Makan siang...'}
                        value={catatan}
                        onChange={e => setCatatan(e.target.value)}
                    />
                </div>

                <button
                    className={`btn-primary ${isIncome ? 'btn-income' : ''}`}
                    onClick={handleSubmit}
                    disabled={!kategori || !nominal}
                >
                    {selectedCat ? `${selectedCat.emoji} Simpan` : 'Simpan'}
                </button>
            </div>
        </div>
    );
}
