
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, child, remove, update } from "firebase/database";
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
import type { Transaction, FinancialSummary, Settings } from '../types';

// Your web app's Firebase configuration is now read from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// --- Authentication Functions ---
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

// --- User-Scoped Database Functions ---
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


export const addTransactionToDB = async (userId: string, transaction: Omit<Transaction, 'id'>) => {
    const newTransactionKey = push(child(ref(db), `users/${userId}/transactions`)).key;
    if (!newTransactionKey) {
        throw new Error("Could not generate a new key for transaction.");
    }
    await set(ref(db, `users/${userId}/transactions/${newTransactionKey}`), transaction);
    return { ...transaction, id: newTransactionKey };
};

export const updateTransactionInDB = async (userId: string, transaction: Pick<Transaction, 'id' | 'amount' | 'description'>) => {
    const updates: { [key: string]: any } = {};
    updates[`/users/${userId}/transactions/${transaction.id}/amount`] = transaction.amount;
    updates[`/users/${userId}/transactions/${transaction.id}/description`] = transaction.description;
    await update(ref(db), updates);
};

export const deleteTransactionInDB = async (userId: string, transactionId: string) => {
    await remove(ref(db, `users/${userId}/transactions/${transactionId}`));
};

export const updateSummaryInDB = async (userId: string, summary: FinancialSummary) => {
  await set(ref(db, `users/${userId}/summary/`), summary);
};

export const updateSettingsInDB = async (userId: string, settings: Settings) => {
  await set(ref(db, `users/${userId}/settings/`), settings);
};
