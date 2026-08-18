/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { translations } from '../translations.ts';
import { SurveySubmission } from '../types.ts';
import { fetchNotoSansTelugu } from '../font-helper.ts';

// Excel spreadsheet exporter
export const triggerExcelExport = (survey: SurveySubmission) => {
  try {
    const isTe = survey.language === 'te';
    const flatRow: any = {};
    if (isTe) {
      flatRow['సర్వే తేదీ'] = survey.surveyDate;
      flatRow['సమయం'] = survey.surveyTime;
      flatRow['UHID సంఖ్య'] = survey.uhid;
      flatRow['ఎంచుకున్న భాష'] = 'తెలుగు';
      flatRow['రోగి పేరు'] = survey.personalDetails.name;
      flatRow['వయస్సు'] = survey.personalDetails.age;
      flatRow['లింగం'] = survey.personalDetails.gender === 'Female' ? 'స్త్రీ' : (survey.personalDetails.gender === 'Male' ? 'పురుషుడు' : 'ఇతరులు');
      flatRow['వృత్తి'] = survey.personalDetails.occupation;
      flatRow['ఫోన్ నంబర్'] = survey.personalDetails.phone;
      flatRow['ఈమెయిల్ చిరునామా'] = survey.personalDetails.email;
      flatRow['చిరునామా'] = survey.personalDetails.address;
      flatRow['ఇల్లు'] = survey.personalDetails.home;
      flatRow['కార్యస్థలం'] = survey.personalDetails.karyasthalam;
      flatRow['సాధారణ ఆరోగ్య సమస్యలు'] = survey.responses.generalHealthProblems ? 'అవును' : 'లేదు';
      flatRow['సాధారణ ఆరోగ్య వివరాలు'] = survey.responses.generalHealthExplanation;
      flatRow['ఛాతీ నొప్పి'] = survey.responses.chestPain ? 'అవును' : 'లేదు';
      flatRow['ఛాతీ నొప్పి వ్యవధి'] = survey.responses.chestPainSinceHowLong;
      flatRow['ఛాతీ నొప్పి స్థానం'] = survey.responses.chestPainPart;
      flatRow['ఛాతీ నొప్పి వైపు'] = survey.responses.chestPainSide;
      flatRow['ఛాతీ నొప్పి తీవ్రత'] = survey.responses.chestPainIntensity;
      flatRow['నడుస్తున్నప్పుడు ఛాతీ నొప్పి పెరుగుతుందా'] = survey.responses.chestPainIncreasesWalking ? 'అవును' : 'లేదు';
      flatRow['మెట్లు ఎక్కుతున్నప్పుడు ఛాతీ నొప్పి పెరుగుతుందా'] = survey.responses.chestPainIncreasesClimbing ? 'అవును' : 'లేదు';
      flatRow['బరువులు ఎత్తుతున్నప్పుడు ఛాతీ నొప్పి పెరుగుతుందా'] = survey.responses.chestPainIncreasesLifting ? 'అవును' : 'లేదు';
      flatRow['నొప్పి ఎలా తగ్గుతుంది'] = survey.responses.chestPainReducesHow;
      flatRow['ఆయాసం'] = survey.responses.breathlessness ? 'అవును' : 'లేదు';
      flatRow['ఆయాసం ఎంతకాలం నుండి ఉంది'] = survey.responses.breathlessnessSinceHowLong;
      flatRow['ఆయాసం ఎప్పుడు పెరుగుతుంది'] = survey.responses.breathlessnessIncreasesWhen;
      flatRow['గుండె దడ'] = survey.responses.palpitations ? 'అవును' : 'లేదు';
      flatRow['కళ్ళు తిరగడం'] = survey.responses.dizziness ? 'అవును' : 'లేదు';
      flatRow['కాళ్ల వాపులు'] = survey.responses.swellingLegs ? 'అవును' : 'లేదు';
      flatRow['అలసట'] = survey.responses.excessiveFatigue ? 'అవును' : 'లేదు';
      flatRow['శ్వాసకోశ సమస్యలు'] = survey.responses.respiratorySymptoms;
      flatRow['జీర్ణకోశ సమస్యలు'] = survey.responses.digestiveSymptoms;
      flatRow['నరాల సమస్యలు'] = survey.responses.nervousSymptoms;
      flatRow['గతంలో కోవిడ్ వచ్చిందా'] = survey.responses.hadCovid ? 'అవును' : 'లేదు';
      flatRow['కోవిడ్ వివరాలు'] = survey.responses.covidDetails;
      flatRow['కోవిడ్ టీకా వివరాలు'] = survey.responses.covidVaccinated;
      flatRow['ఆరోగ్య భీమా ఉందా'] = survey.responses.hasInsurance ? 'అవును' : 'లేదు';
      flatRow['భీమా వివరాలు'] = survey.responses.insuranceDetails;
      flatRow['మధుమేహం (షుగర్)'] = survey.responses.diabetes ? 'అవును' : 'లేదు';
      flatRow['బీపీ'] = survey.responses.highBp ? 'అవును' : 'లేదు';
      flatRow['మధుమేహం/బీపీ ఎంతకాలం నుండి ఉంది'] = survey.responses.diabetesBpSinceHowLong;
      flatRow['కుటుంబంలో ఎవరికైనా గుండె జబ్బులు ఉన్నాయా'] = survey.responses.familyHeartDisease ? 'అవును' : 'లేదు';
      flatRow['కుటుంబంలో 60 ఏళ్ల లోపు అకస్మాత్తుగా ఎవరైనా మరణించారా'] = survey.responses.familySuddenDeathBefore60 ? 'అవును' : 'లేదు';
      flatRow['పొగాకు అలవాటు (సిగరెట్)'] = survey.responses.tobaccoUsageCigarette ? 'అవును' : 'లేదు';
      flatRow['పొగాకు అలవాటు (గుట్కా)'] = survey.responses.tobaccoUsageGutka ? 'అవును' : 'లేదు';
      flatRow['పొగాకు అలవాటు (ఇతరములు)'] = survey.responses.tobaccoUsageOther;
      flatRow['కొలెస్ట్రాల్ ఉందా'] = survey.responses.highCholesterol ? 'అవును' : 'లేదు';
      flatRow['గత వైద్య పరీక్షలు'] = survey.responses.previousMedicalExams;
      flatRow['ప్రస్తుతం వాడుతున్న మందులు'] = survey.responses.currentMedicines;
      flatRow['అల్సర్'] = survey.responses.ulcer ? 'అవును' : 'లేదు';
      flatRow['ఆస్తమా'] = survey.responses.asthma ? 'అవును' : 'లేదు';
      flatRow['పక్షవాతం/స్ట్రోక్'] = survey.responses.stroke ? 'అవును' : 'లేదు';
      flatRow['ఫిట్స్'] = survey.responses.fits ? 'అవును' : 'లేదు';
      flatRow['నరాల బలహీనత'] = survey.responses.nervousDisorders ? 'అవును' : 'లేదు';
      flatRow['కీళ్ల నొప్పులు'] = survey.responses.jointDiseases ? 'అవును' : 'లేదు';
      flatRow['మూత్రపిండాల జబ్బు'] = survey.responses.kidneyDisease ? 'అవును' : 'లేదు';
      flatRow['థైరాయిడ్ సమస్య'] = survey.responses.thyroidDisease ? 'అవును' : 'లేదు';
      flatRow['కాలేయ బలహీనత'] = survey.responses.liverDisease ? 'అవును' : 'లేదు';
      flatRow['క్యాన్సర్'] = survey.responses.cancer ? 'అవును' : 'లేదు';
      flatRow['ఇతర దీర్ఘకాలిక సమస్యలు'] = survey.responses.otherDisease;
      flatRow['గతంలో సర్జరీలు జరిగాయా'] = survey.responses.hadSurgery ? 'అవును' : 'లేదు';
      flatRow['సర్జరీ వివరాలు'] = survey.responses.surgeryDetails;
      flatRow['సర్జరీ సమస్యలు'] = survey.responses.surgeryComplications;
      flatRow['హాస్పిటలైజేషన్ జరిగిందా'] = survey.responses.hadHospitalization ? 'అవును' : 'లేదు';
      flatRow['హాస్పిటలైజేషన్ వివరాలు'] = survey.responses.hospitalizationDetails;
      flatRow['చికిత్స పొందిన గుండె జబ్బులు'] = survey.responses.previousHeartDisease ? 'అవును' : 'లేదు';
      flatRow['గుండె జబ్బు వివరాలు'] = survey.responses.heartDiseaseDetails;
      flatRow['మందుల వల్ల దుష్ప్రభావాలు'] = survey.responses.medicationSideEffects;
      flatRow['నిద్ర నాణ్యత'] = survey.responses.sleepQuality;
      flatRow['నిద్ర ఆటంకాలు'] = survey.responses.sleepProblems;
      flatRow['మద్యపాన అలవాటు'] = survey.responses.alcoholConsumption ? 'అవును' : 'లేదు';
      flatRow['ఇతర వ్యసనాలు'] = survey.responses.otherAddictions;
      flatRow['ఎత్తు (సెం.మీ)'] = survey.responses.height;
      flatRow['బరువు (килоలు)'] = survey.responses.weight;
      flatRow['రోజువారీ వ్యాయామం'] = survey.responses.dailyExercise ? 'అవును' : 'లేదు';
      flatRow['వ్యాయామం రకం'] = survey.responses.exerciseType;
      flatRow['వ్యాయామం వ్యవధి'] = survey.responses.exerciseDuration;
      flatRow['శాకాహారి'] = survey.responses.vegetarian ? 'అవును' : 'లేదు';
      flatRow['మాంసాహారి'] = survey.responses.nonVegetarian ? 'అవును' : 'లేదు';
      flatRow['ప్రతిరోజూ పండ్లు తింటారా'] = survey.responses.fruitsIntake ? 'అవును' : 'లేదు';
      flatRow['మానసిక ఒత్తిడి'] = survey.responses.stress;
      flatRow['ఆందోళన'] = survey.responses.anxiety;
      flatRow['పని ఒత్తిడి'] = survey.responses.workPressure;
      flatRow['ఋతుక్రమం క్రమబద్ధత (స్త్రీల కొరకు)'] = survey.responses.menstrualCycleRegular ? 'అవును' : 'లేదు';
      flatRow['గర్భవతి (స్త్రీల కొరకు)'] = survey.responses.pregnant ? 'అవును' : 'లేదు';
      flatRow['గర్భధారణ సమస్యలు (స్త్రీల కొరకు)'] = survey.responses.pregnancyComplications;
      flatRow['మునుపటి సర్జరీలు (స్త్రీల కొరకు)'] = survey.responses.previousSurgeries;
    } else {
      flatRow['Survey Date'] = survey.surveyDate;
      flatRow['Survey Time'] = survey.surveyTime;
      flatRow['UHID Number'] = survey.uhid;
      flatRow['Language Selected'] = 'English';
      flatRow['Patient Name'] = survey.personalDetails.name;
      flatRow['Age'] = survey.personalDetails.age;
      flatRow['Gender'] = survey.personalDetails.gender;
      flatRow['Occupation'] = survey.personalDetails.occupation;
      flatRow['Phone Number'] = survey.personalDetails.phone;
      flatRow['Email Address'] = survey.personalDetails.email;
      flatRow['Address'] = survey.personalDetails.address;
      flatRow['Home Place'] = survey.personalDetails.home;
      flatRow['Workplace'] = survey.personalDetails.karyasthalam;
      flatRow['General Health Problems'] = survey.responses.generalHealthProblems ? 'Yes' : 'No';
      flatRow['General Health Details'] = survey.responses.generalHealthExplanation;
      flatRow['Chest Pain'] = survey.responses.chestPain ? 'Yes' : 'No';
      flatRow['Chest Pain Duration'] = survey.responses.chestPainSinceHowLong;
      flatRow['Chest Pain Location'] = survey.responses.chestPainPart;
      flatRow['Chest Pain Side'] = survey.responses.chestPainSide;
      flatRow['Chest Pain Intensity'] = survey.responses.chestPainIntensity;
      flatRow['Increases while Walking'] = survey.responses.chestPainIncreasesWalking ? 'Yes' : 'No';
      flatRow['Increases while Climbing'] = survey.responses.chestPainIncreasesClimbing ? 'Yes' : 'No';
      flatRow['Increases while Lifting'] = survey.responses.chestPainIncreasesLifting ? 'Yes' : 'No';
      flatRow['How it reduces'] = survey.responses.chestPainReducesHow;
      flatRow['Breathlessness'] = survey.responses.breathlessness ? 'Yes' : 'No';
      flatRow['Breathlessness Since'] = survey.responses.breathlessnessSinceHowLong;
      flatRow['Breathlessness Increases When'] = survey.responses.breathlessnessIncreasesWhen;
      flatRow['Palpitations'] = survey.responses.palpitations ? 'Yes' : 'No';
      flatRow['Dizziness/Fainting'] = survey.responses.dizziness ? 'Yes' : 'No';
      flatRow['Leg Swelling'] = survey.responses.swellingLegs ? 'Yes' : 'No';
      flatRow['Excessive Fatigue'] = survey.responses.excessiveFatigue ? 'Yes' : 'No';
      flatRow['Respiratory Symptoms'] = survey.responses.respiratorySymptoms;
      flatRow['Digestive Symptoms'] = survey.responses.digestiveSymptoms;
      flatRow['Nervous Symptoms'] = survey.responses.nervousSymptoms;
      flatRow['COVID History'] = survey.responses.hadCovid ? 'Yes' : 'No';
      flatRow['COVID Details'] = survey.responses.covidDetails;
      flatRow['COVID Vaccinated'] = survey.responses.covidVaccinated;
      flatRow['Health Insurance'] = survey.responses.hasInsurance ? 'Yes' : 'No';
      flatRow['Insurance Details'] = survey.responses.insuranceDetails;
      flatRow['Diabetes (Sugar)'] = survey.responses.diabetes ? 'Yes' : 'No';
      flatRow['High BP'] = survey.responses.highBp ? 'Yes' : 'No';
      flatRow['Diabetes/BP Since'] = survey.responses.diabetesBpSinceHowLong;
      flatRow['Family Heart History'] = survey.responses.familyHeartDisease ? 'Yes' : 'No';
      flatRow['Family Sudden Death'] = survey.responses.familySuddenDeathBefore60 ? 'Yes' : 'No';
      flatRow['Tobacco usage (Cigarette)'] = survey.responses.tobaccoUsageCigarette ? 'Yes' : 'No';
      flatRow['Tobacco usage (Gutka)'] = survey.responses.tobaccoUsageGutka ? 'Yes' : 'No';
      flatRow['Tobacco usage (Other)'] = survey.responses.tobaccoUsageOther;
      flatRow['High Cholesterol'] = survey.responses.highCholesterol ? 'Yes' : 'No';
      flatRow['Previous Examinations'] = survey.responses.previousMedicalExams;
      flatRow['Current Medicines'] = survey.responses.currentMedicines;
      flatRow['Ulcer'] = survey.responses.ulcer ? 'Yes' : 'No';
      flatRow['Asthma'] = survey.responses.asthma ? 'Yes' : 'No';
      flatRow['Stroke/Paralysis'] = survey.responses.stroke ? 'Yes' : 'No';
      flatRow['Fits/Seizures'] = survey.responses.fits ? 'Yes' : 'No';
      flatRow['Nervous Disorders'] = survey.responses.nervousDisorders ? 'Yes' : 'No';
      flatRow['Joint Diseases'] = survey.responses.jointDiseases ? 'Yes' : 'No';
      flatRow['Kidney Disease'] = survey.responses.kidneyDisease ? 'Yes' : 'No';
      flatRow['Thyroid Disease'] = survey.responses.thyroidDisease ? 'Yes' : 'No';
      flatRow['Liver Disease'] = survey.responses.liverDisease ? 'Yes' : 'No';
      flatRow['Cancer'] = survey.responses.cancer ? 'Yes' : 'No';
      flatRow['Other Chronic Illness'] = survey.responses.otherDisease;
      flatRow['Surgery History'] = survey.responses.hadSurgery ? 'Yes' : 'No';
      flatRow['Surgery Details'] = survey.responses.surgeryDetails;
      flatRow['Surgery Complications'] = survey.responses.surgeryComplications;
      flatRow['Hospitalization History'] = survey.responses.hadHospitalization ? 'Yes' : 'No';
      flatRow['Hospitalization Details'] = survey.responses.hospitalizationDetails;
      flatRow['Heart Disease History'] = survey.responses.previousHeartDisease ? 'Yes' : 'No';
      flatRow['Heart Disease Details'] = survey.responses.heartDiseaseDetails;
      flatRow['Medication Side Effects'] = survey.responses.medicationSideEffects;
      flatRow['Sleep Quality'] = survey.responses.sleepQuality;
      flatRow['Sleep Problems'] = survey.responses.sleepProblems;
      flatRow['Alcohol Consumption'] = survey.responses.alcoholConsumption ? 'Yes' : 'No';
      flatRow['Other Addictions'] = survey.responses.otherAddictions;
      flatRow['Height (cm)'] = survey.responses.height;
      flatRow['Weight (kg)'] = survey.responses.weight;
      flatRow['Daily Exercise'] = survey.responses.dailyExercise ? 'Yes' : 'No';
      flatRow['Exercise Type'] = survey.responses.exerciseType;
      flatRow['Exercise Duration'] = survey.responses.exerciseDuration;
      flatRow['Vegetarian'] = survey.responses.vegetarian ? 'Yes' : 'No';
      flatRow['Non-Vegetarian'] = survey.responses.nonVegetarian ? 'Yes' : 'No';
      flatRow['Fruits Intake'] = survey.responses.fruitsIntake ? 'Yes' : 'No';
      flatRow['Mental Stress'] = survey.responses.stress;
      flatRow['Anxiety'] = survey.responses.anxiety;
      flatRow['Work Pressure'] = survey.responses.workPressure;
      flatRow['Menstrual Regularity (Female)'] = survey.responses.menstrualCycleRegular ? 'Yes' : 'No';
      flatRow['Pregnant (Female)'] = survey.responses.pregnant ? 'Yes' : 'No';
      flatRow['Pregnancy Complications (Female)'] = survey.responses.pregnancyComplications;
      flatRow['Previous Surgeries (Female)'] = survey.responses.previousSurgeries;
    }

    const ws = XLSX.utils.json_to_sheet([flatRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Sheet');
    XLSX.writeFile(wb, `SHF_Survey_${survey.uhid || 'Patient'}.xlsx`);
  } catch (err) {
    console.error('Failed to export to excel sheet:', err);
    alert('Error generating excel spreadsheet. Please check console.');
  }
};

// PDF report builder with Noto Sans Telugu support
// PDF report builder with Noto Sans Telugu support
export const triggerPdfExport = async (survey: SurveySubmission, setIsLoading: (loading: boolean) => void) => {
  try {
    setIsLoading(true);
    const doc = new jsPDF();
    const isTe = survey.language === 'te';
    const tCurrent = translations[survey.language];
    
    // Load Telugu font for native character support
    const base64Font = await fetchNotoSansTelugu();
    if (base64Font) {
      doc.addFileToVFS('NotoSansTelugu.ttf', base64Font);
      doc.addFont('NotoSansTelugu.ttf', 'NotoSansTelugu', 'normal');
      doc.setFont('NotoSansTelugu');
    } else {
      doc.setFont('Helvetica');
    }

    const questionItems = [
      { id: 1, key: 'generalHealthProblems', labelEn: 'Do you have any health-related problems?', labelTe: 'మీకు ఏవైనా ఆరోగ్య సమస్యలు ఉన్నాయా?' },
      { id: 2, key: 'generalHealthExplanation', labelEn: 'Explain details of health problems', labelTe: 'సమస్యల వివరాలు వివరించండి' },
      { id: 3, key: 'chestPain', labelEn: 'Do you have chest pain?', labelTe: 'మీకు ఛాతి నొప్పి ఉందా?' },
      { id: 4, key: 'palpitations', labelEn: 'Do you experience palpitations?', labelTe: 'మీకు గుండె దడ ఉందా?' },
      { id: 5, key: 'swellingLegs', labelEn: 'Do you have swelling of legs or body?', labelTe: 'కాళ్ళు లేదా శరీరం వాపు ఉందా?' },
      { id: 6, key: 'hadCovid', labelEn: 'Did you have COVID-19?', labelTe: 'మీకు కోవిడ్ - 19 వచ్చిందా?' },
      { id: 7, key: 'diabetes', labelEn: 'Do you have Diabetes (Sugar)?', labelTe: 'మధుమేహం (షుగర్ వ్యాధి) ఉందా?' },
      { id: 8, key: 'familyHeartDisease', labelEn: 'Family history of heart disease before age 60?', labelTe: 'కుటుంబంలో 60 ఏళ్ల లోపు ఎవరికైనా గుండె జబ్బు చరిత్ర ఉందా?' },
      { id: 9, key: 'tobaccoUsageCigarette', labelEn: 'Tobacco usage: Cigarette?', labelTe: 'పొగాకు వాడుతున్నారా: సిగరెట్?' },
      { id: 10, key: 'highCholesterol', labelEn: 'Do you have high cholesterol?', labelTe: 'రక్తంలో కొలెస్ట్రాల్ అధికంగా ఉందని మీకు తెలుసా?' },
      { id: 11, key: 'currentMedicines', labelEn: 'Details of current medicines', labelTe: 'ప్రస్తుతం మీరు వాడుతున్న మందుల వివరాలు' },
      { id: 12, key: 'ulcer', labelEn: 'Do you have Ulcer?', labelTe: 'కడుపులో పుండు (అల్సర్) ఉందా?' },
      { id: 13, key: 'stroke', labelEn: 'Do you have Stroke (Paralysis)?', labelTe: 'పక్షవాతం ఉందా?' },
      { id: 14, key: 'nervousDisorders', labelEn: 'Do you have nervous disorders?', labelTe: 'ఇతర నాడీ సంబంధిత వ్యాధులు ఉన్నాయా?' },
      { id: 15, key: 'kidneyDisease', labelEn: 'Do you have kidney disease?', labelTe: 'మూత్రపిండాల (కిడ్నీ) వ్యాధి ఉందా?' },
      { id: 16, key: 'liverDisease', labelEn: 'Do you have liver disease?', labelTe: 'కాలేయ (లివర్) వ్యాధి ఉందా?' },
      { id: 17, key: 'hadSurgery', labelEn: 'Have you had any surgery?', labelTe: 'గతంలో శస్త్రచికిత్స (ఆపరేషన్) చేయించుకున్నారా?' },
      { id: 18, key: 'previousHeartDisease', labelEn: 'Do you have previous heart disease?', labelTe: 'గతంలో గుండె జబ్బు ఉన్నట్టు నిర్ధారించబడిందా?' },
      { id: 19, key: 'dailyExercise', labelEn: 'Do you do daily exercise?', labelTe: 'మీరు ప్రతిరోజూ వ్యాయామం చేస్తారా?' },
      { id: 20, key: 'nonVegetarian', labelEn: 'Your habits: Non-Vegetarian?', labelTe: 'మీ ఆహార అలవాట్లు: మాంసాహారమా?' },
      { id: 21, key: 'asthma', labelEn: 'Do you have Asthma?', labelTe: 'ఉబ్బసం వ్యాధి (ఆస్తమా) ఉందా?' },
      { id: 22, key: 'fits', labelEn: 'Do you have Fits?', labelTe: 'ఫిట్స్ ఉందా?' },
      { id: 23, key: 'jointDiseases', labelEn: 'Do you have joint diseases?', labelTe: 'కీళ్ల సంబంధిత వ్యాధులు ఉన్నాయా?' },
      { id: 24, key: 'thyroidDisease', labelEn: 'Do you have thyroid disease?', labelTe: 'థైరాయిడ్ వ్యాధి ఉందా?' },
      { id: 25, key: 'cancer', labelEn: 'Do you have cancer?', labelTe: 'క్యాన్సర్ ఉందా?' },
      { id: 26, key: 'hadHospitalization', labelEn: 'Have you ever been admitted to hospital?', labelTe: 'గతంలో ఎప్పుడైనా ఆసుపత్రిలో చేరి చికిత్స పొందారా?' },
      { id: 27, key: 'alcoholConsumption', labelEn: 'Do you consume alcohol?', labelTe: 'మద్యం సేవించే అలవాటు ఉందా?' },
      { id: 28, key: 'vegetarian', labelEn: 'Your habits: Vegetarian?', labelTe: 'మీ ఆహార అలవాట్లు: శాకాహారమా?' },
      { id: 29, key: 'fruitsIntake', labelEn: 'Do you intake fruits regularly?', labelTe: 'నిత్యం పండ్లు తింటారా?' },
      { id: 30, key: 'breathlessness', labelEn: 'Do you have breathlessness / difficulty breathing?', labelTe: 'మీకు ఆయాసం లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉందా?' },
      { id: 31, key: 'dizziness', labelEn: 'Do you feel dizziness / fainting?', labelTe: 'తల తిరగడం లేదా తెలివితప్పడం ఉందా?' },
      { id: 32, key: 'excessiveFatigue', labelEn: 'Do you feel excessive fatigue?', labelTe: 'అధికంగా అలసట చెందుతున్నారా?' },
      { id: 33, key: 'hasInsurance', labelEn: 'Do you have health insurance?', labelTe: 'మీకు ఆరోగ్య బీమా ఉందా?' },
      { id: 34, key: 'highBp', labelEn: 'Do you have High BP (Blood Pressure)?', labelTe: 'అధిక రక్తపోటు (బీపీ) ఉందా?' },
      { id: 35, key: 'familySuddenDeathBefore60', labelEn: 'Family history of sudden death before age 60?', labelTe: 'మీకు కుటుంబంలో 60 ఏళ్ల లోపు ఎవరికైనా గుండె జబ్బు చరిత్ర ఉందా?' },
      { id: 36, key: 'tobaccoUsageGutka', labelEn: 'Tobacco usage: Gutka / Zarda?', labelTe: 'పొగాకు వాడుతున్నారా: గుట్కా / జర్దా?' }
    ];

    const getAnswerVal = (key: string) => {
      const val = (survey.responses as any)[key];
      if (val === true) return isTe ? 'అవును' : 'Yes';
      if (val === false) return isTe ? 'లేదు' : 'No';
      if (typeof val === 'string' && val.trim() !== '') {
        const maxLen = isTe ? 18 : 26;
        return val.length > maxLen ? val.substring(0, maxLen) + '...' : val;
      }
      return isTe ? 'లేదు' : 'No';
    };

    // --- 1. HEADER BRANDING ---
    doc.setFillColor(220, 38, 38);
    doc.ellipse(14.5, 13.5, 2.3, 2.3, 'F');
    doc.ellipse(18.5, 13.5, 2.3, 2.3, 'F');
    doc.triangle(12.2, 14.2, 20.8, 14.2, 16.5, 18.7, 'F');
    
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(13, 14.5, 15, 14.5);
    doc.line(15, 14.5, 15.8, 12.5);
    doc.line(15.8, 12.5, 16.8, 16.5);
    doc.line(16.8, 16.5, 17.8, 14.5);
    doc.line(17.8, 14.5, 19.8, 14.5);

    doc.setTextColor(15, 23, 42);
    if (base64Font) doc.setFont('NotoSansTelugu', 'bold');
    doc.setFontSize(14.5);
    doc.text(isTe ? 'శ్రీనివాస హార్ట్ సెంటర్' : 'SRINIVASA HEART CENTRE', 23, 13);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.text(isTe ? 'రాంనగర్, హన్మకొండ' : 'Ramnagar, Hanamkonda', 23, 17.5);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text(isTe ? 'ఆరోగ్య సర్వే నివేదికకు స్వాగతం' : 'WELCOME TO HEALTH SURVEY REPORT', 23, 21.5);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(156, 8, 46, 15, 2.5, 2.5, 'D');
    
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.3);
    doc.circle(162.5, 15.5, 1.2, 'D');
    doc.line(162.5, 14.3, 162.5, 11.5);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(isTe ? 'నివేదిక ఐడి' : 'REPORT ID', 166, 13);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text(`UHID: ${survey.uhid || '—'}`, 166, 18.5);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(8, 26, 202, 26);

    // --- 2. SURVEY INFORMATION ---
    doc.setFillColor(15, 23, 42);
    doc.rect(8, 28.5, 194, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    if (base64Font) doc.setFont('NotoSansTelugu', 'normal');
    doc.setFontSize(7.5);
    doc.text(isTe ? 'సర్వే సమాచారం' : 'SURVEY INFORMATION', 12, 31.7);

    const infoY = 33.5;
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(8, infoY, 194, 11, 2.5, 2.5, 'D');
    doc.line(72, infoY, 72, infoY + 11);
    doc.line(137, infoY, 137, infoY + 11);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(`📅  ${isTe ? 'సర్వే తేదీ' : 'DATE'}`, 12, infoY + 4);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text(survey.surveyDate || '—', 12, infoY + 8.5);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(`🕒  ${isTe ? 'సమయం' : 'TIME'}`, 76, infoY + 4);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text(survey.surveyTime || '—', 76, infoY + 8.5);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(6.5);
    doc.text(`🆔  UHID`, 141, infoY + 4);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text(survey.uhid || '—', 141, infoY + 8.5);

    // --- 3. PERSONAL DETAILS ---
    doc.setFillColor(15, 23, 42);
    doc.rect(8, 46.5, 194, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text(isTe ? 'వ్యక్తిగత వివరాలు' : 'PERSONAL DETAILS', 12, 49.7);

    const detailsY = 51.5;
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(8, detailsY, 194, 21, 2.5, 2.5, 'D');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(`👤  ${isTe ? 'పేరు' : 'Name'}:`, 12, detailsY + 4.5);
    doc.text(`📞  ${isTe ? 'ఫోన్ నంబర్' : 'Phone Number'}:`, 12, detailsY + 9);
    doc.text(`💼  ${isTe ? 'వృత్తి' : 'Occupation'}:`, 12, detailsY + 13.5);
    doc.text(`🏠  ${isTe ? 'చిరునామా' : 'Address'}:`, 12, detailsY + 18);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text(survey.personalDetails.name || '—', 35, detailsY + 4.5);
    doc.text(survey.personalDetails.phone || '—', 35, detailsY + 9);
    doc.text(survey.personalDetails.occupation || '—', 35, detailsY + 13.5);
    const address = survey.personalDetails.address || '—';
    const truncAddress = address.length > 36 ? address.substring(0, 36) + '...' : address;
    doc.text(truncAddress, 35, detailsY + 18);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(`📅  ${isTe ? 'వయస్సు' : 'Age'}:`, 110, detailsY + 4.5);
    doc.text(`⚧  ${isTe ? 'లింగం' : 'Gender'}:`, 110, detailsY + 9);
    doc.text(`✉  ${isTe ? 'ఈమెయిల్' : 'Email'}:`, 110, detailsY + 13.5);
    doc.text(`🏡  ${isTe ? 'ఇల్లు' : 'Home'}:`, 110, detailsY + 18);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text(survey.personalDetails.age ? `${survey.personalDetails.age} ${isTe ? 'సంవత్సరాలు' : 'Years'}` : '—', 132, detailsY + 4.5);
    const genderVal = survey.personalDetails.gender === 'Male' ? (isTe ? 'పురుషుడు' : 'Male') : (survey.personalDetails.gender === 'Female' ? (isTe ? 'స్త్రీ' : 'Female') : (isTe ? 'ఇతర' : 'Other'));
    doc.text(genderVal, 132, detailsY + 9);
    doc.text(survey.personalDetails.email || '—', 132, detailsY + 13.5);
    const homeVal = survey.personalDetails.home || '—';
    const workplaceVal = survey.personalDetails.karyasthalam || '—';
    const homeWorkText = workplaceVal !== '—' && workplaceVal !== '' ? `${homeVal} (${workplaceVal})` : homeVal;
    const truncHomeWork = homeWorkText.length > 30 ? homeWorkText.substring(0, 30) + '...' : homeWorkText;
    doc.text(truncHomeWork, 132, detailsY + 18);

    // --- 4. HEALTH SURVEY RESPONSES ---
    doc.setFillColor(15, 23, 42);
    doc.rect(8, 74.5, 194, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.text(isTe ? 'ఆరోగ్య సర్వే సమాధానాలు' : 'HEALTH SURVEY RESPONSES', 12, 77.7);

    // Columns Subheaders
    doc.setFillColor(30, 41, 59);
    doc.rect(8, 79.5, 95, 4.5, 'F');
    doc.rect(107, 79.5, 95, 4.5, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text(isTe ? 'ప్రశ్న' : 'QUESTION', 14, 82.7);
    doc.text(isTe ? 'సమాధానం' : 'ANSWER', 79, 82.7);
    doc.text(isTe ? 'ప్రశ్న' : 'QUESTION', 113, 82.7);
    doc.text(isTe ? 'సమాధానం' : 'ANSWER', 178, 82.7);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.rect(8, 79.5, 95, 172.5, 'D');
    doc.rect(107, 79.5, 95, 172.5, 'D');

    for (let i = 0; i < 18; i++) {
      const rowY = 84.5 + i * 9.25;
      
      doc.setDrawColor(243, 244, 246);
      doc.setLineWidth(0.2);
      doc.line(8, rowY + 9.25, 103, rowY + 9.25);
      doc.line(107, rowY + 9.25, 202, rowY + 9.25);

      // --- COLUMN 1 ---
      const item1 = questionItems[i];
      const ans1 = getAnswerVal(item1.key);
      const qText1 = isTe ? item1.labelTe : item1.labelEn;
      
      doc.setFillColor(15, 23, 42);
      doc.ellipse(11, rowY + 4.5, 1.7, 1.7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(item1.id.toString(), 11, rowY + 5.1, { align: 'center' });

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(6.2);
      const maxQLen1 = isTe ? 35 : 44;
      const truncQText1 = qText1.length > maxQLen1 ? qText1.substring(0, maxQLen1) + '...' : qText1;
      doc.text(truncQText1, 14.5, rowY + 5.1);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.text(ans1, 79, rowY + 5.1);

      // --- COLUMN 2 ---
      const item2 = questionItems[i + 18];
      const ans2 = getAnswerVal(item2.key);
      const qText2 = isTe ? item2.labelTe : item2.labelEn;

      doc.setFillColor(15, 23, 42);
      doc.ellipse(110, rowY + 4.5, 1.7, 1.7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(item2.id.toString(), 110, rowY + 5.1, { align: 'center' });

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(6.2);
      const maxQLen2 = isTe ? 35 : 44;
      const truncQText2 = qText2.length > maxQLen2 ? qText2.substring(0, maxQLen2) + '...' : qText2;
      doc.text(truncQText2, 113.5, rowY + 5.1);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(6.5);
      doc.text(ans2, 178, rowY + 5.1);
    }

    // --- 5. NOTES & SIGNATURE ---
    const bottomY = 254.5;
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.4);
    doc.roundedRect(8, bottomY, 115, 23, 2.5, 2.5, 'D');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.text(isTe ? '📋 వైద్యుల గమనికలు' : '📋 NOTES FOR DOCTOR', 12, bottomY + 4.5);
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(12, bottomY + 10, 118, bottomY + 10);
    doc.line(12, bottomY + 15, 118, bottomY + 15);
    doc.line(12, bottomY + 20, 118, bottomY + 20);

    doc.roundedRect(127, bottomY, 75, 23, 2.5, 2.5, 'D');
    doc.text(isTe ? '🩺 వైద్యుని సంతకం' : '🩺 DOCTOR\'S SIGNATURE', 131, bottomY + 4.5);
    doc.setDrawColor(203, 213, 225);
    doc.line(131, bottomY + 14.5, 196, bottomY + 14.5);
    doc.text(isTe ? 'తేదీ: _______________' : 'DATE: _________________', 131, bottomY + 19.5);

    // --- 6. FOOTER ---
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(isTe ? 'ఆరోగ్య సర్వే పూర్తి చేసినందుకు ధన్యవాదాలు.' : 'THANK YOU FOR COMPLETING THE HEALTH SURVEY.', 105, 283.5, { align: 'center' });
    doc.text(isTe ? 'మీ ఆరోగ్యం, మా ప్రాధాన్యత.' : 'YOUR HEALTH, OUR PRIORITY.', 105, 287.5, { align: 'center' });

    // Save PDF as Patient's ID (UHID)
    doc.save(`${survey.uhid || 'Patient'}.pdf`);
    setIsLoading(false);
  } catch (e) {
    console.error('PDF Builder crashed:', e);
    setIsLoading(false);
    alert('Error building PDF. Falling back to simple print.');
  }
};

// Excel/CSV Consolidated exporter for all records
export const triggerAllSurveysCsvExport = (surveys: SurveySubmission[]) => {
  try {
    const rows = surveys.map(survey => {
      const isTe = survey.language === 'te';
      const flatRow: any = {};
      
      flatRow[isTe ? 'సర్వే తేదీ' : 'Survey Date'] = survey.surveyDate;
      flatRow[isTe ? 'సమయం' : 'Time'] = survey.surveyTime;
      flatRow[isTe ? 'UHID సంఖ్య' : 'UHID'] = survey.uhid;
      flatRow[isTe ? 'ఎంచుకున్న భాష' : 'Language'] = survey.language === 'te' ? 'Telugu' : 'English';
      flatRow[isTe ? 'రోగి పేరు' : 'Patient Name'] = survey.personalDetails.name;
      flatRow[isTe ? 'వయస్సు' : 'Age'] = survey.personalDetails.age;
      flatRow[isTe ? 'లింగం' : 'Gender'] = survey.personalDetails.gender;
      flatRow[isTe ? 'వృత్తి' : 'Occupation'] = survey.personalDetails.occupation || '';
      flatRow[isTe ? 'ఫోన్ నంబర్' : 'Phone'] = survey.personalDetails.phone;
      flatRow[isTe ? 'ఈమెయిల్ చిరునామా' : 'Email'] = survey.personalDetails.email || '';
      flatRow[isTe ? 'చిరునామా' : 'Address'] = survey.personalDetails.address;
      flatRow[isTe ? 'ఇల్లు' : 'Home'] = survey.personalDetails.home || '';
      flatRow[isTe ? 'కార్యస్థలం' : 'Workplace'] = survey.personalDetails.karyasthalam || '';
      
      flatRow[isTe ? 'సాధారణ ఆరోగ్య సమస్యలు' : 'General Health Problems'] = survey.responses.generalHealthProblems ? 'Yes' : 'No';
      flatRow[isTe ? 'సాధారణ ఆరోగ్య వివరాలు' : 'General Health Details'] = survey.responses.generalHealthExplanation || '';
      flatRow[isTe ? 'ఛాతీ నొప్పి' : 'Chest Pain'] = survey.responses.chestPain ? 'Yes' : 'No';
      flatRow[isTe ? 'ఆయాసం' : 'Breathlessness'] = survey.responses.breathlessness ? 'Yes' : 'No';
      flatRow[isTe ? 'గుండె దడ' : 'Palpitations'] = survey.responses.palpitations ? 'Yes' : 'No';
      flatRow[isTe ? 'కళ్ళు తిరగడం' : 'Dizziness'] = survey.responses.dizziness ? 'Yes' : 'No';
      flatRow[isTe ? 'కాళ్ల వాపులు' : 'Swelling in Legs'] = survey.responses.swellingLegs ? 'Yes' : 'No';
      flatRow[isTe ? 'అలసట' : 'Excessive Fatigue'] = survey.responses.excessiveFatigue ? 'Yes' : 'No';
      
      flatRow[isTe ? 'బీపీ' : 'High BP'] = survey.responses.highBp ? 'Yes' : 'No';
      flatRow[isTe ? 'మధుమేహం (షుగర్)' : 'Diabetes'] = survey.responses.diabetes ? 'Yes' : 'No';
      flatRow[isTe ? 'కుటుంబంలో ఎవరికైనా గుండె జబ్బులు ఉన్నాయా' : 'Family Heart Disease'] = survey.responses.familyHeartDisease ? 'Yes' : 'No';
      
      return flatRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Patients');
    XLSX.writeFile(workbook, `SHF_All_Patients_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Failed to export all to Excel:', error);
    alert('Export failed. Please check console.');
  }
};

// Consolidated PDF generator for all records
export const triggerAllSurveysPdfExport = async (surveys: SurveySubmission[], setPdfLoading?: (loading: boolean) => void) => {
  if (setPdfLoading) setPdfLoading(true);
  try {
    const doc = new jsPDF();
    const fontBase64 = await fetchNotoSansTelugu();
    if (fontBase64) {
      doc.addFileToVFS('NotoSansTelugu.ttf', fontBase64);
      doc.addFont('NotoSansTelugu.ttf', 'NotoSansTelugu', 'normal');
      doc.setFont('NotoSansTelugu');
    } else {
      doc.setFont('Helvetica');
    }

    // Title banner
    doc.setFillColor(225, 29, 72);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('SRINIVASA HEART CENTRE', 15, 10);
    doc.setFontSize(10);
    doc.text('Consolidated Patient Health Screenings Registry', 15, 18);
    
    // Date & count metadata
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Total Records: ${surveys.length}`, 150, 10);
    doc.text(`Exported On: ${new Date().toLocaleDateString()}`, 150, 18);

    let y = 35;
    
    // Draw table header
    doc.setFillColor(243, 244, 246);
    doc.rect(10, y, 190, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text('UHID', 12, y + 6);
    doc.text('Patient Name', 35, y + 6);
    doc.text('Age/Gen', 90, y + 6);
    doc.text('Phone', 115, y + 6);
    doc.text('Survey Date', 140, y + 6);
    doc.text('Cardiac Risk', 170, y + 6);
    y += 12;

    surveys.forEach((survey) => {
      if (y > 275) {
        doc.addPage();
        if (fontBase64) {
          doc.setFont('NotoSansTelugu');
        }
        y = 20;
        // Table header on new page
        doc.setFillColor(243, 244, 246);
        doc.rect(10, y, 190, 8, 'F');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text('UHID', 12, y + 6);
        doc.text('Patient Name', 35, y + 6);
        doc.text('Age/Gen', 90, y + 6);
        doc.text('Phone', 115, y + 6);
        doc.text('Survey Date', 140, y + 6);
        doc.text('Cardiac Risk', 170, y + 6);
        y += 12;
      }

      const hasCardiacRisk = survey.responses?.chestPain || survey.responses?.breathlessness || survey.responses?.previousHeartDisease;
      
      doc.setFontSize(8.5);
      doc.text(survey.uhid || 'N/A', 12, y);
      doc.text(survey.personalDetails?.name || 'N/A', 35, y);
      doc.text(`${survey.personalDetails?.age || ''} yrs / ${survey.personalDetails?.gender || ''}`, 90, y);
      doc.text(survey.personalDetails?.phone || 'N/A', 115, y);
      doc.text(survey.surveyDate || 'N/A', 140, y);
      
      if (hasCardiacRisk) {
        doc.setTextColor(220, 38, 38); // Red
        doc.text('HIGH RISK', 170, y);
      } else {
        doc.setTextColor(22, 163, 74); // Green
        doc.text('LOW RISK', 170, y);
      }
      doc.setTextColor(50, 50, 50);

      // Draw underline separator
      doc.setDrawColor(240, 240, 240);
      doc.line(10, y + 3, 200, y + 3);
      y += 8;
    });

    doc.save(`SHF_Consolidated_Patient_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    if (setPdfLoading) setPdfLoading(false);
  } catch (error) {
    console.error('Failed to export consolidated PDF:', error);
    if (setPdfLoading) setPdfLoading(false);
    alert('Export failed. Please check console.');
  }
};
