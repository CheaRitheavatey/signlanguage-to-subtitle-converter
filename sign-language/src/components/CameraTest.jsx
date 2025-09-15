import React from 'react';
import { useCamera } from '../hooks/useCamera'; // Fixed import path

const CameraTest = () => {
  const { cameraState, videoRef, startCamera, stopCamera } = useCamera();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Camera Test</h2>
      
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ 
          width: '400px', 
          height: '300px', 
          border: '2px solid #333',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={startCamera}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Start Camera
        </button>
        
        <button 
          onClick={stopCamera}
          style={{
            padding: '10px 15px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Stop Camera
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Camera Status:</h3>
        <p><strong>Active:</strong> {cameraState.isActive ? 'Yes' : 'No'}</p>
        <p><strong>Has Permission:</strong> {cameraState.hasPermission ? 'Yes' : 'No'}</p>
        {cameraState.error && (
          <p style={{ color: 'red' }}>
            <strong>Error:</strong> {cameraState.error}
          </p>
        )}
      </div>
    </div>
  );
};

export default CameraTest;