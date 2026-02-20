import Dexie from 'dexie';

export const db = new Dexie('SakuMateDB');

// v1 schema (legacy)
db.version(1).stores({
    profile: '++id',
    transactions: '++id, timestamp, kategori',
    fixedExpenses: '++id, nama'
});

// v2: transactions get 'type', drop fixedExpenses
db.version(2).stores({
    profile: '++id',
    transactions: '++id, timestamp, type, kategori',
    fixedExpenses: null,
}).upgrade(tx => {
    return tx.table('transactions').toCollection().modify(t => {
        if (!t.type) t.type = 'expense';
    });
});

// v3: add savingGoals table
db.version(3).stores({
    profile: '++id',
    transactions: '++id, timestamp, type, kategori',
    savingGoals: '++id, nama',
});

// v4: add wallets table + walletId on transactions
db.version(4).stores({
    profile: '++id',
    transactions: '++id, timestamp, type, kategori, walletId',
    savingGoals: '++id, nama',
    wallets: '++id, name, order',
}).upgrade(tx => {
    // 1. Create all default wallets
    return tx.table('wallets').bulkAdd([
        { name: 'Tunai', icon: '💵', color: '#1dd1a1', isDefault: true, order: 0 },
        { name: 'OVO', icon: '💜', color: '#4c2a86', isDefault: false, order: 1 },
        { name: 'GoPay', icon: '💚', color: '#00aa13', isDefault: false, order: 2 },
        { name: 'Dana', icon: '💙', color: '#108ee9', isDefault: false, order: 3 },
        { name: 'Bank', icon: '🏦', color: '#54a0ff', isDefault: false, order: 4 },
    ]).then(() => {
        // 2. Get ID of 'Tunai' (should be 1 since it's the first one inserted and auto-increment)
        // Assign all existing transactions to it
        return tx.table('transactions').toCollection().modify(t => {
            if (!t.walletId) t.walletId = 1;
        });
    });
});

// Default wallets to seed on first use
export const DEFAULT_WALLETS = [
    { name: 'Tunai', icon: 'cash', color: '#1dd1a1', isDefault: true, order: 0 },
];

export const WALLET_ICONS = ['wallet', 'cash', 'card', 'phone', 'bank', 'store', 'gift', 'rocket', 'shield', 'dollar', 'star', 'heart', 'diamond', 'flash', 'trending'];
export const WALLET_COLORS = ['#1dd1a1', '#4c2a86', '#00aa13', '#108ee9', '#54a0ff', '#e17055', '#fdcb6e', '#6c5ce7', '#00b894', '#ff6b6b'];
