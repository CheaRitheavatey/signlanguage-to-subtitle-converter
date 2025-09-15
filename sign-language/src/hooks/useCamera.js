import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [cameraState, setCameraState] = useState({
    isActive: false,
    hasPermission: false,
    error: null,
    devices: [],
    selectedDevice: null
  });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Get available camera devices
  const getCameraDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraState(prev => ({ ...prev, devices: videoDevices }));
      return videoDevices;
    } catch (error) {
      console.error('Error getting devices:', error);
      return [];
    }
  }, []);

  const startCamera = useCallback(async (deviceId = null) => {
    try {
      setCameraState(prev => ({ ...prev, error: null }));
      
      // const constraints = {
      //   video: deviceId ? { 
      //     deviceId: { exact: deviceId },
      //     width: { ideal: 640 },
      //     height: { ideal: 480 },
      //     frameRate: { ideal: 30 }
      //   } : {
      //     width: { ideal: 640 },
      //     height: { ideal: 480 },
      //     frameRate: { ideal: 30 }
      //   },
      //   audio: false
      // };
      const constraints = {
      video: true,
      audio: false
    };

      console.log('Requesting camera with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained:', stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
            resolve();
          } else {
            videoRef.current.onloadeddata = resolve;
            videoRef.current.onerror = (e) => {
              console.error('Video loading error:', e);
              resolve();
            };
            
            // Timeout fallback
            setTimeout(resolve, 1000);
          }
        });

        videoRef.current.play().catch(e => {
          console.error('Video play error:', e);
        });
        
        setCameraState({
          isActive: true,
          hasPermission: true,
          error: null,
          devices: cameraState.devices,
          selectedDevice: deviceId
        });

        // Get devices after permission is granted
        await getCameraDevices();
      }
    } catch (error) {
      console.error('Camera error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Camera access failed';
      
      let detailedError = errorMessage;
      if (error.name === 'NotAllowedError') {
        detailedError = 'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        detailedError = 'No camera found. Please check if your camera is connected.';
      } else if (error.name === 'NotReadableError') {
        detailedError = 'Camera is already in use by another application.';
      }
      
      setCameraState({
        isActive: false,
        hasPermission: false,
        error: detailedError,
        devices: cameraState.devices,
        selectedDevice: null
      });
    }
  }, [cameraState.devices, getCameraDevices]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log('Stopping camera stream');
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState(prev => ({
      ...prev,
      isActive: false,
      error: null
    }));
  }, []);

  const switchCamera = useCallback(async (deviceId) => {
    stopCamera();
    // Small delay to ensure camera is fully stopped
    await new Promise(resolve => setTimeout(resolve, 100));
    startCamera(deviceId);
  }, [startCamera, stopCamera]);

  // Get available devices on mount
  useEffect(() => {
    getCameraDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      getCameraDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopCamera();
    };
  }, [getCameraDevices, stopCamera]);

  return {
    cameraState,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    getCameraDevices
  };
};

