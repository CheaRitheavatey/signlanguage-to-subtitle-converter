import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [cameraState, setCameraState] = useState({
    isActive: false,
    hasPermission: false,
    error: null,
  });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setCameraState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onLoadedmetadata = () => {
          videoRef.current.play();
        }
        streamRef.current = stream;
        
        setCameraState({
          isActive: true,
          hasPermission: true,
          error: null,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
      setCameraState({
        isActive: false,
        hasPermission: false,
        error: errorMessage,
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState({
      isActive: false,
      hasPermission: true,
      error: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraState,
    videoRef,
    startCamera,
    stopCamera,
  };
};