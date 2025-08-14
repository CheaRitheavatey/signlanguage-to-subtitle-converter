import { useState, useCallback, useRef, useEffect } from 'react';
import { wlaslService } from '../services/wlaslService';

export const useWLASLDetection = (settings) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [detectedSigns, setDetectedSigns] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processingRef = useRef(null);
  const detectionHistoryRef = useRef([]);
  const lastProcessTimeRef = useRef(0);

  // Initialize WLASL service
  const initializeWLASL = useCallback(() => {
    if (apiKey) {
      wlaslService.setApiKey(apiKey);
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [apiKey]);

  useEffect(() => {
    initializeWLASL();
  }, [initializeWLASL]);

  // Capture and process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized || isProcessing) {
      return;
    }

    const now = Date.now();
    // Limit processing to every 1000ms to avoid API rate limits and improve performance
    if (now - lastProcessTimeRef.current < 1000) {
      return;
    }

    lastProcessTimeRef.current = now;
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to base64 for API
      const imageData = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

      // Classify the frame using WLASL service
      const result = await wlaslService.classifySignLanguageFrame(imageData);

      if (result.success && result.topPrediction) {
        const prediction = result.topPrediction;
        
        // Filter by confidence threshold
        if (prediction.confidence >= settings.minConfidence) {
          const newSign = {
            id: Date.now().toString(),
            sign: prediction.word,
            confidence: prediction.confidence,
            timestamp: Date.now(),
            category: prediction.category,
            isWLASL: true,
            coordinates: {
              x: Math.random() * 200 + 100,
              y: Math.random() * 150 + 100,
              width: 120,
              height: 80,
            },
          };

          // Update current gesture
          setCurrentGesture({
            name: prediction.word,
            confidence: prediction.confidence,
            category: prediction.category
          });

          // Add to detection history
          detectionHistoryRef.current.push(newSign);
          
          // Keep only recent detections (last 10)
          if (detectionHistoryRef.current.length > 10) {
            detectionHistoryRef.current.shift();
          }

          // Update detected signs state
          setDetectedSigns([...detectionHistoryRef.current]);

          // Process signs into sentences periodically
          if (detectionHistoryRef.current.length >= 3) {
            processSignsToSentence();
          }
        }
      }
    } catch (error) {
      console.error('WLASL frame processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, isProcessing, settings.minConfidence]);

  // Convert detected signs to sentences using WLASL service
  const processSignsToSentence = useCallback(() => {
    if (detectionHistoryRef.current.length === 0) return;

    try {
      const recentSigns = detectionHistoryRef.current.slice(-5); // Last 5 signs
      const sentence = wlaslService.convertToSentence(recentSigns);
      
      if (sentence && sentence.length > 0) {
        // Create a sentence entry
        const sentenceSign = {
          id: `sentence_${Date.now()}`,
          sign: sentence,
          confidence: recentSigns.reduce((sum, s) => sum + s.confidence, 0) / recentSigns.length,
          timestamp: Date.now(),
          category: 'sentence',
          isSentence: true,
          isWLASL: true,
          originalSigns: recentSigns.map(s => s.sign)
        };

        // Add sentence to detected signs
        setDetectedSigns(prev => [...prev, sentenceSign]);
        
        // Clear recent history to avoid repetition
        detectionHistoryRef.current = [];
      }
    } catch (error) {
      console.error('Sentence processing error:', error);
    }
  }, []);

  // Start detection loop
  const startDetection = useCallback((videoElement) => {
    if (!isInitialized) {
      console.warn('WLASL service not initialized. Please set API key.');
      return;
    }

    videoRef.current = videoElement;
    setIsDetecting(true);

    // Start processing loop
    const processLoop = () => {
      if (isDetecting) {
        processFrame();
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
    detectionHistoryRef.current = [];
    setCurrentGesture(null);
  }, []);

  // Update API key
  const updateApiKey = useCallback((newKey) => {
    setApiKey(newKey);
  }, []);

  // Get vocabulary information
  const getVocabularyInfo = useCallback(() => {
    return wlaslService.getVocabularyStats();
  }, []);

  return {
    isInitialized,
    isDetecting,
    isProcessing,
    currentGesture,
    detectedSigns,
    canvasRef,
    apiKey,
    startDetection,
    stopDetection,
    clearDetections,
    updateApiKey,
    processSignsToSentence,
    getVocabularyInfo
  };
};