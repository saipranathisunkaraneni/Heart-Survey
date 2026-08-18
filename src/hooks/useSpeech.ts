/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { translations } from '../translations';

export interface UseSpeechProps {
  lang: 'te' | 'en';
  voiceCompanion: boolean;
}

function getEnglishFallback(text: string): string {
  if (!text) return "";
  
  if (/^[a-zA-Z0-9\s?,.:;'"!()-\/]+$/.test(text)) {
    return text;
  }

  let cleaned = text.trim();

  const directMap: { [key: string]: string } = {
    "దయచేసి అవును లేదా కాదు అని చెప్పండి.": "Please say Yes or No.",
    "దయచేసి అవును లేదా కాదు అని చెప్పండి": "Please say Yes or No",
    "అవును అని నమోదు చేసాము.": "Recorded Yes.",
    "కాదు అని నమోదు చేసాము.": "Recorded No.",
    "రెండు సార్లు ప్రయత్నించినా మీ వాయిస్ సరిగ్గా రికార్డ్ అవ్వలేదు. దయచేసి ఇక్కడ టైప్ చేయండి.": "Speech recognition failed twice. Switching to keyboard entry.",
    "మీ సమాధానం వినిపించలేదు. దయచేసి మళ్లీ చెప్పండి.": "I could not hear your response. Please speak again.",
    "దయచేసి అన్ని తప్పనిసరి వివరాలను పూరించండి.": "Please fill out all required fields.",
    "రెండు అని నమోదు చేసాము.": "Recorded Male.",
    "స్త్రీ అని నమోదు చేసాము.": "Recorded Female.",
    "పురుషుడు అని నమోదు చేసాము.": "Recorded Male.",
    "ఇతరులు అని నమోదు చేసాము.": "Recorded Other.",
    "మగ అని నమోదు చేసాము.": "Recorded Male.",
    "ఆడ అని నమోదు చేసాము.": "Recorded Female."
  };

  if (directMap[cleaned]) {
    return directMap[cleaned];
  }

  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  if (sentences.length > 1) {
    return sentences.map(s => getEnglishFallback(s)).join(" ");
  }

  let trailingPunct = "";
  const matchPunct = cleaned.match(/[.!?]+$/);
  if (matchPunct) {
    trailingPunct = matchPunct[0];
    cleaned = cleaned.substring(0, cleaned.length - trailingPunct.length).trim();
  }

  for (const key in translations.te.voicePrompts) {
    if (translations.te.voicePrompts[key].trim().replace(/[.!?]+$/, "").trim() === cleaned) {
      return (translations.en.voicePrompts[key] || cleaned) + trailingPunct;
    }
  }

  for (const key in translations.te.questions) {
    if (translations.te.questions[key].trim().replace(/[.!?]+$/, "").trim() === cleaned) {
      return (translations.en.questions[key] || cleaned) + trailingPunct;
    }
  }

  for (let idx = 0; idx < translations.te.pageIntroductions.length; idx++) {
    if (translations.te.pageIntroductions[idx].trim().replace(/[.!?]+$/, "").trim() === cleaned) {
      return (translations.en.pageIntroductions[idx] || cleaned) + trailingPunct;
    }
  }

  if (cleaned.includes("అని నమోదు చేసాము")) {
    const valueTe = cleaned.replace("అని నమోదు చేసాము", "").trim();
    if (valueTe === "అవును") return "Recorded Yes" + trailingPunct;
    if (valueTe === "కాదు") return "Recorded No" + trailingPunct;
    if (valueTe === "పురుషుడు" || valueTe === "మగ") return "Recorded Male" + trailingPunct;
    if (valueTe === "స్త్రీ" || valueTe === "ఆడ") return "Recorded Female" + trailingPunct;
    if (valueTe === "ఇతరులు") return "Recorded Other" + trailingPunct;
    return `Recorded ${valueTe}` + trailingPunct;
  }

  return text;
}

export function useSpeech({ lang, voiceCompanion }: UseSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningFeedback, setListeningFeedback] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  const stop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setListeningFeedback('');
    setTranscript('');
  };

  const speak = (text: string, overrideLang?: 'te' | 'en', onEnd?: () => void) => {
    if (typeof overrideLang === 'function') {
      onEnd = overrideLang as any;
      overrideLang = undefined;
    }

    if (!synthRef.current) {
      if (onEnd) onEnd();
      return;
    }

    try {
      setTranscript('');
      synthRef.current.cancel();
      const currentLang = overrideLang || lang;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'te' ? 'te-IN' : 'en-IN';
      utterance.rate = currentLang === 'te' ? 1.0 : 0.95;

      const voices = synthRef.current.getVoices();
      const voice = voices.find(v => {
        const vlang = v.lang.toLowerCase();
        const vname = v.name.toLowerCase();
        const target = currentLang === 'te' ? 'te' : 'en';
        return vlang.startsWith(target) || vname.includes(target === 'te' ? 'telugu' : 'english') || (target === 'te' && vlang.includes('te-'));
      });
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsListening(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.error('Speech synthesis utterance error:', err);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      synthRef.current.speak(utterance);
    } catch (e) {
      console.error('Failed speaking text:', e);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    }
  };

  const listen = (
    onResult: (text: string, confidence: number) => void,
    onNoSpeech: () => void
  ) => {
    stop();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setListeningFeedback(lang === 'te' ? 'వాయిస్ సపోర్ట్ లేదు' : 'Voice not supported');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang === 'te' ? 'te-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setListeningFeedback(lang === 'te' ? 'వింటున్నాము... మాట్లాడండి' : 'Listening... speak now');
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setListeningFeedback('');
        
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          onNoSpeech();
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentTranscript = (finalTranscript + interimTranscript).trim();
        if (currentTranscript) {
          setTranscript(currentTranscript);
        }

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          setIsListening(false);
          const transcriptText = lastResult[0].transcript || '';
          const confidence = lastResult[0].confidence || 1.0;
          
          console.log('Recognized speech (final):', transcriptText, 'Confidence:', confidence);
          onResult(transcriptText, confidence);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error('Speech recognition exception:', e);
      setIsListening(false);
      onNoSpeech();
    }
  };

  const speakThenListen = (
    promptText: string,
    onSuccess: (text: string) => void,
    onFallbackToText: () => void,
    currentRetryVal = retryCount
  ) => {
    if (!voiceCompanion) {
      // Just listen directly if voice companion is disabled
      listen(
        (text, confidence) => handleSpeechResult(text, confidence, promptText, onSuccess, onFallbackToText, currentRetryVal),
        () => handleNoSpeech(promptText, onSuccess, onFallbackToText, currentRetryVal)
      );
      return;
    }

    speak(promptText, undefined, () => {
      listen(
        (text, confidence) => handleSpeechResult(text, confidence, promptText, onSuccess, onFallbackToText, currentRetryVal),
        () => handleNoSpeech(promptText, onSuccess, onFallbackToText, currentRetryVal)
      );
    });
  };

  const handleSpeechResult = (
    text: string,
    confidence: number,
    promptText: string,
    onSuccess: (text: string) => void,
    onFallbackToText: () => void,
    currentRetryVal: number
  ) => {
    if (confidence < 0.10) {
      // Low confidence retry
      console.warn('Low confidence speech recognition. Confidence:', confidence);
      handleRetryFailure(promptText, onSuccess, onFallbackToText, currentRetryVal);
    } else {
      // Valid recognition
      setRetryCount(0);
      onSuccess(text);
    }
  };

  const handleNoSpeech = (
    promptText: string,
    onSuccess: (text: string) => void,
    onFallbackToText: () => void,
    currentRetryVal: number
  ) => {
    handleRetryFailure(promptText, onSuccess, onFallbackToText, currentRetryVal);
  };

  const handleRetryFailure = (
    promptText: string,
    onSuccess: (text: string) => void,
    onFallbackToText: () => void,
    currentRetryVal: number
  ) => {
    const nextRetry = currentRetryVal + 1;
    if (nextRetry > 2) {
      // Max 2 retries exceeded. Switch to text.
      setRetryCount(0);
      stop();
      
      const switchAlertText = lang === 'te'
        ? "రెండు సార్లు ప్రయత్నించినా మీ వాయిస్ సరిగ్గా రికార్డ్ అవ్వలేదు. దయచేసి ఇక్కడ టైప్ చేయండి."
        : "Speech recognition failed twice. Switching to keyboard entry.";
      
      if (voiceCompanion) {
        speak(switchAlertText, undefined, () => {
          onFallbackToText();
        });
      } else {
        onFallbackToText();
      }
    } else {
      // Retry speaking retry alert, then listen again
      setRetryCount(nextRetry);
      const retryAlertText = lang === 'te'
        ? "మీ సమాధానం వినిపించలేదు. దయచేసి మళ్లీ చెప్పండి."
        : "I could not hear your response. Please speak again.";

      if (voiceCompanion) {
        speak(retryAlertText, undefined, () => {
          listen(
            (text, confidence) => handleSpeechResult(text, confidence, promptText, onSuccess, onFallbackToText, nextRetry),
            () => handleNoSpeech(promptText, onSuccess, onFallbackToText, nextRetry)
          );
        });
      } else {
        listen(
          (text, confidence) => handleSpeechResult(text, confidence, promptText, onSuccess, onFallbackToText, nextRetry),
          () => handleNoSpeech(promptText, onSuccess, onFallbackToText, nextRetry)
        );
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    isSpeaking,
    isListening,
    listeningFeedback,
    transcript,
    retryCount,
    setRetryCount,
    speak,
    listen,
    speakThenListen,
    stop
  };
}
