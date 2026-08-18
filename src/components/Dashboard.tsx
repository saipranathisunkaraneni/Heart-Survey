/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { fetchAllSurveys, UserProfile, saveSurveyToCloud, subscribeToSurveys } from '../utils/firebaseService';
import { getOfflineSurveys, deleteOfflineSurvey } from '../utils/offlineDb';
import { triggerExcelExport, triggerPdfExport, triggerAllSurveysCsvExport, triggerAllSurveysPdfExport } from '../utils/exportHelpers';
import { SurveySubmission } from '../types';
import { 
  Heart, Users, Clipboard, LogOut, Search, PlusCircle, CheckCircle2, 
  FileText, Download, Activity, RefreshCw, AlertTriangle, Eye, Calendar, Phone, ArrowLeftRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onStartSurvey: () => void;
}

export default function Dashboard({ user, onLogout, onStartSurvey }: DashboardProps) {
  const [surveys, setSurveys] = useState<SurveySubmission[]>([]);
  const [offlineSurveys, setOfflineSurveys] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<SurveySubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [filterGender, setFilterGender] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  const loadOfflineData = async () => {
    try {
      const offline = await getOfflineSurveys();
      setOfflineSurveys(offline);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    try {
      const data = await fetchAllSurveys();
      setSurveys(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSurveys((data) => {
      setSurveys(data);
      setLoading(false);
    });

    loadOfflineData();
    const interval = setInterval(loadOfflineData, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    if (offlineSurveys.length === 0 || syncing) return;
    setSyncing(true);
    setSyncSuccess(false);
    
    let successCount = 0;
    for (const offlineRecord of offlineSurveys) {
      try {
        await saveSurveyToCloud(offlineRecord.data);
        await deleteOfflineSurvey(offlineRecord.id);
        successCount++;
      } catch (err) {
        console.error('Failed to sync offline record:', offlineRecord.id, err);
      }
    }
    
    setSyncing(false);
    if (successCount > 0) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
      loadOfflineData();
    }
  };

  // Stats Calculations
  const totalCount = surveys.length;
  const maleCount = surveys.filter(s => s.personalDetails?.gender === 'Male').length;
  const femaleCount = surveys.filter(s => s.personalDetails?.gender === 'Female').length;
  const otherCount = surveys.filter(s => s.personalDetails?.gender === 'Other').length;
  
  const diabetesCount = surveys.filter(s => s.responses?.diabetes === true).length;
  const bpCount = surveys.filter(s => s.responses?.highBp === true).length;
  const heartDiseaseCount = surveys.filter(s => s.responses?.previousHeartDisease === true).length;
  const covidCount = surveys.filter(s => s.responses?.hadCovid === true).length;
  const smokingCount = surveys.filter(s => s.responses?.tobaccoUsageCigarette === true || s.responses?.tobaccoUsageGutka === true).length;

  const ageGroups = [
    { name: '< 30', value: surveys.filter(s => parseInt(s.personalDetails?.age || '0') < 30).length },
    { name: '30 - 50', value: surveys.filter(s => { const a = parseInt(s.personalDetails?.age || '0'); return a >= 30 && a <= 50; }).length },
    { name: '51 - 70', value: surveys.filter(s => { const a = parseInt(s.personalDetails?.age || '0'); return a > 50 && a <= 70; }).length },
    { name: '> 70', value: surveys.filter(s => parseInt(s.personalDetails?.age || '0') > 70).length }
  ];

  const diseaseData = [
    { name: 'Diabetes', count: diabetesCount, fill: '#F59E0B' },
    { name: 'High BP', count: bpCount, fill: '#EF4444' },
    { name: 'Heart Disease', count: heartDiseaseCount, fill: '#EC4899' },
    { name: 'Covid History', count: covidCount, fill: '#3B82F6' },
    { name: 'Smoker/Tobacco', count: smokingCount, fill: '#10B981' }
  ];

  const genderData = [
    { name: 'Male', value: maleCount, color: '#3B82F6' },
    { name: 'Female', value: femaleCount, color: '#EC4899' },
    { name: 'Other', value: otherCount, color: '#10B981' }
  ].filter(g => g.value > 0);

  // Search and Filter logic
  const filteredSurveys = surveys.filter(s => {
    const term = searchQuery.toLowerCase();
    const nameMatch = s.personalDetails?.name?.toLowerCase().includes(term);
    const uhidMatch = s.uhid?.toLowerCase().includes(term);
    const phoneMatch = s.personalDetails?.phone?.includes(term);
    const textMatch = nameMatch || uhidMatch || phoneMatch;

    const genderMatch = !filterGender || s.personalDetails?.gender === filterGender;
    const langMatch = !filterLanguage || s.language === filterLanguage;

    return textMatch && genderMatch && langMatch;
  });

  if (user.role === 'receptionist') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-md">
              <Heart className="h-5.5 w-5.5 fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-black text-rose-950 font-display">Srinivasa Heart Centre</h1>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Kiosk Registration Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-gray-800 block">{user.name}</span>
              <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mt-0.5">{user.role}</span>
            </div>

            <button 
              onClick={onLogout} 
              className="flex items-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Receptionist Body */}
        <main className="max-w-4xl w-full mx-auto p-4 md:p-6 flex-1 space-y-6 text-left">
          {/* Welcome & Launch Card */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3 relative z-10 text-left">
              <span className="text-[10px] bg-white/20 border border-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest inline-block">Survey Entry Desk</span>
              <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-none">Patient Screening Kiosk</h2>
              <p className="text-xs opacity-90 max-w-md font-medium leading-relaxed">Register a patient and launch the conversational voice-guided health survey.</p>
            </div>
            <button
              onClick={onStartSurvey}
              className="py-4 px-8 bg-white text-rose-600 hover:bg-rose-50 font-black rounded-2xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer text-sm shrink-0 flex items-center gap-2 relative z-10 animate-pulse"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Start Kiosk Survey</span>
            </button>
          </div>

          {/* Sync status card if offline items exist */}
          {offlineSurveys.length > 0 && (
            <div className="bg-amber-50 border border-amber-250 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-amber-800 block">Offline Surveys Pending Sync ({offlineSurveys.length})</span>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Surveys are saved locally. Sync them once connection is restored.</span>
                </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>
          )}

          {/* Patient Quick Lookup / Search Directory */}
          <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-150 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div>
                <h3 className="text-sm font-black text-gray-800 font-display">Patient Lookup Directory</h3>
                <p className="text-[10px] text-gray-400 font-medium">Search for existing patient files to verify details</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by UHID, Name, Phone..."
                  className="pl-9 pr-4 py-2 border border-gray-200 outline-none rounded-xl text-xs font-semibold bg-white w-60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400 font-bold">Loading Patients...</div>
              ) : filteredSurveys.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 font-semibold">No patients found. Click "Start Kiosk Survey" to register.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] text-gray-450 font-extrabold uppercase border-b border-gray-150">
                      <th className="px-5 py-3">UHID</th>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Age/Gender</th>
                      <th className="px-5 py-3">Last Survey Date</th>
                      <th className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {filteredSurveys.slice(0, 10).map((survey, index) => (
                      <tr key={survey.id || index} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 font-mono font-bold text-rose-900">{survey.uhid}</td>
                        <td className="px-5 py-3 font-semibold text-gray-850">{survey.personalDetails?.name}</td>
                        <td className="px-5 py-3 text-gray-650">{survey.personalDetails?.age} yrs / {survey.personalDetails?.gender}</td>
                        <td className="px-5 py-3 text-gray-500">{survey.surveyDate}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => triggerPdfExport(survey, setPdfLoading)}
                              className="flex items-center gap-1 py-1.5 px-3 border border-rose-200 text-rose-600 rounded-lg text-[10px] font-bold hover:bg-rose-50 transition-colors cursor-pointer animate-pulse"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>Print Report</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* TOP HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-md">
            <Heart className="h-5.5 w-5.5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black text-rose-950 font-display">Srinivasa Heart Centre</h1>
            <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Health Survey System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-gray-800 block">{user.name}</span>
            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider block mt-0.5">{user.role}</span>
          </div>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 space-y-6">
        
        {/* ACTION RIBBON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-150 rounded-2xl shadow-sm">
          <div>
            <h2 className="text-xl font-black text-gray-800 font-display">Hospital Survey Analytics</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Real-time surveillance reporting and patient screening logs</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync trigger for offline items */}
            {offlineSurveys.length > 0 && (
              <button 
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer disabled:opacity-50 animate-pulse"
              >
                <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync {offlineSurveys.length} Offline Surveys</span>
              </button>
            )}

            {syncSuccess && (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Synced successfully!
              </span>
            )}

            <button
              onClick={onStartSurvey}
              className="flex items-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Start Kiosk Survey</span>
            </button>
          </div>
        </div>

        {/* ANALYTICS STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-widest block">Total Records</span>
              <Clipboard className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <span className="text-3xl font-black text-gray-800 block font-display">{totalCount}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">Surveys recorded in database</span>
            </div>
          </div>

          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-widest block">Diabetes (Sugar)</span>
              <Activity className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-amber-600 block font-display">{diabetesCount}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
                {totalCount > 0 ? ((diabetesCount / totalCount) * 100).toFixed(0) : 0}% of total patient pool
              </span>
            </div>
          </div>

          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-widest block">Hypertension (BP)</span>
              <Activity className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-red-600 block font-display">{bpCount}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
                {totalCount > 0 ? ((bpCount / totalCount) * 100).toFixed(0) : 0}% of total patient pool
              </span>
            </div>
          </div>

          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-450 font-extrabold uppercase tracking-widest block">Heart Disease</span>
              <Heart className="h-5 w-5 text-pink-500 fill-current" />
            </div>
            <div>
              <span className="text-3xl font-black text-pink-600 block font-display">{heartDiseaseCount}</span>
              <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block">
                {totalCount > 0 ? ((heartDiseaseCount / totalCount) * 100).toFixed(0) : 0}% previous diagnoses
              </span>
            </div>
          </div>
        </div>

        {/* VISUAL CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Chronic Risks Bar chart */}
          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
            <span className="text-[11px] text-gray-450 font-extrabold uppercase tracking-widest block">Medical Condition Prevalences</span>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diseaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Gender Pie chart */}
          <div className="bg-white p-5 border border-gray-150 rounded-2xl shadow-sm space-y-4">
            <span className="text-[11px] text-gray-450 font-extrabold uppercase tracking-widest block">Gender Distribution</span>
            <div className="h-64 flex flex-col items-center justify-center">
              {totalCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-xs font-semibold">No survey data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* PATIENT REGISTRY TABLE */}
        <div className="bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden">
          {/* Filter Header */}
          <div className="p-5 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <div>
              <h3 className="text-sm font-black text-gray-800 font-display">Patient Screening Registry</h3>
              <p className="text-[11px] text-gray-400 font-medium">Search and review patient reports details</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => triggerAllSurveysCsvExport(filteredSurveys)}
                className="py-2 px-3.5 bg-white border border-gray-250 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                title="Export all filtered surveys to CSV/Excel"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => triggerAllSurveysPdfExport(filteredSurveys, setPdfLoading)}
                className="py-2 px-3.5 bg-rose-600 border border-transparent text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                title="Download consolidated PDF of all filtered surveys"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Export All PDF</span>
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by UHID, Name, Phone..."
                  className="pl-9 pr-4 py-2 border border-gray-200 outline-none rounded-xl text-xs font-medium bg-white w-60 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 outline-none bg-white cursor-pointer"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <select 
                className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 outline-none bg-white cursor-pointer"
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="te">Telugu</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-xs text-gray-450 font-bold flex flex-col items-center gap-2">
                <span className="h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading Patient Registry...</span>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="py-20 text-center text-xs text-gray-450 font-bold">
                No patient screenings match the criteria.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-widest border-b border-gray-150">
                    <th className="px-5 py-3.5">UHID</th>
                    <th className="px-5 py-3.5">Patient Name</th>
                    <th className="px-5 py-3.5">Age/Gender</th>
                    <th className="px-5 py-3.5">Date / Time</th>
                    <th className="px-5 py-3.5">Language</th>
                    <th className="px-5 py-3.5">Risk Summary</th>
                    <th className="px-5 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredSurveys.map((survey, index) => {
                    const hasCardiacRisk = survey.responses?.chestPain || survey.responses?.previousHeartDisease;
                    return (
                      <tr key={survey.id || index} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-rose-900">{survey.uhid}</td>
                        <td className="px-5 py-4 font-semibold text-gray-800">{survey.personalDetails?.name}</td>
                        <td className="px-5 py-4 text-gray-650">
                          {survey.personalDetails?.age} yrs / <span className="font-semibold">{survey.personalDetails?.gender}</span>
                        </td>
                        <td className="px-5 py-4 text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{survey.surveyDate}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${survey.language === 'te' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                            {survey.language === 'te' ? 'Telugu' : 'English'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {hasCardiacRisk ? (
                            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              CARDIAC RISK
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                              <CheckCircle2 className="h-3 w-3 shrink-0" />
                              SCREENED
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedSurvey(survey)}
                              className="p-1.5 text-gray-550 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="View Patient Details Summary"
                            >
                              <Eye className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => triggerPdfExport(survey, setPdfLoading)}
                              className="p-1.5 text-gray-550 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Download PDF Report"
                            >
                              <FileText className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => triggerExcelExport(survey)}
                              className="p-1.5 text-gray-550 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Download Excel Sheet"
                            >
                              <Download className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-150 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black font-display">{selectedSurvey.personalDetails?.name}</h3>
                <p className="text-[10px] opacity-90 font-extrabold uppercase tracking-widest mt-0.5">UHID: {selectedSurvey.uhid} • Screened on {selectedSurvey.surveyDate}</p>
              </div>
              <button 
                onClick={() => setSelectedSurvey(null)} 
                className="text-white hover:text-rose-200 transition-colors font-black text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left text-xs">
              {/* Personal Info Grid */}
              <div className="bg-rose-50/20 border border-rose-100/50 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                <div><span className="text-gray-450 font-bold block">Age / Gender</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.age} yrs / {selectedSurvey.personalDetails?.gender}</strong></div>
                <div><span className="text-gray-450 font-bold block">Occupation</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.occupation || 'N/A'}</strong></div>
                <div><span className="text-gray-450 font-bold block">Phone</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.phone}</strong></div>
                <div className="sm:col-span-3 border-t border-rose-100/50 my-1 pt-2" />
                <div><span className="text-gray-450 font-bold block">Address</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.address}</strong></div>
                <div><span className="text-gray-450 font-bold block">Home Location</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.home || 'N/A'}</strong></div>
                <div><span className="text-gray-450 font-bold block">Workplace</span><strong className="text-gray-800 font-semibold">{selectedSurvey.personalDetails?.karyasthalam || 'N/A'}</strong></div>
              </div>

              {/* Symptom Card */}
              <div className="space-y-3">
                <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider block">Clinical Symptoms</span>
                <div className="border border-gray-150 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <span className="text-gray-500 font-bold">Chest Pain:</span> 
                    <strong className={`ml-2 ${selectedSurvey.responses?.chestPain ? 'text-red-600 font-black' : 'text-gray-800 font-semibold'}`}>
                      {selectedSurvey.responses?.chestPain ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Breathlessness:</span> 
                    <strong className={`ml-2 ${selectedSurvey.responses?.breathlessness ? 'text-red-500 font-black' : 'text-gray-800 font-semibold'}`}>
                      {selectedSurvey.responses?.breathlessness ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Palpitations (Heart beating fast):</span> 
                    <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.palpitations ? 'Yes' : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Dizziness (Fainting):</span> 
                    <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.dizziness ? 'Yes' : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Swelling of Legs:</span> 
                    <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.swellingLegs ? 'Yes' : 'No'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 font-bold">Excessive Fatigue (Tiredness):</span> 
                    <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.excessiveFatigue ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-3">
                <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider block">Chronic Risk Conditions</span>
                <div className="border border-gray-150 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3">
                  <div><span className="text-gray-500 font-bold">Diabetes (Sugar):</span> <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.diabetes ? 'Yes' : 'No'}</strong></div>
                  <div><span className="text-gray-500 font-bold">Hypertension (High BP):</span> <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.highBp ? 'Yes' : 'No'}</strong></div>
                  <div><span className="text-gray-500 font-bold">High Cholesterol:</span> <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.highCholesterol ? 'Yes' : 'No'}</strong></div>
                  <div><span className="text-gray-500 font-bold">Previous Heart Condition:</span> <strong className="ml-2 text-gray-850 font-semibold">{selectedSurvey.responses?.previousHeartDisease ? 'Yes' : 'No'}</strong></div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-150">
              <button
                onClick={() => triggerExcelExport(selectedSurvey)}
                className="flex items-center gap-1.5 py-2 px-4 border border-gray-200 rounded-xl text-xs font-bold text-gray-650 hover:bg-white transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
              
              <button
                onClick={() => triggerPdfExport(selectedSurvey, setPdfLoading)}
                className="flex items-center gap-1.5 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {pdfLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center gap-4 shadow-2xl max-w-sm w-full mx-4 text-center animate-zoom-in">
            <span className="h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <h4 className="text-base font-black text-rose-950 font-display">Generating PDF Report</h4>
              <p className="text-xs text-gray-550 font-semibold mt-1">Please wait while we prepare the high-resolution patient report file...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
