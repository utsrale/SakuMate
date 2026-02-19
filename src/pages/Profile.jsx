import { useState } from 'react';
import {
    IoPerson,
    IoChevronForward,
    IoSchool,
    IoPencil,
    IoClose,
    IoRefresh,
    IoInformationCircle,
} from 'react-icons/io5';
import { formatRupiah, calculateBalance, getTotalIncome, getTotalExpense } from '../utils/predictionEngine';
import './Profile.css';

const AVATARS = ['😊', '😎', '🤓', '🧑‍💻', '👩‍🎓', '👨‍🎓', '🦊', '🐱', '🐶', '🐻', '🦁', '🐼', '🌸', '⭐', '🔥', '💎'];

export default function Profile({ profile, setProfile, transactions, resetOnboarding, showToast }) {
    const [modal, setModal] = useState(null);
    const [editName, setEditName] = useState(profile.nama);
    const [editUni, setEditUni] = useState(profile.universitas || '');
    const [editAvatar, setEditAvatar] = useState(profile.avatarEmoji || '😊');

    const balance = calculateBalance(transactions);
    const totalIn = getTotalIncome(transactions);
    const totalOut = getTotalExpense(transactions);

    const saveProfile = async () => {
        await setProfile({ ...profile, nama: editName, universitas: editUni, avatarEmoji: editAvatar });
        setModal(null);
        showToast('Profil diperbarui ✅', 'Perubahan tersimpan', 'success');
    };

    const menus = [
        {
            title: 'AKUN',
            items: [
                {
                    icon: IoPerson,
                    label: 'Edit Profil',
                    sub: 'Nama, avatar, kampus',
                    color: '#54a0ff',
                    action: () => {
                        setEditName(profile.nama);
                        setEditUni(profile.universitas || '');
                        setEditAvatar(profile.avatarEmoji || '😊');
                        setModal('edit');
                    }
                },
                {
                    icon: IoInformationCircle,
                    label: 'Tentang SakuMate',
                    sub: 'Tracker pemasukan & pengeluaran',
                    color: '#1dd1a1',
                    action: () => showToast('SakuMate v3.0 🎉', 'Income + expense tracker', 'info'),
                },
            ]
        },
        {
            title: 'DATA',
            items: [
                {
                    icon: IoRefresh,
                    label: 'Reset Semua Data',
                    sub: 'Hapus semua transaksi & profil',
                    color: '#ff6b6b',
                    action: () => {
                        if (confirm('Reset semua data? Aksi ini tidak bisa dibatalkan.')) {
                            resetOnboarding();
                        }
                    }
                },
            ]
        }
    ];

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

            {/* Stats Card */}
            <div className="profile-stats card">
                <div className="pstat">
                    <span className="pstat-val">{formatRupiah(balance)}</span>
                    <span className="pstat-label">Saldo</span>
                </div>
                <div className="pstat-div" />
                <div className="pstat">
                    <span className="pstat-val income-val">+{formatRupiah(totalIn)}</span>
                    <span className="pstat-label">Total Masuk</span>
                </div>
                <div className="pstat-div" />
                <div className="pstat">
                    <span className="pstat-val expense-val">-{formatRupiah(totalOut)}</span>
                    <span className="pstat-label">Total Keluar</span>
                </div>
            </div>

            {/* Menu Groups */}
            {menus.map((g, i) => (
                <div key={i} className="profile-group">
                    <h3 className="group-title">{g.title}</h3>
                    <div className="menu-card card">
                        {g.items.map((item, j) => (
                            <button key={j} className="menu-item" onClick={item.action}>
                                <div className="menu-icon-bg" style={{ background: `${item.color}15`, color: item.color }}>
                                    <item.icon />
                                </div>
                                <div className="menu-info">
                                    <span className="menu-label">{item.label}</span>
                                    {item.sub && <span className="menu-sub">{item.sub}</span>}
                                </div>
                                <IoChevronForward className="menu-chevron" />
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="app-version">SakuMate v3.0 · Income & Expense Tracker</div>

            {/* Edit Profile Modal */}
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
        </div>
    );
}
