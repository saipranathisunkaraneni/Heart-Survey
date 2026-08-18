export interface QuestionDefinition {
  id: string;
  section: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'checkbox';
  isPersonal?: boolean;
  isRequired?: boolean;
  options?: string[]; // Translation set option keys, e.g. 'genderMale'
  condition?: (personal: any, responses: any) => boolean;
}

export const surveySections = [
  { id: 'basic', labelEn: 'Basic Information', labelTe: 'ప్రాథమిక సమాచారం' },
  { id: 'symptoms', labelEn: 'Symptoms', labelTe: 'లక్షణాలు' },
  { id: 'chestPain', labelEn: 'Chest Pain Assessment', labelTe: 'ఛాతీ నొప్పి అంచనా' },
  { id: 'respiratory', labelEn: 'Respiratory Problems', labelTe: 'శ్వాసకోశ సమస్యలు' },
  { id: 'covid', labelEn: 'COVID History', labelTe: 'కోవిడ్ చరిత్ర' },
  { id: 'medical', labelEn: 'Medical History', labelTe: 'వైద్య చరిత్ర' },
  { id: 'family', labelEn: 'Family History', labelTe: 'కుటుంబ చరిత్ర' },
  { id: 'lifestyle', labelEn: 'Lifestyle & Habits', labelTe: 'జీవనశైలి & అలవాట్లు' },
  { id: 'medication', labelEn: 'Medication History', labelTe: 'మందుల చరిత్ర' },
  { id: 'female', labelEn: 'Female Health', labelTe: 'స్త్రీల ఆరోగ్యం' }
];

