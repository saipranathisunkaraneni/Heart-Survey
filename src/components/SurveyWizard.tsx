/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import { saveDraft, getDraft, clearDraft, saveOfflineSurvey, getOfflineSurveys } from '../utils/offlineDb';
import { saveSurveyToCloud, UserProfile } from '../utils/firebaseService';
import { translations } from '../translations';
import { PersonalDetails, SurveyResponses, SurveySubmission } from '../types';
import { 
  Mic, MicOff, Volume2, VolumeX, Check, X, AlertCircle, Sparkles, CheckCircle2, ShieldAlert, Heart,
  User, HelpCircle, Lock, Phone, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, Activity, FileText
} from 'lucide-react';
import { triggerPdfExport } from '../utils/exportHelpers';
import { motion, AnimatePresence } from 'motion/react';

const heartStethImg = '/src/assets/images/heart_stethoscope_1780729575391.png';

function normalizeNumberWords(text: string): string {
  let normalized = text.toLowerCase().trim();

  const tensDict: { [key: string]: number } = {
    twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
    'ఇరవై': 20, 'ముప్పై': 30, 'నలభై': 40, 'యాభై': 50, 'అరవై': 60, 'డెబ్బై': 70, 'ఎనభై': 80, 'తొంభై': 90,
    iravai: 20, irave: 20,
    muppai: 30, muppe: 30,
    nalabhai: 40, nalabhe: 40,
    yaabhai: 50, yabhai: 50, yaabhe: 50, yabhe: 50,
    aravai: 60, arave: 60,
    debbai: 70, debbe: 70,
    enabhai: 80, enabhe: 80,
    thombhai: 90, tombhai: 90, thombhe: 90, tombhe: 90
  };

  const singlesDict: { [key: string]: number } = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19,
    'సున్నా': 0, 'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5, 'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
    sunna: 0, okati: 1, rendu: 2, moodu: 3, naalugu: 4, nalugu: 4, aidu: 5, aaru: 6, edu: 7, enimidi: 8, thommidi: 9, padi: 10
  };

  const words = normalized
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .split(/\s+/);

  const parsedTokens: string[] = [];
  let i = 0;

  while (i < words.length) {
    const word = words[i];
    if (tensDict[word] !== undefined) {
      let val = tensDict[word];
      if (i + 1 < words.length && singlesDict[words[i + 1]] !== undefined) {
        val += singlesDict[words[i + 1]];
        i += 2;
      } else {
        i += 1;
      }
      parsedTokens.push(val.toString());
    } else if (singlesDict[word] !== undefined) {
      parsedTokens.push(singlesDict[word].toString());
      i += 1;
    } else {
      parsedTokens.push(word);
      i += 1;
    }
  }

  let result = parsedTokens.join(' ');
  result = result.replace(/(\d)\s+(?=\d)/g, '$1');
  return result;
}

function parseYesNo(text: string): boolean | null {
  if (!text) return null;
  const norm = text.toLowerCase().trim().replace(/[.!?]+$/, "");
  
  // English Yes matching
  if (/\b(yes|yeah|yup|correct|true|positive|ya|ok|okay)\b/i.test(norm)) return true;
  
  // English No matching
  if (/\b(no|nay|never|false|nope|negative|not|none|know|now)\b/i.test(norm)) return false;
  
  // Telugu Yes matching
  if (/అవును|అవునండి|అవునండీ|ఔను|ఔనండి|ఔనండీ|ఎస్|యస్|ఓకే|ఒకే|ఓకె|ఆవును|ఆవునండి|ఆవునండీ/.test(norm)) return true;
  
  // Telugu No matching
  if (/కాదు|కాదండి|కాదండీ|లేదు|లేదండి|లేదండీ|వద్దు|వద్దండి|వద్దండీ|నో|నొ/.test(norm)) return false;
  
  return null;
}

function sanitizeSpeechInput(text: string, isPhone: boolean = false): string {
  if (!text) return "";
  let sanitized = text;

  sanitized = sanitized.replace(/\b(dash|hyphen|minus)\b/gi, "-");
  sanitized = sanitized.replace(/\b(డాష్|హైఫన్)\b/g, "-");
  sanitized = sanitized.replace(/\b(by|slash)\b/gi, "/");
  sanitized = sanitized.replace(/\b(బై)\b/g, "/");

  sanitized = sanitized.replace(/\s*-\s*/g, "-");
  sanitized = sanitized.replace(/\s*\/\s*/g, "/");

  if (isPhone) {
    sanitized = sanitized.replace(/\s+/g, '');
    sanitized = sanitized.replace(/[^0-9]/g, '');
  }

  return sanitized;
}

function formatAddressSpeech(text: string): string {
  if (!text) return "";
  let formatted = text.replace(/\s+/g, ' ');

  const keywordsEn = ["village", "mandal", "district", "street", "road", "colony", "near", "opposite", "beside", "state", "pincode", "pin code", "hno", "h.no", "door no"];
  const keywordsTe = ["గ్రామం", "మండలం", "జిల్లా", "వీధి", "రోడ్డు", "కాలనీ", "సమీపంలో", "ఎదురుగా", "ఇంటి నంబర్", "పక్కన"];

  keywordsEn.forEach(kw => {
    const rx = new RegExp(`\\s+(${kw})`, 'gi');
    formatted = formatted.replace(rx, ', $1');
  });

  keywordsTe.forEach(kw => {
    const rx = new RegExp(`\\s+(${kw})`, 'g');
    formatted = formatted.replace(rx, ', $1');
  });

  formatted = formatted.replace(/,(\s*,)+/g, ',');
  formatted = formatted.replace(/\s*,\s*/g, ', ');
  formatted = formatted.replace(/^, /, '');
  
  return formatted;
}

interface SurveyWizardProps {
  user: UserProfile | null;
  onBackToDashboard: () => void;
  onSecretLogin: () => void;
  onGoHome: () => void;
  initialLang?: 'te' | 'en';
}

