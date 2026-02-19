import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  useProfile,
  useTransactions,
  useSavingGoals,
  useStreak,
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
  const { transactions, addTransaction, removeTransaction } = useTransactions();
  const { goals, addGoal, addToGoal, removeGoal, updateGoal } = useSavingGoals();
  const { streak, recordActivity, resetStreak } = useStreak();
  const { isOnboarded, completeOnboarding, resetOnboarding } = useOnboarding();
  const { toasts, showToast } = useToast();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleAddTransaction = (tx) => {
    addTransaction(tx);
    recordActivity(); // Update streak
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
            />
          } />
          <Route path="/profile" element={
            <Profile
              profile={profile}
              setProfile={setProfile}
              transactions={transactions}
              resetOnboarding={handleReset}
              showToast={showToast}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onAdd={handleAddTransaction}
      />
    </BrowserRouter>
  );
}

export default App;
