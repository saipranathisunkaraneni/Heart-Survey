import React, { useState, useEffect } from 'react';
import { 
  Heart, Shield, Lock, Eye, Activity, Award, ArrowRight, CheckCircle2, 
  Clock, Stethoscope, ChevronRight, Clipboard, HelpCircle, Phone, 
  Mail, MapPin, Check, PlusCircle, UserCheck
} from 'lucide-react';

interface LandingPageProps {
  onStartSurvey: () => void;
  onSecretLogin: () => void;
  lang: 'en' | 'te';
  setLang: (lang: 'en' | 'te') => void;
}

const landingTranslations = {
  en: {
    title: "Srinivasa Heart Survey",
    subtitle: "Srinivasa Heart Centre",
    navHome: "Home",
    navAbout: "About Survey",
    navPrivacy: "Privacy",
    navFaq: "FAQ",
    navContact: "Contact",
    takeSurvey: "Take Survey",
    heroBadge: "Secure Pre-Consultation Assessment",
    heroTitlePrefix: "Welcome to ",
    heroTitleMiddle: "Srinivasa",
    heroTitleSuffix: " Heart Survey",
    heroText: "Helping our medical team understand your heart health before your consultation through a secure digital assessment.",
    startSurvey: "Start Health Survey",
    estimatedTime: "Estimated completion: 5–7 Minutes",
    sec100: "100% Secure",
    secConf: "Confidential",
    secDr: "Doctor Reviewed",
    secAi: "AI Assisted",
    cardiology: "Cardiology Diagnostics",
    location: "Srinivasa Heart Centre, Hanamkonda",
    corePurpose: "Core Purpose",
    whyTakeTitle: "Why Take This Survey?",
    whyTakeDesc: "This digital pre-screening questionnaire helps our cardiologists collect medical history, lifestyle factors, and symptoms to personalize your diagnosis.",
    reducedWaitTitle: "Reduced Wait Times",
    reducedWaitDesc: "Patients register and outline details at home or kiosk, eliminating paper intake delays upon clinic arrival.",
    fasterConsultTitle: "Faster Consultations",
    fasterConsultDesc: "Doctors review parsed inputs instantly, leaving more time during checkups to focus on secondary diagnostic actions.",
    accurateDiagTitle: "Accurate Diagnosis",
    accurateDiagDesc: "Standardized clinical symptoms filters ensure no critical conditions or patient records are omitted.",
    personalHealthTitle: "Personalized Health",
    personalHealthDesc: "Tailored algorithms flag lifestyle habits, previous surgeries, and drug sensitivities for focused guidance.",
    modulesCovered: "Modules Covered",
    compScreening: "Comprehensive Heart Screening",
    sixDomains: "We compile responses across six critical cardiac health domains:",
    riskTitle: "Heart Risk Assessment",
    riskDesc: "Checks for chest pain intensities, breathlessness, dizziness, swelling legs, fatigue, and other symptoms.",
    medHistoryTitle: "Medical History Collection",
    medHistoryDesc: "Filters chronic issues like diabetes, high BP, previous surgeries, stroke, fits, and thyroid conditions.",
    lifestyleTitle: "Lifestyle Assessment",
    lifestyleDesc: "Collects height, weight, tobacco/gutka usage, alcohol habits, and daily exercise duration.",
    familyTitle: "Family History",
    familyDesc: "Flags heart disease lineages or cases of premature sudden deaths under age 60.",
    digitalRecordTitle: "Digital Health Records",
    digitalRecordDesc: "Builds a centralized database of current medications, previous medical exams, and insurance files.",
    aiAnalysisTitle: "AI Assisted Analysis",
    aiAnalysisDesc: "Flags clinical warning signs instantly to help cardiologists prioritize high-risk patients.",
    workflow: "Workflow",
    timelineTitle: "Survey Process Timeline",
    timelineDesc: "How your digital assessment progress guides your clinic checkup:",
    step01: "Registration",
    step01Sub: "UHID Generation",
    step02: "Demographics",
    step02Sub: "Personal Details",
    step03: "Medical History",
    step03Sub: "Chronic Conditions",
    step04: "Lifestyle",
    step04Sub: "Habits & Exercise",
    step05: "Heart Metrics",
    step05Sub: "Chest Pain & Symptoms",
    step06: "Submission",
    step06Sub: "Receipt & PDF",
    step07: "Doctor Review",
    step07Sub: "Diagnosis Report",
    dataSecurity: "Data Security",
    privacyTitle: "Your Privacy Matters",
    privacyText: "All health survey responses remain fully confidential. We utilize enterprise-grade encryption methods to secure patient documents.",
    p1: "Data is protected under standard hospital patient privacy policies.",
    p2: "Your details are only visible to your assigned clinical team.",
    p3: "Encrypted cloud Firestore prevents leaks and unauthorized queries.",
    p4: "Kiosk drafts are automatically wiped upon final survey submission.",
    c1Title: "Confidentiality",
    c1Desc: "No public logs. Only doctors read individual files.",
    c2Title: "Authorized access",
    c2Desc: "Dashboard access strictly requires staff logins.",
    c3Title: "Secure cloud",
    c3Desc: "All files written directly to encrypted Firestore.",
    c4Title: "Protected policies",
    c4Desc: "Complies with regulatory clinical databases criteria.",
    modernization: "Modernization",
    whyChooseTitle: "Why Choose Digital Surveys?",
    whyChooseDesc: "Moving beyond traditional paper forms enables a seamless pre-screening workflow:",
    choice1: "Less Paperwork",
    choice1Desc: "Go paperless and save time.",
    choice2: "Faster Registration",
    choice2Desc: "Get in and out of the clinic quicker.",
    choice3: "Accurate History",
    choice3Desc: "Prevents missing key details.",
    choice4: "Easy for Doctors",
    choice4Desc: "Quick reading view dashboards.",
    choice5: "Secure Records",
    choice5Desc: "Encrypted history files.",
    faqs: "FAQs",
    faqTitle: "Frequently Asked Questions",
    readyTitle: "Ready to Begin?",
    readyText: "Click below to launch the conversational voice-first pre-consultation survey questionnaire.",
    startHeartSurvey: "Start Heart Survey",
    descText: "Srinivasa Heart Centre provides specialized cardiology services, diagnostic screenings, and personalized inpatient care campaigns in Hanamkonda.",
    helpline: "Emergency Helpline: 108 / +91 9390105045",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    addressVal: "Ramnagar, Hanamkonda, Telangana 506001",
    rightsReserved: "Srinivasa Heart Centre. All rights reserved. | Protected under Hospital Privacy Policy guidelines.",
    faqsList: [
      {
        q: "How long does the survey take?",
        a: "The survey takes approximately 5 to 7 minutes to complete. It includes basic personal details, medical history, current symptoms, and lifestyle questions."
      },
      {
        q: "Is my information secure?",
        a: "Yes, absolute security is our priority. Your data is encrypted and saved securely in cloud servers, accessible only by authorized medical professionals at Srinivasa Heart Centre."
      },
      {
        q: "Can I stop and continue later?",
        a: "Yes, the survey wizard auto-saves your progress locally. If you close the browser or step away, you can restore your progress when you reopen the page."
      },
      {
        q: "Who can access my information?",
        a: "Only your consulting cardiologist, clinic doctors, and authorized hospital staff can access your responses through their secure authenticated dashboards."
      },
      {
        q: "Is this survey mandatory?",
        a: "Yes, this digital assessment helps our medical team understand your condition, history, and risk factors in advance, significantly reducing waiting times and improving your diagnosis quality."
      }
    ]
  },
  te: {
    title: "శ్రీనివాస హార్ట్ సర్వే",
    subtitle: "శ్రీనివాస హార్ట్ సెంటర్",
    navHome: "హోమ్",
    navAbout: "సర్వే గురించి",
    navPrivacy: "వ్యక్తిగత భద్రత",
    navFaq: "ప్రశ్నోత్తరాలు",
    navContact: "సంప్రదించండి",
    takeSurvey: "సర్వే చేయండి",
    heroBadge: "సురక్షిత ముందస్తు వైద్య సంప్రదింపుల సర్వే",
    heroTitlePrefix: "శ్రీనివాస ",
    heroTitleMiddle: "హార్ట్ సర్వే",
    heroTitleSuffix: "కు స్వాగతం",
    heroText: "సురక్షితమైన డిజిటల్ అసెస్‌మెంట్ ద్వారా మీ వైద్య సంప్రదింపులకు ముందే మీ గుండె ఆరోగ్యాన్ని అర్థం చేసుకోవడానికి మా వైద్య బృందానికి సహాయపడుతుంది.",
    startSurvey: "ఆరోగ్య సర్వే ప్రారంభించండి",
    estimatedTime: "పూర్తవడానికి పట్టే సమయం: 5–7 నిమిషాలు",
    sec100: "100% సురక్షితం",
    secConf: "అత్యంత రహస్యం",
    secDr: "వైద్యుల సమీక్ష",
    secAi: "AI సహాయం గలది",
    cardiology: "కార్డియాలజీ డయాగ్నోస్టిక్స్",
    location: "శ్రీనివాస హార్ట్ సెంటర్, హనుమకొండ",
    corePurpose: "ముఖ్య ఉద్దేశం",
    whyTakeTitle: "ఈ సర్వే ఎందుకు పూరించాలి?",
    whyTakeDesc: "ఈ డిజిటల్ ముందస్తు స్క్రీనింగ్ ప్రశ్నాపత్రం మా గుండె నిపుణులకు మీ వైద్య చరిత్ర, జీవనశైలి మరియు లక్షణాలను సేకరించడంలో సహాయపడుతుంది, తద్వారా మీ రోగ నిర్ధారణను మరింత స్పష్టంగా చేయవచ్చు.",
    reducedWaitTitle: "తక్కువ నిరీక్షణ సమయం",
    reducedWaitDesc: "రోగులు ఇంట్లోనే లేదా కియోస్క్ వద్ద నమోదు చేసుకుని వివరాలను పూరించవచ్చు, తద్వారా క్లినిక్‌కి వచ్చినప్పుడు కాగితపు పనుల ఆలస్యాన్ని నివారించవచ్చు.",
    fasterConsultTitle: "వేగవంతమైన సంప్రదింపులు",
    fasterConsultDesc: "వైద్యులు రోగులు పూరించిన వివరాలను తక్షణమే సమీక్షిస్తారు, తద్వారా చెకప్ సమయంలో రోగి పట్ల మరింత శ్రద్ధ వహించడానికి సమయం లభిస్తుంది.",
    accurateDiagTitle: "ఖచ్చితమైన రోగ నిర్ధారణ",
    accurateDiagDesc: "ప్రామాణిక క్లినికల్ లక్షణాల ఫిల్టర్‌లు ఏవైనా ముఖ్యమైన పరిస్థితులు లేదా రోగి వివరాలు మిస్ కాకుండా చూస్తాయి.",
    personalHealthTitle: "వ్యక్తిగతీకరించిన ఆరోగ్యం",
    personalHealthDesc: "జీవనశైలి అలవాట్లు, మునుపటి శస్త్రచికిత్సలు మరియు మందుల అలవాట్లను గుర్తించి ప్రత్యేక శ్రద్ధను అందిస్తుంది.",
    modulesCovered: "కవర్ చేయబడిన విభాగాలు",
    compScreening: "సమగ్ర గుండె ఆరోగ్య పరీక్ష",
    sixDomains: "మేము ఆరు కీలక గుండె ఆరోగ్య రంగాలలో సమాధానాలను సేకరిస్తాము:",
    riskTitle: "గుండె జబ్బుల ప్రమాద అంచనా",
    riskDesc: "ఛాతీ నొప్పి తీవ్రతలు, ఆయాసం, మైకము, కాళ్ళ వాపు, అలసట మరియు ఇతర లక్షణాలను తనిఖీ చేస్తుంది.",
    medHistoryTitle: "వైద్య చరిత్ర సేకరణ",
    medHistoryDesc: "మధుమేహం (షుగర్), బీపీ, మునుపటి శస్త్రచికిత్సలు, పక్షవాతం, ఫిట్స్ మరియు థైరాయిడ్ వంటి దీర్ఘకాలిక సమస్యలను పరిశీలిస్తుంది.",
    lifestyleTitle: "జీవనశైలి అంచనా",
    lifestyleDesc: "ఎత్తు, బరువు, పొగాకు/గుట్కా వాడకం, మద్యం అలవాట్లు మరియు రోజువారీ వ్యాయామ సమయాన్ని సేకరిస్తుంది.",
    familyTitle: "కుటుంబ చరిత్ర",
    familyDesc: "కుటుంబంలో గుండె జబ్బుల చరిత్ర లేదా 60 ఏళ్లలోపు ఆకస్మిక మరణాల కేసులను గుర్తిస్తుంది.",
    digitalRecordTitle: "డిజిటల్ ఆరోగ్య రికార్డులు",
    digitalRecordDesc: "ప్రస్తుతం వాడుతున్న మందులు, మునుపటి వైద్య పరీక్షలు మరియు ఇన్సూరెన్స్ వివరాల కేంద్రీకృత డేటాను సృష్టిస్తుంది.",
    aiAnalysisTitle: "AI సహాయక విశ్లేషణ",
    aiAnalysisDesc: "అత్యంత ప్రమాదం ఉన్న రోగులకు త్వరగా వైద్య సహాయం అందించడానికి క్లినికల్ హెచ్చరిక సంకేతాలను తక్షణమే గుర్తిస్తుంది.",
    workflow: "విధానం",
    timelineTitle: "సర్వే విధానం కాలక్రమం",
    timelineDesc: "మీ డిజిటల్ అసెస్‌మెంట్ పురోగతి మీ క్లినిక్ చెకప్‌కు ఎలా సహాయపడుతుందో ఇక్కడ చూడండి:",
    step01: "నమోదు",
    step01Sub: "UHID సృష్టి",
    step02: "జనాభా వివరాలు",
    step02Sub: "వ్యక్తిగత వివరాలు",
    step03: "వైద్య చరిత్ర",
    step03Sub: "దీర్ఘకాలిక సమస్యలు",
    step04: "జీవనశైలి",
    step04Sub: "అలవాట్లు & వ్యాయామం",
    step05: "గుండె కొలతలు",
    step05Sub: "ఛాతీ నొప్పి & లక్షణాలు",
    step06: "సమర్పణ",
    step06Sub: "రశీదు & PDF",
    step07: "వైద్యుల సమీక్ష",
    step07Sub: "రోగ నిర్ధారణ నివేదిక",
    dataSecurity: "డేటా భద్రత",
    privacyTitle: "మీ వ్యక్తిగత భద్రత మా బాధ్యత",
    privacyText: "ఆరోగ్య సర్వే సమాధానాలన్నీ పూర్తిగా రహస్యంగా ఉంచబడతాయి. రోగి పత్రాలను భద్రపరచడానికి మేము అత్యుత్తమ ఎన్‌క్రిప్షన్ పద్ధతులను ఉపయోగిస్తాము.",
    p1: "డేటా ప్రామాణిక ఆసుపత్రి రోగి గోప్యతా విధానాల క్రింద రక్షించబడుతుంది.",
    p2: "మీ వివరాలు మీకు కేటాయించిన క్లినికల్ బృందానికి మాత్రమే కనిపిస్తాయి.",
    p3: "ఎన్‌క్రిప్టెడ్ క్లౌడ్ ఫైర్‌స్టోర్ డేటా లీక్‌లు మరియు అనధికారిక ప్రశ్నలను నిరోధిస్తుంది.",
    p4: "చివరి సర్వే సమర్పణ తర్వాత కియోస్క్ డ్రాఫ్ట్‌లు స్వయంచాలకంగా తొలగించబడతాయి.",
    c1Title: "రహస్యత",
    c1Desc: "పబ్లిక్ లాగ్‌లు ఉండవు. వైద్యులు మాత్రమే వ్యక్తిగత ఫైల్‌లను చదువుతారు.",
    c2Title: "అధికారిక యాక్సెస్",
    c2Desc: "డ్యాష్‌బోర్డ్ వీక్షించడానికి సిబ్బంది లాగిన్ తప్పనిసరి.",
    c3Title: "సురక్షిత క్లౌడ్",
    c3Desc: "అన్ని ఫైల్‌లు నేరుగా ఎన్‌క్రిప్టెడ్ ఫైర్‌స్టోర్‌లో సేవ్ చేయబడతాయి.",
    c4Title: "రక్షిత విధానాలు",
    c4Desc: "నియంత్రణ క్లినికల్ డేటాబేస్ ప్రమాణాలకు కట్టుబడి ఉంటుంది.",
    modernization: "ఆధునీకరణ",
    whyChooseTitle: "డిజిటల్ సర్వేలను ఎందుకు ఎంచుకోవాలి?",
    whyChooseDesc: "సాంప్రదాయ కాగితపు పత్రాలను దాటి డిజిటల్ మార్గాన్ని ఎంచుకోవడం ద్వారా లభించే ప్రయోజనాలు:",
    choice1: "తక్కువ కాగితపు పని",
    choice1Desc: "కాగితం లేకుండా సమయాన్ని ఆదా చేయండి.",
    choice2: "వేగవంతమైన నమోదు",
    choice2Desc: "క్లినిక్‌కి వచ్చి త్వరగా వెళ్ళవచ్చు.",
    choice3: "ఖచ్చితమైన చరిత్ర",
    choice3Desc: "ముఖ్యమైన వివరాలను కోల్పోకుండా నిరోధిస్తుంది.",
    choice4: "వైద్యులకు సులభం",
    choice4Desc: "డ్యాష్‌బోర్డ్‌లలో సులభంగా చూసే అవకాశం.",
    choice5: "సురక్షిత రికార్డులు",
    choice5Desc: "ఎన్‌క్రిప్టెడ్ చరిత్ర ఫైల్‌లు.",
    faqs: "ప్రశ్నోత్తరాలు",
    faqTitle: "తరచుగా అడిగే ప్రశ్నలు",
    readyTitle: "ప్రారంభించడానికి సిద్ధంగా ఉన్నారా?",
    readyText: "వాయిస్ సహాయంతో ముందస్తు సంప్రదింపుల హార్ట్ సర్వేను ప్రారంభించడానికి క్రింది బటన్ నొక్కండి.",
    startHeartSurvey: "హార్ట్ సర్వే ప్రారంభించండి",
    descText: "శ్రీనివాస హార్ట్ సెంటర్ హనుమకొండలో ప్రత్యేక కార్డియాలజీ సేవలు, రోగ నిర్ధారణ స్క్రీనింగ్‌లు మరియు వ్యక్తిగతీకరించిన చికిత్సలను అందిస్తుంది.",
    helpline: "అత్యవసర హెల్ప్‌లైన్: 108 / +91 9390105045",
    quickLinks: "త్వరిత లింకులు",
    contactInfo: "సంప్రదింపు సమాచారం",
    addressVal: "రాంనగర్, హనుమకొండ, తెలంగాణ 506001",
    rightsReserved: "శ్రీనివాస హార్ట్ సెంటర్. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి. | ఆసుపత్రి గోప్యతా విధాన మార్గదర్శకాల క్రింద రక్షించబడింది.",
    faqsList: [
      {
        q: "సర్వే పూర్తి చేయడానికి ఎంత సమయం పడుతుంది?",
        a: "ఈ సర్వే పూర్తి చేయడానికి సుమారు 5 నుండి 7 నిమిషాలు పడుతుంది. దీనిలో సాధారణ వ్యక్తిగత వివరాలు, వైద్య చరిత్ర, ప్రస్తుత లక్షణాలు మరియు జీవనశైలి ప్రశ్నలు ఉంటాయి."
      },
      {
        q: "నా సమాచారం సురక్షితంగా ఉంటుందా?",
        a: "అవును, పూర్తి భద్రత మా ప్రాధాన్యత. మీ డేటా ఎన్‌క్రిప్ట్ చేయబడి క్లౌడ్ సర్వర్‌లలో సురక్షితంగా సేవ్ చేయబడుతుంది, దీనిని శ్రీనివాస హార్ట్ సెంటర్ లోని అధీకృత వైద్య నిపుణులు మాత్రమే చూడగలరు."
      },
      {
        q: "నేను మధ్యలో ఆపి తర్వాత కొనసాగించవచ్చా?",
        a: "అవును, సర్వే విజార్డ్ మీ పురోగతిని స్థానికంగా స్వయంచాలకంగా సేవ్ చేస్తుంది. మీరు బ్రౌజర్‌ను మూసివేసినా లేదా పక్కకు వెళ్లినా, పేజీని మళ్లీ తెరిచినప్పుడు మీరు కొనసాగించవచ్చు."
      },
      {
        q: "నా సమాచారాన్ని ఎవరు చూడగలరు?",
        a: "మీకు సంప్రదించే కార్డియాలజిస్ట్, క్లినిక్ వైద్యులు మరియు అధీకృత ఆసుపత్రి సిబ్బంది మాత్రమే వారి సురక్షిత లాగిన్ ద్వారా మీ సమాధానాలను చూడగలరు."
      },
      {
        q: "ఈ సర్వే తప్పనిసరిగా చేయాలా?",
        a: "అవును, ఈ డిజిటల్ అసెస్‌మెంట్ మా వైద్య బృందానికి మీ పరిస్థితి, చరిత్ర మరియు ప్రమాద కారకాలను ముందుగానే అర్థం చేసుకోవడానికి సహాయపడుతుంది, తద్వారా నిరీక్షణ సమయం తగ్గుతుంది మరియు చికిత్స నాణ్యత పెరుగుతుంది."
      }
    ]
  }
};

