import { useState } from 'react';
import {
    IoPerson,
    IoChevronForward,
    IoSchool,
    IoPencil,
    IoClose,
    IoRefresh,
    IoInformationCircle,
    IoMoon,
    IoSunny,
    IoWallet,
    IoTrashOutline,
    IoAdd,
} from 'react-icons/io5';
import './Profile.css';
import { db, WALLET_ICONS, WALLET_COLORS } from '../db';
import { WalletIcon, WALLET_ICON_MAP } from '../components/WalletIcon';

const AVATARS = ['😊', '😎', '🤓', '🧑‍💻', '👩‍🎓', '👨‍🎓', '🦊', '🐱', '🐶', '🐻', '🦁', '🐼', '🌸', '⭐', '🔥', '💎'];

export default function Profile({ profile, setProfile, resetOnboarding, showToast, darkMode, toggleDarkMode, wallets = [], addWallet, updateWallet, removeWallet }) {
    const [modal, setModal] = useState(null);
    const [editName, setEditName] = useState(profile.nama);
    const [editUni, setEditUni] = useState(profile.universitas || '');
    const [editAvatar, setEditAvatar] = useState(profile.avatarEmoji || '😊');

    // Wallet form state
    const [newWName, setNewWName] = useState('');
    const [newWIcon, setNewWIcon] = useState('💵');
    const [newWColor, setNewWColor] = useState('#1dd1a1');
    const [editingWalletId, setEditingWalletId] = useState(null);

    const saveProfile = async () => {
        await setProfile({ ...profile, nama: editName, universitas: editUni, avatarEmoji: editAvatar });
        setModal(null);
        showToast('Profil diperbarui ✅', 'Perubahan tersimpan', 'success');
    };

    const resetWalletForm = () => {
        setNewWName('');
        setNewWIcon('💵');
        setNewWColor('#1dd1a1');
        setEditingWalletId(null);
    };

    const handleSaveWallet = async () => {
        if (!newWName) return;
        if (editingWalletId) {
            await updateWallet(editingWalletId, { name: newWName, icon: newWIcon, color: newWColor });
            showToast('Wallet Diperbarui', `"${newWName}" berhasil disimpan`, 'success');
        } else {
            await addWallet({ name: newWName, icon: newWIcon, color: newWColor });
            showToast('Wallet Ditambahkan!', `"${newWName}" sudah bisa digunakan`, 'success');
        }
        resetWalletForm();
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="profile-header-center">
                <div className="profile-avatar-large">
                    <div className="avatar-emoji-large">{profile.avatarEmoji || '😊'}</div>
                    <button className="edit-avatar-btn" onClick={() => {
                        setEditName(profile.nama);
                        setEditUni(profile.universitas || '');
                        setEditAvatar(profile.avatarEmoji || '😊');
                        setModal('edit');
                    }}>
                        <IoPencil />
                    </button>
                </div>
                <h2 className="profile-name">{profile.nama}</h2>
                {profile.universitas && <p className="profile-uni">{profile.universitas}</p>}
                <span className="profile-badge"><IoSchool /> Aktif</span>
            </div>

            {/* ===== AKUN GROUP ===== */}
            <div className="profile-group">
                <h3 className="group-title">AKUN</h3>
                <div className="menu-card card">
                    <button className="menu-item" onClick={() => {
                        setEditName(profile.nama);
                        setEditUni(profile.universitas || '');
                        setEditAvatar(profile.avatarEmoji || '😊');
                        setModal('edit');
                    }}>
                        <div className="menu-icon-bg" style={{ background: '#54a0ff15', color: '#54a0ff' }}>
                            <IoPerson />
                        </div>
                        <div className="menu-info">
                            <span className="menu-label">Edit Profil</span>
                            <span className="menu-sub">Nama, avatar, kampus</span>
                        </div>
                        <IoChevronForward className="menu-chevron" />
                    </button>

                    {/* Dark Mode Toggle */}
                    <div className="menu-item">
                        <div className="menu-icon-bg" style={{ background: darkMode ? '#5f27cd15' : '#feca5715', color: darkMode ? '#5f27cd' : '#f9ca24' }}>
                            {darkMode ? <IoMoon /> : <IoSunny />}
                        </div>
                        <div className="menu-info">
                            <span className="menu-label">Dark Mode</span>
                            <span className="menu-sub">{darkMode ? 'Aktif — tema gelap' : 'Nonaktif — tema terang'}</span>
                        </div>
                        <button
                            className={`toggle-switch ${darkMode ? 'on' : ''}`}
                            onClick={toggleDarkMode}
                            aria-label="Toggle dark mode"
                        >
                            <div className="toggle-thumb" />
                        </button>
                    </div>

                    {/* Kelola Wallet */}
                    <button className="menu-item" onClick={() => setModal('wallet')}>
                        <div className="menu-icon-bg" style={{ background: '#fdcb6e15', color: '#fdcb6e' }}>
                            <IoWallet />
                        </div>
                        <div className="menu-info">
                            <span className="menu-label">Kelola Wallet</span>
                            <span className="menu-sub">{wallets.length} sumber dana aktif</span>
                        </div>
                        <IoChevronForward className="menu-chevron" />
                    </button>

                    {/* Tentang */}
                    <button className="menu-item" onClick={() => setModal('about')}>
                        <div className="menu-icon-bg" style={{ background: '#1dd1a115', color: '#1dd1a1' }}>
                            <IoInformationCircle />
                        </div>
                        <div className="menu-info">
                            <span className="menu-label">Tentang SakuMate</span>
                            <span className="menu-sub">Versi & informasi aplikasi</span>
                        </div>
                        <IoChevronForward className="menu-chevron" />
                    </button>
                </div>
            </div>

            {/* ===== DATA GROUP ===== */}
            <div className="profile-group">
                <h3 className="group-title">DATA</h3>
                <div className="menu-card card">
                    <button className="menu-item" onClick={() => {
                        if (confirm('Reset semua data? Aksi ini tidak bisa dibatalkan.')) {
                            resetOnboarding();
                        }
                    }}>
                        <div className="menu-icon-bg" style={{ background: '#ff6b6b15', color: '#ff6b6b' }}>
                            <IoRefresh />
                        </div>
                        <div className="menu-info">
                            <span className="menu-label">Reset Semua Data</span>
                            <span className="menu-sub">Hapus semua transaksi & profil</span>
                        </div>
                        <IoChevronForward className="menu-chevron" />
                    </button>
                </div>
            </div>

            <div className="app-version">SakuMate v1.0 · Made with ❤️</div>

            {/* ===== EDIT PROFILE MODAL ===== */}
            {modal === 'edit' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Profil</h3>
                            <button className="modal-close" onClick={() => setModal(null)}><IoClose /></button>
                        </div>

                        <div className="form-group">
                            <label className="label">Avatar</label>
                            <div className="avatar-picker">
                                {AVATARS.map(e => (
                                    <button
                                        key={e}
                                        className={`avatar-opt ${editAvatar === e ? 'sel' : ''}`}
                                        onClick={() => setEditAvatar(e)}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Nama</label>
                            <input className="input-field" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nama kamu" />
                        </div>

                        <div className="form-group">
                            <label className="label">Kampus (opsional)</label>
                            <input className="input-field" value={editUni} onChange={e => setEditUni(e.target.value)} placeholder="Universitas Indonesia" />
                        </div>

                        <button className="btn-primary" onClick={saveProfile}>Simpan</button>
                    </div>
                </div>
            )}

            {/* ===== ABOUT MODAL ===== */}
            {modal === 'about' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-content about-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Tentang SakuMate</h3>
                            <button className="modal-close" onClick={() => setModal(null)}><IoClose /></button>
                        </div>

                        <div className="about-hero">
                            <div className="about-icon">💰</div>
                            <h2 className="about-appname">SakuMate</h2>
                            <span className="about-version">Versi 1.0</span>
                        </div>

                        <p className="about-desc">
                            SakuMate adalah aplikasi pencatat keuangan pribadi yang dirancang untuk membantu kamu mengelola pemasukan dan pengeluaran dengan mudah dan menyenangkan.
                        </p>

                        <div className="about-features">
                            <div className="about-feat">
                                <span>💸</span>
                                <span>Catat pemasukan & pengeluaran fleksibel</span>
                            </div>
                            <div className="about-feat">
                                <span>📊</span>
                                <span>Analisis kategori & tren harian</span>
                            </div>
                            <div className="about-feat">
                                <span>🎯</span>
                                <span>Target & saving goals dengan progress</span>
                            </div>
                            <div className="about-feat">
                                <span>🔥</span>
                                <span>Streak & gamifikasi kebiasaan menabung</span>
                            </div>
                            <div className="about-feat">
                                <span>📱</span>
                                <span>Offline-first, data tersimpan di perangkatmu</span>
                            </div>
                        </div>

                        <div className="about-footer">
                            Dibuat dengan ❤️ · Data tersimpan lokal di browser kamu
                        </div>
                    </div>
                </div>
            )}

            {/* ===== WALLET MANAGEMENT MODAL ===== */}
            {modal === 'wallet' && (
                <div className="modal-overlay" onClick={() => setModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Kelola Wallet</h3>
                            <button className="modal-close" onClick={() => setModal(null)}><IoClose /></button>
                        </div>

                        {/* Existing wallets */}
                        <div className="wallet-manage-list">
                            {wallets.map(w => (
                                <div key={w.id} className="wallet-manage-item">
                                    <span className="wallet-manage-icon" style={{ background: `${w.color}18`, color: w.color }}><WalletIcon icon={w.icon} size={18} /></span>
                                    <span className="wallet-manage-name">{w.name}</span>
                                    {w.isDefault && <span className="wallet-default-tag">Default</span>}
                                    <div className="wallet-manage-actions">
                                        <button
                                            className="wallet-manage-btn edit"
                                            onClick={() => {
                                                setEditingWalletId(w.id);
                                                setNewWName(w.name);
                                                setNewWIcon(w.icon);
                                                setNewWColor(w.color);
                                            }}
                                        >
                                            <IoPencil />
                                        </button>
                                        {!w.isDefault && (
                                            <button
                                                className="wallet-manage-btn del"
                                                onClick={() => {
                                                    if (confirm(`Hapus wallet "${w.name}"? Transaksi akan dipindah ke wallet default.`)) {
                                                        removeWallet(w.id);
                                                        showToast('Wallet dihapus', `"${w.name}" telah dihapus`, 'info');
                                                        if (editingWalletId === w.id) resetWalletForm();
                                                    }
                                                }}
                                            >
                                                <IoTrashOutline />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add/Edit wallet form */}
                        <div className="wallet-add-section">
                            <h4 className="wallet-add-title">
                                {editingWalletId ? 'Edit Wallet' : 'Tambah Wallet Baru'}
                            </h4>
                            <div className="form-group">
                                <label className="label">Nama</label>
                                <input
                                    className="input-field"
                                    value={newWName}
                                    onChange={e => setNewWName(e.target.value)}
                                    placeholder="Contoh: ShopeePay"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Icon</label>
                                <div className="wallet-icon-picker">
                                    {WALLET_ICONS.map(ic => (
                                        <button
                                            key={ic}
                                            className={`wallet-icon-opt ${newWIcon === ic ? 'sel' : ''}`}
                                            onClick={() => setNewWIcon(ic)}
                                            title={WALLET_ICON_MAP[ic]?.label}
                                        >
                                            <WalletIcon icon={ic} size={18} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label">Warna</label>
                                <div className="wallet-color-picker">
                                    {WALLET_COLORS.map(c => (
                                        <button
                                            key={c}
                                            className={`wallet-color-opt ${newWColor === c ? 'sel' : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setNewWColor(c)}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="wallet-form-actions">
                                {editingWalletId && (
                                    <button className="btn-secondary" onClick={resetWalletForm}>Batal</button>
                                )}
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveWallet}
                                    disabled={!newWName.trim()}
                                >
                                    {editingWalletId ? 'Simpan Perubahan' : 'Tambah Wallet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
