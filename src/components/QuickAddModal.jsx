import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IoClose, IoArrowDown, IoArrowUp } from 'react-icons/io5';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/predictionEngine';
import './QuickAddModal.css';

export default function QuickAddModal({ isOpen, onClose, onAdd }) {
    const [type, setType] = useState('expense');
    const [kategori, setKategori] = useState('');
    const [nominal, setNominal] = useState('');
    const [catatan, setCatatan] = useState('');

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
            timestamp: new Date().toISOString(),
        });
        // Reset
        setType('expense');
        setKategori('');
        setNominal('');
        setCatatan('');
        onClose();
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