export default function LandingPage({ onStartSurvey, onSecretLogin, lang, setLang }: LandingPageProps) {
  const [logoClicks, setLogoClicks] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const t = landingTranslations[lang];

  // Hidden portal tap handler
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

  // Reset clicks after 2 seconds
  useEffect(() => {
    if (logoClicks > 0) {
      const t = setTimeout(() => setLogoClicks(0), 2000);
      return () => clearTimeout(t);
    }
  }, [logoClicks]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-700">
      
      {/* 1. STICKY NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div 
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2.5 cursor-pointer select-none group focus:outline-none"
        >
          <div className="h-9 w-9 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-black text-slate-800 font-display tracking-tight leading-none">{t.title}</h1>
            <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">{t.subtitle}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-600">
          <a href="#home" className="hover:text-rose-600 transition-colors">{t.navHome}</a>
          <a href="#about" className="hover:text-rose-600 transition-colors">{t.navAbout}</a>
          <a href="#privacy" className="hover:text-rose-600 transition-colors">{t.navPrivacy}</a>
          <a href="#faq" className="hover:text-rose-600 transition-colors">{t.navFaq}</a>
          <a href="#contact" className="hover:text-rose-600 transition-colors">{t.navContact}</a>
        </nav>

        <div className="flex items-center gap-4">
          {/* Bilingual Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                lang === 'en' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('te')}
              className={`py-1 px-2.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                lang === 'te' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:bg-white/50'
              }`}
            >
              తెలుగు
            </button>
          </div>

          <button 
            onClick={onStartSurvey}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            {t.takeSurvey}
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative bg-gradient-to-br from-rose-50/50 via-white to-rose-50/30 overflow-hidden py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-[10px] bg-rose-50 border border-rose-200/60 text-rose-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest inline-flex items-center gap-1.5 animate-fade-in">
              <Shield className="h-3 w-3 fill-current" /> {t.heroBadge}
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none font-display">
              {t.heroTitlePrefix}<span className="text-rose-600">{t.heroTitleMiddle}</span>{t.heroTitleSuffix}
            </h2>
            <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
              {t.heroText}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4.5 pt-2">
              <button
                onClick={onStartSurvey}
                className="py-4 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group text-sm"
              >
                <Heart className="h-5 w-5 fill-current animate-bounce group-hover:scale-110" />
                <span>{t.startSurvey}</span>
              </button>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{t.estimatedTime}</span>
              </div>
            </div>

            {/* Display Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-rose-100">
              {[
                { icon: Shield, label: t.sec100 },
                { icon: Lock, label: t.secConf },
                { icon: UserCheck, label: t.secDr },
                { icon: Activity, label: t.secAi }
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-rose-150 shadow-sm hover:border-rose-200 transition-all">
                  <b.icon className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wide">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image/Illustration Column */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-6 bg-white border border-rose-100 rounded-3xl shadow-xl max-w-sm w-full group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="/src/assets/images/heart_stethoscope_1780729575391.png" 
                alt="Heart screening assessment" 
                className="w-full h-auto object-contain drop-shadow-md animate-float"
              />
              <div className="mt-4 text-center">
                <span className="text-[10px] text-rose-600 font-black tracking-widest uppercase block font-display">{t.cardiology}</span>
                <p className="text-xs text-gray-400 font-bold mt-0.5">{t.location}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-gray-100">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.corePurpose}</span>
          <h3 className="text-3xl font-black text-slate-900 font-display">{t.whyTakeTitle}</h3>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full" />
          <p className="text-sm text-gray-500 max-w-lg mx-auto font-medium">
            {t.whyTakeDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: Clock,
              title: t.reducedWaitTitle,
              desc: t.reducedWaitDesc
            },
            {
              icon: Activity,
              title: t.fasterConsultTitle,
              desc: t.fasterConsultDesc
            },
            {
              icon: Stethoscope,
              title: t.accurateDiagTitle,
              desc: t.accurateDiagDesc
            },
            {
              icon: Award,
              title: t.personalHealthTitle,
              desc: t.personalHealthDesc
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-150 hover:border-rose-250 shadow-sm hover:shadow-md transition-all text-left space-y-4">
              <div className="h-12 w-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
                <item.icon className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-black text-slate-800 font-display">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SERVICES / MODULES COVERED */}
      <section className="bg-slate-50/50 py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.modulesCovered}</span>
            <h3 className="text-3xl font-black text-slate-900 font-display">{t.compScreening}</h3>
            <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full" />
            <p className="text-sm text-gray-500 max-w-lg mx-auto font-medium">
              {t.sixDomains}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: t.riskTitle, desc: t.riskDesc, icon: Heart },
              { title: t.medHistoryTitle, desc: t.medHistoryDesc, icon: Stethoscope },
              { title: t.lifestyleTitle, desc: t.lifestyleDesc, icon: Activity },
              { title: t.familyTitle, desc: t.familyDesc, icon: Clipboard },
              { title: t.digitalRecordTitle, desc: t.digitalRecordDesc, icon: CheckCircle2 },
              { title: t.aiAnalysisTitle, desc: t.aiAnalysisDesc, icon: Award }
            ].map((s, idx) => (
              <div key={idx} className="group bg-white p-6.5 rounded-2xl border border-gray-150 hover:border-rose-200 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all text-left space-y-4">
                <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <s.icon className="h-5 w-5 fill-current" />
                </div>
                <h4 className="text-sm font-black text-slate-800 font-display">{s.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SURVEY PROCESS TIMELINE */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-gray-100">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.workflow}</span>
          <h3 className="text-3xl font-black text-slate-900 font-display">{t.timelineTitle}</h3>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full" />
          <p className="text-sm text-gray-500 max-w-lg mx-auto font-medium">
            {t.timelineDesc}
          </p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[800px] flex justify-between items-center relative py-6">
            
            {/* Timeline connection line */}
            <div className="absolute top-[3.25rem] left-[5%] right-[5%] h-0.5 bg-gray-200 -z-10" />

            {[
              { step: "01", label: t.step01, sub: t.step01Sub },
              { step: "02", label: t.step02, sub: t.step02Sub },
              { step: "03", label: t.step03, sub: t.step03Sub },
              { step: "04", label: t.step04, sub: t.step04Sub },
              { step: "05", label: t.step05, sub: t.step05Sub },
              { step: "06", label: t.step06, sub: t.step06Sub },
              { step: "07", label: t.step07, sub: t.step07Sub }
            ].map((p, idx) => (
              <div key={idx} className="flex flex-col items-center w-[12%] text-center">
                <div className="h-11 w-11 bg-white border-2 border-rose-500 text-rose-600 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform hover:scale-105">
                  {p.step}
                </div>
                <span className="text-xs font-black text-slate-800 font-display mt-3 block">{p.label}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 block">{p.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRIVACY & SECURITY SECTION */}
      <section id="privacy" className="py-20 px-6 max-w-7xl mx-auto w-full border-b border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left privacy text */}
          <div className="space-y-6 text-left">
            <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.dataSecurity}</span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">{t.privacyTitle}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-semibold">
              {t.privacyText}
            </p>
            <div className="space-y-4">
              {[
                t.p1,
                t.p2,
                t.p3,
                t.p4
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right privacy cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: t.c1Title, desc: t.c1Desc, icon: Shield },
              { title: t.c2Title, desc: t.c2Desc, icon: Eye },
              { title: t.c3Title, desc: t.c3Desc, icon: Lock },
              { title: t.c4Title, desc: t.c4Desc, icon: Check }
            ].map((c, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-150 hover:border-rose-250 hover:shadow-md transition-all text-left space-y-3">
                <div className="h-9 w-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center">
                  <c.icon className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-black text-slate-800 font-display">{c.title}</h4>
                <p className="text-[11px] text-gray-500 leading-normal font-semibold">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE DIGITAL SURVEY */}
      <section className="bg-slate-50/50 py-20 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.modernization}</span>
            <h3 className="text-3xl font-black text-slate-900 font-display">{t.whyChooseTitle}</h3>
            <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full" />
            <p className="text-sm text-gray-500 max-w-lg mx-auto font-medium">
              {t.whyChooseDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { label: t.choice1, desc: t.choice1Desc },
              { label: t.choice2, desc: t.choice2Desc },
              { label: t.choice3, desc: t.choice3Desc },
              { label: t.choice4, desc: t.choice4Desc },
              { label: t.choice5, desc: t.choice5Desc }
            ].map((c, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-150 hover:border-rose-200 hover:shadow-md transition-all text-center space-y-2">
                <span className="text-xs font-black text-slate-800 font-display block">{c.label}</span>
                <span className="text-[10px] text-gray-400 font-bold block">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto w-full border-b border-gray-100">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] text-rose-600 font-extrabold uppercase tracking-widest block">{t.faqs}</span>
          <h3 className="text-3xl font-black text-slate-900 font-display">{t.faqTitle}</h3>
          <div className="h-1 w-12 bg-rose-500 mx-auto rounded-full" />
        </div>

        <div className="space-y-3 text-left">
          {t.faqsList.map((faq, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full py-4.5 px-5 flex items-center justify-between text-xs font-black text-slate-800 font-display hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${activeFaq === idx ? 'rotate-90 text-rose-600' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="py-4 px-5 border-t border-gray-150 bg-slate-50/30 text-xs font-bold text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-rose-700 to-rose-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h3 className="text-3.5xl font-black font-display tracking-tight leading-none">{t.readyTitle}</h3>
          <p className="text-xs opacity-90 max-w-sm mx-auto font-medium leading-relaxed">
            {t.readyText}
          </p>
          <button
            onClick={onStartSurvey}
            className="w-full sm:w-auto py-4 px-10 bg-white text-rose-700 hover:bg-rose-50 font-black rounded-2xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer text-sm"
          >
            {t.startHeartSurvey}
          </button>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer id="contact" className="bg-slate-900 text-gray-400 py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          {/* Logo and Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 bg-rose-600 text-white rounded-lg flex items-center justify-center shadow-md">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="text-sm font-black font-display tracking-tight">{t.subtitle}</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              {t.descText}
            </p>
            <div className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest">
              {t.helpline}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">{t.quickLinks}</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-white transition-colors">{t.navHome}</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">{t.navAbout}</a></li>
              <li><a href="#privacy" className="hover:text-white transition-colors">{t.navPrivacy}</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">{t.navFaq}</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">{t.contactInfo}</h4>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-rose-500 shrink-0" />
              <span>+91 9390105045</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-rose-500 shrink-0" />
              <span>contact@srinivasaheart.org</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
              <span>{t.addressVal}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-[10px] text-center text-slate-500">
          &copy; {new Date().getFullYear()} {t.rightsReserved}
        </div>
      </footer>

    </div>
  );
}
