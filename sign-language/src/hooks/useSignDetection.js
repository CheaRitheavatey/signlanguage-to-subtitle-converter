import { useCallback } from 'react';
import { SIGN_TRANSLATIONS } from '../types';
import { useMediaPipeDetection } from './useMediaPipeDetection';

export const useSignDetection = (settings) => {
  const {
    isInitialized,
    isDetecting,
    currentGesture,
    detectedSigns: rawDetectedSigns,
    canvasRef,
    startDetection: startMediaPipeDetection,
    stopDetection: stopMediaPipeDetection,
    clearDetections: clearMediaPipeDetections,
  } = useMediaPipeDetection();

  // Filter signs based on confidence threshold
  const detectedSigns = rawDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);

  const startDetection = useCallback((videoElement) => {
    if (videoElement && isInitialized) {
      startMediaPipeDetection(videoElement);
    }
  }, [startMediaPipeDetection, isInitialized]);

  const stopDetection = useCallback(() => {
    stopMediaPipeDetection();
  }, [stopMediaPipeDetection]);

  const translateSign = useCallback((sign) => {
    const translations = SIGN_TRANSLATIONS[settings.language];
    return translations[sign] || sign;
  }, [settings.language]);

  const clearDetections = useCallback(() => {
    clearMediaPipeDetections();
  }, [clearMediaPipeDetections]);

  return {
    isInitialized,
    detectedSigns,
    currentGesture,
    isDetecting,
    canvasRef,
    startDetection,
    stopDetection,
    clearDetections,
    translateSign,
  };
};


// need to update by loading model + infer on the fly
