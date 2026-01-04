import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, child, remove, update, runTransaction } from "firebase/database";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type User
} from "firebase/auth";
import { type Transaction, type FinancialSummary, type Settings, TransactionType } from '../types';
import { validateTransaction } from "../utils/validators";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
};

export const signUpWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
    return signOut(auth);
};

export const onAuthUserChanged = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
}

export const setupTransactionsListener = (userId: string, callback: (transactions: Transaction[]) => void) => {
    const transactionsRef = ref(db, `users/${userId}/transactions/`);
    return onValue(transactionsRef, (snapshot) => {
        const data = snapshot.val();
        const transactionList: Transaction[] = [];
        for (let id in data) {
            transactionList.push({ id, ...data[id] });
        }
        callback(transactionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
};

export const setupSummaryListener = (userId: string, callback: (summary: FinancialSummary) => void) => {
    const summaryRef = ref(db, `users/${userId}/summary/`);
    return onValue(summaryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            callback(data);
        } else {
            const initialSummary = { availableCapital: 0, accumulatedProfits: 0 };
            set(ref(db, `users/${userId}/summary`), initialSummary);
            callback(initialSummary);
        }
    });
};

export const setupSettingsListener = (userId: string, callback: (settings: Settings) => void) => {
    const settingsRef = ref(db, `users/${userId}/settings/`);
    return onValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            callback(data);
        } else {
            const initialSettings = { profitPercentage: 20 };
            set(ref(db, `users/${userId}/settings`), initialSettings);
            callback(initialSettings);
        }
    });
};

const calculateImpact = (type: TransactionType, amount: number, profitPercentage: number, isCredit: boolean = false, isExtraIncome: boolean = false, extraIncomeType?: 'capital' | 'profit') => {
    let capitalChange = 0;
    let profitChange = 0;

    if (isCredit) {
        return { capitalChange: 0, profitChange: 0 };
    }

    if (isExtraIncome && extraIncomeType) {
        if (extraIncomeType === 'capital') {
            return { capitalChange: amount, profitChange: 0 };
        } else if (extraIncomeType === 'profit') {
            return { capitalChange: 0, profitChange: amount };
        }
    }

    switch (type) {
        case TransactionType.Sale:
            const profit = amount * (profitPercentage / 100);
            profitChange = profit;
            capitalChange = amount - profit;
            break;
        case TransactionType.Purchase:
            capitalChange = -amount;
            break;
        case TransactionType.Expense:
            profitChange = -amount;
            break;
    }
    return { capitalChange, profitChange };
}

export const addPaymentAtomic = async (userId: string, transactionId: string, paymentAmount: number, note: string, profitPercentage: number) => {
    const transactionRef = ref(db, `users/${userId}/transactions/${transactionId}`);

    await runTransaction(transactionRef, (transaction) => {
        if (!transaction) return;

        if (!transaction.payments) transaction.payments = [];
        if (!transaction.amountPaid) transaction.amountPaid = 0;

        const newPayment = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            amount: paymentAmount,
            note
        };

        transaction.payments.push(newPayment);
        transaction.amountPaid += paymentAmount;

        if (transaction.amountPaid >= transaction.amount) {
            transaction.isPaid = true;
        }

        return transaction;
    });

    // Update Summary with the REALIZED cash
    const summaryRef = ref(db, `users/${userId}/summary`);

    // Fetch transaction type to know how to calculate impact
    const transactionTypeSnap = await new Promise<any>((resolve) =>
        onValue(child(ref(db), `users/${userId}/transactions/${transactionId}/type`), resolve, { onlyOnce: true })
    );
    const transactionType = transactionTypeSnap.val();

    await runTransaction(summaryRef, (currentSummary) => {
        if (!currentSummary) return { availableCapital: 0, accumulatedProfits: 0 };

        if (transactionType === TransactionType.Purchase || transactionType === TransactionType.Expense) {
            // For purchases/expenses, a payment means money LEAVING the capital.
            // User requested "solo el capital" for purchases.
            currentSummary.availableCapital = (currentSummary.availableCapital || 0) - paymentAmount;
        } else {
            // Default to Sale logic (money entering)
            const profitFromPayment = paymentAmount * (profitPercentage / 100);
            const capitalFromPayment = paymentAmount - profitFromPayment;

            currentSummary.availableCapital = (currentSummary.availableCapital || 0) + capitalFromPayment;
            currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) + profitFromPayment;
        }

        return currentSummary;
    });
};

