/**
 * Resilient dual-storage helper using IndexedDB + localStorage.
 * IndexedDB provides virtually unlimited storage (gigabytes) on mobile and desktop browsers,
 * preventing any QuotaExceededError when storing products with high-definition photos.
 */

const DB_NAME = 'bazar_sucesso_db_v2';
const DB_VERSION = 1;
const STORE_NAME = 'keyval_store';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? request.result : null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('idbGet fallback due to error:', err);
    return null;
  }
}

export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('idbSet error:', err);
  }
}

export async function idbRemove(key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('idbRemove error:', err);
  }
}

/**
 * Safely saves data to both localStorage and IndexedDB.
 * Gracefully catches QuotaExceededError on localStorage without crashing.
 */
export function safeSave<T>(key: string, data: T): void {
  // 1. Save to IndexedDB (asynchronously, unlimited quota)
  idbSet(key, data).catch((e) => console.warn('Failed to save to IndexedDB:', e));

  // 2. Try saving to localStorage for quick synchronous bootstrapping
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    // If QuotaExceededError happens on mobile localStorage, log softly
    console.warn(`localStorage quota reached for key "${key}". Data is safely retained in IndexedDB.`, e);
  }
}

/**
 * Safely removes key from both stores
 */
export function safeRemove(key: string): void {
  idbRemove(key).catch((e) => console.warn('Failed to remove from IndexedDB:', e));
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(e);
  }
}