export default function SurveyWizard({ user, onBackToDashboard, onSecretLogin, onGoHome, initialLang }: SurveyWizardProps) {
  // Wizard phase: 'language' | 'draft_restore' | 'survey' | 'success'
  const [wizardPhase, setWizardPhase] = useState<'language' | 'draft_restore' | 'survey' | 'success'>(
    initialLang ? 'survey' : 'language'
  );
  const [lang, setLang] = useState<'te' | 'en'>(initialLang || 'en');
  const [voiceCompanion, setVoiceCompanion] = useState(true);
  const [savedDraftState, setSavedDraftState] = useState<any | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onSecretLogin();
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    if (logoClicks > 0) {
      const t = setTimeout(() => setLogoClicks(0), 2000);
      return () => clearTimeout(t);
    }
  }, [logoClicks]);

  const handleGoHome = () => {
    const hasProgress = 
      uhid.trim() !== '' || 
      personalDetails.name.trim() !== '' || 
      personalDetails.age.trim() !== '' ||
      responses.generalHealthProblems === true ||
      responses.chestPain === true ||
      currentActiveIndex > 0;
      
    if (hasProgress && wizardPhase !== 'success') {
      const confirmMsg = lang === 'te' 
        ? 'మీరు నిష్క్రమించాలనుకుంటున్నారా? మీ సర్వే సమాచారం కోల్పోయే అవకాశం ఉంది.' 
        : 'Are you sure you want to leave? Your survey progress will be lost.';
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    onGoHome();
  };

  // Survey responses state
  const [uhid, setUhid] = useState('');
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '', age: '', gender: '', occupation: '', address: '', home: '', karyasthalam: '', phone: '', email: ''
  });
  const [responses, setResponses] = useState<SurveyResponses>({
    generalHealthProblems: false, generalHealthExplanation: '',
    chestPain: false, chestPainSinceHowLong: '', chestPainPart: '', chestPainSide: '', chestPainIntensity: '',
    chestPainIncreasesWalking: false, chestPainIncreasesClimbing: false, chestPainIncreasesLifting: false, chestPainReducesHow: '',
    breathlessness: false, palpitations: false, dizziness: false, swellingLegs: false, excessiveFatigue: false,
    breathlessnessSinceHowLong: '', breathlessnessIncreasesWhen: '',
    respiratorySymptoms: '', digestiveSymptoms: '', nervousSymptoms: '',
    hadCovid: false, covidDetails: '', covidVaccinated: '',
    hasInsurance: false, insuranceDetails: '',
    diabetes: false, highBp: false, diabetesBpSinceHowLong: '',
    familyHeartDisease: false, familySuddenDeathBefore60: false,
    tobaccoUsageCigarette: false, tobaccoUsageGutka: false, tobaccoUsageOther: '',
    highCholesterol: false, previousMedicalExams: '', currentMedicines: '',
    ulcer: false, asthma: false, stroke: false, fits: false, nervousDisorders: false, jointDiseases: false,
    kidneyDisease: false, thyroidDisease: false, liverDisease: false, cancer: false, otherDisease: '',
    hadSurgery: false, surgeryDetails: '', surgeryComplications: '',
    hadHospitalization: false, hospitalizationDetails: '',
    previousHeartDisease: false, heartDiseaseDetails: '', medicationSideEffects: '',
    sleepQuality: '', sleepProblems: '', alcoholConsumption: false, otherAddictions: '',
    height: '', weight: '', dailyExercise: false, exerciseType: '', exerciseDuration: '',
    vegetarian: false, nonVegetarian: false, fruitsIntake: false,
    stress: '', anxiety: '', workPressure: '',
    menstrualCycleRegular: false, pregnant: false, pregnancyComplications: '', previousSurgeries: ''
  });

  // Navigation step
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lastCompletedSurvey, setLastCompletedSurvey] = useState<SurveySubmission | null>(null);
  const [showTriageWarning, setShowTriageWarning] = useState(false);
  const [isEmergencyFastTrack, setIsEmergencyFastTrack] = useState(false);

  const generateUhid = async () => {
    try {
      const response = await fetch('/api/surveys/next-uhid');
      let serverNextStr = 'SN01';
      if (response.ok) {
        const data = await response.json();
        serverNextStr = data.nextUhid || 'SN01';
      }
      
      const offlineSurveys = await getOfflineSurveys();
      let maxOffline = 0;
      offlineSurveys.forEach((s: any) => {
        if (s.data && s.data.uhid && typeof s.data.uhid === 'string' && /^sn\d+$/i.test(s.data.uhid)) {
          const idStr = s.data.uhid.replace(/^sn/i, '');
          const num = parseInt(idStr, 10);
          if (!isNaN(num) && num > maxOffline) {
            maxOffline = num;
          }
        }
      });
      
      const serverNum = parseInt(serverNextStr.replace(/^sn/i, ''), 10) || 1;
      const finalNextNum = Math.max(serverNum, maxOffline + 1);
      const formattedId = `SN${finalNextNum.toString().padStart(2, '0')}`;
      
      setUhid(formattedId);
    } catch (e) {
      console.warn('Failed to calculate exact UHID, defaulting to SN01:', e);
      setUhid('SN01');
    }
  };

  // Voice system state
  const [activeListeningField, setActiveListeningField] = useState<string | null>(null);
  const [activeCheckboxVoice, setActiveCheckboxVoice] = useState<any | null>(null);
  const [checkboxValidationFeedback, setCheckboxValidationFeedback] = useState('');

  const t = translations[lang];
  const speech = useSpeech({ lang, voiceCompanion });

  // ----------------------------------------------------
  // INITIAL MOUNT - DRAFT CHECK
  // ----------------------------------------------------
  useEffect(() => {
    async function checkDraft() {
      const draft = await getDraft();
      if (draft) {
        setSavedDraftState(draft);
        setWizardPhase('draft_restore');
      } else {
        generateUhid();
        if (initialLang) {
          setWizardPhase('survey');
        }
      }
    }
    checkDraft();
  }, []);

  // Play instruction on mount when in language selection phase
  useEffect(() => {
    if (wizardPhase === 'language' && voiceCompanion) {
      const promptTe = "నమస్కారం, శ్రీనివాస హార్ట్ సెంటర్ ఆరోగ్య సర్వేకు స్వాగతం. మీరు మీ ఫారాన్ని పూరించవచ్చు.";
      const promptEn = "Welcome to Srinivasa Heart Centre Health Survey. You can fill out your form.";
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utTe = new SpeechSynthesisUtterance(promptTe);
        utTe.lang = 'te-IN';
        utTe.rate = 1.0;
        
        const utEn = new SpeechSynthesisUtterance(promptEn);
        utEn.lang = 'en-IN';
        utEn.rate = 0.95;
        
        window.speechSynthesis.speak(utTe);
        window.speechSynthesis.speak(utEn);
      }
    }
  }, [wizardPhase, voiceCompanion]);

  // Speak step prompts on active index change
  useEffect(() => {
    if (wizardPhase === 'survey') {
      speakStepPrompt(currentActiveIndex, lang);
    }
  }, [currentActiveIndex, wizardPhase, lang]);

  // Focus and scroll active voice field into view
  useEffect(() => {
    if (activeListeningField) {
      setTimeout(() => {
        const el = document.getElementById(activeListeningField);
        if (el) {
          el.focus();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [activeListeningField]);

  const speakStepPrompt = (stepIndex: number, languageCode: 'te' | 'en') => {
    if (!voiceCompanion) return;
    const intro = translations[languageCode].pageIntroductions[stepIndex];
    if (intro) {
      speech.speak(intro);
    }
  };

  const restoreDraft = () => {
    if (savedDraftState) {
      setLang(savedDraftState.lang || 'en');
      setUhid(savedDraftState.uhid || '');
      setPersonalDetails(savedDraftState.personalDetails || {});
      setResponses(savedDraftState.responses || {});
      setCurrentActiveIndex(savedDraftState.currentActiveIndex || 0);
      if (savedDraftState.responses?.chestPain === true) {
        setShowTriageWarning(true);
      }
      setWizardPhase('survey');
    }
  };

  const deleteDraft = async () => {
    await clearDraft();
    setWizardPhase('survey');
    generateUhid();
  };

  const handleLanguageSelect = (selectedLang: 'en' | 'te') => {
    setLang(selectedLang);
    setWizardPhase('survey');
    setCurrentActiveIndex(0);
    // Reset state to ensure fresh forms
    setPersonalDetails({ name: '', age: '', gender: '', occupation: '', address: '', home: '', karyasthalam: '', phone: '', email: '' });
    setResponses({
      generalHealthProblems: false, generalHealthExplanation: '', chestPain: false, chestPainSinceHowLong: '', chestPainPart: '', chestPainSide: '', chestPainIntensity: '', chestPainIncreasesWalking: false, chestPainIncreasesClimbing: false, chestPainIncreasesLifting: false, chestPainReducesHow: '', breathlessness: false, palpitations: false, dizziness: false, swellingLegs: false, excessiveFatigue: false, breathlessnessSinceHowLong: '', breathlessnessIncreasesWhen: '', respiratorySymptoms: '', digestiveSymptoms: '', nervousSymptoms: '', hadCovid: false, covidDetails: '', covidVaccinated: '', hasInsurance: false, insuranceDetails: '', diabetes: false, highBp: false, diabetesBpSinceHowLong: '', familyHeartDisease: false, familySuddenDeathBefore60: false, tobaccoUsageCigarette: false, tobaccoUsageGutka: false, tobaccoUsageOther: '', highCholesterol: false, previousMedicalExams: '', currentMedicines: '', ulcer: false, asthma: false, stroke: false, fits: false, nervousDisorders: false, jointDiseases: false, kidneyDisease: false, thyroidDisease: false, liverDisease: false, cancer: false, otherDisease: '', hadSurgery: false, surgeryDetails: '', surgeryComplications: '', hadHospitalization: false, hospitalizationDetails: '', previousHeartDisease: false, heartDiseaseDetails: '', medicationSideEffects: '', sleepQuality: '', sleepProblems: '', alcoholConsumption: false, otherAddictions: '', height: '', weight: '', dailyExercise: false, exerciseType: '', exerciseDuration: '', vegetarian: false, nonVegetarian: false, fruitsIntake: false, stress: '', anxiety: '', workPressure: '', menstrualCycleRegular: false, pregnant: false, pregnancyComplications: '', previousSurgeries: ''
    });
    generateUhid();
  };

  const triggerAutoSave = (personal: any, resp: any, activeIdx: number, customLang?: 'en' | 'te') => {
    const draftState = {
      lang: customLang || lang,
      uhid,
      personalDetails: personal,
      responses: resp,
      currentActiveIndex: activeIdx
    };
    saveDraft(draftState);
  };

  // ----------------------------------------------------
  // RESPONSE CHANGERS
  // ----------------------------------------------------
  const handleDetailsChange = (key: keyof PersonalDetails, value: any) => {
    setPersonalDetails(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'gender' && value !== 'Female') {
        setResponses(prevResponses => {
          const nextResponses = {
            ...prevResponses,
            menstrualCycleRegular: false,
            pregnant: false,
            pregnancyComplications: '',
            previousSurgeries: ''
          };
          triggerAutoSave(next, nextResponses, currentActiveIndex);
          return nextResponses;
        });
      } else {
        triggerAutoSave(next, responses, currentActiveIndex);
      }
      return next;
    });
  };

  const handleResponseChange = (key: keyof SurveyResponses, value: any) => {
    if (key === 'chestPain') {
      if (value === true) {
        setShowTriageWarning(true);
      } else {
        setShowTriageWarning(false);
      }
    }
    setResponses(prev => {
      const next = { ...prev, [key]: value };
      triggerAutoSave(personalDetails, next, currentActiveIndex);
      return next;
    });
  };

  // Field validation
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!uhid.trim()) {
      errors.uhid = lang === 'te' ? 'UHID తప్పనిసరి.' : 'UHID ID is required.';
    }
    if (!personalDetails.name.trim()) {
      errors.name = lang === 'te' ? 'పేరు తప్పనిసరి.' : 'Name is required.';
    }
    if (!personalDetails.age.trim()) {
      errors.age = lang === 'te' ? 'వయస్సు తప్పనిసరి.' : 'Age is required.';
    }

    if (personalDetails.phone.trim()) {
      const cleanPhone = personalDetails.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length !== 10) {
        errors.phone = t.validationErrorPhone;
      }
    }
    if (personalDetails.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalDetails.email.trim())) {
        errors.email = t.validationErrorEmail;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (currentActiveIndex === 0) {
      if (!validateForm()) {
        const warning = lang === 'te' ? "దయచేసి అన్ని తప్పనిసరి వివరాలను పూరించండి." : "Please fill out all required fields.";
        speech.speak(warning);
        return;
      }
    }

    if (currentActiveIndex < 5) {
      const nextIdx = currentActiveIndex + 1;
      setCurrentActiveIndex(nextIdx);
    }
  };

  const handleBackStep = () => {
    if (currentActiveIndex > 0) {
      const backIdx = currentActiveIndex - 1;
      setCurrentActiveIndex(backIdx);
    }
  };

  // ----------------------------------------------------
  // SPEECH CONTROL HANDLERS FOR FIELD-BY-FIELD MIC
  // ----------------------------------------------------
  const handleFieldVoiceInput = (fieldId: string, isDetailsProp: boolean) => {
    if (activeListeningField === fieldId) {
      speech.stop();
      setActiveListeningField(null);
      return;
    }

    setActiveListeningField(fieldId);

    speech.listen(
      (speechResult) => {
        let sanitized = sanitizeSpeechInput(speechResult, fieldId === 'phone');
        if (fieldId === 'address') {
          sanitized = formatAddressSpeech(sanitized);
        } else if (fieldId === 'age' || fieldId === 'height' || fieldId === 'weight') {
          sanitized = normalizeNumberWords(sanitized);
        }

        if (fieldId === 'uhid') {
          setUhid(sanitized);
        } else if (isDetailsProp) {
          handleDetailsChange(fieldId as keyof PersonalDetails, sanitized);
          if (fieldId === 'phone' && sanitized.replace(/[^0-9]/g, '').length < 10) {
            const warningMsg = lang === 'te' ? 'దయచేసి పది అంకెల ఫోన్ నంబర్‌ను నమోదు చేయండి.' : 'Please enter ten digits.';
            speech.speak(warningMsg);
          }
        } else {
          handleResponseChange(fieldId as keyof SurveyResponses, sanitized);
        }

        setActiveListeningField(null);
      },
      () => {
        setActiveListeningField(null);
      }
    );
  };

  const handleYesNoFieldVoice = (fieldId: keyof SurveyResponses) => {
    if (activeListeningField === fieldId) {
      speech.stop();
      setActiveListeningField(null);
      return;
    }

    setActiveListeningField(fieldId);

    speech.listen(
      (speechResult) => {
        const val = parseYesNo(speechResult);
        if (val !== null) {
          handleResponseChange(fieldId, val);
          const confirmMsg = lang === 'te'
            ? `${val ? 'అవును' : 'కాదు'} అని నమోదు చేసాము.`
            : `Recorded ${val ? 'Yes' : 'No'}.`;
          speech.speak(confirmMsg);
        }
        setActiveListeningField(null);
      },
      () => {
        setActiveListeningField(null);
      }
    );
  };

  const handleGenderVoice = () => {
    const fieldId = 'gender';
    if (activeListeningField === fieldId) {
      speech.stop();
      setActiveListeningField(null);
      return;
    }

    setActiveListeningField(fieldId);

    speech.listen(
      (speechResult) => {
        const normalized = speechResult.toLowerCase().trim();
        let val = '';
        if (normalized.includes('male') || normalized.includes('పురుషుడు') || normalized.includes('మగ')) {
          val = 'Male';
        } else if (normalized.includes('female') || normalized.includes('స్త్రీ') || normalized.includes('ఆడ')) {
          val = 'Female';
        } else if (normalized.includes('other') || normalized.includes('ఇతర') || normalized.includes('ఇతరులు')) {
          val = 'Other';
        }

        if (val) {
          handleDetailsChange('gender', val);
          const confirmMsg = lang === 'te' ? `${t[('gender' + val) as keyof typeof t] || val} అని నమోదు చేసాము.` : `Recorded ${val}.`;
          speech.speak(confirmMsg);
        }
        setActiveListeningField(null);
      },
      () => {
        setActiveListeningField(null);
      }
    );
  };

  const handleChestPainSideVoice = () => {
    const fieldId = 'chestPainSide';
    if (activeListeningField === fieldId) {
      speech.stop();
      setActiveListeningField(null);
      return;
    }

    setActiveListeningField(fieldId);

    speech.listen(
      (speechResult) => {
        const normalized = speechResult.toLowerCase().trim();
        let val = '';
        if (normalized.includes('left') || normalized.includes('ఎడమ')) {
          val = 'Left';
        } else if (normalized.includes('right') || normalized.includes('కుడి')) {
          val = 'Right';
        } else if (normalized.includes('middle') || normalized.includes('మధ్య')) {
          val = 'Middle';
        }

        if (val) {
          handleResponseChange('chestPainSide', val);
          const confirmMsg = lang === 'te' 
            ? `${val === 'Left' ? 'ఎడమ వైపు' : val === 'Right' ? 'కుడి వైపు' : 'మధ్య భాగం'} అని నమోదు చేసాము.` 
            : `Recorded ${val}.`;
          speech.speak(confirmMsg);
        }
        setActiveListeningField(null);
      },
      () => {
        setActiveListeningField(null);
      }
    );
  };

  const renderVoiceControls = (
    label: string,
    fieldId: string,
    isDetails: boolean,
    options?: { isYesNo?: boolean; isGender?: boolean; isChestPainSide?: boolean }
  ) => {
    const isListening = activeListeningField === fieldId;
    const questionText = label.replace(/^\d+\.\s*/, '').replace(/\*$/, '').trim();

    return (
      <div className="inline-flex items-center gap-1 ml-2">
        <button
          type="button"
          onClick={() => speech.speak(questionText)}
          className="p-1 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title={lang === 'te' ? "ప్రశ్న వినండి" : "Listen to question"}
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (options?.isYesNo) {
              handleYesNoFieldVoice(fieldId as keyof SurveyResponses);
            } else if (options?.isGender) {
              handleGenderVoice();
            } else if (options?.isChestPainSide) {
              handleChestPainSideVoice();
            } else {
              handleFieldVoiceInput(fieldId, isDetails);
            }
          }}
          className={`p-1 rounded-full transition-colors cursor-pointer ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'text-rose-500 hover:bg-rose-50'
          }`}
          title={lang === 'te' ? "వాయిస్ ద్వారా జవాబు ఇవ్వండి" : "Answer with voice"}
        >
          <Mic className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  // ----------------------------------------------------
  // SEQUENTIAL CHECKBOX VOICE ASSESSMENT
  // ----------------------------------------------------
  const handleCheckboxVoicePrompt = (groupKey: string) => {
    startCheckboxSequentialVoice(groupKey);
  };

  const startCheckboxSequentialVoice = (groupKey: string) => {
    let items: Array<{ key: string; question: string }> = [];
    let sectionTitle = "";
    if (groupKey === 'cardiacList') {
      sectionTitle = lang === 'te' ? "గుండె మరియు శ్వాసకోశ లక్షణాలు" : "Cardiac and Respiratory Symptoms Assessment";
      items = [
        { key: 'palpitations', question: t.questions.palpitations },
        { key: 'dizziness', question: t.questions.dizziness },
        { key: 'swellingLegs', question: t.questions.swellingLegs },
        { key: 'excessiveFatigue', question: t.questions.excessiveFatigue }
      ];
    } else if (groupKey === 'existingConditions') {
      sectionTitle = lang === 'te' ? "దీర్ఘకాలిక ఆరోగ్య సమస్యలు" : "Chronic Conditions Assessment";
      items = [
        { key: 'ulcer', question: t.questions.ulcer },
        { key: 'asthma', question: t.questions.asthma },
        { key: 'stroke', question: t.questions.stroke },
        { key: 'fits', question: t.questions.fits },
        { key: 'nervousDisorders', question: t.questions.nervousDisorders },
        { key: 'jointDiseases', question: t.questions.jointDiseases },
        { key: 'kidneyDisease', question: t.questions.kidneyDisease },
        { key: 'thyroidDisease', question: t.questions.thyroidDisease },
        { key: 'liverDisease', question: t.questions.liverDisease },
        { key: 'cancer', question: t.questions.cancer }
      ];
    } else if (groupKey === 'dietList') {
      sectionTitle = lang === 'te' ? "ఆహార అలవాట్లు" : "Dietary Habits Assessment";
      items = [
        { key: 'vegetarian', question: lang === 'te' ? "మీరు శాకాహారులా?" : "Are you a Vegetarian?" },
        { key: 'nonVegetarian', question: lang === 'te' ? "మీరు మాంసాహారులా?" : "Are you a Non-Vegetarian?" },
        { key: 'fruitsIntake', question: lang === 'te' ? "మీరు ప్రతిరోజూ పండ్లు తింటారా?" : "Do you eat fruits daily?" }
      ];
      if (personalDetails.gender === 'Female') {
        items.push(
          { key: 'menstrualCycleRegular', question: t.questions.menstrualCycleRegular },
          { key: 'pregnant', question: t.questions.pregnant }
        );
      }
    } else if (groupKey === 'tobaccoList') {
      sectionTitle = lang === 'te' ? "పొగాకు అలవాట్లు" : "Tobacco Usage Assessment";
      items = [
        { key: 'tobaccoUsageCigarette', question: t.questions.tobaccoUsageCigarette },
        { key: 'tobaccoUsageGutka', question: t.questions.tobaccoUsageGutka },
        { key: 'tobaccoUsageOther', question: t.questions.tobaccoUsageOther }
      ];
    }

    if (items.length > 0) {
      const initialVoiceState = {
        groupKey,
        items,
        sectionTitle,
        currentIndex: 0
      };
      setActiveCheckboxVoice(initialVoiceState);
      
      speech.stop();
      speech.speak(sectionTitle + ". " + (lang === 'te' ? "ప్రశ్నలు ప్రారంభిస్తున్నాము." : "Starting questions."));
      
      setTimeout(() => {
        executeCheckboxQuestionStep(initialVoiceState, 0);
      }, 2000);
    }
  };

  const executeCheckboxQuestionStep = (voiceState: any, index: number) => {
    if (!voiceState || index >= voiceState.items.length) {
      handleCheckboxSectionComplete(voiceState.groupKey);
      return;
    }

    setActiveCheckboxVoice(prev => {
      if (!prev) return null;
      return { ...prev, currentIndex: index };
    });

    const item = voiceState.items[index];
    const itemQuestion = item.question;
    const promptSuffix = lang === 'te' 
      ? ". దయచేసి అవును లేదా కాదు అని చెప్పండి." 
      : ". Please answer Yes or No.";
    
    const textToSpeak = itemQuestion + promptSuffix;
    setCheckboxValidationFeedback(lang === 'te' ? "వింటున్నాము..." : "Listening...");

    speech.speakThenListen(
      textToSpeak,
      (speechText) => {
        const isYes = parseYesNo(speechText);
        if (isYes === true) {
          handleResponseChange(item.key as keyof SurveyResponses, true);
          const confirmMsg = lang === 'te' ? `అవును అని నమోదు చేసాము.` : `Recorded Yes.`;
          setCheckboxValidationFeedback(confirmMsg);
          speech.speak(confirmMsg);
          
          if (item.key === 'pregnant') {
            setTimeout(() => {
              const compPrompt = lang === 'te'
                ? "గర్భధారణ సమయంలో ఏవైనా ఇబ్బందులు ఎదుర్కొన్నారా? చెప్పండి."
                : "Did you experience any pregnancy complications? Please explain.";
              setActiveListeningField('pregnancyComplications');
              speech.speakThenListen(
                compPrompt,
                (compText) => {
                  const cleanedText = sanitizeSpeechInput(compText, false);
                  handleResponseChange('pregnancyComplications', cleanedText);
                  const okMsg = lang === 'te' ? "నమోదు చేసాము." : "Recorded.";
                  speech.speak(okMsg);
                  setActiveListeningField(null);
                  setTimeout(() => {
                    executeCheckboxQuestionStep(voiceState, index + 1);
                  }, 1500);
                },
                () => {
                  setActiveListeningField(null);
                  executeCheckboxQuestionStep(voiceState, index + 1);
                }
              );
            }, 1500);
          } else {
            setTimeout(() => {
              executeCheckboxQuestionStep(voiceState, index + 1);
            }, 1500);
          }

        } else if (isYes === false) {
          handleResponseChange(item.key as keyof SurveyResponses, false);
          const confirmMsg = lang === 'te' ? `లేదు అని నమోదు చేసాము.` : `Recorded No.`;
          setCheckboxValidationFeedback(confirmMsg);
          speech.speak(confirmMsg);
          
          setTimeout(() => {
            executeCheckboxQuestionStep(voiceState, index + 1);
          }, 1500);

        } else {
          const retryMsg = lang === 'te' 
            ? "క్షమించండి, మీ సమాధానం అర్థం కాలేదు. దయచేసి అవును లేదా లేదు అని చెప్పండి." 
            : "Sorry, I didn't get that. Please say Yes or No.";
          setCheckboxValidationFeedback(retryMsg);
          speech.speak(retryMsg);
          
          setTimeout(() => {
            executeCheckboxQuestionStep(voiceState, index);
          }, 3000);
        }
      },
      () => {
        // Fallback manually
      }
    );
  };

  const handleCheckboxSectionComplete = (groupKey: string) => {
    setActiveCheckboxVoice(null);
    setCheckboxValidationFeedback("");
    
    const completeMsg = lang === 'te' ? "ఈ విభాగం పూర్తయింది." : "This section is completed.";
    speech.speak(completeMsg);

    setTimeout(() => {
      if (groupKey === 'cardiacList') {
        setCurrentActiveIndex(2);
      } else if (groupKey === 'existingConditions') {
        setCurrentActiveIndex(3);
      } else if (groupKey === 'dietList') {
        if (personalDetails.gender === 'Female') {
          const femaleSpecMsg = lang === 'te'
            ? "స్త్రీ సంబంధిత ఆపరేషన్లు ఏమైనా జరిగాయా? చెప్పండి."
            : "Any female specific surgeries? Please explain.";
          
          setTimeout(() => {
            setActiveListeningField('previousSurgeries');
            speech.speakThenListen(
              femaleSpecMsg,
              (surgText) => {
                const cleanedText = sanitizeSpeechInput(surgText, false);
                handleResponseChange('previousSurgeries', cleanedText);
                const okMsg = lang === 'te' ? "నమోదు చేసాము. విభాగం పూర్తయింది." : "Recorded. Section completed.";
                speech.speak(okMsg);
                setActiveListeningField(null);
                setTimeout(() => {
                  setCurrentActiveIndex(4);
                }, 2000);
              },
              () => {
                setActiveListeningField(null);
                setCurrentActiveIndex(4);
              }
            );
          }, 1500);
        } else {
          setCurrentActiveIndex(4);
        }
      } else if (groupKey === 'tobaccoList') {
        setCurrentActiveIndex(5);
      }
    }, 1500);
  };

  const handleCheckboxManualOverride = (isYes: boolean) => {
    if (!activeCheckboxVoice) return;
    
    speech.stop();
    setActiveListeningField(null);

    const voiceState = activeCheckboxVoice;
    const index = voiceState.currentIndex;
    const item = voiceState.items[index];

    handleResponseChange(item.key as keyof SurveyResponses, isYes);
    const confirmMsg = lang === 'te' 
      ? `${isYes ? 'అవును' : 'కాదు'} అని నమోదు చేసాము.` 
      : `Recorded ${isYes ? 'Yes' : 'No'}.`;
    setCheckboxValidationFeedback(confirmMsg);
    speech.speak(confirmMsg);
    
    setTimeout(() => {
      executeCheckboxQuestionStep(voiceState, index + 1);
    }, 1200);
  };

  const handleFinalSubmit = async () => {
    if (!validateForm()) {
      const warning = lang === 'te' ? "దయచేసి అన్ని తప్పనిసరి వివరాలను పూరించండి." : "Please fill out all required fields.";
      speech.speak(warning);
      setCurrentActiveIndex(0);
      return;
    }

    setSubmissionLoading(true);
    setIsOfflineSaved(false);

    const now = new Date();
    const surveyDate = now.toISOString().split('T')[0];
    const surveyTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const finalSurvey: SurveySubmission = {
      surveyDate,
      surveyTime,
      uhid,
      language: lang,
      personalDetails,
      responses,
      createdAt: now.toISOString()
    };

    try {
      const docId = await saveSurveyToCloud(finalSurvey);
      setSubmittedId(docId);
      setLastCompletedSurvey(finalSurvey);
      setIsOfflineSaved(false);
      await clearDraft();
      setWizardPhase('success');
    } catch (err) {
      console.warn('Online submission failed, saving offline:', err);
      try {
        await saveOfflineSurvey(finalSurvey);
        setSubmittedId(`SHF-OFFLINE-${uhid}-${surveyDate.replace(/-/g, '')}`);
        setLastCompletedSurvey(finalSurvey);
        setIsOfflineSaved(true);
        await clearDraft();
        setWizardPhase('success');
      } catch (offlineErr) {
        console.error('Offline saving failed as well:', offlineErr);
        alert(lang === 'te' ? 'సర్వేను సేవ్ చేయడంలో విఫలమైంది.' : 'Failed to save survey. Please try again.');
      }
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleEmergencySubmit = async () => {
    if (!validateForm()) {
      const warning = lang === 'te' ? "దయచేసి మీ వ్యక్తిగత వివరాలను పూరించండి." : "Please fill out all required fields.";
      speech.speak(warning);
      setCurrentActiveIndex(0);
      return;
    }

    setSubmissionLoading(true);
    setIsOfflineSaved(false);
    setIsEmergencyFastTrack(true);

    const now = new Date();
    const surveyDate = now.toISOString().split('T')[0];
    const surveyTime = now.toTimeString().split(' ')[0].substring(0, 5);

    const finalSurvey: SurveySubmission = {
      surveyDate,
      surveyTime,
      uhid,
      language: lang,
      personalDetails,
      responses: {
        ...responses,
        generalHealthExplanation: (responses.generalHealthExplanation || '') + " [EMERGENCY FAST-TRACK SUBMISSION]"
      },
      createdAt: now.toISOString()
    };

    try {
      const docId = await saveSurveyToCloud(finalSurvey);
      setSubmittedId(docId);
      setLastCompletedSurvey(finalSurvey);
      setIsOfflineSaved(false);
      await clearDraft();
      setWizardPhase('success');
    } catch (err) {
      console.warn('Online emergency submission failed, saving offline:', err);
      try {
        await saveOfflineSurvey(finalSurvey);
        setSubmittedId(`SHF-OFFLINE-${uhid}-${surveyDate.replace(/-/g, '')}`);
        setLastCompletedSurvey(finalSurvey);
        setIsOfflineSaved(true);
        await clearDraft();
        setWizardPhase('success');
      } catch (offlineErr) {
        console.error('Offline saving failed for emergency survey:', offlineErr);
        alert(lang === 'te' ? 'సర్వేను సేవ్ చేయడంలో విఫలమైంది.' : 'Failed to save survey. Please try again.');
      }
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleRestartSurvey = () => {
    setUhid('');
    setPersonalDetails({ name: '', age: '', gender: '', occupation: '', address: '', home: '', karyasthalam: '', phone: '', email: '' });
    setResponses({
      generalHealthProblems: false,
      generalHealthExplanation: '',
      chestPain: false,
      chestPainSinceHowLong: '',
      chestPainPart: '',
      chestPainSide: '',
      chestPainIntensity: '',
      chestPainIncreasesWalking: false,
      chestPainIncreasesClimbing: false,
      chestPainIncreasesLifting: false,
      chestPainReducesHow: '',
      breathlessness: false,
      palpitations: false,
      dizziness: false,
      swellingLegs: false,
      excessiveFatigue: false,
      breathlessnessSinceHowLong: '',
      breathlessnessIncreasesWhen: '',
      respiratorySymptoms: '',
      digestiveSymptoms: '',
      nervousSymptoms: '',
      hadCovid: false,
      covidDetails: '',
      covidVaccinated: '',
      hasInsurance: false,
      insuranceDetails: '',
      diabetes: false,
      highBp: false,
      diabetesBpSinceHowLong: '',
      familyHeartDisease: false,
      familySuddenDeathBefore60: false,
      tobaccoUsageCigarette: false,
      tobaccoUsageGutka: false,
      tobaccoUsageOther: '',
      highCholesterol: false,
      previousMedicalExams: '',
      currentMedicines: '',
      ulcer: false,
      asthma: false,
      stroke: false,
      fits: false,
      nervousDisorders: false,
      jointDiseases: false,
      kidneyDisease: false,
      thyroidDisease: false,
      liverDisease: false,
      cancer: false,
      otherDisease: '',
      hadSurgery: false,
      surgeryDetails: '',
      surgeryComplications: '',
      hadHospitalization: false,
      hospitalizationDetails: '',
      previousHeartDisease: false,
      heartDiseaseDetails: '',
      medicationSideEffects: '',
      sleepQuality: '',
      sleepProblems: '',
      alcoholConsumption: false,
      otherAddictions: '',
      height: '',
      weight: '',
      dailyExercise: false,
      exerciseType: '',
      exerciseDuration: '',
      vegetarian: false,
      nonVegetarian: false,
      fruitsIntake: false,
      menstrualCycleRegular: false,
      pregnant: false
    });
    setValidationErrors({});
    setCurrentActiveIndex(0);
    setShowTriageWarning(false);
    setIsEmergencyFastTrack(false);
  };

  const renderStepContent = () => {
    switch (currentActiveIndex) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{t.sections.personal}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'దయచేసి మీ వ్యక్తిగత వివరాలను నమోదు చేయండి' : 'Provide basic registration info to map survey tracks'}</p>
            </div>
            {/* UHID Card */}
            <div className="bg-[#FFF1F2]/60 p-5 rounded-2xl border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-display">
                  <label className="text-sm font-bold text-rose-900 block flex items-center gap-1.5">
                    1. {t.questions.uhid} <span className="text-red-500 font-bold">*</span>
                  </label>
                  {renderVoiceControls('1. ' + t.questions.uhid, 'uhid', false)}
                </div>
                <p className="text-xs text-rose-600/90 font-medium">{lang === 'te' ? 'అధికారిక ఆసుపత్రి రోగి సంఖ్యను నమోదు చేయండి' : 'Official Hospital Patient Reference ID'}</p>
              </div>
              <div className="relative w-full sm:max-w-xs flex items-center">
                <input
                  id="uhid"
                  type="text"
                  value={uhid}
                  onChange={(e) => { setUhid(e.target.value); triggerAutoSave(personalDetails, responses, 0); }}
                  placeholder={t.placeholders.uhid}
                  className={`w-full bg-white border ${validationErrors.uhid ? 'border-red-500 focus:ring-red-300' : (activeListeningField === 'uhid' ? 'border-rose-500 ring-2 ring-rose-500 bg-rose-50/15 animate-pulse' : 'border-gray-200')} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm font-semibold`}
                />
              </div>
            </div>

            {/* General details fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">2. {t.questions.name} <span className="text-red-500 font-bold">*</span></label>
                  {renderVoiceControls('2. ' + t.questions.name, 'name', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="name"
                    type="text"
                    value={personalDetails.name}
                    onChange={(e) => handleDetailsChange('name', e.target.value)}
                    placeholder={t.placeholders.name}
                    className={`w-full border ${validationErrors.name ? 'border-red-500' : (activeListeningField === 'name' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200')} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">3. {t.questions.age} <span className="text-red-500 font-bold">*</span></label>
                  {renderVoiceControls('3. ' + t.questions.age, 'age', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="age"
                    type="number"
                    value={personalDetails.age}
                    onChange={(e) => handleDetailsChange('age', e.target.value)}
                    placeholder={t.placeholders.age}
                    className={`w-full border ${validationErrors.age ? 'border-red-500' : (activeListeningField === 'age' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200')} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">4. {t.questions.gender} <span className="text-red-500 font-bold">*</span></label>
                  {renderVoiceControls('4. ' + t.questions.gender, 'gender', true, { isGender: true })}
                </div>
                <div className="relative">
                  <select
                    id="gender"
                    value={personalDetails.gender}
                    onChange={(e) => handleDetailsChange('gender', e.target.value)}
                    className={`w-full border ${activeListeningField === 'gender' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 pr-10 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium appearance-none cursor-pointer`}
                  >
                    <option value="">{t.placeholders.gender}</option>
                    <option value="Male">{t.genderMale}</option>
                    <option value="Female">{t.genderFemale}</option>
                    <option value="Other">{t.genderOther}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Occupation */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">5. {t.questions.occupation}</label>
                  {renderVoiceControls('5. ' + t.questions.occupation, 'occupation', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="occupation"
                    type="text"
                    value={personalDetails.occupation}
                    onChange={(e) => handleDetailsChange('occupation', e.target.value)}
                    placeholder={t.placeholders.occupation}
                    className={`w-full border ${activeListeningField === 'occupation' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">6. {t.questions.address} <span className="text-red-500 font-bold">*</span></label>
                  {renderVoiceControls('6. ' + t.questions.address, 'address', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="address"
                    type="text"
                    value={personalDetails.address}
                    onChange={(e) => handleDetailsChange('address', e.target.value)}
                    placeholder={t.placeholders.address}
                    className={`w-full border ${validationErrors.address ? 'border-red-500' : (activeListeningField === 'address' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200')} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Home */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">{lang === 'te' ? '7. ఇల్లు వివరాలు' : '7. Home (Door No/Details)'}</label>
                  {renderVoiceControls(lang === 'te' ? '7. ఇల్లు వివరాలు' : '7. Home (Door No/Details)', 'home', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="home"
                    type="text"
                    value={personalDetails.home}
                    onChange={(e) => handleDetailsChange('home', e.target.value)}
                    placeholder={t.placeholders.home}
                    className={`w-full border ${activeListeningField === 'home' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Karyasthalam */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">8. {t.questions.karyasthalam}</label>
                  {renderVoiceControls('8. ' + t.questions.karyasthalam, 'karyasthalam', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="karyasthalam"
                    type="text"
                    value={personalDetails.karyasthalam}
                    onChange={(e) => handleDetailsChange('karyasthalam', e.target.value)}
                    placeholder={t.placeholders.karyasthalam}
                    className={`w-full border ${activeListeningField === 'karyasthalam' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block tracking-wide">9. {t.questions.phone} <span className="text-red-500 font-bold">*</span></label>
                  {renderVoiceControls('9. ' + t.questions.phone, 'phone', true)}
                </div>
                <div className="relative flex items-center">
                  <input
                    id="phone"
                    type="tel"
                    value={personalDetails.phone}
                    onChange={(e) => handleDetailsChange('phone', e.target.value)}
                    placeholder={t.placeholders.phone}
                    className={`w-full border ${activeListeningField === 'phone' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Symptoms
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{lang === 'te' ? 'లక్షణాలు' : 'Key Symptoms'}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'దయచేసి మీ గుండె సంబంధిత లక్షణాలను ఎంచుకోండి' : 'Identify primary cardiac symptoms and pain duration'}</p>
            </div>

            {responses.chestPain && showTriageWarning && (
              <div className="bg-gradient-to-br from-red-50/95 via-rose-50/90 to-red-100/50 backdrop-blur-md border-2 border-red-500 rounded-3xl p-6 shadow-2xl shadow-red-150/20 flex flex-col md:flex-row items-center gap-6 text-left relative overflow-hidden transition-all hover:scale-[1.005] duration-300 animate-in fade-in slide-in-from-top-6 duration-500">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
                <div className="h-16 w-16 bg-gradient-to-br from-red-100 to-red-200 text-red-650 border border-red-200/60 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <ShieldAlert className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-3.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <h3 className="text-sm md:text-base font-black text-red-700 tracking-tight uppercase font-display">{t.emergencyWarningTitle}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-red-800 leading-relaxed font-bold tracking-wide">
                    {t.emergencyWarningText}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleEmergencySubmit}
                      disabled={submissionLoading}
                      className="py-3 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-550/35 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 uppercase tracking-wider font-display"
                    >
                      {submissionLoading ? (
                        <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>{t.emergencyBtnNotify}</span>
                    </button>
                    <button
                      type="button"
                      className="py-3 px-5 bg-white/90 hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer hover:shadow-md transition-all active:scale-[0.98] uppercase tracking-wider font-display"
                      onClick={() => setShowTriageWarning(false)}
                    >
                      {t.emergencyBtnContinue}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                {/* Chest Pain Question */}
                <div className={`bg-rose-50/20 border ${activeListeningField === 'chestPain' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-rose-100'} rounded-2xl p-6 space-y-4 text-left`} id="chestPain">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-bold text-gray-800 block">1. {t.questions.chestPain}</label>
                    {renderVoiceControls('1. ' + t.questions.chestPain, 'chestPain', false, { isYesNo: true })}
                  </div>
                </div>
                <div className="flex gap-6">
                  <button
                    type="button"
                    onClick={() => handleResponseChange('chestPain', true)}
                    className={`flex items-center gap-2.5 py-3 px-6 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      responses.chestPain === true 
                        ? 'bg-rose-600 border-rose-600 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-650 hover:bg-rose-50/10'
                    }`}
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResponseChange('chestPain', false)}
                    className={`flex items-center gap-2.5 py-3 px-6 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      responses.chestPain === false 
                        ? 'bg-slate-500 border-slate-500 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-650 hover:bg-rose-50/10'
                    }`}
                  >
                    {t.no}
                  </button>
                </div>

                {/* Sub questions if chest pain is true */}
                {responses.chestPain && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-rose-100"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 block">{t.questions.chestPainSinceHowLong}</label>
                        {renderVoiceControls(t.questions.chestPainSinceHowLong, 'chestPainSinceHowLong', false)}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="chestPainSinceHowLong"
                          type="text"
                          value={responses.chestPainSinceHowLong}
                          onChange={(e) => handleResponseChange('chestPainSinceHowLong', e.target.value)}
                          placeholder={t.placeholders.chestPainSinceHowLong}
                          className={`w-full border ${activeListeningField === 'chestPainSinceHowLong' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 block">{t.questions.chestPainPart}</label>
                        {renderVoiceControls(t.questions.chestPainPart, 'chestPainPart', false)}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="chestPainPart"
                          type="text"
                          value={responses.chestPainPart}
                          onChange={(e) => handleResponseChange('chestPainPart', e.target.value)}
                          placeholder={t.placeholders.chestPainPart}
                          className={`w-full border ${activeListeningField === 'chestPainPart' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 block">{t.questions.chestPainSide}</label>
                        {renderVoiceControls(t.questions.chestPainSide, 'chestPainSide', false, { isChestPainSide: true })}
                      </div>
                      <div className="relative">
                        <select
                          id="chestPainSide"
                          value={responses.chestPainSide}
                          onChange={(e) => handleResponseChange('chestPainSide', e.target.value)}
                          className={`w-full border ${activeListeningField === 'chestPainSide' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 pr-10 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium appearance-none cursor-pointer`}
                        >
                          <option value="">{t.placeholders.chestPainSide}</option>
                          <option value="Left">{lang === 'te' ? 'ఎడమ వైపు (Left)' : 'Left'}</option>
                          <option value="Right">{lang === 'te' ? 'కుడి వైపు (Right)' : 'Right'}</option>
                          <option value="Middle">{lang === 'te' ? 'మధ్యభాగం (Middle)' : 'Middle'}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 block">{t.questions.chestPainIntensity}</label>
                        {renderVoiceControls(t.questions.chestPainIntensity, 'chestPainIntensity', false)}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="chestPainIntensity"
                          type="text"
                          value={responses.chestPainIntensity}
                          onChange={(e) => handleResponseChange('chestPainIntensity', e.target.value)}
                          placeholder={t.placeholders.chestPainIntensity}
                          className={`w-full border ${activeListeningField === 'chestPainIntensity' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                        />
                      </div>
                    </div>

                    {/* Chest Pain Increases Checkboxes */}
                    <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className={`space-y-1 p-1.5 rounded-xl border ${activeListeningField === 'chestPainIncreasesWalking' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-transparent'}`} id="chestPainIncreasesWalking">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-500 block">{t.questions.chestPainIncreasesWalking}</span>
                          {renderVoiceControls(t.questions.chestPainIncreasesWalking, 'chestPainIncreasesWalking', false, { isYesNo: true })}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesWalking', true)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesWalking === true ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesWalking', false)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesWalking === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-500'}`}>{t.no}</button>
                        </div>
                      </div>
                      <div className={`space-y-1 p-1.5 rounded-xl border ${activeListeningField === 'chestPainIncreasesClimbing' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-transparent'}`} id="chestPainIncreasesClimbing">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-500 block">{t.questions.chestPainIncreasesClimbing}</span>
                          {renderVoiceControls(t.questions.chestPainIncreasesClimbing, 'chestPainIncreasesClimbing', false, { isYesNo: true })}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesClimbing', true)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesClimbing === true ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesClimbing', false)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesClimbing === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-500'}`}>{t.no}</button>
                        </div>
                      </div>
                      <div className={`space-y-1 p-1.5 rounded-xl border ${activeListeningField === 'chestPainIncreasesLifting' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-transparent'}`} id="chestPainIncreasesLifting">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-gray-500 block">{t.questions.chestPainIncreasesLifting}</span>
                          {renderVoiceControls(t.questions.chestPainIncreasesLifting, 'chestPainIncreasesLifting', false, { isYesNo: true })}
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesLifting', true)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesLifting === true ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                          <button type="button" onClick={() => handleResponseChange('chestPainIncreasesLifting', false)} className={`flex-1 py-1 px-3 border rounded text-xs font-bold ${responses.chestPainIncreasesLifting === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-500'}`}>{t.no}</button>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 space-y-1.5 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 block">{t.questions.chestPainReducesHow}</label>
                        {renderVoiceControls(t.questions.chestPainReducesHow, 'chestPainReducesHow', false)}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="chestPainReducesHow"
                          type="text"
                          value={responses.chestPainReducesHow}
                          onChange={(e) => handleResponseChange('chestPainReducesHow', e.target.value)}
                          placeholder={t.placeholders.chestPainReducesHow}
                          className={`w-full border ${activeListeningField === 'chestPainReducesHow' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* General Health problems section */}
              <div className={`border ${activeListeningField === 'generalHealthProblems' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-gray-150'} rounded-2xl p-6 space-y-4 bg-white text-left`} id="generalHealthProblems">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">2. {t.questions.generalHealthProblems}</label>
                  {renderVoiceControls('2. ' + t.questions.generalHealthProblems, 'generalHealthProblems', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('generalHealthProblems', true)} className={`py-2 px-5 border rounded-lg text-sm font-bold ${responses.generalHealthProblems === true ? 'bg-rose-500 border-rose-500 text-white shadow-sm' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('generalHealthProblems', false)} className={`py-2 px-5 border rounded-lg text-sm font-bold ${responses.generalHealthProblems === false ? 'bg-slate-500 border-slate-500 text-white shadow-sm' : 'bg-white text-gray-500'}`}>{t.no}</button>
                </div>
                {responses.generalHealthProblems && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-gray-600 block">{t.questions.generalHealthExplanation}</label>
                      {renderVoiceControls(t.questions.generalHealthExplanation, 'generalHealthExplanation', false)}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="generalHealthExplanation"
                        type="text"
                        value={responses.generalHealthExplanation}
                        onChange={(e) => handleResponseChange('generalHealthExplanation', e.target.value)}
                        placeholder={t.placeholders.generalHealthExplanation}
                        className={`w-full border ${activeListeningField === 'generalHealthExplanation' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Breathlessness section */}
              <div className={`border ${activeListeningField === 'breathlessness' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-gray-150'} rounded-2xl p-6 space-y-4 bg-white text-left`} id="breathlessness">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">3. {t.questions.breathlessness}</label>
                  {renderVoiceControls('3. ' + t.questions.breathlessness, 'breathlessness', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('breathlessness', true)} className={`py-2 px-5 border rounded-lg text-sm font-bold ${responses.breathlessness === true ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('breathlessness', false)} className={`py-2 px-5 border rounded-lg text-sm font-bold ${responses.breathlessness === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-500'}`}>{t.no}</button>
                </div>
                {responses.breathlessness && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{t.questions.breathlessnessSinceHowLong}</span>
                        {renderVoiceControls(t.questions.breathlessnessSinceHowLong, 'breathlessnessSinceHowLong', false)}
                      </div>
                      <input
                        id="breathlessnessSinceHowLong"
                        type="text"
                        value={responses.breathlessnessSinceHowLong}
                        onChange={(e) => handleResponseChange('breathlessnessSinceHowLong', e.target.value)}
                        className={`w-full border ${activeListeningField === 'breathlessnessSinceHowLong' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500`}
                        placeholder={t.placeholders.breathlessnessSinceHowLong}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{t.questions.breathlessnessIncreasesWhen}</span>
                        {renderVoiceControls(t.questions.breathlessnessIncreasesWhen, 'breathlessnessIncreasesWhen', false)}
                      </div>
                      <input
                        id="breathlessnessIncreasesWhen"
                        type="text"
                        value={responses.breathlessnessIncreasesWhen}
                        onChange={(e) => handleResponseChange('breathlessnessIncreasesWhen', e.target.value)}
                        className={`w-full border ${activeListeningField === 'breathlessnessIncreasesWhen' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500`}
                        placeholder={t.placeholders.breathlessnessIncreasesWhen}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Other Cardiac Checkboxes */}
              <div className="border border-gray-150 rounded-2xl p-6 bg-white space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800 block">4. {lang === 'te' ? 'ఇతర గుండె / శ్వాసకోశ లక్షణాలు' : 'Other Cardiac/Respiratory Symptoms'}</span>
                  <button
                    type="button"
                    onClick={() => handleCheckboxVoicePrompt('cardiacList')}
                    className="p-1.5 rounded-full cursor-pointer transition-colors bg-pink-50 text-pink-500 hover:bg-pink-100"
                    title="Read checkbox guide aloud"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {[
                    { key: 'palpitations', label: t.questions.palpitations },
                    { key: 'dizziness', label: t.questions.dizziness },
                    { key: 'swellingLegs', label: t.questions.swellingLegs },
                    { key: 'excessiveFatigue', label: t.questions.excessiveFatigue }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border rounded-xl hover:bg-rose-50/5 cursor-pointer">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={(responses as any)[item.key] || false}
                          onChange={(e) => handleResponseChange(item.key as any, e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500 h-4.5 w-4.5 accent-rose-500"
                        />
                        <span className="text-xs font-bold text-gray-755">{item.label}</span>
                      </label>
                      {renderVoiceControls(item.label, item.key, false, { isYesNo: true })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar illustration */}
            <div className="hidden lg:col-span-4 lg:flex flex-col items-center justify-center p-6 border border-rose-100 bg-rose-50/10 rounded-3xl self-start sticky top-20">
              <img src={heartStethImg} alt="Heart tracker" className="w-44 h-44 object-contain drop-shadow-md animate-float" />
              <span className="text-xs text-rose-700 font-extrabold mt-4 font-display">{lang === 'te' ? 'లక్షణాల స్క్రీనర్' : 'Symptoms Screener'}</span>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">{lang === 'te' ? 'శ్రీనివాస గుండె సెంటర్' : 'Srinivasa Heart Centre'}</p>
            </div>
          </div>
        </div>
      );

      case 2: // Medical History
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{lang === 'te' ? 'వైద్య చరిత్ర' : 'Medical History'}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'దయచేసి మీ మునుపటి అనారోగ్యాలు మరియు వ్యాధుల వివరాలను అందించండి' : 'Check any chronic illness or past diagnoses list'}</p>
            </div>

            {/* Hypertension & Sugar */}
            <div className="bg-rose-50/10 border border-rose-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">1. {t.questions.diabetes}</label>
                  {renderVoiceControls('1. ' + t.questions.diabetes, 'diabetes', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('diabetes', true)} className={`py-1.5 px-4 border rounded text-xs font-bold ${responses.diabetes === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('diabetes', false)} className={`py-1.5 px-4 border rounded text-xs font-bold ${responses.diabetes === false ? 'bg-slate-500 border-slate-500 text-white shadow-sm' : 'bg-white text-gray-500'}`}>{t.no}</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">2. {t.questions.highBp}</label>
                  {renderVoiceControls('2. ' + t.questions.highBp, 'highBp', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('highBp', true)} className={`py-1.5 px-4 border rounded text-xs font-bold ${responses.highBp === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-500'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('highBp', false)} className={`py-1.5 px-4 border rounded text-xs font-bold ${responses.highBp === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-500'}`}>{t.no}</button>
                </div>
              </div>

              {(responses.diabetes || responses.highBp) && (
                <div className="md:col-span-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-655 block">{t.questions.diabetesBpSinceHowLong}</label>
                    {renderVoiceControls(t.questions.diabetesBpSinceHowLong, 'diabetesBpSinceHowLong', false)}
                  </div>
                  <input type="text" value={responses.diabetesBpSinceHowLong} onChange={(e) => handleResponseChange('diabetesBpSinceHowLong', e.target.value)} placeholder={t.placeholders.diabetesBpSinceHowLong} className="w-full border rounded-xl py-3 px-4 text-sm" />
                </div>
              )}
            </div>

            {/* Existing Chronic Disease Checklist */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 block">3. {lang === 'te' ? 'ఇతర వ్యాధులు' : 'Existing Medical Conditions'}</span>
                <button
                  type="button"
                  onClick={() => handleCheckboxVoicePrompt('existingConditions')}
                  className="p-1.5 rounded-full cursor-pointer transition-colors bg-pink-50 text-pink-500 hover:bg-pink-100"
                  title="Read chronic conditions guide"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'ulcer', label: t.questions.ulcer },
                  { key: 'asthma', label: t.questions.asthma },
                  { key: 'stroke', label: t.questions.stroke },
                  { key: 'fits', label: t.questions.fits },
                  { key: 'nervousDisorders', label: t.questions.nervousDisorders },
                  { key: 'jointDiseases', label: t.questions.jointDiseases },
                  { key: 'kidneyDisease', label: t.questions.kidneyDisease },
                  { key: 'thyroidDisease', label: t.questions.thyroidDisease },
                  { key: 'liverDisease', label: t.questions.liverDisease },
                  { key: 'cancer', label: t.questions.cancer },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-2.5 border rounded-xl hover:bg-rose-50/5 cursor-pointer">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={(responses as any)[item.key] || false}
                        onChange={(e) => handleResponseChange(item.key as any, e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4 accent-rose-500"
                      />
                      <span className="text-xs font-semibold text-gray-655">{item.label}</span>
                    </label>
                    {renderVoiceControls(item.label, item.key, false, { isYesNo: true })}
                  </div>
                ))}
              </div>
            </div>

            {/* Hospitalization and Surgeries */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.hadHospitalization}</label>
                  {renderVoiceControls(t.questions.hadHospitalization, 'hadHospitalization', false, { isYesNo: true })}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleResponseChange('hadHospitalization', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.hadHospitalization === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('hadHospitalization', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.hadHospitalization === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
                {responses.hadHospitalization && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 block">{lang === 'te' ? 'ఆసుపత్రి చేరిక వివరాలు' : 'Hospitalization details'}</span>
                      {renderVoiceControls(t.placeholders.hospitalizationDetails || 'Hospitalization details', 'hospitalizationDetails', false)}
                    </div>
                    <input type="text" value={responses.hospitalizationDetails} onChange={(e) => handleResponseChange('hospitalizationDetails', e.target.value)} placeholder={t.placeholders.hospitalizationDetails || 'Provide admission cause details'} className="w-full border rounded-xl py-3 px-4 text-sm" />
                  </div>
                )}
              </div>

              {/* Surgeries */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.hadSurgery}</label>
                  {renderVoiceControls(t.questions.hadSurgery, 'hadSurgery', false, { isYesNo: true })}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => handleResponseChange('hadSurgery', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.hadSurgery === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('hadSurgery', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.hadSurgery === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
                {responses.hadSurgery && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{lang === 'te' ? 'ఆపరేషన్ వివరాలు' : 'Surgery details'}</span>
                        {renderVoiceControls(t.placeholders.surgeryDetails || 'Surgery details', 'surgeryDetails', false)}
                      </div>
                      <input
                        id="surgeryDetails"
                        type="text"
                        value={responses.surgeryDetails}
                        onChange={(e) => handleResponseChange('surgeryDetails', e.target.value)}
                        placeholder={t.placeholders.surgeryDetails || 'Surgery Details'}
                        className={`w-full border ${activeListeningField === 'surgeryDetails' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{lang === 'te' ? 'ఏవైనా ఇబ్బందులు జరిగాయా?' : 'Complications if any'}</span>
                        {renderVoiceControls(t.placeholders.surgeryComplications || 'Complications details', 'surgeryComplications', false)}
                      </div>
                      <input
                        id="surgeryComplications"
                        type="text"
                        value={responses.surgeryComplications}
                        onChange={(e) => handleResponseChange('surgeryComplications', e.target.value)}
                        placeholder={t.placeholders.surgeryComplications || 'Complications (if any)'}
                        className={`w-full border ${activeListeningField === 'surgeryComplications' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Lifestyle & Habits
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{lang === 'te' ? 'జీవనశైలి & అలవాట్లు' : 'Lifestyle & Habits'}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'మీ ఫిట్నెస్, ఆహారం మరియు అలవాట్లు' : 'Physical stats, exercise scope, sleep quality and stress factors'}</p>
            </div>

            {/* Height & Weight */}
            <div className="bg-rose-50/10 border border-rose-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block">{t.questions.height}</label>
                  {renderVoiceControls(t.questions.height, 'height', false)}
                </div>
                <input
                  id="height"
                  type="number"
                  value={responses.height}
                  onChange={(e) => handleResponseChange('height', e.target.value)}
                  placeholder={t.placeholders.height}
                  className={`w-full border ${activeListeningField === 'height' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm font-semibold bg-white`}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block">{t.questions.weight}</label>
                  {renderVoiceControls(t.questions.weight, 'weight', false)}
                </div>
                <input
                  id="weight"
                  type="number"
                  value={responses.weight}
                  onChange={(e) => handleResponseChange('weight', e.target.value)}
                  placeholder={t.placeholders.weight}
                  className={`w-full border ${activeListeningField === 'weight' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm font-semibold bg-white`}
                />
              </div>
            </div>

            {/* Exercise & Habits */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.dailyExercise}</label>
                  {renderVoiceControls(t.questions.dailyExercise, 'dailyExercise', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('dailyExercise', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.dailyExercise === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('dailyExercise', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.dailyExercise === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
                {responses.dailyExercise && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{t.placeholders.exerciseType}</span>
                        {renderVoiceControls(t.placeholders.exerciseType, 'exerciseType', false)}
                      </div>
                      <input
                        id="exerciseType"
                        type="text"
                        value={responses.exerciseType}
                        onChange={(e) => handleResponseChange('exerciseType', e.target.value)}
                        placeholder={t.placeholders.exerciseType}
                        className={`w-full border ${activeListeningField === 'exerciseType' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 block">{t.placeholders.exerciseDuration}</span>
                        {renderVoiceControls(t.placeholders.exerciseDuration, 'exerciseDuration', false)}
                      </div>
                      <input
                        id="exerciseDuration"
                        type="text"
                        value={responses.exerciseDuration}
                        onChange={(e) => handleResponseChange('exerciseDuration', e.target.value)}
                        placeholder={t.placeholders.exerciseDuration}
                        className={`w-full border ${activeListeningField === 'exerciseDuration' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 text-sm`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.alcoholConsumption}</label>
                  {renderVoiceControls(t.questions.alcoholConsumption, 'alcoholConsumption', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('alcoholConsumption', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.alcoholConsumption === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('alcoholConsumption', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.alcoholConsumption === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
              </div>
            </div>

            {/* Diet choices & Female specifics */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 block">{lang === 'te' ? 'ఆహార అలవాట్లు' : 'Diet Choices'}</span>
                <button
                  type="button"
                  onClick={() => handleCheckboxVoicePrompt('dietList')}
                  className="p-1.5 rounded-full cursor-pointer transition-colors bg-pink-50 text-pink-500 hover:bg-pink-100"
                  title="Read diet choices aloud"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'vegetarian', label: lang === 'te' ? 'శాకాహారము' : 'Vegetarian' },
                  { key: 'nonVegetarian', label: lang === 'te' ? 'మాంసాహారము' : 'Non-Vegetarian' },
                  { key: 'fruitsIntake', label: lang === 'te' ? 'రోజూ పండ్లు తినడం' : 'Daily Fruits' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-xl hover:bg-rose-50/10 cursor-pointer">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={(responses as any)[item.key] || false}
                        onChange={(e) => handleResponseChange(item.key as any, e.target.checked)}
                        className="rounded text-rose-500 h-4.5 w-4.5 accent-rose-500"
                      />
                      <span className="text-xs font-bold text-gray-770">{item.label}</span>
                    </label>
                    {renderVoiceControls(item.label, item.key, false, { isYesNo: true })}
                  </div>
                ))}
              </div>

              {personalDetails.gender === 'Female' && (
                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <span className="text-xs font-bold text-pink-650 block uppercase tracking-wider">{lang === 'te' ? 'మహిళల ప్రత్యేక సర్వే సమాధానాలు' : 'Female Specific Survey Responses'}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Menstrual Regularity */}
                    <div className={`space-y-3 p-3 rounded-xl border ${activeListeningField === 'menstrualCycleRegular' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-transparent'}`} id="menstrualCycleRegular">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-655">{t.questions.menstrualCycleRegular}</span>
                        {renderVoiceControls(t.questions.menstrualCycleRegular, 'menstrualCycleRegular', false, { isYesNo: true })}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleResponseChange('menstrualCycleRegular', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.menstrualCycleRegular === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                        <button type="button" onClick={() => handleResponseChange('menstrualCycleRegular', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.menstrualCycleRegular === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                      </div>
                    </div>

                    {/* Pregnancy check */}
                    <div className={`space-y-3 p-3 rounded-xl border ${activeListeningField === 'pregnant' ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-50/15 animate-pulse' : 'border-transparent'}`} id="pregnant">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-655">{t.questions.pregnant}</span>
                        {renderVoiceControls(t.questions.pregnant, 'pregnant', false, { isYesNo: true })}
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleResponseChange('pregnant', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.pregnant === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                        <button type="button" onClick={() => handleResponseChange('pregnant', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.pregnant === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                      </div>
                    </div>

                    {/* Pregnancy complications (conditional) */}
                    {responses.pregnant === true && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-700 block tracking-wide">{t.questions.pregnancyComplications}</label>
                          {renderVoiceControls(t.questions.pregnancyComplications, 'pregnancyComplications', false)}
                        </div>
                        <div className="relative flex items-center">
                          <input
                            id="pregnancyComplications"
                            type="text"
                            value={responses.pregnancyComplications || ''}
                            onChange={(e) => handleResponseChange('pregnancyComplications', e.target.value)}
                            placeholder={t.placeholders.pregnancyComplications}
                            className={`w-full border ${activeListeningField === 'pregnancyComplications' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Previous surgeries */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-700 block tracking-wide">{t.questions.previousSurgeries}</label>
                        {renderVoiceControls(t.questions.previousSurgeries, 'previousSurgeries', false)}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="previousSurgeries"
                          type="text"
                          value={responses.previousSurgeries || ''}
                          onChange={(e) => handleResponseChange('previousSurgeries', e.target.value)}
                          placeholder={t.placeholders.previousSurgeries}
                          className={`w-full border ${activeListeningField === 'previousSurgeries' ? 'border-pink-500 ring-2 ring-pink-500 bg-rose-50/15 animate-pulse' : 'border-gray-200'} rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-pink-500 text-sm font-medium`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Family History & Tobacco
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{lang === 'te' ? 'కుటుంబ జబ్బుల చరిత్ర' : 'Family History & Tobacco'}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'దయచేసి మీ ఇంట్లోని గుండె జబ్బుల వివరాలను అందించండి' : 'Check family medical risk factors and tobacco habits'}</p>
            </div>

            {/* Family risks */}
            <div className="bg-rose-50/10 border border-rose-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.familyHeartDisease}</label>
                  {renderVoiceControls(t.questions.familyHeartDisease, 'familyHeartDisease', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('familyHeartDisease', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.familyHeartDisease === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('familyHeartDisease', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.familyHeartDisease === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800 block">{t.questions.familySuddenDeathBefore60}</label>
                  {renderVoiceControls(t.questions.familySuddenDeathBefore60, 'familySuddenDeathBefore60', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('familySuddenDeathBefore60', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.familySuddenDeathBefore60 === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('familySuddenDeathBefore60', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.familySuddenDeathBefore60 === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
              </div>
            </div>

            {/* Tobacco options */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white space-y-4 text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 block">{lang === 'te' ? 'పొగాకు అలవాట్లు' : 'Tobacco usage habit'}</span>
                <button
                  type="button"
                  onClick={() => handleCheckboxVoicePrompt('tobaccoList')}
                  className="p-1.5 rounded-full cursor-pointer transition-colors bg-pink-50 text-pink-500 hover:bg-pink-100"
                  title="Read tobacco usage list"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-xl max-w-sm cursor-pointer hover:bg-rose-50/5">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input type="checkbox" checked={responses.tobaccoUsageCigarette} onChange={(e) => handleResponseChange('tobaccoUsageCigarette', e.target.checked)} className="rounded text-rose-500 h-4.5 w-4.5 accent-rose-500" />
                    <span className="text-xs font-bold text-gray-755">{lang === 'te' ? 'సిగరెట్' : 'Cigarette'}</span>
                  </label>
                  {renderVoiceControls(lang === 'te' ? 'సిగరెట్ (Cigarette)' : 'Cigarette', 'tobaccoUsageCigarette', false, { isYesNo: true })}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-xl max-w-sm cursor-pointer hover:bg-rose-50/5">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input type="checkbox" checked={responses.tobaccoUsageGutka} onChange={(e) => handleResponseChange('tobaccoUsageGutka', e.target.checked)} className="rounded text-rose-500 h-4.5 w-4.5 accent-rose-500" />
                    <span className="text-xs font-bold text-gray-755">{lang === 'te' ? 'గుట్కా' : 'Gutka, Zarda'}</span>
                  </label>
                  {renderVoiceControls(lang === 'te' ? 'గుట్కా' : 'Gutka, Zarda', 'tobaccoUsageGutka', false, { isYesNo: true })}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 block">{t.placeholders.tobaccoUsageOther}</span>
                    {renderVoiceControls(t.placeholders.tobaccoUsageOther, 'tobaccoUsageOther', false)}
                  </div>
                  <div className="relative flex items-center">
                    <input type="text" value={responses.tobaccoUsageOther} onChange={(e) => handleResponseChange('tobaccoUsageOther', e.target.value)} placeholder={t.placeholders.tobaccoUsageOther} className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* High Cholesterol & Current Medicines */}
            <div className="border border-gray-150 rounded-2xl p-6 bg-white space-y-5 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-855 block">{t.questions.highCholesterol}</label>
                  {renderVoiceControls(t.questions.highCholesterol, 'highCholesterol', false, { isYesNo: true })}
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => handleResponseChange('highCholesterol', true)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.highCholesterol === true ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-400'}`}>{t.yes}</button>
                  <button type="button" onClick={() => handleResponseChange('highCholesterol', false)} className={`py-1.5 px-4 border rounded-xl text-xs font-bold ${responses.highCholesterol === false ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white text-gray-400'}`}>{t.no}</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700 block">{t.questions.currentMedicines}</label>
                  {renderVoiceControls(t.questions.currentMedicines, 'currentMedicines', false)}
                </div>
                <div className="relative flex items-center col-span-1">
                  <input type="text" value={responses.currentMedicines} onChange={(e) => handleResponseChange('currentMedicines', e.target.value)} placeholder={t.placeholders.currentMedicines} className="w-full border rounded-xl py-3 px-4 text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Review & Submit
        return (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-2xl font-black text-gray-800 font-display">{lang === 'te' ? 'సమీక్ష & సమర్పణ' : 'Review & Submit'}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{lang === 'te' ? 'దయచేసి సమర్పించే ముందు మీ వివరాలను సమీక్షించండి' : 'Please review your survey answers before saving'}</p>
            </div>

            {/* REVIEW ITEMS */}
            <div className="space-y-5">
              {/* Box 1: Personal Details */}
              <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-rose-50/30 px-5 py-4 flex items-center justify-between border-b">
                  <h3 className="text-xs font-extrabold text-rose-955 uppercase tracking-widest flex items-center gap-2">
                    <User className="h-4 w-4 text-rose-500" />
                    {t.sections.personal}
                  </h3>
                  <button type="button" onClick={() => setCurrentActiveIndex(0)} className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer">{lang === 'te' ? 'సవరించండి' : 'Edit Responses'}</button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5 text-xs text-gray-650">
                  <div>{lang === 'te' ? 'యూహెచ్ ఐడి నంబర్:' : 'UHID ID:'} <strong className="text-rose-700 block text-sm mt-0.5">{uhid || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                  <div>{lang === 'te' ? 'పేరు:' : 'Name:'} <strong className="text-gray-900 block text-sm mt-0.5">{personalDetails.name || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                  <div>{lang === 'te' ? 'వయస్సు / లింగం:' : 'Age / Gender:'} <strong className="text-gray-900 block text-sm mt-0.5">
                    {personalDetails.age || (lang === 'te' ? 'వర్తించదు' : 'N/A')} {lang === 'te' ? 'సంవత్సరాలు' : 'yrs'} / {personalDetails.gender === 'Male' ? t.genderMale : personalDetails.gender === 'Female' ? t.genderFemale : personalDetails.gender === 'Other' ? t.genderOther : (lang === 'te' ? 'వర్తించదు' : 'N/A')}
                  </strong></div>
                  <div>{lang === 'te' ? 'ఫోన్ నంబర్:' : 'Phone:'} <strong className="text-gray-900 block text-sm mt-0.5">{personalDetails.phone || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                  <div>{lang === 'te' ? 'చిరునామా:' : 'Address:'} <strong className="text-gray-900 block text-sm mt-0.5">{personalDetails.address || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                </div>
              </div>

              {/* Box 2: Symptoms */}
              <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-rose-50/30 px-5 py-4 flex items-center justify-between border-b">
                  <h3 className="text-xs font-extrabold text-rose-955 uppercase tracking-widest flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-rose-500" />
                    {lang === 'te' ? 'లక్షణాలు' : 'Key Symptoms'}
                  </h3>
                  <button type="button" onClick={() => setCurrentActiveIndex(1)} className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer">{lang === 'te' ? 'సవరించండి' : 'Edit Responses'}</button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs text-gray-655">
                  <div>{lang === 'te' ? 'ఛాతి నొప్పి:' : 'Chest Pain:'} <strong className={`block text-sm mt-0.5 ${responses.chestPain ? 'text-red-600 font-bold' : 'text-gray-900'}`}>{responses.chestPain ? t.yes : t.no}</strong></div>
                  {responses.chestPain && (
                    <>
                      <div>{lang === 'te' ? 'నొప్పి వ్యవధి:' : 'Duration of Pain:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.chestPainSinceHowLong || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                      <div>{lang === 'te' ? 'నొప్పి ఉన్న స్థలం / వైపు:' : 'Pain Location / Side:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.chestPainPart || (lang === 'te' ? 'వర్తించదు' : 'N/A')} ({responses.chestPainSide === 'Left' ? (lang === 'te' ? 'ఎడమ వైపు' : 'Left') : responses.chestPainSide === 'Right' ? (lang === 'te' ? 'కుడి వైపు' : 'Right') : responses.chestPainSide === 'Middle' ? (lang === 'te' ? 'మధ్యభాగం' : 'Middle') : (lang === 'te' ? 'వర్తించదు' : 'N/A')})</strong></div>
                    </>
                  )}
                  <div>{lang === 'te' ? 'ఆయాసం / శ్వాస ఇబ్బంది:' : 'Breathlessness:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.breathlessness ? t.yes : t.no}</strong></div>
                  <div>{lang === 'te' ? 'గుండె దడ, కళ్ళు తిరగడం:' : 'Palpitations, Dizziness:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.palpitations ? t.yes : t.no}, {responses.dizziness ? t.yes : t.no}</strong></div>
                </div>
              </div>

              {/* Box 3: Medical History */}
              <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-rose-50/30 px-5 py-4 flex items-center justify-between border-b">
                  <h3 className="text-xs font-extrabold text-rose-955 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-4 w-4 text-rose-500" />
                    {lang === 'te' ? 'వైద్య చరిత్ర' : 'Medical History'}
                  </h3>
                  <button type="button" onClick={() => setCurrentActiveIndex(2)} className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer">{lang === 'te' ? 'సవరించండి' : 'Edit Responses'}</button>
                </div>
                <div className="p-5 grid grid-cols-2 gap-4 text-xs text-gray-655">
                  <div>{lang === 'te' ? 'మధుమేహం (షుగర్) / బీపీ:' : 'Diabetes / BP:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.diabetes ? t.yes : t.no} / {responses.highBp ? t.yes : t.no}</strong></div>
                  <div>{lang === 'te' ? 'శస్త్రచికిత్స / ఆసుపత్రి చేరిక:' : 'Surgery / Hospitalization:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.hadSurgery ? t.yes : t.no} / {responses.hadHospitalization ? t.yes : t.no}</strong></div>
                </div>
              </div>

              {/* Box 4: Lifestyle & Habits */}
              <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-rose-50/30 px-5 py-4 flex items-center justify-between border-b">
                  <h3 className="text-xs font-extrabold text-rose-955 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-4 w-4 text-rose-500" />
                    {lang === 'te' ? 'జీవనశైలి & అలవాట్లు' : 'Lifestyle & Habits'}
                  </h3>
                  <button type="button" onClick={() => setCurrentActiveIndex(3)} className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer">{lang === 'te' ? 'సవరించండి' : 'Edit Responses'}</button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5 text-xs text-gray-655">
                  <div>{lang === 'te' ? 'ఎత్తు / బరువు:' : 'Height / Weight:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.height || (lang === 'te' ? 'వర్తించదు' : 'N/A')} cm / {responses.weight || (lang === 'te' ? 'వర్తించదు' : 'N/A')} kg</strong></div>
                  <div>{lang === 'te' ? 'రోజువారీ వ్యాయామం:' : 'Daily Exercise:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.dailyExercise ? t.yes : t.no} {responses.dailyExercise && `(${responses.exerciseType || (lang === 'te' ? 'వర్తించదు' : 'N/A')}, ${responses.exerciseDuration || (lang === 'te' ? 'వర్తించదు' : 'N/A')})`}</strong></div>
                  <div>{lang === 'te' ? 'ఆహార అలవాట్లు:' : 'Diet Choices:'} <strong className="text-gray-900 block text-sm mt-0.5">
                    {responses.vegetarian && (lang === 'te' ? 'శాకాహారము' : 'Vegetarian')}
                    {responses.vegetarian && responses.nonVegetarian && ' / '}
                    {responses.nonVegetarian && (lang === 'te' ? 'మాంసాహారము' : 'Non-Vegetarian')}
                    {!responses.vegetarian && !responses.nonVegetarian && (lang === 'te' ? 'వర్తించదు' : 'N/A')}
                    {responses.fruitsIntake && ` (${lang === 'te' ? 'రోజువారీ పండ్లు' : 'Daily Fruits'})`}
                  </strong></div>
                  {personalDetails.gender === 'Female' && (
                    <>
                      <div>{lang === 'te' ? 'క్రమం తప్పకుండా పీరియడ్స్ వస్తున్నాయా:' : 'Menstrual Cycle Regular:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.menstrualCycleRegular === true ? t.yes : responses.menstrualCycleRegular === false ? t.no : (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                      <div>{lang === 'te' ? 'గర్భవతిగా ఉన్నారా:' : 'Pregnant:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.pregnant === true ? t.yes : responses.pregnant === false ? t.no : (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                      {responses.pregnant === true && (
                        <div>{lang === 'te' ? 'గర్భధారణ సమస్యలు:' : 'Pregnancy Complications:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.pregnancyComplications || (lang === 'te' ? 'లేవు' : 'None')}</strong></div>
                      )}
                      <div>{lang === 'te' ? 'గతంలో సర్జరీలు (స్త్రీ సంబంధిత):' : 'Previous Female Surgeries:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.previousSurgeries || (lang === 'te' ? 'లేవు' : 'None')}</strong></div>
                    </>
                  )}
                </div>
              </div>

              {/* Box 5: Family History & Habits */}
              <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                <div className="bg-rose-50/30 px-5 py-4 flex items-center justify-between border-b">
                  <h3 className="text-xs font-extrabold text-rose-955 uppercase tracking-widest flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                    {lang === 'te' ? 'కుటుంబ చరిత్ర & ఇతర అలవాట్లు' : 'Family History & Habits'}
                  </h3>
                  <button type="button" onClick={() => setCurrentActiveIndex(4)} className="text-xs font-bold text-pink-600 hover:text-pink-700 cursor-pointer">{lang === 'te' ? 'సవరించండి' : 'Edit Responses'}</button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3.5 text-xs text-gray-655">
                  <div>{lang === 'te' ? 'కుటుంబ గుండె జబ్బుల చరిత్ర:' : 'Family Heart Disease:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.familyHeartDisease ? t.yes : t.no} / {responses.familySuddenDeathBefore60 ? t.yes : t.no} ({lang === 'te' ? 'ఆకస్మిక మరణం' : 'Sudden Death'})</strong></div>
                  <div>{lang === 'te' ? 'పొగాకు అలవాటు:' : 'Tobacco Usage:'} <strong className="text-gray-900 block text-sm mt-0.5">
                    {responses.tobaccoUsageCigarette && (lang === 'te' ? 'సిగరెట్' : 'Cigarette')}
                    {responses.tobaccoUsageCigarette && (responses.tobaccoUsageGutka || responses.tobaccoUsageOther) && ' / '}
                    {responses.tobaccoUsageGutka && (lang === 'te' ? 'గుట్కా' : 'Gutka')}
                    {responses.tobaccoUsageGutka && responses.tobaccoUsageOther && ' / '}
                    {responses.tobaccoUsageOther && responses.tobaccoUsageOther}
                    {!responses.tobaccoUsageCigarette && !responses.tobaccoUsageGutka && !responses.tobaccoUsageOther && (lang === 'te' ? 'లేదు' : 'None')}
                  </strong></div>
                  <div>{lang === 'te' ? 'కొలెస్ట్రాల్ / మందులు:' : 'Cholesterol / Medicines:'} <strong className="text-gray-900 block text-sm mt-0.5">{responses.highCholesterol ? t.yes : t.no} / {responses.currentMedicines || (lang === 'te' ? 'వర్తించదు' : 'N/A')}</strong></div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = lang === 'en' ? [
    { id: 1, title: 'Personal Details' },
    { id: 2, title: 'Symptoms' },
    { id: 3, title: 'Medical History' },
    { id: 4, title: 'Lifestyle & Habits' },
    { id: 5, title: 'Family History' },
    { id: 6, title: 'Review & Submit' }
  ] : [
    { id: 1, title: 'వ్యక్తిగత వివరాలు' },
    { id: 2, title: 'లక్షణాలు' },
    { id: 3, title: 'వైద్య చరిత్ర' },
    { id: 4, title: 'జీవనశైలి & అలవాట్లు' },
    { id: 5, title: 'కుటుంబ చరిత్ర' },
    { id: 6, title: 'సమీక్ష & సమర్పణ' }
  ];

  const progressPercentage = [10, 30, 50, 70, 85, 95][currentActiveIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/40 via-white to-pink-50/35 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <Heart className="h-6 w-6 text-rose-500 fill-current animate-pulse" />
          <h1 className="text-base font-black text-rose-950 font-display">{lang === 'te' ? 'శ్రీనివాస గుండె సర్వే' : 'Srinivasa Heart Survey'}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Bilingual Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setLang('en');
                triggerAutoSave(personalDetails, responses, currentActiveIndex, 'en');
              }}
              className={`py-1 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'en' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('te');
                triggerAutoSave(personalDetails, responses, currentActiveIndex, 'te');
              }}
              className={`py-1 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                lang === 'te' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              తెలుగు
            </button>
          </div>

          <button
            onClick={() => setVoiceCompanion(!voiceCompanion)}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              voiceCompanion ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-gray-400'
            }`}
          >
            {voiceCompanion ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{lang === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'}</span>
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center gap-1.5 py-2 px-3.5 border border-rose-200 hover:border-rose-450 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-xl hover:bg-rose-50/10 cursor-pointer transition-colors shadow-sm bg-white"
          >
            <span>🏠</span>
            <span>{lang === 'te' ? 'హోమ్' : 'Home'}</span>
          </button>
        </div>
      </header>

      {/* PHASE 1: LANGUAGE SELECTION */}
      {wizardPhase === 'language' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white p-8 border border-rose-100 rounded-3xl shadow-xl space-y-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-pink-600" />
            
            <div className="space-y-3">
              <span 
                onClick={handleLogoClick} 
                role="button"
                tabIndex={0}
                className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block font-sans cursor-pointer select-none py-2 hover:text-rose-600 active:scale-95 transition-all"
              >
                SRINIVASA HEART CENTRE
              </span>
              <h2 className="text-2xl font-black text-rose-955 font-display tracking-tight">Select Survey Language / భాషను ఎంచుకోండి</h2>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">Please choose your preferred language to proceed with the screening survey</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleLanguageSelect('te')}
                className="group border border-gray-150 p-6 rounded-2xl text-left hover:border-rose-400 hover:bg-rose-50/5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 shadow-sm hover:shadow-md"
              >
                <span className="text-lg font-black text-rose-600 block leading-tight">తెలుగు</span>
                <span className="text-xs text-gray-400 font-medium group-hover:text-rose-500 mt-2 block">తెలుగు భాషలో సర్వే పూర్తి చేయడానికి ఇక్కడ నొక్కండి.</span>
              </button>

              <button
                onClick={() => handleLanguageSelect('en')}
                className="group border border-gray-150 p-6 rounded-2xl text-left hover:border-rose-400 hover:bg-rose-50/5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-40 shadow-sm hover:shadow-md"
              >
                <span className="text-lg font-black text-rose-600 block leading-tight">English</span>
                <span className="text-xs text-gray-400 font-medium group-hover:text-rose-500 mt-2 block">Click here to complete the survey in English language.</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: DRAFT RESTORE */}
      {wizardPhase === 'draft_restore' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-7 border border-rose-100 rounded-3xl shadow-xl space-y-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-pink-600" />
            <div className="mx-auto h-12 w-12 bg-amber-50 border border-amber-100 text-amber-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-800 font-display">
                {(savedDraftState?.lang || lang) === 'te' ? 'అసంపూర్ణ సర్వే కనుగొనబడింది' : 'Incomplete Survey Found'}
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                {(savedDraftState?.lang || lang) === 'te' 
                  ? 'గత సెషన్ నుండి స్వయంచాలకంగా సేవ్ చేయబడిన చిత్తుప్రతి కనుగొనబడింది. మీరు దానిని పునరుద్ధరించాలనుకుంటున్నారా?' 
                  : 'We found an auto-saved draft from a previous session. Would you like to resume?'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                onClick={deleteDraft}
                className="py-3 px-4 border border-gray-250 rounded-2xl text-xs font-bold text-gray-550 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {(savedDraftState?.lang || lang) === 'te' ? 'చిత్తుప్రతిని తొలగించు' : 'Discard Draft'}
              </button>
              <button
                onClick={restoreDraft}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow transition-colors cursor-pointer"
              >
                {(savedDraftState?.lang || lang) === 'te' ? 'సర్వేను పునరుద్ధరించు' : 'Resume Draft'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: SURVEY WIZARD */}
      {wizardPhase === 'survey' && (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (Step Indicators Panel) */}
            <section className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-xs space-y-4 text-left">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block font-sans">
                  {lang === 'te' ? 'సర్వే పురోగతి' : 'Survey Progress'}
                </span>
                
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-rose-700">
                    <span>{progressPercentage}%</span>
                    <span>{lang === 'te' ? 'పూర్తయింది' : 'Completed'}</span>
                  </div>
                  <div className="w-full bg-rose-50 h-2 rounded-full overflow-hidden border border-rose-100">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-2.5 pt-2">
                  {steps.map((st, idx) => {
                    const isActive = currentActiveIndex === idx;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => !submissionLoading && setCurrentActiveIndex(idx)}
                        disabled={submissionLoading}
                        className={`w-full py-3.5 px-4 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all border ${
                          submissionLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isActive 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 border-rose-500 text-white shadow-md shadow-rose-200/40 font-black'
                            : 'bg-white border-gray-150 text-gray-600 hover:bg-rose-50/20'
                        }`}
                      >
                        <span>{st.id}. {st.title}</span>
                        {idx < currentActiveIndex && (
                          <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Telugu Numbers Pronunciation Guide Box */}
              <div className="bg-white border border-rose-100 rounded-3xl p-5 shadow-xs space-y-3.5 text-left">
                <div className="border-b pb-2">
                  <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block font-sans">
                    Telugu Numbers Helper
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium block">
                    Use these words for age and other numeric fields
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
                  <div><strong className="text-rose-900">1:</strong> okati / ఒకటి</div>
                  <div><strong className="text-rose-900">2:</strong> rendu / రెండు</div>
                  <div><strong className="text-rose-900">3:</strong> moodu / మూడు</div>
                  <div><strong className="text-rose-900">4:</strong> naalugu / నాలుగు</div>
                  <div><strong className="text-rose-900">5:</strong> aidu / ఐదు</div>
                  <div><strong className="text-rose-900">6:</strong> aaru / ఆరు</div>
                  <div><strong className="text-rose-900">7:</strong> edu / ఏడు</div>
                  <div><strong className="text-rose-900">8:</strong> enimidi / ఎనిమిది</div>
                  <div><strong className="text-rose-900">9:</strong> thommidi / తొమ్మిది</div>
                  <div><strong className="text-rose-900">10:</strong> padi / పది</div>
                </div>
                <div className="border-t pt-2 text-[9px] text-gray-500 font-semibold leading-tight">
                  <span className="block font-bold">Compound Examples:</span>
                  <span className="block mt-0.5">35 = muppai aidu (ముప్పై ఐదు)</span>
                  <span className="block">42 = nalabhai rendu (నలభై రెండు)</span>
                </div>
              </div>

              {/* Help desk widget */}
              <div className="bg-[#FFF1F2] border border-rose-100 rounded-3xl p-6 text-left space-y-3 shadow-xs">
                <div>
                  <h4 className="text-gray-900 font-extrabold text-sm font-display">Need Help?</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">Camp coordinator is ready to assist you</p>
                </div>
                <a 
                  href="tel:9390105045"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-rose-250 hover:border-rose-450 text-rose-600 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  <Phone className="h-3.5 w-3.5" />
                  93901 05045
                </a>
              </div>
            </section>

            {/* Right Column (Survey Step Forms content) */}
            <section className="lg:col-span-9 flex flex-col gap-6">
              
              {/* Voice state indicator feedback block */}
              {(speech.isListening || speech.isSpeaking) && (
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center justify-center gap-3">
                    {speech.isListening && (
                      <>
                        <div className="flex items-center justify-center gap-1.5 h-6">
                          <span className="w-1.5 bg-rose-500 rounded-full animate-bounce h-4" />
                          <span className="w-1.5 bg-rose-500 rounded-full animate-bounce h-6" style={{ animationDelay: '0.1s' }} />
                          <span className="w-1.5 bg-rose-500 rounded-full animate-bounce h-5" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-xs font-bold text-rose-700">{speech.listeningFeedback}</span>
                      </>
                    )}
                    {!speech.isListening && speech.isSpeaking && (
                      <>
                        <Volume2 className="h-5 w-5 text-rose-600 animate-pulse" />
                        <span className="text-xs font-bold text-rose-700">Speaking... దయచేసి వినండి</span>
                      </>
                    )}
                  </div>
                  {speech.isListening && speech.transcript && (
                    <div className="w-full max-w-lg bg-white border border-rose-100 rounded-xl p-3 text-center shadow-inner mt-1">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-1">Live Speech Transcript</span>
                      <p className="text-xs font-black text-rose-900 leading-relaxed">"{speech.transcript}"</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-3xl border border-rose-100 p-6 md:p-10 shadow-sm flex-1 min-h-[460px]">
                {speech.transcript && (
                  <div className="mb-6 bg-rose-50/30 border border-rose-100/70 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-inner animate-fade-in">
                    <div className="flex-1">
                      <span className="text-[10px] text-rose-600 font-extrabold tracking-wider uppercase block mb-1">
                        {lang === 'te' ? "వాయిస్ ట్రాన్స్క్రిప్ట్ (చివరిగా పలికినది)" : "Voice Transcript (Last Spoken)"}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        "{speech.transcript}"
                      </p>
                    </div>
                    {speech.isListening && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                )}
                {renderStepContent()}
              </div>

              {/* Bottom Wizard Nav controllers */}
              <footer className="flex items-center justify-between">
                <button
                  onClick={currentActiveIndex === 0 ? () => setWizardPhase('language') : handleBackStep}
                  disabled={submissionLoading}
                  className="px-6 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-extrabold cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.back}
                </button>

                <button
                  onClick={currentActiveIndex === 5 ? handleFinalSubmit : handleNextStep}
                  disabled={submissionLoading}
                  className="px-7 py-3.5 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 border border-rose-750 font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-rose-200/60 transition-transform hover:scale-102 disabled:opacity-50"
                >
                  {submissionLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      {currentActiveIndex === 5 ? t.submit : t.next}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </footer>
            </section>
          </main>
        </div>
      )}

      {/* PHASE 4: SUCCESS COMPLETED SURVEY SCREEN */}
      {wizardPhase === 'success' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 border border-rose-100 rounded-3xl shadow-xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-pink-600" />
            
            <div className="mx-auto h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
              {isOfflineSaved ? <ShieldAlert className="h-9 w-9 text-amber-500" /> : <CheckCircle2 className="h-9 w-9 text-emerald-500 fill-current" />}
            </div>

            <div className="space-y-2.5">
              <h2 className="text-2xl font-black text-rose-955 font-display">
                {isOfflineSaved ? (lang === 'te' ? 'ఆఫ్‌లైన్‌లో భద్రపరచబడింది!' : 'Stored Offline!') : t.successTitle}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{lang === 'te' ? 'స్క్రీనింగ్ పూర్తయింది' : 'Screening Completed'}</p>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto text-center">
                {isOfflineSaved 
                  ? (lang === 'te' 
                      ? 'కియోస్క్ ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉంది. మీ ఆరోగ్య సర్వే స్థానికంగా సేవ్ చేయబడింది మరియు ఆసుపత్రి నెట్‌వర్క్ పునరుద్ధరించబడినప్పుడు స్వయంచాలకంగా సమకాలీకరించబడుతుంది.' 
                      : 'Kiosk is currently offline. Your screening survey has been saved locally and will automatically synchronize when the hospital network is restored.')
                  : t.successSubtitle
                }
              </p>
            </div>

            {(isEmergencyFastTrack || (lastCompletedSurvey?.responses && lastCompletedSurvey.responses.chestPain === true)) && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50/90 border border-red-200 rounded-3xl p-5 shadow-lg shadow-red-100/25 flex flex-col items-center gap-3 relative overflow-hidden animate-pulse">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-rose-600" />
                <div className="flex items-center gap-2 text-red-650">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest block">{lang === 'te' ? 'వైద్య అత్యవసర నోటీసు' : 'Clinical Emergency Notice'}</span>
                </div>
                <strong className="text-red-800 font-extrabold text-xs md:text-sm leading-relaxed text-center font-sans tracking-wide">
                  {t.emergencyAlertNotice}
                </strong>
              </div>
            )}

            <div className="bg-rose-50/20 border border-rose-100 p-4 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest block">{lang === 'te' ? 'సర్వే సూచన ఐడి' : 'Reference Survey ID'}</span>
              <strong className="text-rose-700 font-black text-sm block mt-1">{submittedId || 'SHF-Offline'}</strong>
            </div>

            <button
              onClick={() => {
                if (lastCompletedSurvey) {
                  triggerPdfExport(lastCompletedSurvey, setPdfLoading);
                }
              }}
              disabled={pdfLoading}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
            >
              {pdfLoading ? (
                <span className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileText className="h-4.5 w-4.5" />
              )}
              <span>{lang === 'te' ? 'నివేదిక పిడిఎఫ్ డౌన్‌లోడ్ చేయండి' : 'Download PDF Report'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onBackToDashboard}
                className="py-3 px-4 border border-gray-250 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 cursor-pointer"
              >
                {user 
                  ? (lang === 'te' ? 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి' : 'Go to Dashboard') 
                  : (lang === 'te' ? 'హోమ్‌కు వెళ్లండి' : 'Back to Home')
                }
              </button>
              <button
                onClick={handleRestartSurvey}
                className="py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow cursor-pointer"
              >
                {lang === 'te' ? 'కొత్త సర్వే' : 'New Survey'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKBOX VOICE SEQUENTIAL SEQUENCE DIALOG POPUP */}
      {activeCheckboxVoice && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-rose-100 max-w-lg w-full p-6 md:p-8 space-y-6 transform transition-all duration-300 scale-100 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-550" />
            
            <div className="flex items-center justify-between text-left border-b pb-4">
              <div>
                <span className="text-[10px] text-pink-650 font-extrabold tracking-wider uppercase">{lang === 'te' ? "వాయిస్ అసిస్టెంట్" : "Voice Assistant"}</span>
                <h3 className="text-sm font-black text-slate-800 uppercase block">{activeCheckboxVoice.sectionTitle}</h3>
              </div>
              <button 
                onClick={() => {
                  speech.stop();
                  setActiveCheckboxVoice(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-8 space-y-4 text-center">
              <span className="text-xs text-slate-400 font-bold tracking-wide uppercase">
                {lang === 'te' ? `ప్రశ్న ${activeCheckboxVoice.currentIndex + 1} / ${activeCheckboxVoice.items.length}` : `Question ${activeCheckboxVoice.currentIndex + 1} of ${activeCheckboxVoice.items.length}`}
              </span>
              
              <h4 className="text-xl md:text-2xl font-black text-rose-955 px-2 leading-snug">
                {activeCheckboxVoice.items[activeCheckboxVoice.currentIndex].question}
              </h4>
            </div>

            <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center justify-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              <span className="text-xs font-bold text-rose-700 font-sans tracking-wide">
                {checkboxValidationFeedback}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleCheckboxManualOverride(true)}
                className="py-3 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-rose-200/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                {lang === 'te' ? "అవును" : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => handleCheckboxManualOverride(false)}
                className="py-3 px-5 bg-slate-500 hover:bg-slate-600 text-white rounded-2xl text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-slate-200/50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                ✕
                {lang === 'te' ? "లేదు" : "No"}
              </button>
            </div>

            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
              {lang === 'te' ? "లేదా బదిలీ చేయడానికి మాన్యువల్ బటన్ క్లిక్ చేయండి." : "Or click manual button to overwrite directly."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
