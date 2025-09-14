import { useState, useCallback, useRef, useEffect } from 'react';
import { teachableMachineService } from '../services/teachableMachineService';

export const useTeachableMachine = (settings) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [detectedSigns, setDetectedSigns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processingRef = useRef(null);
  const lastProcessTimeRef = useRef(0);

  // Initialize Teachable Machine model
  const initializeModel = useCallback(async () => {
    try {
      setIsProcessing(true);
      const success = await teachableMachineService.loadModel();
      
      if (success) {
        const info = teachableMachineService.getModelInfo();
        setModelInfo(info);
        setIsInitialized(true);
        console.log('Teachable Machine model initialized:', info);
      } else {
        setIsInitialized(false);
        console.error('Failed to initialize Teachable Machine model');
      }
    } catch (error) {
      console.error('Model initialization error:', error);
      setIsInitialized(false);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized || isProcessing) {
      return;
    }

    const now = Date.now();
    // Limit processing to every 1 second for better performance
    if (now - lastProcessTimeRef.current < 1000) {
      return;
    }

    lastProcessTimeRef.current = now;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      // Always draw current video frame to canvas first
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Only process detection if model is ready
      if (teachableMachineService.isModelReady()) {
        // Predict sign using Teachable Machine model
        const prediction = await teachableMachineService.predictSign(canvas);

        if (prediction && prediction.confidence >= settings.minConfidence) {
          const newSign = {
            id: Date.now().toString(),
            sign: prediction.sign,
            confidence: prediction.confidence,
            timestamp: Date.now(),
            category: 'teachable_machine',
            coordinates: {
              x: Math.random() * 200 + 100,
              y: Math.random() * 150 + 100,
              width: 120,
              height: 80,
            },
            allPredictions: prediction.allPredictions
          };

          // Update current gesture
          setCurrentGesture({
            name: prediction.sign,
            confidence: prediction.confidence,
            category: 'teachable_machine'
          });

          // Add to detected signs
          setDetectedSigns(prev => [...prev.slice(-9), newSign]);
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, isProcessing, settings.minConfidence]);

  // Start detection loop
  const startDetection = useCallback((videoElement) => {
    if (!isInitialized) {
      console.warn('Teachable Machine model not initialized');
      return;
    }

    videoRef.current = videoElement;
    setIsDetecting(true);

    // Start processing loop
    const processLoop = () => {
      if (videoRef.current && canvasRef.current) {
        processFrame();
      }
      if (isDetecting) {
        processingRef.current = requestAnimationFrame(processLoop);
      }
    };

    processingRef.current = requestAnimationFrame(processLoop);
  }, [isInitialized, isDetecting, processFrame]);

  // Stop detection
  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setCurrentGesture(null);
    
    if (processingRef.current) {
      cancelAnimationFrame(processingRef.current);
      processingRef.current = null;
    }
  }, []);

  // Clear detections
  const clearDetections = useCallback(() => {
    setDetectedSigns([]);
    setCurrentGesture(null);
  }, []);

  // Initialize model on mount
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  return {
    isInitialized,
    isDetecting,
    isProcessing,
    currentGesture,
    detectedSigns,
    modelInfo,
    canvasRef,
    startDetection,
    stopDetection,
    clearDetections,
    initializeModel
  };
};