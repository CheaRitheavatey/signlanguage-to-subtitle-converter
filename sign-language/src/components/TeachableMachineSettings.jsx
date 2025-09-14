import React from 'react';
import { Brain, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const TeachableMachineSettings = ({ 
  isInitialized, 
  isProcessing, 
  modelInfo, 
  onInitializeModel 
}) => {
  return (
    <div className="api-key-settings">
      <div className="panel-header">
        <div className="panel-title">
          <Brain className="panel-icon" size={20} />
          <h3>Teachable Machine Model</h3>
        </div>
        <div className="status-indicator">
          {isInitialized ? (
            <CheckCircle size={16} className="status-success" />
          ) : (
            <AlertCircle size={16} className="status-warning" />
          )}
          <span className="status-text">
            {isProcessing ? 'Loading...' : (isInitialized ? 'Model Loaded' : 'Not Loaded')}
          </span>
        </div>
      </div>

      <div className="api-key-content">
        <div className="key-group">
          <label className="key-label">
            <span>Model Status</span>
          </label>
          
          {isInitialized && modelInfo ? (
            <div className="model-info">
              <div className="key-status">
                <CheckCircle size={14} className="status-icon-success" />
                <span>Model successfully loaded</span>
              </div>
              <div className="model-details">
                <p><strong>Input Shape:</strong> {JSON.stringify(modelInfo.inputShape)}</p>
                <p><strong>Output Shape:</strong> {JSON.stringify(modelInfo.outputShape)}</p>
              </div>
            </div>
          ) : (
            <div className="model-error">
              <AlertCircle size={14} className="status-warning" />
              <span>Model not loaded. Make sure model files are in public/models/</span>
            </div>
          )}
        </div>

        <button
          onClick={onInitializeModel}
          className="save-keys-btn"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Loading Model...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              {isInitialized ? 'Reload Model' : 'Load Model'}
            </>
          )}
        </button>

        <div className="api-info">
          <h4>Model Requirements</h4>
          <ul>
            <li><strong>Location:</strong> Place your model files in <code>public/models/</code></li>
            <li><strong>Required Files:</strong> model.json, weights.bin, metadata.json</li>
            <li><strong>Format:</strong> Google Teachable Machine exported model</li>
            <li><strong>Input:</strong> 224x224 RGB images</li>
          </ul>
        </div>
      </div>
    </div>
  );
};