export const addTransactionAtomic = async (userId: string, transaction: Omit<Transaction, 'id'>, profitPercentage: number) => {
    const validation = validateTransaction(transaction);
    if (!validation.success) {
        throw new Error("Datos inválidos: " + validation.error);
    }

    const newTransactionKey = push(child(ref(db), `users/${userId}/transactions`)).key;
    if (!newTransactionKey) {
        throw new Error("Could not generate a new key for transaction.");
    }

    const transactionWithId = { ...transaction, id: newTransactionKey };

    await set(ref(db, `users/${userId}/transactions/${newTransactionKey}`), transaction);

    const summaryRef = ref(db, `users/${userId}/summary`);
    await runTransaction(summaryRef, (currentSummary) => {
        if (currentSummary === null) {
            return { availableCapital: 0, accumulatedProfits: 0 };
        }

        const { capitalChange, profitChange } = calculateImpact(
            transaction.type,
            transaction.amount,
            profitPercentage,
            transaction.isCredit,
            transaction.isExtraIncome,
            transaction.extraIncomeType
        );

        currentSummary.availableCapital = (currentSummary.availableCapital || 0) + capitalChange;
        currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) + profitChange;

        return currentSummary;
    });

    return transactionWithId;
};

export const editTransactionAtomic = async (userId: string, oldTransaction: Transaction, newTransaction: Transaction, profitPercentage: number) => {
    const validation = validateTransaction(newTransaction);
    if (!validation.success) {
        throw new Error("Datos inválidos: " + validation.error);
    }

    const updates: { [key: string]: any } = {};
    updates[`/users/${userId}/transactions/${newTransaction.id}/amount`] = newTransaction.amount;
    updates[`/users/${userId}/transactions/${newTransaction.id}/description`] = newTransaction.description;

    // Persist Credit/Type changes
    if (newTransaction.type !== undefined) updates[`/users/${userId}/transactions/${newTransaction.id}/type`] = newTransaction.type;

    if (newTransaction.isCredit !== undefined) {
        updates[`/users/${userId}/transactions/${newTransaction.id}/isCredit`] = newTransaction.isCredit;
    }

    if (newTransaction.clientName !== undefined) {
        updates[`/users/${userId}/transactions/${newTransaction.id}/clientName`] = newTransaction.clientName;
    } else if (oldTransaction.clientName && !newTransaction.clientName) {
        // If it had a name but now doesn't (switched to cash), remove it? 
        // Or just leave it as legacy data. Better to be safe and set to null if we want to remove.
        // For now let's just update if present.
    }

    // Persist Extra Income changes
    if (newTransaction.isExtraIncome !== undefined) {
        updates[`/users/${userId}/transactions/${newTransaction.id}/isExtraIncome`] = newTransaction.isExtraIncome;
    }
    if (newTransaction.extraIncomeType !== undefined) {
        updates[`/users/${userId}/transactions/${newTransaction.id}/extraIncomeType`] = newTransaction.extraIncomeType;
    }

    // Check if paid status needs update based on new amount
    if (newTransaction.isCredit) {
        const amountPaid = oldTransaction.amountPaid || 0;
        const isPaid = amountPaid >= newTransaction.amount;
        updates[`/users/${userId}/transactions/${newTransaction.id}/isPaid`] = isPaid;
    }

    await update(ref(db), updates);

    const summaryRef = ref(db, `users/${userId}/summary`);
    await runTransaction(summaryRef, (currentSummary) => {
        if (!currentSummary) return currentSummary;

        const oldImpact = calculateImpact(oldTransaction.type, oldTransaction.amount, profitPercentage, oldTransaction.isCredit, oldTransaction.isExtraIncome, oldTransaction.extraIncomeType);
        currentSummary.availableCapital = (currentSummary.availableCapital || 0) - oldImpact.capitalChange;
        currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) - oldImpact.profitChange;

        const newImpact = calculateImpact(newTransaction.type, newTransaction.amount, profitPercentage, newTransaction.isCredit, newTransaction.isExtraIncome, newTransaction.extraIncomeType);
        currentSummary.availableCapital += newImpact.capitalChange;
        currentSummary.accumulatedProfits += newImpact.profitChange;

        return currentSummary;
    });
};

