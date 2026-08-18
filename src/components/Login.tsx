/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { loginStaff, UserProfile } from '../utils/firebaseService';
import { Shield, Key, Mail, Heart, AlertCircle, HelpCircle, ArrowRight, Clipboard } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onStartPatientSurvey: () => void;
  onBackToLanding: () => void;
}

export default function Login({ onLoginSuccess, onStartPatientSurvey, onBackToLanding }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all details.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const userProfile = await loginStaff(email, password);
      onLoginSuccess(userProfile);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50/45 via-white to-pink-50/35 px-4 md:px-6 py-8 relative">
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1.5 py-2 px-4 border border-rose-250 hover:border-rose-450 text-rose-600 text-xs font-bold rounded-xl bg-white shadow-sm transition-all cursor-pointer"
        >
          <span>🏠 Home</span>
        </button>
      </div>
      <div className="max-w-md w-full space-y-8 bg-white p-8 border border-rose-100 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Top gradient strip */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-rose-500 to-pink-600" />
        
        {/* Clinic Brand */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 shadow-inner">
            <Heart className="h-8 w-8 fill-current text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-rose-950 font-display tracking-tight leading-none">Srinivasa Heart Centre</h2>
          <p className="mt-2.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Health Screening Kiosk</p>
        </div>

        {/* 1. PATIENT / USER DIRECT START PORTAL */}
        <div className="bg-rose-50/30 border border-rose-100 p-6 rounded-2xl text-center space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-rose-950">ఆరోగ్య సర్వే / Health Survey</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              రక్తపోటు, షుగర్ మరియు గుండె సంబంధిత వివరాలను నమోదు చేయడానికి ఇక్కడ క్లిక్ చేయండి.<br />
              <span className="text-[10px] text-rose-600 block mt-1">Start screening voice survey directly. No login required.</span>
            </p>
          </div>
          <button
            onClick={onStartPatientSurvey}
            className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black py-4 px-6 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2 animate-pulse"
          >
            <span>ఆరోగ్య సర్వేను ప్రారంభించండి / Start Survey</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-150" /></div>
          <span className="relative bg-white px-4 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Portal Access</span>
        </div>

        {/* 2. STAFF SECURE LOGIN TOGGLE */}
        {!showStaffLogin ? (
          <button
            onClick={() => setShowStaffLogin(true)}
            className="w-full py-3 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-550 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4 text-gray-400" />
            <span>Staff Portal Login / సిబ్బంది లాగిన్</span>
          </button>
        ) : (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Secure Staff Access</span>
              <button 
                onClick={() => { setShowStaffLogin(false); setError(''); }}
                className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer"
              >
                Cancel / వెనుకకు
              </button>
            </div>

            {error && (
              <div className="bg-rose-50/50 border border-rose-250 p-4 rounded-2xl text-xs font-semibold text-rose-700 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block tracking-wide">Staff Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="pl-11 pr-4 py-3 w-full border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all bg-white"
                    placeholder="e.g. receptionist@shf.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block tracking-wide">Secure Access Password</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    className="pl-11 pr-4 py-3 w-full border border-gray-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none rounded-xl text-xs font-semibold text-gray-800 transition-all bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer transition-all shadow-md disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Verify & Login</span>
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDemoHelp(!showDemoHelp)}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer ml-auto"
              >
                <HelpCircle className="h-4.5 w-4.5" />
                <span>Need Demo Credentials?</span>
              </button>
            </div>

            {showDemoHelp && (
              <div className="bg-rose-50/20 border border-rose-100 rounded-2xl p-4 text-left space-y-2 text-xs text-gray-600 animate-fade-in">
                <span className="font-bold text-rose-900 block">Default Accounts:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><strong>Admin:</strong><br />admin@shf.org<br />(Pass: admin123)</div>
                  <div><strong>Doctor:</strong><br />doctor@shf.org<br />(Pass: doctor123)</div>
                  <div className="col-span-2"><strong>Receptionist:</strong><br />receptionist@shf.org (Pass: receptionist123)</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
