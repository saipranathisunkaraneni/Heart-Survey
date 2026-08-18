/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  setDoc,
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase.ts';
import { getOfflineUser, cacheOfflineUser } from './offlineDb.ts';
import { SurveySubmission } from '../types.ts';

export interface UserProfile {
  email: string;
  role: 'admin' | 'doctor' | 'receptionist';
  name: string;
}

// Helper to hash password using SHA-256
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ----------------------------------------------------
// AUTHENTICATION SERVICE
// ----------------------------------------------------

export async function loginStaff(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Try Firebase Authentication online first
  if (db && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;
      
      // Fetch user role from Firestore 'users' collection
      const userDoc = await getDoc(doc(db, 'users', normalizedEmail));
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        // Cache role locally for offline persistence
        await cacheOfflineUser(normalizedEmail, profile.role, profile.name);
        return profile;
      } else {
        // Fallback: if user is authenticated but no document, check local cache or default
        const cached = await getOfflineUser(normalizedEmail);
        if (cached) return cached;

        // Default based on email patterns
        let role: 'admin' | 'doctor' | 'receptionist' = 'receptionist';
        if (normalizedEmail.includes('admin')) role = 'admin';
        else if (normalizedEmail.includes('doctor')) role = 'doctor';
        
        const defaultProfile: UserProfile = {
          email: normalizedEmail,
          role,
          name: normalizedEmail.split('@')[0].toUpperCase()
        };
        await cacheOfflineUser(normalizedEmail, defaultProfile.role, defaultProfile.name);
        return defaultProfile;
      }
    } catch (authError) {
      console.warn('Firebase login failed, trying offline authentication:', authError);
    }
  }

  // 2. Offline Fallback Check
  const cachedUser = await getOfflineUser(normalizedEmail);
  if (cachedUser) {
    // Basic password checking for default offline accounts (admin123, doctor123, receptionist123)
    const username = normalizedEmail.split('@')[0];
    const expectedPassword = `${username}123`;
    const inputHash = await sha256(password);
    const expectedHash = await sha256(expectedPassword);
    if (inputHash === expectedHash) {
      return cachedUser;
    }
  }

  throw new Error('Invalid email or password. Please verify your credentials.');
}

export async function logoutStaff(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

// ----------------------------------------------------
// FIRESTORE OPERATIONS
// ----------------------------------------------------

export async function saveSurveyToCloud(survey: SurveySubmission): Promise<string> {
  if (db) {
    try {
      // 1. Generate Idempotency Key (UHID + Survey Date) to prevent duplicates
      let docId = '';
      if (survey.uhid && survey.surveyDate) {
        const dateKey = survey.surveyDate.replace(/[^a-zA-Z0-9]/g, '_');
        docId = `survey_${survey.uhid}_${dateKey}`;
      } else {
        // Fallback random ID if fields are somehow missing
        const tmpRef = doc(collection(db, 'surveys'));
        docId = tmpRef.id;
      }

      // 2. Save Survey Response
      const surveyDocRef = doc(db, 'surveys', docId);
      await setDoc(surveyDocRef, {
        ...survey,
        createdAt: survey.createdAt || new Date().toISOString()
      }, { merge: true });

      // 3. Upsert Patient Profile by UHID
      if (survey.uhid) {
        const patientDocRef = doc(db, 'patients', survey.uhid);
        await setDoc(patientDocRef, {
          uhid: survey.uhid,
          name: survey.personalDetails.name,
          age: survey.personalDetails.age,
          gender: survey.personalDetails.gender,
          phone: survey.personalDetails.phone,
          email: survey.personalDetails.email,
          address: survey.personalDetails.address,
          lastSurveyDate: survey.surveyDate,
          lastSurveyId: docId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      console.log('Survey saved to Firestore successfully with Idempotency ID:', docId);
      return docId;
    } catch (err) {
      console.error('Failed to write survey data directly to Firestore:', err);
      throw err;
    }
  }
  throw new Error('Firebase database is not initialized');
}

export async function fetchAllSurveys(): Promise<SurveySubmission[]> {
  // Try online first
  if (db) {
    try {
      const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list: SurveySubmission[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SurveySubmission);
      });
      return list;
    } catch (err) {
      console.warn('Failed to fetch surveys from cloud Firestore. Falling back to local Express server:', err);
    }
  }

  // Fallback to Express backend server
  try {
    const res = await fetch('/api/surveys');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Could not fetch surveys from local Express endpoint:', err);
  }
  return [];
}

export function subscribeToSurveys(callback: (surveys: SurveySubmission[]) => void): () => void {
  if (db) {
    try {
      const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: SurveySubmission[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as SurveySubmission);
        });
        callback(list);
      }, (error) => {
        console.error('Error in surveys snapshot listener:', error);
      });
      return unsubscribe;
    } catch (err) {
      console.error('Failed to subscribe to surveys on Firestore:', err);
    }
  }
  return () => {};
}
