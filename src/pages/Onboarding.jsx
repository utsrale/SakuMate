import { useState } from 'react';
import { IoRocketOutline } from 'react-icons/io5';
import './Onboarding.css';

export default function Onboarding({ onComplete, setProfile }) {
    const [step, setStep] = useState(0);
    const [nama, setNama] = useState('');
    const [universitas, setUniversitas] = useState('');

    const handleFinish = async () => {
        await setProfile({
            nama: nama.trim() || 'Kamu',
            universitas: universitas.trim(),
            avatarEmoji: '😊',
        });
        onComplete();
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-dots">
                {[0, 1].map(i => (
                    <div key={i} className={`dot ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`} />
                ))}
            </div>

            {step === 0 && (
                <div className="onboarding-step">
                    <div className="onboarding-hero">
                        <div className="hero-emoji">💰</div>
                        <h1 className="hero-title">
                            Selamat Datang di<br />
                            <span className="brand-name">SakuMate</span>
                        </h1>
                        <p className="hero-desc">
                            Catat semua pemasukan dan pengeluaran kamu dengan mudah. Lacak ke mana uangmu pergi.
                        </p>
                    </div>
                    <button className="btn-primary btn-hero" onClick={() => setStep(1)}>
                        <IoRocketOutline /> Mulai Sekarang
                    </button>
                </div>
            )}

            {step === 1 && (
                <div className="onboarding-step">
                    <div className="step-header">
                        <h2>Siapa Kamu?</h2>
                        <p className="step-desc">Bisa diubah nanti di menu Profil</p>
                    </div>

                    <div className="form-group">
                        <label className="label">Nama Panggilan</label>
                        <input
                            className="input-field"
                            placeholder="Andi"
                            value={nama}
                            onChange={e => setNama(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Kampus (opsional)</label>
                        <input
                            className="input-field"
                            placeholder="Universitas Indonesia"
                            value={universitas}
                            onChange={e => setUniversitas(e.target.value)}
                        />
                    </div>

                    <button className="btn-primary" onClick={handleFinish}>
                        🎉 Mulai Catat!
                    </button>
                </div>
            )}
        </div>
    );
}
