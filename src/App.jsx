import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { IoRefresh } from 'react-icons/io5';
import {
  useProfile,
  useTransactions,
  useSavingGoals,
  useStreak,
  useDarkMode,
  useWallets,
  useOnboarding,
  useToast,
} from './hooks/useStore';

import Layout from './components/Layout';
import QuickAddModal from './components/QuickAddModal';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Analistik from './pages/Analistik';
import Profile from './pages/Profile';
import Transactions from './pages/Transactions';

function App() {
  const [profile, setProfile] = useProfile();
  const { transactions, addTransaction, removeTransaction, updateTransaction } = useTransactions();
  const { goals, addGoal, addToGoal, removeGoal } = useSavingGoals();
  const { streak, recordActivity, resetStreak } = useStreak();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { wallets, addWallet, updateWallet, removeWallet, getDefaultWalletId } = useWallets();
  const { isOnboarded, completeOnboarding, resetOnboarding } = useOnboarding();
  const { toasts, showToast } = useToast();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleAddTransaction = (tx) => {
    addTransaction(tx);
    recordActivity();
    const isIncome = tx.type === 'income';
    showToast(
      isIncome ? '💰 Pemasukan tercatat!' : '📝 Pengeluaran tercatat!',
      tx.catatan || (isIncome ? '+' : '-') + tx.nominal.toLocaleString('id-ID'),
      isIncome ? 'success' : 'info'
    );
  };

  const handleReset = () => {
    resetOnboarding();
    resetStreak();
  };

  if (!isOnboarded) {
    return (
      <Onboarding
        onComplete={completeOnboarding}
        setProfile={setProfile}
      />
    );
  }

  // Safety check: if onboarded but no profile data (e.g. DB wiped but localStorage stale)
  if (!profile) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        color: '#fff',
        background: '#1e272e'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255,255,255,0.1)',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Memuat data...</p>
        <button
          onClick={handleReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#ff6b6b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <IoRefresh /> Reset Data (Jika Macet)
        </button>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div className="toast-message">
              {toast.title && <strong>{toast.title}</strong>}
              {toast.message}
            </div>
          </div>
        ))}
      </div>

      <Layout onQuickAdd={() => setShowQuickAdd(true)}>
        <Routes>
          <Route path="/" element={
            <Dashboard
              profile={profile}
              transactions={transactions}
              goals={goals}
              streak={streak}
              wallets={wallets}
              showToast={showToast}
            />
          } />
          <Route path="/goals" element={
            <Goals
              goals={goals}
              addGoal={addGoal}
              addToGoal={addToGoal}
              removeGoal={removeGoal}
            />
          } />
          <Route path="/analytics" element={
            <Analistik transactions={transactions} />
          } />
          <Route path="/transactions" element={
            <Transactions
              transactions={transactions}
              removeTransaction={removeTransaction}
              updateTransaction={updateTransaction}
              wallets={wallets}
            />
          } />
          <Route path="/profile" element={
            <Profile
              profile={profile}
              setProfile={setProfile}
              resetOnboarding={handleReset}
              showToast={showToast}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              wallets={wallets}
              addWallet={addWallet}
              updateWallet={updateWallet}
              removeWallet={removeWallet}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAdd={handleAddTransaction}
        wallets={wallets}
        defaultWalletId={getDefaultWalletId()}
        addWallet={addWallet}
        showToast={showToast}
      />
    </BrowserRouter>
  );
}

export default App;
