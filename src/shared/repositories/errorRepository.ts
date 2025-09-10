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
      const errors = await this.findAll();
      errors.unshift(error); // Add to beginning for recent first
      
      // Keep only the most recent errors
      const limitedErrors = errors.slice(0, this.maxStorageSize);
      
      localStorage.setItem(this.storageKey, JSON.stringify(limitedErrors));
    } catch (e) {
      console.warn('Failed to save error to localStorage:', e);
    }
  }

  async findAll(): Promise<ErrorReport[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load errors from localStorage:', e);
      return [];
    }
  }

  async findByCategory(category: string): Promise<ErrorReport[]> {
    const errors = await this.findAll();
    return errors.filter(error => error.category === category);
  }

  async findBySeverity(severity: string): Promise<ErrorReport[]> {
    const errors = await this.findAll();
    return errors.filter(error => error.severity === severity);
  }

  async findRecent(limit: number): Promise<ErrorReport[]> {
    const errors = await this.findAll();
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
    const errors = await this.findAll();
    return errors.length;
  }
}

export class IndexedDBErrorRepository implements ErrorRepository {
  private readonly dbName = 'ErrorReportsDB';
  private readonly storeName = 'errorReports';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
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
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(error);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async findAll(): Promise<ErrorReport[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const errors = request.result.sort((a, b) => 
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
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onsuccess = () => {
        const errors = request.result.sort((a, b) => 
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
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('severity');
      const request = index.getAll(severity);
      
      request.onsuccess = () => {
        const errors = request.result.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(errors);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async findRecent(limit: number): Promise<ErrorReport[]> {
    const errors = await this.findAll();
    return errors.slice(0, limit);
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async count(): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();
      
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
export const errorRepository = ErrorRepositoryFactory.create('localStorage');
