import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// ==================== PROFILE ====================
const DEFAULT_PROFILE = {
    nama: '',
    universitas: '',
    avatarEmoji: '😊',
};

export function useProfile() {
    const profileList = useLiveQuery(() => db.profile.toArray());
    const profile = profileList?.[0] || DEFAULT_PROFILE;

    const setProfile = async (newProfile) => {
        const existing = await db.profile.toArray();
        if (existing.length > 0) {
            await db.profile.update(existing[0].id, newProfile);
        } else {
            await db.profile.add(newProfile);
        }
    };

    return [profile, setProfile];
}

// ==================== TRANSACTIONS ====================
export function useTransactions() {
    const transactions = useLiveQuery(() =>
        db.transactions.orderBy('timestamp').reverse().toArray()
    ) || [];

    const addTransaction = async (tx) => {
        await db.transactions.add(tx);
    };

    const removeTransaction = async (id) => {
        await db.transactions.delete(id);
    };

    const clearTransactions = async () => {
        await db.transactions.clear();
    };

    return { transactions, addTransaction, removeTransaction, clearTransactions };
}

// ==================== SAVING GOALS ====================
export function useSavingGoals() {
    const goals = useLiveQuery(() => db.savingGoals.toArray()) || [];

    const addGoal = async (goal) => {
        await db.savingGoals.add({
            ...goal,
            savedAmount: 0,
            createdAt: new Date().toISOString(),
        });
    };

    const addToGoal = async (id, amount) => {
        const goal = await db.savingGoals.get(id);
        if (goal) {
            await db.savingGoals.update(id, {
                savedAmount: (goal.savedAmount || 0) + amount,
            });
        }
    };

    const removeGoal = async (id) => {
        await db.savingGoals.delete(id);
    };

    const updateGoal = async (id, data) => {
        await db.savingGoals.update(id, data);
    };

    return { goals, addGoal, addToGoal, removeGoal, updateGoal };
}

// ==================== STREAK ====================
const STREAK_KEY = 'sakumate_streak';

function readStreak() {
    try {
        return JSON.parse(localStorage.getItem(STREAK_KEY)) || {
            count: 0,
            longest: 0,
            lastDate: null,
        };
    } catch { return { count: 0, longest: 0, lastDate: null }; }
}

function writeStreak(data) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export function useStreak() {
    const [streak, setStreak] = useState(() => readStreak());

    // Call this whenever a transaction is added
    const recordActivity = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const s = readStreak();

        if (s.lastDate === today) return; // already logged today

        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        const newCount = s.lastDate === yesterday ? s.count + 1 : 1;
        const newLongest = Math.max(newCount, s.longest);

        const updated = { count: newCount, longest: newLongest, lastDate: today };
        writeStreak(updated);
        setStreak(updated);
    };

    const resetStreak = () => {
        const reset = { count: 0, longest: 0, lastDate: null };
        writeStreak(reset);
        setStreak(reset);
    };

    return { streak, recordActivity, resetStreak };
}

// ==================== ONBOARDING ====================
export function useOnboarding() {
    const [isOnboarded, setIsOnboarded] = useState(() => {
        try { return localStorage.getItem('sakumate_onboarded') === 'true'; }
        catch { return false; }
    });

    const completeOnboarding = () => {
        setIsOnboarded(true);
        localStorage.setItem('sakumate_onboarded', 'true');
    };

    const resetOnboarding = () => {
        setIsOnboarded(false);
        localStorage.removeItem('sakumate_onboarded');
        localStorage.removeItem(STREAK_KEY);
        db.transactions.clear();
        db.profile.clear();
        db.savingGoals.clear();
    };

    return { isOnboarded, completeOnboarding, resetOnboarding };
}

// ==================== TOAST ====================
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = (title, message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    return { toasts, showToast };
}
