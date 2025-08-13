import { useRef, useCallback, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { SignLanguageProcessor } from '../utils/signLanguageProcessor';

export const useMediaPipeDetection = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [detectedSigns, setDetectedSigns] = useState([]);
  
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processorRef = useRef(new SignLanguageProcessor());
  const lastGestureRef = useRef('');
  const gestureTimeoutRef = useRef(null);

  const initializeMediaPipe = useCallback(async () => {
    try {
      // Initialize MediaPipe Hands
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      handsRef.current = hands;
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
    }
  }, []);

  const onResults = useCallback((results) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Process gesture
    const gesture = processorRef.current.processResults(results);
    setCurrentGesture(gesture);

    if (gesture && gesture.name !== 'Unknown' && gesture.confidence > 0.7) {
      // Prevent duplicate consecutive gestures
      if (gesture.name !== lastGestureRef.current) {
        lastGestureRef.current = gesture.name;
        
        // Clear existing timeout
        if (gestureTimeoutRef.current) {
          clearTimeout(gestureTimeoutRef.current);
        }

        // Add detected sign
        const newSign = {
          id: Date.now().toString(),
          sign: gesture.name,
          confidence: gesture.confidence,
          timestamp: Date.now(),
          coordinates: {
            x: Math.random() * 200 + 100,
            y: Math.random() * 150 + 100,
            width: 120,
            height: 80,
          },
        };

        setDetectedSigns(prev => [...prev.slice(-9), newSign]);

        // Reset gesture tracking after delay
        gestureTimeoutRef.current = setTimeout(() => {
          lastGestureRef.current = '';
        }, 1500);
      }
    }

    // Draw hand landmarks if detected
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
      }
    }
  }, []);

  const drawLandmarks = (ctx, landmarks, width, height) => {
    // Draw connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    });

    // Draw landmarks
    ctx.fillStyle = '#FF0000';
    landmarks.forEach((landmark) => {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const startDetection = useCallback(async (videoElement) => {
    if (!handsRef.current || !videoElement) return;

    videoRef.current = videoElement;
    
    // Create camera
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        if (handsRef.current && videoElement.readyState >= 2) {
          await handsRef.current.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720
    });

    cameraRef.current = camera;
    await camera.start();
    setIsDetecting(true);
  }, []);

  const stopDetection = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    setIsDetecting(false);
    setCurrentGesture(null);
    processorRef.current.clearHistory();
    lastGestureRef.current = '';
    
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
    }
  }, []);

  const clearDetections = useCallback(() => {
    setDetectedSigns([]);
    processorRef.current.clearHistory();
  }, []);

  useEffect(() => {
    initializeMediaPipe();
    
    return () => {
      stopDetection();
    };
  }, [initializeMediaPipe, stopDetection]);

  return {
    isInitialized,
    isDetecting,
    currentGesture,
    detectedSigns,
    canvasRef,
    startDetection,
    stopDetection,
    clearDetections,
  };
};