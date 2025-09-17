// src/components/BackendBridge.jsx
import React, { useEffect, useRef } from 'react';
import { postFrame } from '../api';

export default function BackendBridge({ videoRef, running, onPrediction, captureInterval = 150 }) {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const clientIdRef = useRef(null);

  // Create/remember client id
  useEffect(() => {
    let id = localStorage.getItem('clientId');
    if (!id) {
      id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      localStorage.setItem('clientId', id);
    }
    clientIdRef.current = id;
  }, []);

  // create canvas used for snapshots
  useEffect(() => {
    if (!canvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 224;
      c.height = 224;
      canvasRef.current = c;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // sender
    const sendFrame = async () => {
      try {
        const video = videoRef?.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext('2d');
        // draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // convert to blob and send
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            const res = await postFrame(blob, clientIdRef.current);
            // res: { word, confidence, status, have }
            if (res && res.status === 'predicted' && res.word) {
              onPrediction && onPrediction(res);
            }
          } catch (err) {
            // network or API error, keep running (don't crash)
            console.error('BackendBridge post error', err);
          }
        }, 'image/jpeg', 0.8);
      } catch (err) {
        console.error('BackendBridge capture error', err);
      }
      console.log('Captured frame at', new Date().toISOString());

    };

    // start interval
    intervalRef.current = setInterval(sendFrame, captureInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, videoRef, onPrediction, captureInterval]);

  return null;
}
