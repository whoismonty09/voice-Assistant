
import { useState, useEffect, useCallback } from 'react';

interface UseSpeechSynthesisProps {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechSynthesis({
  voice,
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError,
}: UseSpeechSynthesisProps = {}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize voices when available
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Set a default voice if none provided (prefer a male voice for Jarvis)
        if (!voice) {
          const defaultVoice = availableVoices.find(v => 
            v.name.includes('Male') || 
            v.name.includes('Google UK English Male') || 
            v.name.includes('Daniel')
          ) || availableVoices[0];
          
          setSelectedVoice(defaultVoice);
        } else {
          setSelectedVoice(voice);
        }
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [voice]);

  // Set event handlers for speech synthesis
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const handleStart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    const handleError = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.('Speech synthesis error occurred');
    };

    speechSynthesis.addEventListener('start', handleStart);
    speechSynthesis.addEventListener('end', handleEnd);
    speechSynthesis.addEventListener('error', handleError);

    return () => {
      speechSynthesis.removeEventListener('start', handleStart);
      speechSynthesis.removeEventListener('end', handleEnd);
      speechSynthesis.removeEventListener('error', handleError);
    };
  }, [onEnd, onError, onStart]);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onError?.('Speech synthesis is not supported in this browser.');
      return;
    }

    if (!text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      onError?.('Failed to synthesize speech');
    }
  }, [onError, pitch, rate, selectedVoice, volume]);

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  return {
    voices,
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    setVoice: setSelectedVoice,
  };
}

export default useSpeechSynthesis;
