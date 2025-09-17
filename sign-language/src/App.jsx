// 

// ASLTranslator.js
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

const ASLTranslator = () => {
  const webcamRef = useRef(null);
  const [prediction, setPrediction] = useState('');
  const [khmerTranslation, setKhmerTranslation] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [framesCollected, setFramesCollected] = useState(0);
  const [clientId] = useState(() => `client_${Math.random().toString(36).substr(2, 9)}`);
  const [status, setStatus] = useState('idle');

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  };

  const sendImageToBackend = async (imageData) => {
    setIsLoading(true);
    try {
      // Convert base64 to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('file', blob, 'frame.png');
      
      // Send to backend with client ID header
      const result = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Client-Id': clientId,
        },
      });
      
      const data = await result.json();
      
      if (data.error) {
        console.error('Error:', data.error);
        return;
      }
      
      setStatus(data.status);
      setFramesCollected(data.have);
      
      if (data.status === 'predicted') {
        setPrediction(data.word);
        setKhmerTranslation(data.khmer_translation);
        setConfidence(data.confidence);
      } else if (data.status === 'no_hand') {
        setPrediction('No hand detected');
        setKhmerTranslation('');
        setConfidence(0);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const resetBuffer = async () => {
    try {
      await fetch(`http://localhost:8000/reset/${clientId}`);
      setFramesCollected(0);
      setStatus('idle');
      setPrediction('');
      setKhmerTranslation('');
      setConfidence(0);
    } catch (error) {
      console.error('Error resetting buffer:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        const imageData = capture();
        if (imageData) {
          sendImageToBackend(imageData);
        }
      }, 100); // Capture more frequently for sequence model
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ASL to Khmer Translator</h1>
      <p>Client ID: {clientId}</p>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            style={{ width: '100%', borderRadius: '8px' }}
          />
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => setIsCapturing(!isCapturing)}
              style={{
                padding: '10px 20px',
                backgroundColor: isCapturing ? '#ff4757' : '#2ed573',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {isCapturing ? 'Stop Translating' : 'Start Translating'}
            </button>
            
            <button 
              onClick={resetBuffer}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ffa502',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '10px'
              }}
            >
              Reset Buffer
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>Translation Results</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Status:</h3>
            <p style={{ fontSize: '18px' }}>
              {status === 'collecting' ? `Collecting frames (${framesCollected}/48)` : 
               status === 'predicted' ? 'Prediction ready' :
               status === 'no_hand' ? 'No hand detected' : 'Idle'}
            </p>
          </div>
          
          {isLoading ? (
            <p>Processing...</p>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h3>Predicted Sign:</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{prediction || 'No prediction yet'}</p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>Khmer Translation:</h3>
                <p style={{ fontSize: '32px', fontFamily: 'Khmer OS, sans-serif', fontWeight: 'bold' }}>
                  {khmerTranslation || 'នៅពេលបន្តិច'}
                </p>
              </div>
              
              <div>
                <h3>Confidence:</h3>
                <p style={{ fontSize: '18px' }}>
                  {confidence ? `${(confidence * 100).toFixed(2)}%` : 'N/A'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ASLTranslator;