import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_WALLETS } from '../db';
import { format } from 'date-fns';

// ==================== DARK MODE ====================
const DARK_KEY = 'sakumate_dark_mode';

export function useDarkMode() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem(DARK_KEY) === 'true';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem(DARK_KEY, darkMode);
    }, [darkMode]);

    // Apply on first load
    useEffect(() => {
        const saved = localStorage.getItem(DARK_KEY) === 'true';
        document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
    }, []);

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return { darkMode, toggleDarkMode };
}


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

    const updateTransaction = async (id, changes) => {
        await db.transactions.update(id, changes);
    };

    const clearTransactions = async () => {
        await db.transactions.clear();
    };

    return { transactions, addTransaction, removeTransaction, updateTransaction, clearTransactions };
}

// ==================== WALLETS ====================
export function useWallets() {
    const wallets = useLiveQuery(() => db.wallets.orderBy('order').toArray()) || [];

    // Auto-seed and Deduplicate (Enhanced)
    useEffect(() => {
        (async () => {
            try {
                // 1. Check for duplicates
                const allWallets = await db.wallets.toArray();
                const groups = {};

                // Group by name
                for (const w of allWallets) {
                    if (!groups[w.name]) groups[w.name] = [];
                    groups[w.name].push(w);
                }

                // Process groups with duplicates
                for (const name in groups) {
                    const group = groups[name];
                    if (group.length > 1) {
                        // Sort: ID 1 first, then Default, then older IDs
                        group.sort((a, b) => {
                            if (a.id === 1) return -1;
                            if (b.id === 1) return 1;
                            if (a.isDefault && !b.isDefault) return -1;
                            if (!a.isDefault && b.isDefault) return 1;
                            return a.id - b.id;
                        });

                        const master = group[0];
                        const victims = group.slice(1);

                        await db.transaction('rw', db.wallets, db.transactions, async () => {
                            for (const v of victims) {
                                // Move transactions to master
                                await db.transactions.where('walletId').equals(v.id).modify({ walletId: master.id });
                                // Delete victim
                                await db.wallets.delete(v.id);
                            }
                        });
                    }
                }

                // 2. Seed if empty
                const count = await db.wallets.count();
                if (count === 0) {
                    await db.wallets.bulkAdd(DEFAULT_WALLETS);
                }
            } catch (error) {
                console.error("Wallet deduplication failed:", error);
            }
        })();
    }, []);

    const addWallet = async (wallet) => {
        const maxOrder = wallets.length > 0 ? Math.max(...wallets.map(w => w.order || 0)) + 1 : 0;
        return await db.wallets.add({ ...wallet, isDefault: false, order: maxOrder });
    };

    const updateWallet = async (id, changes) => {
        await db.wallets.update(id, changes);
    };

    const removeWallet = async (id) => {
        // Move transactions from deleted wallet to the default wallet
        const defaultWallet = wallets.find(w => w.isDefault);
        if (defaultWallet && defaultWallet.id !== id) {
            await db.transactions.where('walletId').equals(id).modify({ walletId: defaultWallet.id });
        }
        await db.wallets.delete(id);
    };

    const getDefaultWalletId = () => {
        const def = wallets.find(w => w.isDefault);
        return def ? def.id : (wallets[0]?.id || null);
    };

    return { wallets, addWallet, updateWallet, removeWallet, getDefaultWalletId };
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

    const resetOnboarding = async () => {
        setIsOnboarded(false);
        localStorage.removeItem('sakumate_onboarded');
        localStorage.removeItem(STREAK_KEY);

        await db.transaction('rw', db.transactions, db.profile, db.savingGoals, db.wallets, async () => {
            await db.transactions.clear();
            await db.profile.clear();
            await db.savingGoals.clear();
            await db.wallets.clear();
            // Re-seed wallets immediately so the app is not empty on next start
            await db.wallets.bulkAdd(DEFAULT_WALLETS);
        });
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
