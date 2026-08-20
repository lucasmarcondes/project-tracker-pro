import type { Project } from '../types/project';
import { INITIAL_NOTEPAD_CONTENT, generateSampleProjects } from '../utils/sampleData';

const DB_NAME = 'ProjectTrackerProDB';
const DB_VERSION = 1;

const STORE_PROJECTS = 'projects';
const STORE_NOTEPAD = 'notepad';
const STORE_SETTINGS = 'settings';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        const projectStore = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        projectStore.createIndex('completed', 'completed', { unique: false });
        projectStore.createIndex('dueDate', 'dueDate', { unique: false });
        projectStore.createIndex('projectNo', 'projectNo', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NOTEPAD)) {
        db.createObjectStore(STORE_NOTEPAD, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/* -------------------------------------------------------------
 * LocalStorage Fallbacks
 * ------------------------------------------------------------- */
const LS_PROJECTS = 'ptp_projects_fallback';
const LS_NOTEPAD = 'ptp_notepad_fallback';
const LS_SETTINGS = 'ptp_settings_fallback_';

function getFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

/* -------------------------------------------------------------
 * Project CRUD Operations
 * ------------------------------------------------------------- */

export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as Project[];
        if (!results || results.length === 0) {
          // Check if first time initialization is needed
          const isInitialized = getFromLocalStorage('ptp_initialized', false);
          if (!isInitialized) {
            const initial = generateSampleProjects();
            bulkSaveProjects(initial).then(() => {
              saveToLocalStorage('ptp_initialized', true);
              resolve(initial);
            });
            return;
          }
        }
        resolve(results || []);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using localStorage fallback:', err);
    let list = getFromLocalStorage<Project[]>(LS_PROJECTS, []);
    if (!list || list.length === 0) {
      list = generateSampleProjects();
      saveToLocalStorage(LS_PROJECTS, list);
    }
    return list;
  }
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.put(project);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = getFromLocalStorage<Project[]>(LS_PROJECTS, []);
    const idx = list.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      list[idx] = project;
    } else {
      list.push(project);
    }
    saveToLocalStorage(LS_PROJECTS, list);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = getFromLocalStorage<Project[]>(LS_PROJECTS, []);
    const filtered = list.filter((p) => p.id !== id);
    saveToLocalStorage(LS_PROJECTS, filtered);
  }
}

export async function bulkSaveProjects(projects: Project[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      for (const p of projects) {
        store.put(p);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    saveToLocalStorage(LS_PROJECTS, projects);
  }
}

export async function clearAllProjects(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    saveToLocalStorage(LS_PROJECTS, []);
  }
}

/* -------------------------------------------------------------
 * Notepad Persistence
 * ------------------------------------------------------------- */

export async function getNotepadContent(): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NOTEPAD, 'readonly');
      const store = tx.objectStore(STORE_NOTEPAD);
      const req = store.get('global_notepad');
      req.onsuccess = () => {
        if (req.result && req.result.content !== undefined) {
          resolve(req.result.content);
        } else {
          resolve(INITIAL_NOTEPAD_CONTENT);
        }
      };
      req.onerror = () => resolve(INITIAL_NOTEPAD_CONTENT);
    });
  } catch {
    return getFromLocalStorage<string>(LS_NOTEPAD, INITIAL_NOTEPAD_CONTENT);
  }
}

export async function saveNotepadContent(content: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOTEPAD, 'readwrite');
      const store = tx.objectStore(STORE_NOTEPAD);
      const req = store.put({
        id: 'global_notepad',
        content,
        lastUpdated: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    saveToLocalStorage(LS_NOTEPAD, content);
  }
}

/* -------------------------------------------------------------
 * Settings Persistence
 * ------------------------------------------------------------- */

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.value !== undefined) {
          resolve(req.result.value as T);
        } else {
          resolve(defaultValue);
        }
      };
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    return getFromLocalStorage<T>(LS_SETTINGS + key, defaultValue);
  }
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      const req = store.put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    saveToLocalStorage(LS_SETTINGS + key, value);
  }
}
