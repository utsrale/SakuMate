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
