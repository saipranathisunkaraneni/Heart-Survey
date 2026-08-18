/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PersonalDetails {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  address: string;
  home: string;
  karyasthalam: string;
  phone: string;
  email: string;
}

export interface SurveyResponses {
  // Section 1
  generalHealthProblems: boolean;
  generalHealthExplanation: string;
  
  // Section 2
  chestPain: boolean;
  chestPainSinceHowLong: string;
  chestPainPart: string;
  chestPainSide: string; // Left, Right, Middle
  chestPainIntensity: string;
  chestPainIncreasesWalking: boolean;
  chestPainIncreasesClimbing: boolean;
  chestPainIncreasesLifting: boolean;
  chestPainReducesHow: string;
  
  // Symptoms
  breathlessness: boolean;
  palpitations: boolean;
  dizziness: boolean;
  swellingLegs: boolean;
  excessiveFatigue: boolean;
  
  // Section 3
  breathlessnessSinceHowLong: string;
  breathlessnessIncreasesWhen: string;
  
  // Section 4
  respiratorySymptoms: string;
  digestiveSymptoms: string;
  nervousSymptoms: string;
  
  // Section 5
  hadCovid: boolean;
  covidDetails: string;
  covidVaccinated: string; // 'vaccinated' | 'not' | ''
  
  // Section 6
  hasInsurance: boolean;
  insuranceDetails: string;
  
  // Section 7
  diabetes: boolean;
  highBp: boolean;
  diabetesBpSinceHowLong: string;
  familyHeartDisease: boolean;
  familySuddenDeathBefore60: boolean;
  tobaccoUsageCigarette: boolean;
  tobaccoUsageGutka: boolean;
  tobaccoUsageOther: string;
  highCholesterol: boolean;
  previousMedicalExams: string;
  currentMedicines: string;
  
  // Section 8
  ulcer: boolean;
  asthma: boolean;
  stroke: boolean;
  fits: boolean;
  nervousDisorders: boolean;
  jointDiseases: boolean;
  kidneyDisease: boolean;
  thyroidDisease: boolean;
  liverDisease: boolean;
  cancer: boolean;
  otherDisease: string;
  
  // Section 9
  hadSurgery: boolean;
  surgeryDetails: string;
  surgeryComplications: string;
  
  // Section 10
  hadHospitalization: boolean;
  hospitalizationDetails: string;
  
  // Section 11
  previousHeartDisease: boolean;
  heartDiseaseDetails: string;
  
  // Section 12
  medicationSideEffects: string;
  
  // Section 13
  sleepQuality: string;
  sleepProblems: string;
  
  // Section 14
  alcoholConsumption: boolean;
  otherAddictions: string;
  
  // Section 15
  height: string;
  weight: string;
  
  // Section 16
  dailyExercise: boolean;
  exerciseType: string;
  exerciseDuration: string;
  
  // Section 17
  vegetarian: boolean;
  nonVegetarian: boolean;
  fruitsIntake: boolean;
  
  // Section 18
  stress: string;
  anxiety: string;
  workPressure: string;
  
  // Section 19 (Female only)
  menstrualCycleRegular: boolean;
  pregnant: boolean;
  pregnancyComplications: string;
  previousSurgeries: string;
}

export interface SurveySubmission {
  id?: string;
  surveyDate: string;
  surveyTime: string;
  uhid: string;
  language: 'te' | 'en';
  personalDetails: PersonalDetails;
  responses: SurveyResponses;
  createdAt?: string;
}
