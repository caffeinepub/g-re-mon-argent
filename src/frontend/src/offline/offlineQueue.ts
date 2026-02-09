import type { Sale, Expense, UserProfile, ExpenseCategory } from '../backend';
import { useState, useEffect } from 'react';

const DB_NAME = 'cashbook-offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'actionQueue';
const OPTIMISTIC_STORE = 'optimisticData';

interface OfflineAction {
  id: string;
  type: 'createSale' | 'createExpense' | 'setMonthlyGoal' | 'registerUser' | 'saveProfile';
  data: any;
  timestamp: number;
}

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(OPTIMISTIC_STORE)) {
        db.createObjectStore(OPTIMISTIC_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const database = await getDB();
  const id = `${action.type}-${Date.now()}-${Math.random()}`;
  
  const queuedAction: OfflineAction = {
    id,
    ...action,
    timestamp: Date.now(),
  };
  
  return new Promise<string>((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE, OPTIMISTIC_STORE], 'readwrite');
    const queueStore = transaction.objectStore(QUEUE_STORE);
    const optimisticStore = transaction.objectStore(OPTIMISTIC_STORE);
    
    queueStore.add(queuedAction);
    
    // Add optimistic data
    if (action.type === 'createSale') {
      const optimisticSale: Sale = {
        id: BigInt(Date.now()),
        user: null as any,
        date: BigInt(Date.now() * 1_000_000),
        amount: action.data.amount,
        product: action.data.product,
      };
      optimisticStore.put({ id: `sale-${id}`, data: optimisticSale });
    } else if (action.type === 'createExpense') {
      const optimisticExpense: Expense = {
        id: BigInt(Date.now()),
        user: null as any,
        date: BigInt(Date.now() * 1_000_000),
        amount: action.data.amount,
        category: action.data.category,
      };
      optimisticStore.put({ id: `expense-${id}`, data: optimisticExpense });
    }
    
    transaction.oncomplete = () => resolve(id);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getQueuedActions(): Promise<OfflineAction[]> {
  const database = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(QUEUE_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedAction(id: string) {
  const database = await getDB();
  
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE, OPTIMISTIC_STORE], 'readwrite');
    const queueStore = transaction.objectStore(QUEUE_STORE);
    const optimisticStore = transaction.objectStore(OPTIMISTIC_STORE);
    
    queueStore.delete(id);
    
    // Remove optimistic data
    const keysRequest = optimisticStore.getAllKeys();
    keysRequest.onsuccess = () => {
      const keys = keysRequest.result;
      for (const key of keys) {
        if (typeof key === 'string' && key.includes(id)) {
          optimisticStore.delete(key);
        }
      }
    };
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearOptimisticData() {
  const database = await getDB();
  
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([OPTIMISTIC_STORE], 'readwrite');
    const store = transaction.objectStore(OPTIMISTIC_STORE);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllOfflineData() {
  const database = await getDB();
  
  return new Promise<void>((resolve, reject) => {
    const transaction = database.transaction([QUEUE_STORE, OPTIMISTIC_STORE], 'readwrite');
    const queueStore = transaction.objectStore(QUEUE_STORE);
    const optimisticStore = transaction.objectStore(OPTIMISTIC_STORE);
    
    queueStore.clear();
    optimisticStore.clear();
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function mergeOptimisticData<T extends Sale | Expense>(type: 'sales' | 'expenses', serverData: T[]): T[] {
  // In a real implementation, we'd fetch from IndexedDB
  // For now, just return server data
  return serverData;
}

export function useOfflineQueue() {
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const updateQueueLength = async () => {
      try {
        const actions = await getQueuedActions();
        setQueueLength(actions.length);
      } catch (error) {
        console.error('Failed to get queue length:', error);
      }
    };

    updateQueueLength();
    const interval = setInterval(updateQueueLength, 2000);

    return () => clearInterval(interval);
  }, []);

  return { queueLength };
}
