import { useCallback, useState } from 'react';
import { useMediaPipeDetection } from './useMediaPipeDetection';
import { useBasicDetection } from './useBasicDetection';
import { SIGN_TRANSLATIONS } from '../types';

export const useSignDetection = (settings) => {
  const [detectionMode, setDetectionMode] = useState('mediapipe'); // 'mediapipe' or 'basic'
  
  // MediaPipe detection (original)
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

  // Basic detection with Sea Lion AI (new)
  const {
    isInitialized: isBasicInitialized,
    isDetecting: isBasicDetecting,
    isProcessing: isBasicProcessing,
    currentGesture: basicCurrentGesture,
    detectedSigns: basicDetectedSigns,
    canvasRef: basicCanvasRef,
    apiKey,
    startDetection: startBasicDetection,
    stopDetection: stopBasicDetection,
    clearDetections: clearBasicDetections,
    updateApiKey,
    processSignsToSentence
  } = useBasicDetection(settings);

  // Filter signs based on confidence threshold
  const activeDetectedSigns = detectionMode === 'basic' 
    ? basicDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence)
    : rawDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);

  const startDetection = useCallback((videoElement) => {
    if (detectionMode === 'basic') {
      if (videoElement && isBasicInitialized) {
        startBasicDetection(videoElement);
      } else {
        console.warn('Basic detection not initialized or video element is invalid.');
      }
    } else {
      if (videoElement && isInitialized) {
        startMediaPipeDetection(videoElement);
      } else {
        console.warn('MediaPipe detection not initialized or video element is invalid.');
      }
    }
  }, [detectionMode, startBasicDetection, startMediaPipeDetection, isBasicInitialized, isInitialized]);

  const stopDetection = useCallback(() => {
    if (detectionMode === 'basic') {
      stopBasicDetection();
    } else {
      stopMediaPipeDetection();
    }
  }, [detectionMode, stopBasicDetection, stopMediaPipeDetection]);

  const translateSign = useCallback((sign) => {
    const translations = SIGN_TRANSLATIONS[settings.language];
    return translations[sign] || sign;
  }, [settings.language]);

  const clearDetections = useCallback(() => {
    if (detectionMode === 'basic') {
      clearBasicDetections();
    } else {
      clearMediaPipeDetections();
    }
  }, [detectionMode, clearBasicDetections, clearMediaPipeDetections]);

  // Call this to process detected signs to sentences
  // useEffect(() => {
  //   if (detectionMode === 'basic' && basicDetectedSigns.length > 0) {
  //     processSignsToSentence(activeDetectedSigns);
  //   }
  // }, [activeDetectedSigns, detectionMode, processSignsToSentence]);

  return {
    // Detection state
    isInitialized: detectionMode === 'basic' ? isBasicInitialized : isInitialized,
    detectedSigns: activeDetectedSigns,
    currentGesture: detectionMode === 'basic' ? basicCurrentGesture : currentGesture,
    isDetecting: detectionMode === 'basic' ? isBasicDetecting : isDetecting,
    isProcessing: detectionMode === 'basic' ? isBasicProcessing : false,
    canvasRef: detectionMode === 'basic' ? basicCanvasRef : canvasRef,
    
    // Detection controls
    startDetection,
    stopDetection,
    clearDetections,
    translateSign,
    
    // Mode management
    detectionMode,
    setDetectionMode,
    
    // Basic detection with Sea Lion AI features
    apiKey,
    updateApiKey,
    processSignsToSentence
  };
};