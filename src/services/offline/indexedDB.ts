import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB Schema
 */
interface SchoolOSDB extends DBSchema {
  user: {
    key: string;
    value: Record<string, unknown>;
  };
  grades: {
    key: string;
    value: Record<string, unknown>;
    indexes: { 'by-student': string };
  };
  attendance: {
    key: string;
    value: Record<string, unknown>;
    indexes: { 'by-student': string; 'by-date': string };
  };
  exams: {
    key: string;
    value: Record<string, unknown>;
  };
  fees: {
    key: string;
    value: Record<string, unknown>;
    indexes: { 'by-student': string };
  };
  messages: {
    key: string;
    value: Record<string, unknown>;
    indexes: { 'by-read': string };
  };
  timetable: {
    key: string;
    value: Record<string, unknown>;
  };
  syncQueue: {
    key: string;
    value: Record<string, unknown>;
    indexes: { 'by-status': string };
  };
  conflictLog: {
    key: string;
    value: Record<string, unknown>;
  };
}

const DB_NAME = 'schoolos-db';
const DB_VERSION = 1;

let db: IDBPDatabase<SchoolOSDB> | null = null;

/**
 * Initialize IndexedDB
 */
export const initializeDB = async (): Promise<IDBPDatabase<SchoolOSDB>> => {
  if (db) return db;

  db = await openDB<SchoolOSDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // User store
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user');
      }

      // Grades store
      if (!db.objectStoreNames.contains('grades')) {
        const gradesStore = db.createObjectStore('grades', { keyPath: 'id' });
        gradesStore.createIndex('by-student', 'studentId');
      }

      // Attendance store
      if (!db.objectStoreNames.contains('attendance')) {
        const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' });
        attendanceStore.createIndex('by-student', 'studentId');
        attendanceStore.createIndex('by-date', 'date');
      }

      // Exams store
      if (!db.objectStoreNames.contains('exams')) {
        db.createObjectStore('exams', { keyPath: 'id' });
      }

      // Fees store
      if (!db.objectStoreNames.contains('fees')) {
        const feesStore = db.createObjectStore('fees', { keyPath: 'id' });
        feesStore.createIndex('by-student', 'studentId');
      }

      // Messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('by-read', 'isRead');
      }

      // Timetable store
      if (!db.objectStoreNames.contains('timetable')) {
        db.createObjectStore('timetable', { keyPath: 'id' });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncQueueStore = db.createObjectStore('syncQueue');
        syncQueueStore.createIndex('by-status', 'status');
      }

      // Conflict log store
      if (!db.objectStoreNames.contains('conflictLog')) {
        db.createObjectStore('conflictLog');
      }
    },
  });

  return db;
};

/**
 * Get database instance
 */
export const getDB = async (): Promise<IDBPDatabase<SchoolOSDB>> => {
  if (!db) {
    return initializeDB();
  }
  return db;
};

/**
 * Add or update item in store
 */
export const setItem = async <T extends keyof SchoolOSDB>(
  storeName: T,
  key: string,
  value: SchoolOSDB[T]['value']
): Promise<void> => {
  const database = await getDB();
  
  // For stores with keyPath (grades, attendance, exams, fees, messages, timetable),
  // don't pass the key parameter - it's extracted from the value
  const storesWithKeyPath = ['grades', 'attendance', 'exams', 'fees', 'messages', 'timetable'];
  
  if (storesWithKeyPath.includes(storeName as string)) {
    // Ensure the value has the id field set
    const valueWithId = { ...value, id: key };
    await database.put(storeName as any, valueWithId);
  } else {
    // For stores without keyPath (user, syncQueue, conflictLog), pass the key
    await database.put(storeName as any, value, key);
  }
};

/**
 * Get item from store
 */
export const getItem = async <T extends keyof SchoolOSDB>(
  storeName: T,
  key: string
): Promise<SchoolOSDB[T]['value'] | undefined> => {
  const database = await getDB();
  return database.get(storeName as any, key);
};

/**
 * Delete item from store
 */
export const deleteItem = async <T extends keyof SchoolOSDB>(
  storeName: T,
  key: string
): Promise<void> => {
  const database = await getDB();
  await database.delete(storeName as any, key);
};

/**
 * Get all items from store
 */
export const getAllItems = async <T extends keyof SchoolOSDB>(
  storeName: T
): Promise<SchoolOSDB[T]['value'][]> => {
  const database = await getDB();
  return database.getAll(storeName as any);
};

/**
 * Clear store
 */
export const clearStore = async <T extends keyof SchoolOSDB>(storeName: T): Promise<void> => {
  const database = await getDB();
  await database.clear(storeName as any);
};

/**
 * Clear all stores
 */
export const clearAllStores = async (): Promise<void> => {
  const database = await getDB();
  const storeNames = Array.from(database.objectStoreNames);

  for (const storeName of storeNames) {
    await database.clear(storeName as any);
  }
};

/**
 * Get items by index
 */
export const getItemsByIndex = async <T extends keyof SchoolOSDB>(
  storeName: T,
  indexName: string,
  value: unknown
): Promise<SchoolOSDB[T]['value'][]> => {
  const database = await getDB();
  const store = database.transaction(storeName as any).objectStore(storeName as any);
  const index = (store as any).index(indexName);
  return index.getAll(value as IDBKeyRange);
};

/**
 * Count items in store
 */
export const countItems = async <T extends keyof SchoolOSDB>(storeName: T): Promise<number> => {
  const database = await getDB();
  return database.count(storeName as any);
};

/**
 * Close database connection
 */
export const closeDB = async (): Promise<void> => {
  if (db) {
    db.close();
    db = null;
  }
};

export default {
  initializeDB,
  getDB,
  setItem,
  getItem,
  deleteItem,
  getAllItems,
  clearStore,
  clearAllStores,
  getItemsByIndex,
  countItems,
  closeDB,
};
