import { useState } from 'react';
import { IoAdd, IoClose, IoTrashOutline, IoTrophyOutline, IoAddCircleOutline } from 'react-icons/io5';
import { formatRupiah } from '../utils/predictionEngine';
import './Goals.css';

const GOAL_EMOJIS = ['🏠', '✈️', '💻', '🎓', '💍', '🚗', '📱', '🎮', '👟', '🎒', '📚', '🌏', '💪', '🎸', '🍕', '🏋️'];

export default function Goals({ goals, addGoal, addToGoal, removeGoal }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showFund, setShowFund] = useState(null); // goal id
    const [fundAmount, setFundAmount] = useState('');

    // New goal form
    const [gNama, setGNama] = useState('');
    const [gEmoji, setGEmoji] = useState('🎯');
    const [gTarget, setGTarget] = useState('');
    const [gDeadline, setGDeadline] = useState('');

    const fmt = (v) => {
        const n = v.replace(/\D/g, '');
        return n ? parseInt(n).toLocaleString('id-ID') : '';
    };

    const handleAddGoal = async () => {
        if (!gNama.trim() || !gTarget) return;
        await addGoal({
            nama: gNama.trim(),
            emoji: gEmoji,
            targetAmount: parseInt(gTarget.replace(/\D/g, '')),
            deadline: gDeadline || null,
        });
        setGNama(''); setGEmoji('🎯'); setGTarget(''); setGDeadline('');
        setShowAdd(false);
    };

    const handleFund = async () => {
        if (!fundAmount || !showFund) return;
        await addToGoal(showFund, parseInt(fundAmount.replace(/\D/g, '')));
        setFundAmount('');
        setShowFund(null);
    };

    const totalSaved = goals.reduce((s, g) => s + (g.savedAmount || 0), 0);
    const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);
    const completed = goals.filter(g => (g.savedAmount || 0) >= g.targetAmount).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Saving Goals</h1>
                    <p className="page-subtitle">{goals.length} target · {completed} tercapai</p>
                </div>
                <button className="add-goal-btn" onClick={() => setShowAdd(true)}>
                    <IoAdd />
                </button>
            </div>

            {/* Summary */}
            {goals.length > 0 && (
                <div className="goals-summary card">
                    <div className="gs-item">
                        <span className="gs-val">{completed}/{goals.length}</span>
                        <span className="gs-label">Tercapai</span>
                    </div>
                    <div className="gs-div" />
                    <div className="gs-item">
                        <span className="gs-val">{formatRupiah(totalSaved)}</span>
                        <span className="gs-label">Terkumpul</span>
                    </div>
                    <div className="gs-div" />
                    <div className="gs-item">
                        <span className="gs-val">{formatRupiah(totalTarget)}</span>
                        <span className="gs-label">Total Target</span>
                    </div>
                </div>
            )}

            {/* Goals List */}
            {goals.length === 0 ? (
                <div className="empty-state card">
                    <span className="empty-state-icon">🎯</span>
                    <p className="empty-state-text">Belum ada target tabungan.<br />Tap ＋ untuk mulai!</p>
                </div>
            ) : (
                <div className="goals-list">
                    {goals.map(goal => {
                        const saved = goal.savedAmount || 0;
                        const pct = Math.min((saved / goal.targetAmount) * 100, 100);
                        const done = saved >= goal.targetAmount;
                        const remaining = Math.max(goal.targetAmount - saved, 0);

                        return (
                            <div key={goal.id} className={`goal-card card ${done ? 'goal-done' : ''}`}>
                                <div className="goal-header">
                                    <div className="goal-emoji-wrap">{goal.emoji}</div>
                                    <div className="goal-info">
                                        <span className="goal-name">{goal.nama}</span>
                                        {goal.deadline && (
                                            <span className="goal-deadline">
                                                🗓 {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </div>
                                    {done
                                        ? <span className="goal-trophy"><IoTrophyOutline /></span>
                                        : <button className="goal-del" onClick={() => removeGoal(goal.id)}><IoTrashOutline /></button>
                                    }
                                </div>

                                {/* Progress */}
                                <div className="goal-progress-wrap">
                                    <div className="goal-progress-bar">
                                        <div
                                            className={`goal-progress-fill ${done ? 'fill-done' : ''}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="goal-pct">{Math.round(pct)}%</span>
                                </div>

                                <div className="goal-amounts">
                                    <span className="goal-saved">
                                        {done ? '✅ Tercapai!' : `Terkumpul: ${formatRupiah(saved)}`}
                                    </span>
                                    <span className="goal-target">
                                        {done ? formatRupiah(goal.targetAmount) : `Sisa: ${formatRupiah(remaining)}`}
                                    </span>
                                </div>

                                {!done && (
                                    <button className="btn-fund" onClick={() => setShowFund(goal.id)}>
                                        <IoAddCircleOutline /> Tambah Dana
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ====== ADD GOAL MODAL ====== */}
            {showAdd && (
                <div className="modal-overlay" onClick={() => setShowAdd(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Target Baru</h3>
                            <button className="modal-close" onClick={() => setShowAdd(false)}><IoClose /></button>
                        </div>

                        <div className="form-group">
                            <label className="label">Emoji</label>
                            <div className="goal-emoji-picker">
                                {GOAL_EMOJIS.map(e => (
                                    <button
                                        key={e}
                                        className={`goal-emoji-opt ${gEmoji === e ? 'sel' : ''}`}
                                        onClick={() => setGEmoji(e)}
                                    >
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Nama Target</label>
                            <input className="input-field" placeholder="Beli laptop, nabung kos..." value={gNama} onChange={e => setGNama(e.target.value)} />
                        </div>

                        <div className="form-group">
                            <label className="label">Target Nominal</label>
                            <div className="amount-input-wrapper">
                                <span className="amount-prefix">Rp</span>
                                <input
                                    className="input-field amount-input"
                                    inputMode="numeric"
                                    placeholder="5.000.000"
                                    value={gTarget}
                                    onChange={e => setGTarget(fmt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Deadline (opsional)</label>
                            <input className="input-field" type="date" value={gDeadline} onChange={e => setGDeadline(e.target.value)} />
                        </div>

                        <button className="btn-primary" onClick={handleAddGoal} disabled={!gNama.trim() || !gTarget}>
                            🎯 Buat Target
                        </button>
                    </div>
                </div>
            )}

            {/* ====== FUND MODAL ====== */}
            {showFund && (
                <div className="modal-overlay" onClick={() => setShowFund(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {goals.find(g => g.id === showFund)?.emoji} Tambah Dana
                            </h3>
                            <button className="modal-close" onClick={() => setShowFund(null)}><IoClose /></button>
                        </div>
                        <p className="modal-desc">
                            Dana yang kamu masukkan akan menambah progress tabungan ini.
                        </p>
                        <div className="form-group">
                            <label className="label">Jumlah</label>
                            <div className="amount-input-wrapper">
                                <span className="amount-prefix">Rp</span>
                                <input
                                    className="input-field amount-input"
                                    inputMode="numeric"
                                    placeholder="100.000"
                                    value={fundAmount}
                                    onChange={e => setFundAmount(fmt(e.target.value))}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <button className="btn-primary btn-income" onClick={handleFund} disabled={!fundAmount}>
                            💰 Simpan ke Target
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
