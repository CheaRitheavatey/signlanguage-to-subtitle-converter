import { useCallback, useState } from 'react';
import { useMediaPipeDetection } from './useMediaPipeDetection';
import { useBasicDetection } from './useBasicDetection';
import { useTeachableMachine } from './useTeachableMachine';
import { SIGN_TRANSLATIONS } from '../types';

export const useSignDetection = (settings) => {
  const [detectionMode, setDetectionMode] = useState('mediapipe'); // 'mediapipe', 'basic', or 'teachable'
  
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

  // Teachable Machine detection (new)
  const {
    isInitialized: isTeachableInitialized,
    isDetecting: isTeachableDetecting,
    isProcessing: isTeachableProcessing,
    currentGesture: teachableCurrentGesture,
    detectedSigns: teachableDetectedSigns,
    modelInfo,
    canvasRef: teachableCanvasRef,
    startDetection: startTeachableDetection,
    stopDetection: stopTeachableDetection,
    clearDetections: clearTeachableDetections,
    initializeModel: initializeTeachableModel
  } = useTeachableMachine(settings);

  // Filter signs based on confidence threshold
  const activeDetectedSigns = (() => {
    switch (detectionMode) {
      case 'basic':
        return basicDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);
      case 'teachable':
        return teachableDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);
      default:
        return rawDetectedSigns.filter(sign => sign.confidence >= settings.minConfidence);
    }
  })();

  const startDetection = useCallback((videoElement) => {
    switch (detectionMode) {
      case 'basic':
        if (videoElement && isBasicInitialized) {
          startBasicDetection(videoElement);
        }
        break;
      case 'teachable':
        if (videoElement && isTeachableInitialized) {
          startTeachableDetection(videoElement);
        }
        break;
      default:
        if (videoElement && isInitialized) {
          startMediaPipeDetection(videoElement);
        }
        break;
    }
  }, [detectionMode, startBasicDetection, startMediaPipeDetection, startTeachableDetection, isBasicInitialized, isInitialized, isTeachableInitialized]);

  const stopDetection = useCallback(() => {
    switch (detectionMode) {
      case 'basic':
        stopBasicDetection();
        break;
      case 'teachable':
        stopTeachableDetection();
        break;
      default:
        stopMediaPipeDetection();
        break;
    }
  }, [detectionMode, stopBasicDetection, stopMediaPipeDetection, stopTeachableDetection]);

  const translateSign = useCallback((sign) => {
    const translations = SIGN_TRANSLATIONS[settings.language];
    return translations[sign] || sign;
  }, [settings.language]);

  const clearDetections = useCallback(() => {
    switch (detectionMode) {
      case 'basic':
        clearBasicDetections();
        break;
      case 'teachable':
        clearTeachableDetections();
        break;
      default:
        clearMediaPipeDetections();
        break;
    }
  }, [detectionMode, clearBasicDetections, clearMediaPipeDetections, clearTeachableDetections]);

  // Get current state based on detection mode
  const getCurrentState = () => {
    switch (detectionMode) {
      case 'basic':
        return {
          isInitialized: isBasicInitialized,
          currentGesture: basicCurrentGesture,
          isDetecting: isBasicDetecting,
          isProcessing: isBasicProcessing,
          canvasRef: basicCanvasRef
        };
      case 'teachable':
        return {
          isInitialized: isTeachableInitialized,
          currentGesture: teachableCurrentGesture,
          isDetecting: isTeachableDetecting,
          isProcessing: isTeachableProcessing,
          canvasRef: teachableCanvasRef
        };
      default:
        return {
          isInitialized: isInitialized,
          currentGesture: currentGesture,
          isDetecting: isDetecting,
          isProcessing: false,
          canvasRef: canvasRef
        };
    }
  };

  const currentState = getCurrentState();

  return {
    // Detection state
    isInitialized: currentState.isInitialized,
    detectedSigns: activeDetectedSigns,
    currentGesture: currentState.currentGesture,
    isDetecting: currentState.isDetecting,
    isProcessing: currentState.isProcessing,
    canvasRef: currentState.canvasRef,
    
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
    processSignsToSentence,
    
    // Teachable Machine features
    modelInfo,
    initializeTeachableModel
  };
};