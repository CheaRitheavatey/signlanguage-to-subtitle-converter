import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, Brain } from 'lucide-react';

export const SeaLionSettings = ({ apiKey, onUpdateApiKey, isInitialized }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleKeyChange = (value) => {
    setTempKey(value);
  };

  const handleSaveKey = () => {
    onUpdateApiKey(tempKey);
  };

  const toggleShowKey = () => {
    setShowKey(!showKey);
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 8));
  };

  return (
    <div className="api-key-settings">
      <div className="panel-header">
        <div className="panel-title">
          <Brain className="panel-icon" size={20} />
          <h3>Sea Lion AI Configuration</h3>
        </div>
        <div className="status-indicator">
          {apiKey ? (
            <CheckCircle size={16} className="status-success" />
          ) : (
            <AlertCircle size={16} className="status-warning" />
          )}
          <span className="status-text">
            {apiKey ? 'API Key Set' : 'No API Key'}
          </span>
        </div>
      </div>

      <div className="api-key-content">
        {/* Sea Lion AI API Key */}
        <div className="key-group">
          <label className="key-label">
            <span>Sea Lion AI API Key</span>
            <a 
              href="https://aisingapore.org/sea-lion/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="key-link"
            >
              Get API Key
            </a>
          </label>
          <div className="key-input-group">
            <input
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="sl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="key-input"
            />
            <button
              type="button"
              onClick={toggleShowKey}
              className="key-toggle"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {apiKey && (
            <div className="key-status">
              <CheckCircle size={14} className="status-icon-success" />
              <span>Key saved: {maskKey(apiKey)}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSaveKey}
          className="save-keys-btn"
          disabled={!tempKey}
        >
          Save API Key
        </button>

        <div className="api-info">
          <h4>Sea Lion AI Features</h4>
          <ul>
            <li><strong>Sentence Generation:</strong> Converts detected signs into fluent, natural sentences</li>
            <li><strong>Grammar Correction:</strong> Ensures proper grammar and sentence structure</li>
            <li><strong>Multi-language Support:</strong> Translates generated sentences to different languages</li>
            <li><strong>Context Awareness:</strong> Considers sign sequence and timing for better results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};