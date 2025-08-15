import React, { useState } from 'react';
import { Eye, TrendingUp, Activity, Brain, Cpu, Loader, Circle, Video } from 'lucide-react';
import About from './About';

export const DetectionPanel = ({
  detectedSigns,
  currentGesture,
  isDetecting,
  isInitialized,
  isProcessing,
  detectionMode,
  onModeChange,
  settings,
  translateSign,
}) => {
  const recentSigns = detectedSigns.slice(-5);
  const [showAbout, setShowAbout] = useState(false);
  const getStatusText = () => {
    if (!isInitialized) return 'Initializing...';
    if (isProcessing) return 'Processing...';
    if (isDetecting) return 'Active';
    return 'Inactive';
  };

  return (
    <div className="detection-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Eye className="panel-icon" size={20} />
          <h3>Sign Detection</h3>
        </div>
        
        <div className="status-indicator">
          <div className={`status-dot ${isDetecting ? 'active' : ''} ${isProcessing ? 'processing' : ''}`} />
          <span className="status-text">
            {getStatusText()}
          </span>
          {isProcessing && <Loader size={14} className="status-spinner" />}
        </div>
      </div>
      
      {/* Detection Mode Selector */}
      <div className="detection-mode">
        <label className="mode-label">Detection Method:</label>
        <div className="mode-buttons">
          <button
            onClick={() => onModeChange('mediapipe')}
            className={`mode-btn ${detectionMode === 'mediapipe' ? 'active' : ''}`}
          >
            <Cpu size={16} />
            <span>MediaPipe</span>
          </button>
          <button
            onClick={() => onModeChange('basic')}
            className={`mode-btn ${detectionMode === 'basic' ? 'active' : ''}`}
          >
            <Brain size={16} />
            <span>Basic + AI</span>
          </button>
          <button
            onClick={() => setShowAbout(!showAbout)}
            className={`mode-btn ${showAbout ? 'active' : ''}`}
          >
            <Circle size={16} />
            <span>Video Demo</span>
          </button>
        </div>
      </div>
      {showAbout && <About/>}
      {/* Current Gesture Display */}
      {currentGesture && isDetecting && (
        <div className="current-gesture">
          <div className="gesture-info">
            <Activity className="gesture-icon" size={16} />
            <span className="gesture-name">
              Current: {detectionMode === 'basic' ? currentGesture.name : translateSign(currentGesture.name)}
            </span>
            {settings.showConfidence && (
              <span className="confidence-score">
                {Math.round(currentGesture.confidence * 100)}%
              </span>
            )}
            {currentGesture.category && (
              <span className="gesture-category">
                ({currentGesture.category})
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="signs-list">
        {recentSigns.map((sign) => (
          <div key={sign.id} className="sign-item">
            <div className="sign-content">
              <div className="sign-names">
                <span className="sign-translated">
                  {sign.isSentence ? sign.sign : (detectionMode === 'basic' ? sign.sign : translateSign(sign.sign))}
                </span>
                {!sign.isSentence && detectionMode !== 'basic' && sign.sign !== translateSign(sign.sign) && (
                  <span className="sign-original">
                    ({sign.sign})
                  </span>
                )}
                {sign.category && (
                  <span className="sign-category">
                    [{sign.category}]
                  </span>
                )}
              </div>
              <div className="sign-timestamp">
                {new Date(sign.timestamp).toLocaleTimeString()}
              </div>
              {sign.originalSigns && (
                <div className="original-signs">
                  <small>From: {sign.originalSigns.join(', ')}</small>
                </div>
              )}
            </div>
            
            {settings.showConfidence && (
              <div className="sign-confidence">
                <TrendingUp size={14} className="confidence-icon" />
                <span className="confidence-value">
                  {Math.round(sign.confidence * 100)}%
                </span>
              </div>
            )}
          </div>
        ))}
        
        {recentSigns.length === 0 && (
          <div className="empty-state">
            <Eye size={32} className="empty-icon" />
            <p className="empty-title">
              {!isInitialized ? `Initializing ${detectionMode === 'basic' ? 'Basic Detection' : 'MediaPipe'}...` : 'No signs detected yet'}
            </p>
            <p className="empty-subtitle">
              {!isInitialized ? 
                (detectionMode === 'basic' ? 'Basic detection ready' : 'Please wait...') : 
                'Start detection to see results'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};