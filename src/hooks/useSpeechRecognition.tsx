
import { useState, useEffect, useCallback } from 'react';

// Define the SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Define our hook props
interface UseSpeechRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const useSpeechRecognition = ({
  onResult,
  onEnd,
  onError,
}: UseSpeechRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Define which SpeechRecognition constructor to use (standard or webkit)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  // Check if speech recognition is supported
  const isSpeechRecognitionSupported = !!SpeechRecognition;

  // Create instance when needed (not during rendering)
  let recognitionInstance: any = null;

  const createRecognitionInstance = useCallback(() => {
    if (!isSpeechRecognitionSupported) {
      console.error('Speech recognition is not supported in this browser');
      return null;
    }

    const instance = new SpeechRecognition();
    instance.continuous = true;
    instance.interimResults = true;
    instance.lang = 'en-US';

    instance.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      if (onResult) onResult(transcript);
    };

    instance.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      if (onError) onError(new Error(`Speech recognition error: ${event.error}`));
    };

    instance.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    return instance;
  }, [isSpeechRecognitionSupported, onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported) {
      console.error('Speech recognition is not supported in this browser');
      if (onError) onError(new Error('Speech recognition is not supported in this browser'));
      return;
    }

    try {
      // Create a new instance each time we start listening
      recognitionInstance = createRecognitionInstance();
      if (recognitionInstance) {
        recognitionInstance.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error starting speech recognition'));
    }
  }, [isSpeechRecognitionSupported, createRecognitionInstance, onError]);

  const stopListening = useCallback(() => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (error) {
          // Ignore errors on unmount
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSpeechRecognitionSupported,
  };
};

export default useSpeechRecognition;
