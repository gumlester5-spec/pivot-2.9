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

const calculateImpact = (type: TransactionType, amount: number, profitPercentage: number) => {
    let capitalChange = 0;
    let profitChange = 0;
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

        const { capitalChange, profitChange } = calculateImpact(transaction.type, transaction.amount, profitPercentage);

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
    await update(ref(db), updates);

    const summaryRef = ref(db, `users/${userId}/summary`);
    await runTransaction(summaryRef, (currentSummary) => {
        if (!currentSummary) return currentSummary;

        const oldImpact = calculateImpact(oldTransaction.type, oldTransaction.amount, profitPercentage);
        currentSummary.availableCapital = (currentSummary.availableCapital || 0) - oldImpact.capitalChange;
        currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) - oldImpact.profitChange;

        const newImpact = calculateImpact(newTransaction.type, newTransaction.amount, profitPercentage);
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

        const impact = calculateImpact(transaction.type, transaction.amount, profitPercentage);

        currentSummary.availableCapital = (currentSummary.availableCapital || 0) - impact.capitalChange;
        currentSummary.accumulatedProfits = (currentSummary.accumulatedProfits || 0) - impact.profitChange;

        return currentSummary;
    });
};

export const updateSettingsInDB = async (userId: string, settings: Settings) => {
    await set(ref(db, `users/${userId}/settings/`), settings);
};
