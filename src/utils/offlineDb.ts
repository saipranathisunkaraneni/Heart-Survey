/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'SHF_Survey_Offline_DB';
const DB_VERSION = 2;

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB database');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;

      // Object store for completed surveys pending online sync
      if (!db.objectStoreNames.contains('surveys_offline')) {
        db.createObjectStore('surveys_offline', { keyPath: 'id', autoIncrement: true });
      }

      // Object store for the single active draft survey (key 'current_draft')
      if (!db.objectStoreNames.contains('survey_drafts')) {
        db.createObjectStore('survey_drafts', { keyPath: 'key' });
      }

      // Object store for offline authenticated users roles cache
      if (!db.objectStoreNames.contains('users_offline')) {
        db.createObjectStore('users_offline', { keyPath: 'email' });
      }
    };
  });
}

// ----------------------------------------------------
// DRAFT OPERATIONS (Auto-Save)
// ----------------------------------------------------

export async function saveDraft(surveyState: any): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('survey_drafts', 'readwrite');
      const store = tx.objectStore('survey_drafts');
      const request = store.put({ key: 'current_draft', state: surveyState, updatedAt: new Date().toISOString() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error saving draft to IndexedDB:', err);
  }
}

export async function getDraft(): Promise<any | null> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('survey_drafts', 'readonly');
      const store = tx.objectStore('survey_drafts');
      const request = store.get('current_draft');

      request.onsuccess = () => {
        resolve(request.result ? request.result.state : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error reading draft from IndexedDB:', err);
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('survey_drafts', 'readwrite');
      const store = tx.objectStore('survey_drafts');
      const request = store.delete('current_draft');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error clearing draft from IndexedDB:', err);
  }
}

// ----------------------------------------------------
// COMPLETED SURVEYS FOR OFFLINE RESILIENCE
// ----------------------------------------------------

export async function saveOfflineSurvey(surveyData: any): Promise<number> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('surveys_offline', 'readwrite');
    const store = tx.objectStore('surveys_offline');
    const record = {
      data: surveyData,
      createdAt: new Date().toISOString(),
      synced: false
    };
    const request = store.add(record);

    request.onsuccess = () => {
      resolve(request.result as number);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineSurveys(): Promise<any[]> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('surveys_offline', 'readonly');
      const store = tx.objectStore('surveys_offline');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error reading offline surveys:', err);
    return [];
  }
}

export async function deleteOfflineSurvey(id: number): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('surveys_offline', 'readwrite');
    const store = tx.objectStore('surveys_offline');
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ----------------------------------------------------
// USER ACCESS MANAGEMENT FOR OFFLINE AUTHS
// ----------------------------------------------------

export async function cacheOfflineUser(email: string, role: string, name: string): Promise<void> {
  const db = await initDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users_offline', 'readwrite');
    const store = tx.objectStore('users_offline');
    const request = store.put({ email: email.toLowerCase().trim(), role, name });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineUser(email: string): Promise<any | null> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('users_offline', 'readonly');
      const store = tx.objectStore('users_offline');
      const request = store.get(email.toLowerCase().trim());

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return null;
  }
}

export async function seedDefaultUsers(): Promise<void> {
  // Pre-seed offline users for seamless local login
  await cacheOfflineUser('admin@shf.org', 'admin', 'System Admin');
  await cacheOfflineUser('doctor@shf.org', 'doctor', 'Dr. Srinivas');
  await cacheOfflineUser('receptionist@shf.org', 'receptionist', 'Reception Desk');
}

// Automatically seed defaults on import
seedDefaultUsers().catch(err => console.error('Offline database seeding failed:', err));
