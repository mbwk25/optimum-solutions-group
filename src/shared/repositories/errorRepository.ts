/**
 * @fileoverview Error Repository Pattern
 * @description Data access layer for error persistence
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { ErrorReport } from '../services/errorReportingService';

export interface ErrorRepository {
  save(error: ErrorReport): Promise<void>;
  findAll(): Promise<ErrorReport[]>;
  findByCategory(category: string): Promise<ErrorReport[]>;
  findBySeverity(severity: string): Promise<ErrorReport[]>;
  findRecent(limit: number): Promise<ErrorReport[]>;
  clear(): Promise<void>;
  count(): Promise<number>;
}

export class LocalStorageErrorRepository implements ErrorRepository {
  private readonly storageKey = 'app_error_reports';
  private readonly maxStorageSize = 50; // Limit stored errors

  async save(error: ErrorReport): Promise<void> {
    try {
      const errors: ErrorReport[] = await this.findAll();
      errors.unshift(error); // Add to beginning for recent first
      
      // Keep only the most recent errors
      const limitedErrors: ErrorReport[] = errors.slice(0, this.maxStorageSize);
      
      localStorage.setItem(this.storageKey, JSON.stringify(limitedErrors));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        // Clear oldest errors and retry
        const errors: ErrorReport[] = await this.findAll();
        // Ensure we drop at least one entry by capping to maxStorageSize - 1
        const newLength: number = Math.min(errors.length, this.maxStorageSize - 1);
        const reducedErrors: ErrorReport[] = errors.slice(0, newLength);
        reducedErrors.unshift(error);
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(reducedErrors));
        } catch (retryError) {
          if (e instanceof DOMException && retryError instanceof DOMException && retryError.name === 'QuotaExceededError') {
            console.error('Failed to save error even after clearing space:', retryError);
          } else {
            console.warn('Failed to save error to localStorage:', retryError);
          }
        }
      } else {
        console.warn('Failed to save error to localStorage:', e);
      }
    }
  }
  async findAll(): Promise<ErrorReport[]> {
    try {
      const data: string | null = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load errors from localStorage:', e);
      return [];
    }
  }

  async findByCategory(category: string): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = await this.findAll();
    return errors.filter((error: ErrorReport) => error.category === category);
  }

  async findBySeverity(severity: string): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = await this.findAll();
    return errors.filter((error: ErrorReport) => error.severity === severity);
  }

  async findRecent(limit: number): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = await this.findAll();
    return errors.slice(0, limit);
  }

  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Failed to clear errors from localStorage:', e);
    }
  }

  async count(): Promise<number> {
    const errors: ErrorReport[] = await this.findAll();
    return errors.length;
  }
}

export class IndexedDBErrorRepository implements ErrorRepository {
  private readonly dbName = 'ErrorReportsDB';
  private readonly storeName = 'errorReports';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db: IDBDatabase = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store: IDBObjectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('severity', 'severity', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async save(error: ErrorReport): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readwrite');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const request: IDBRequest = store.put(error);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async findAll(): Promise<ErrorReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readonly');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const request: IDBRequest = store.getAll();
      
      request.onsuccess = () => {
        const errors: ErrorReport[] = request.result.sort((a: ErrorReport, b: ErrorReport) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(errors);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findByCategory(category: string): Promise<ErrorReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readonly');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const index: IDBIndex = store.index('category');
      const request: IDBRequest = index.getAll(category);
      
      request.onsuccess = () => {
        const errors: ErrorReport[] = request.result.sort((a: ErrorReport, b: ErrorReport) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(errors);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findBySeverity(severity: string): Promise<ErrorReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readonly');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const index: IDBIndex = store.index('severity');
      const request: IDBRequest = index.getAll(severity);
      
      request.onsuccess = () => {
        const errors: ErrorReport[] = request.result.sort((a: ErrorReport, b: ErrorReport) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(errors);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findRecent(limit: number): Promise<ErrorReport[]> {
    const errors: ErrorReport[] = await this.findAll();
    return errors.slice(0, limit);
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readwrite');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const request: IDBRequest = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction: IDBTransaction = this.db!.transaction([this.storeName], 'readonly');
      const store: IDBObjectStore = transaction.objectStore(this.storeName);
      const request: IDBRequest = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Factory for creating repositories
export class ErrorRepositoryFactory {
  static create(type: 'localStorage' | 'indexedDB'): ErrorRepository {
    switch (type) {
      case 'localStorage':
        return new LocalStorageErrorRepository();
      case 'indexedDB':
        return new IndexedDBErrorRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}

// Default repository instance
export const errorRepository: ErrorRepository = ErrorRepositoryFactory.create('localStorage');
