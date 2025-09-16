import React from 'react';
import { Eye, TrendingUp, Activity, Loader, Hand } from 'lucide-react';

export const DetectionPanel = ({
  detectedSigns,
  currentGesture,
  isDetecting,
  isInitialized,
  isProcessing,
  settings,
  translateSign,
}) => {
  const recentSigns = detectedSigns.slice(-5);
  
  const getStatusText = () => {
    if (!isInitialized) return 'Loading MediaPipe...';
    if (isProcessing) return 'Processing...';
    if (isDetecting) return 'Active';
    return 'Inactive';
  };

  return (
    <div className="detection-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Hand className="panel-icon" size={20} />
          <h3>Hand Detection</h3>
        </div>
        
        <div className="status-indicator">
          <div className={`status-dot ${isDetecting ? 'active' : ''} ${isProcessing ? 'processing' : ''}`} />
          <span className="status-text">
            {getStatusText()}
          </span>
          {isProcessing && <Loader size={14} className="status-spinner" />}
        </div>
      </div>
      
      {/* Current Gesture Display */}
      {currentGesture && isDetecting && (
        <div className="current-gesture">
          <div className="gesture-info">
            <Activity className="gesture-icon" size={16} />
            <span className="gesture-name">
              Current: {translateSign(currentGesture.name)}
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
                  {translateSign(sign.sign)}
                </span>
                {sign.sign !== translateSign(sign.sign) && (
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
              {!isInitialized ? 'Loading MediaPipe...' : 'No signs detected yet'}
            </p>
            <p className="empty-subtitle">
              {!isInitialized ? 
                'Please wait while MediaPipe loads...' : 
                'Start detection to see hand gestures'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};