export const deleteTransactionAtomic = async (userId: string, transaction: Transaction, profitPercentage: number) => {
    await remove(ref(db, `users/${userId}/transactions/${transaction.id}`));

    const summaryRef = ref(db, `users/${userId}/summary`);
    await runTransaction(summaryRef, (currentSummary) => {
        if (!currentSummary) return currentSummary;

        const impact = calculateImpact(
            transaction.type,
            transaction.amount,
            profitPercentage,
            transaction.isCredit,
            transaction.isExtraIncome,
            transaction.extraIncomeType
        );

        currentSummary.availableCapital = (currentSummary.availableCapital || 0) - impact.capitalChange;
        currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) - impact.profitChange;

        // Revert payments impact if it was a credit transaction
        if (transaction.isCredit && transaction.payments) {
            const paymentsList = Array.isArray(transaction.payments) ? transaction.payments : Object.values(transaction.payments);

            paymentsList.forEach((p: any) => {
                const paymentAmount = p.amount;

                if (transaction.type === TransactionType.Purchase || transaction.type === TransactionType.Expense) {
                    // Payment on purchase/expense REDUCED capital. To revert, ADD it back.
                    currentSummary.availableCapital += paymentAmount;
                } else {
                    // Payment on sale INCREASED capital and profit. To revert, SUBTRACT.
                    const profitFromPayment = paymentAmount * (profitPercentage / 100);
                    const capitalFromPayment = paymentAmount - profitFromPayment;

                    currentSummary.availableCapital -= capitalFromPayment;
                    currentSummary.accumulatedProfits -= profitFromPayment;
                }
            });
        }

        return currentSummary;
    });
};

export const updateSettingsInDB = async (userId: string, settings: Settings) => {
    await set(ref(db, `users/${userId}/settings/`), settings);
};

export const recalculateSummary = async (userId: string) => {
    const transactionsRef = ref(db, `users/${userId}/transactions`);
    const settingsRef = ref(db, `users/${userId}/settings`);

    // Get all data at once to ensure consistency
    const [transactionsSnap, settingsSnap] = await Promise.all([
        new Promise<any>((resolve) => onValue(transactionsRef, resolve, { onlyOnce: true })),
        new Promise<any>((resolve) => onValue(settingsRef, resolve, { onlyOnce: true }))
    ]);

    const transactions = transactionsSnap.val();
    const settings = settingsSnap.val() || { profitPercentage: 20 };
    const profitPercentage = settings.profitPercentage;

    let availableCapital = 0;
    let accumulatedProfits = 0;

    if (transactions) {
        Object.values(transactions).forEach((t: any) => {
            // Impact from the transaction itself (Sale/Purchase/Expense)
            const { capitalChange, profitChange } = calculateImpact(t.type, t.amount, profitPercentage, t.isCredit, t.isExtraIncome, t.extraIncomeType);
            availableCapital += capitalChange;
            accumulatedProfits += profitChange;

            // Impact from Payments on Credit Sales/Purchases
            if (t.isCredit && t.payments) {
                Object.values(t.payments).forEach((p: any) => {
                    const paymentAmount = p.amount;

                    if (t.type === TransactionType.Purchase || t.type === TransactionType.Expense) {
                        // Payment on purchase reduces capital
                        availableCapital -= paymentAmount;
                    } else {
                        // Payment on sale increases capital and profit
                        const profitFromPayment = paymentAmount * (profitPercentage / 100);
                        const capitalFromPayment = paymentAmount - profitFromPayment;

                        availableCapital += capitalFromPayment;
                        accumulatedProfits += profitFromPayment;
                    }
                });
            }
        });
    }

    // Force update the summary
    await set(ref(db, `users/${userId}/summary`), {
        availableCapital,
        accumulatedProfits
    });

    return { availableCapital, accumulatedProfits };
};
