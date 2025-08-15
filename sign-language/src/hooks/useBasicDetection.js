import { useState, useCallback, useRef, useEffect } from 'react';
import { basicSignService } from '../services/basicSignService';
import { seaLionService } from '../services/seaLionService';

export const useBasicDetection = (settings) => {
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

  // Initialize services
  const initializeServices = useCallback(() => {
    if (apiKey) {
      seaLionService.setApiKey(apiKey);
    }
    setIsInitialized(true); // Basic detection is always available
  }, [apiKey]);

  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  // Capture and process video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) {
      return;
    }

    const now = Date.now();
    // Limit processing to every 2 seconds for demo purposes
    if (now - lastProcessTimeRef.current < 2000) {
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

      // Only process detection if initialized and enough time has passed
      if (isInitialized && now - lastProcessTimeRef.current >= 2000) {
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Detect sign using basic service
        const detection = await basicSignService.detectSignFromFrame(imageData);

        if (detection && detection.confidence >= settings.minConfidence) {
          const newSign = {
            id: Date.now().toString(),
            sign: detection.sign,
            confidence: detection.confidence,
            timestamp: Date.now(),
            category: detection.category,
            coordinates: {
              x: Math.random() * 200 + 100,
              y: Math.random() * 150 + 100,
              width: 120,
              height: 80,
            },
          };

          // Update current gesture
          setCurrentGesture({
            name: detection.sign,
            confidence: detection.confidence,
            category: detection.category
          });

          // Add to detection history
          detectionHistoryRef.current.push(newSign);
          
          // Keep only recent detections (last 10)
          if (detectionHistoryRef.current.length > 10) {
            detectionHistoryRef.current.shift();
          }

          // Update detected signs state
          setDetectedSigns([...detectionHistoryRef.current]);

          // Process signs into fluent sentences periodically
          if (detectionHistoryRef.current.length >= 3) {
            await processSignsToSentence();
          }
        }
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized, isProcessing, settings.minConfidence]);

  // Convert detected signs to fluent sentences using Sea Lion AI
  const processSignsToSentence = useCallback(async () => {
    if (detectionHistoryRef.current.length === 0) return;

    try {
      const recentSigns = detectionHistoryRef.current.slice(-5); // Last 5 signs
      const context = {
        language: settings.language,
        timeframe: 'recent',
        confidence: settings.minConfidence
      };

      const result = await seaLionService.generateFluentSentence(recentSigns, context);
      
      if (result.fluentText) {
        // Translate if needed
        let finalText = result.fluentText;
        if (settings.language !== 'english') {
          finalText = await seaLionService.translateText(result.fluentText, settings.language);
        }

        // Create a sentence entry
        const sentenceSign = {
          id: `sentence_${Date.now()}`,
          sign: finalText,
          confidence: result.confidence,
          timestamp: Date.now(),
          category: 'sentence',
          isSentence: true,
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
  }, [settings.language, settings.minConfidence]);

  // Start detection loop
  const startDetection = useCallback((videoElement) => {
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
  }, [isDetecting, processFrame]);

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
    processSignsToSentence
  };
};