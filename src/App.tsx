/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SurveyWizard from './components/SurveyWizard';
import LandingPage from './components/LandingPage';
import { UserProfile, saveSurveyToCloud } from './utils/firebaseService';
import { getOfflineSurveys, deleteOfflineSurvey } from './utils/offlineDb';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Default to public landing page 'landing' so patients see the premium entry portal
  const [phase, setPhase] = useState<'login' | 'dashboard' | 'survey' | 'landing'>('landing');
  const [appLang, setAppLang] = useState<'en' | 'te'>(() => {
    const stored = localStorage.getItem('SHF_LANG_SELECTED');
    return (stored === 'en' || stored === 'te') ? (stored as 'en' | 'te') : 'en';
  });
  const [showLangModal, setShowLangModal] = useState<boolean>(() => {
    return !localStorage.getItem('SHF_LANG_SELECTED');
  });

  // Check local session storage on mount to persist logged-in staff
  useEffect(() => {
    const savedUser = sessionStorage.getItem('SHF_LOGGED_USER');
    if (savedUser) {
      try {
        const profile = JSON.parse(savedUser) as UserProfile;
        setUser(profile);
        setPhase('dashboard');
      } catch (e) {
        sessionStorage.removeItem('SHF_LOGGED_USER');
      }
    }
  }, []);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    sessionStorage.setItem('SHF_LOGGED_USER', JSON.stringify(profile));
    setPhase('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('SHF_LOGGED_USER');
    // Lock the kiosk back to the premium landing page immediately on logout
    setPhase('landing');
  };

  // Secret hotkey (Ctrl + Shift + L) to toggle the staff login screen on physical keyboards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isLKey = e.key.toLowerCase() === 'l' || e.code === 'KeyL';
      if (e.ctrlKey && e.shiftKey && isLKey) {
        e.preventDefault();
        setPhase(prev => prev === 'login' ? (user ? 'dashboard' : 'landing') : 'login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  // Background Sync Runner for offline surveys
  useEffect(() => {
    let isSyncing = false;

    const runSync = async () => {
      if (!navigator.onLine || isSyncing) return;
      isSyncing = true;
      try {
        const pending = await getOfflineSurveys();
        if (pending.length === 0) {
          isSyncing = false;
          return;
        }
        
        console.log(`Background Sync: Found ${pending.length} pending offline surveys. Syncing...`);
        for (const record of pending) {
          try {
            await saveSurveyToCloud(record.data);
            await deleteOfflineSurvey(record.id);
            console.log(`Background Sync: Synced survey record ID ${record.id}`);
          } catch (err) {
            console.error('Background Sync: Failed to sync record ID', record.id, err);
          }
        }
      } catch (err) {
        console.error('Background Sync error:', err);
      } finally {
        isSyncing = false;
      }
    };

    runSync();
    
    window.addEventListener('online', runSync);
    const interval = setInterval(runSync, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', runSync);
      clearInterval(interval);
    };
  }, []);

  // ----------------------------------------------------
  // ROUTING CONTROLLER
  // ----------------------------------------------------
  let content;
  if (phase === 'landing') {
    content = (
      <LandingPage 
        onStartSurvey={() => setPhase('survey')} 
        onSecretLogin={() => setPhase('login')} 
        lang={appLang}
        setLang={(l) => {
          setAppLang(l);
          localStorage.setItem('SHF_LANG_SELECTED', l);
        }}
      />
    );
  } else if (phase === 'login') {
    content = <Login onLoginSuccess={handleLoginSuccess} onStartPatientSurvey={() => setPhase('survey')} onBackToLanding={() => setPhase('landing')} />;
  } else if (phase === 'dashboard' && user) {
    content = (
      <Dashboard 
        user={user} 
        onLogout={handleLogout} 
        onStartSurvey={() => setPhase('survey')} 
      />
    );
  } else if (phase === 'survey') {
    content = (
      <SurveyWizard 
        user={user}
        onBackToDashboard={() => setPhase(user ? 'dashboard' : 'landing')} 
        onSecretLogin={() => setPhase('login')}
        onGoHome={() => setPhase('landing')}
        initialLang={appLang}
      />
    );
  } else {
    content = (
      <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 text-xs">
        Loading Srinivasa Survey Portal...
      </div>
    );
  }

  return (
    <>
      {content}
      {showLangModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-rose-100/50 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Heart className="h-8 w-8 fill-current text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Select Language / భాషను ఎంచుకోండి</h2>
              <p className="text-xs text-gray-400 font-medium">Please choose your preferred language to proceed with the survey.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setAppLang('en');
                  localStorage.setItem('SHF_LANG_SELECTED', 'en');
                  setShowLangModal(false);
                }}
                className="flex flex-col items-center justify-center p-5 border-2 border-slate-100 hover:border-rose-500 rounded-2xl cursor-pointer hover:bg-rose-50/10 transition-all group active:scale-[0.98]"
              >
                <span className="text-lg font-black text-slate-800 group-hover:text-rose-600">English</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Start in English</span>
              </button>
              <button
                onClick={() => {
                  setAppLang('te');
                  localStorage.setItem('SHF_LANG_SELECTED', 'te');
                  setShowLangModal(false);
                }}
                className="flex flex-col items-center justify-center p-5 border-2 border-slate-100 hover:border-rose-500 rounded-2xl cursor-pointer hover:bg-rose-50/10 transition-all group active:scale-[0.98]"
              >
                <span className="text-lg font-black text-slate-800 group-hover:text-rose-600">తెలుగు</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">తెలుగులో ప్రారంభించండి</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