export const questions: QuestionDefinition[] = [
  // Section 1: Basic Information
  { id: 'uhid', section: 'basic', type: 'text', isPersonal: true, isRequired: true },
  { id: 'name', section: 'basic', type: 'text', isPersonal: true, isRequired: true },
  { id: 'age', section: 'basic', type: 'number', isPersonal: true, isRequired: true },
  { id: 'gender', section: 'basic', type: 'select', isPersonal: true, isRequired: true, options: ['genderMale', 'genderFemale', 'genderOther'] },
  { id: 'occupation', section: 'basic', type: 'text', isPersonal: true },
  { id: 'phone', section: 'basic', type: 'text', isPersonal: true, isRequired: true },
  { id: 'email', section: 'basic', type: 'text', isPersonal: true },
  { id: 'address', section: 'basic', type: 'text', isPersonal: true, isRequired: true },
  { id: 'home', section: 'basic', type: 'text', isPersonal: true },
  { id: 'karyasthalam', section: 'basic', type: 'text', isPersonal: true },

  // Section 2: Symptoms (General)
  { id: 'generalHealthProblems', section: 'symptoms', type: 'boolean' },
  { id: 'generalHealthExplanation', section: 'symptoms', type: 'text', condition: (p, r) => r.generalHealthProblems },

  // Section 3: Chest Pain Assessment
  { id: 'chestPain', section: 'chestPain', type: 'boolean' },
  { id: 'chestPainSinceHowLong', section: 'chestPain', type: 'text', condition: (p, r) => r.chestPain },
  { id: 'chestPainPart', section: 'chestPain', type: 'text', condition: (p, r) => r.chestPain },
  { id: 'chestPainSide', section: 'chestPain', type: 'select', options: ['Left / ఎడమ వైపు', 'Right / కుడి వైపు', 'Middle / మధ్య భాగం'], condition: (p, r) => r.chestPain },
  { id: 'chestPainIntensity', section: 'chestPain', type: 'text', condition: (p, r) => r.chestPain },
  { id: 'chestPainIncreasesWalking', section: 'chestPain', type: 'boolean', condition: (p, r) => r.chestPain },
  { id: 'chestPainIncreasesClimbing', section: 'chestPain', type: 'boolean', condition: (p, r) => r.chestPain },
  { id: 'chestPainIncreasesLifting', section: 'chestPain', type: 'boolean', condition: (p, r) => r.chestPain },
  { id: 'chestPainReducesHow', section: 'chestPain', type: 'text', condition: (p, r) => r.chestPain },

  // Section 4: Respiratory Problems & Breathlessness
  { id: 'breathlessness', section: 'respiratory', type: 'boolean' },
  { id: 'breathlessnessSinceHowLong', section: 'respiratory', type: 'text', condition: (p, r) => r.breathlessness },
  { id: 'breathlessnessIncreasesWhen', section: 'respiratory', type: 'text', condition: (p, r) => r.breathlessness },
  { id: 'palpitations', section: 'respiratory', type: 'boolean' },
  { id: 'dizziness', section: 'respiratory', type: 'boolean' },
  { id: 'swellingLegs', section: 'respiratory', type: 'boolean' },
  { id: 'excessiveFatigue', section: 'respiratory', type: 'boolean' },
  { id: 'respiratorySymptoms', section: 'respiratory', type: 'text' },
  { id: 'digestiveSymptoms', section: 'respiratory', type: 'text' },
  { id: 'nervousSymptoms', section: 'respiratory', type: 'text' },

  // Section 5: COVID History
  { id: 'hadCovid', section: 'covid', type: 'boolean' },
  { id: 'covidDetails', section: 'covid', type: 'text', condition: (p, r) => r.hadCovid },
  { id: 'covidVaccinated', section: 'covid', type: 'select', options: ['yes', 'no', 'optional'], condition: (p, r) => r.hadCovid },

  // Section 6: Health Insurance & BP/Diabetes
  { id: 'hasInsurance', section: 'medical', type: 'boolean' },
  { id: 'insuranceDetails', section: 'medical', type: 'text', condition: (p, r) => r.hasInsurance },
  { id: 'diabetes', section: 'medical', type: 'boolean' },
  { id: 'highBp', section: 'medical', type: 'boolean' },
  { id: 'diabetesBpSinceHowLong', section: 'medical', type: 'text', condition: (p, r) => r.diabetes || r.highBp },
  { id: 'highCholesterol', section: 'medical', type: 'boolean' },
  { id: 'previousMedicalExams', section: 'medical', type: 'text' },

  // Section 6.1: Chronic Diseases List
  { id: 'ulcer', section: 'medical', type: 'boolean' },
  { id: 'asthma', section: 'medical', type: 'boolean' },
  { id: 'stroke', section: 'medical', type: 'boolean' },
  { id: 'fits', section: 'medical', type: 'boolean' },
  { id: 'nervousDisorders', section: 'medical', type: 'boolean' },
  { id: 'jointDiseases', section: 'medical', type: 'boolean' },
  { id: 'kidneyDisease', section: 'medical', type: 'boolean' },
  { id: 'thyroidDisease', section: 'medical', type: 'boolean' },
  { id: 'liverDisease', section: 'medical', type: 'boolean' },
  { id: 'cancer', section: 'medical', type: 'boolean' },
  { id: 'otherDisease', section: 'medical', type: 'text' },

  // Section 6.2: Hospitalization & Surgeries
  { id: 'hadSurgery', section: 'medical', type: 'boolean' },
  { id: 'surgeryDetails', section: 'medical', type: 'text', condition: (p, r) => r.hadSurgery },
  { id: 'surgeryComplications', section: 'medical', type: 'text', condition: (p, r) => r.hadSurgery },
  { id: 'hadHospitalization', section: 'medical', type: 'boolean' },
  { id: 'hospitalizationDetails', section: 'medical', type: 'text', condition: (p, r) => r.hadHospitalization },
  { id: 'previousHeartDisease', section: 'medical', type: 'boolean' },
  { id: 'heartDiseaseDetails', section: 'medical', type: 'text', condition: (p, r) => r.previousHeartDisease },

  // Section 7: Family History
  { id: 'familyHeartDisease', section: 'family', type: 'boolean' },
  { id: 'familySuddenDeathBefore60', section: 'family', type: 'boolean' },

  // Section 8: Lifestyle & Habits
  { id: 'tobaccoUsageCigarette', section: 'lifestyle', type: 'boolean' },
  { id: 'tobaccoUsageGutka', section: 'lifestyle', type: 'boolean' },
  { id: 'tobaccoUsageOther', section: 'lifestyle', type: 'text' },
  { id: 'alcoholConsumption', section: 'lifestyle', type: 'boolean' },
  { id: 'otherAddictions', section: 'lifestyle', type: 'text' },
  { id: 'height', section: 'lifestyle', type: 'number', isRequired: true },
  { id: 'weight', section: 'lifestyle', type: 'number', isRequired: true },
  { id: 'dailyExercise', section: 'lifestyle', type: 'boolean' },
  { id: 'exerciseType', section: 'lifestyle', type: 'text', condition: (p, r) => r.dailyExercise },
  { id: 'exerciseDuration', section: 'lifestyle', type: 'text', condition: (p, r) => r.dailyExercise },
  { id: 'vegetarian', section: 'lifestyle', type: 'boolean' },
  { id: 'nonVegetarian', section: 'lifestyle', type: 'boolean' },
  { id: 'fruitsIntake', section: 'lifestyle', type: 'boolean' },
  { id: 'stress', section: 'lifestyle', type: 'text' },
  { id: 'anxiety', section: 'lifestyle', type: 'text' },
  { id: 'workPressure', section: 'lifestyle', type: 'text' },

  // Section 9: Medication History
  { id: 'currentMedicines', section: 'medication', type: 'text' },
  { id: 'medicationSideEffects', section: 'medication', type: 'text' },
  { id: 'sleepQuality', section: 'lifestyle', type: 'text' },
  { id: 'sleepProblems', section: 'lifestyle', type: 'text' },

  // Section 10: Female Health
  { id: 'menstrualCycleRegular', section: 'female', type: 'boolean', condition: (p) => p.gender === 'Female' },
  { id: 'pregnant', section: 'female', type: 'boolean', condition: (p) => p.gender === 'Female' },
  { id: 'pregnancyComplications', section: 'female', type: 'text', condition: (p, r) => p.gender === 'Female' && r.pregnant },
  { id: 'previousSurgeries', section: 'female', type: 'text', condition: (p) => p.gender === 'Female' }
];
