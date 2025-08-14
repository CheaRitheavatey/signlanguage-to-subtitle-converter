import { useCallback, useState } from 'react';
import { useMediaPipeDetection } from './useMediaPipeDetection';
import { useWLASLDetection } from './useWLASLDetection';
import { SIGN_TRANSLATIONS } from '../types';

export const useSignDetection = (settings) => {
  const [detectionMode, setDetectionMode] = useState('mediapipe'); // 'mediapipe' or 'wlasl'
  
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

  // WLASL-powered detection (new)
  const {
    isInitialized: isWLASLInitialized,
    isDetecting: isWLASLDetecting,
    isProcessing: isWLASLProcessing,
    currentGesture: wlaslCurrentGesture,
    detectedSigns: wlaslDetectedSigns,
    canvasRef: wlaslCanvasRef,
    apiKey,
    startDetection: startWLASLDetection,
    stopDetection: stopWLASLDetection,
    clearDetections: clearWLASLDetections,
    updateApiKey,
    processSignsToSentence,
    getVocabularyInfo
  } = useWLASLDetection(settings);

  // Filter signs based on confidence threshold
  const activeDetectedSigns = detectionMode === 'wlasl' 
    ? wlaslDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence)
    : rawDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);

  const startDetection = useCallback((videoElement) => {
    if (detectionMode === 'wlasl') {
      if (videoElement && isWLASLInitialized) {
        startWLASLDetection(videoElement);
      }
    } else {
      if (videoElement && isInitialized) {
        startMediaPipeDetection(videoElement);
      }
    }
  }, [detectionMode, startWLASLDetection, startMediaPipeDetection, isWLASLInitialized, isInitialized]);

  const stopDetection = useCallback(() => {
    if (detectionMode === 'wlasl') {
      stopWLASLDetection();
    } else {
      stopMediaPipeDetection();
    }
  }, [detectionMode, stopWLASLDetection, stopMediaPipeDetection]);

  const translateSign = useCallback((sign) => {
    // For WLASL mode, signs are already in English, just apply language translation if needed
    if (detectionMode === 'wlasl') {
      const translations = SIGN_TRANSLATIONS[settings.language];
      return translations[sign] || sign;
    }
    
    // For MediaPipe mode, use existing translation logic
    const translations = SIGN_TRANSLATIONS[settings.language];
    return translations[sign] || sign;
  }, [settings.language]);

  const clearDetections = useCallback(() => {
    if (detectionMode === 'wlasl') {
      clearWLASLDetections();
    } else {
      clearMediaPipeDetections();
    }
  }, [detectionMode, clearWLASLDetections, clearMediaPipeDetections]);

  return {
    // Detection state
    isInitialized: detectionMode === 'wlasl' ? isWLASLInitialized : isInitialized,
    detectedSigns: activeDetectedSigns,
    currentGesture: detectionMode === 'wlasl' ? wlaslCurrentGesture : currentGesture,
    isDetecting: detectionMode === 'wlasl' ? isWLASLDetecting : isDetecting,
    isProcessing: detectionMode === 'wlasl' ? isWLASLProcessing : false,
    canvasRef: detectionMode === 'wlasl' ? wlaslCanvasRef : canvasRef,
    
    // Detection controls
    startDetection,
    stopDetection,
    clearDetections,
    translateSign,
    
    // Mode management
    detectionMode,
    setDetectionMode,
    
    // WLASL-specific features
    apiKey,
    updateApiKey,
    processSignsToSentence,
    getVocabularyInfo
  };
};