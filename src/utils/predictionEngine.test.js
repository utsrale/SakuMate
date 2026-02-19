import { describe, it, expect } from 'vitest';
import {
    calculateSmartAllocation,
    calculateDailySafeToSpend,
    calculateCurrentBalance,
    calculateRollover,
    formatRupiah
} from './predictionEngine';

describe('Prediction Engine', () => {
    it('should calculate smart allocation correctly (Fix + 60% Survival + 40% Flex)', () => {
        const income = 1000000;
        const fixedExpenses = [{ nominal: 100000 }]; // Fix Cost = 100k

        // Remaining = 900,000
        // Survival = 900,000 * 0.6 = 540,000
        // Flex = 900,000 * 0.4 = 360,000

        const allocation = calculateSmartAllocation(income, fixedExpenses);

        expect(allocation.fixCost).toBe(100000);
        expect(allocation.survivalFund).toBe(540000);
        expect(allocation.flexFund).toBe(360000);
        expect(allocation.total).toBe(income);
    });

    it('should calculate daily safe to spend correctly', () => {
        const currentBalance = 3000000;
        const fixedExpenses = [];
        const sendDay = 25; // Tanggal kiriman (number)

        const result = calculateDailySafeToSpend(currentBalance, fixedExpenses, sendDay);

        expect(result.dailyBudget).toBeGreaterThan(0);
        expect(result.daysLeft).toBeGreaterThan(0);
    });

    it('should format rupiah correctly', () => {
        // Note: Intl format might include non-breaking space (d result 160 vs 32)
        // We just check if it contains the number string
        expect(formatRupiah(10000)).toContain('10.000');
        expect(formatRupiah(0)).toContain('0');
    });

    it('should calculate rollover correctly', () => {
        const dailyBudget = 100000;
        const todaySpent = 80000;
        const rollover = calculateRollover(dailyBudget, todaySpent);

        expect(rollover.saved).toBe(20000);
        expect(rollover.spentPercent).toBe(80);
        // Rollover status property does not exist in implementation
    });

    it('should calculate current balance from transactions', () => {
        const income = 1000000;
        const fixedExpenses = []; // Assume none for simplicity
        const transactions = [
            { nominal: 50000 },
            { nominal: 20000 }
        ];

        // Balance = Income - Fixed(Paid) - Transactions
        // 1,000,000 - 0 - 70,000 = 930,000

        const balance = calculateCurrentBalance(income, fixedExpenses, transactions, 1);
        expect(balance).toBe(930000);
    });
});
