import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle, BookOpen, BarChart3 } from 'lucide-react';

export const WLASLSettings = ({ apiKey, onUpdateApiKey, isInitialized, getVocabularyInfo }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [showVocabStats, setShowVocabStats] = useState(false);

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

  const vocabularyStats = getVocabularyInfo ? getVocabularyInfo() : null;

  return (
    <div className="api-key-settings">
      <div className="panel-header">
        <div className="panel-title">
          <BookOpen className="panel-icon" size={20} />
          <h3>WLASL Configuration</h3>
        </div>
        <div className="status-indicator">
          {isInitialized ? (
            <CheckCircle size={16} className="status-success" />
          ) : (
            <AlertCircle size={16} className="status-warning" />
          )}
          <span className="status-text">
            {isInitialized ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>

      <div className="api-key-content">
        {/* Hugging Face API Key */}
        <div className="key-group">
          <label className="key-label">
            <span>Hugging Face API Key</span>
            <a 
              href="https://huggingface.co/settings/tokens" 
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
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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

        {/* WLASL Information */}
        <div className="api-info">
          <div className="info-header">
            <h4>WLASL Dataset Information</h4>
            <button
              onClick={() => setShowVocabStats(!showVocabStats)}
              className="vocab-toggle-btn"
            >
              <BarChart3 size={16} />
              {showVocabStats ? 'Hide' : 'Show'} Stats
            </button>
          </div>
          
          <ul>
            <li><strong>Dataset:</strong> Word-Level American Sign Language (WLASL)</li>
            <li><strong>Coverage:</strong> 2000+ common ASL words and phrases</li>
            <li><strong>Categories:</strong> Greetings, family, emotions, actions, colors, numbers</li>
            <li><strong>Processing:</strong> Real-time frame classification with sentence generation</li>
          </ul>

          {showVocabStats && vocabularyStats && (
            <div className="vocab-stats">
              <h5>Vocabulary Statistics</h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Words:</span>
                  <span className="stat-value">{vocabularyStats.totalWords}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Categories:</span>
                  <span className="stat-value">{vocabularyStats.categories}</span>
                </div>
              </div>
              
              <div className="category-breakdown">
                <h6>Category Breakdown:</h6>
                {vocabularyStats.categoryBreakdown.map(({ category, count }) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}:</span>
                    <span className="category-count">{count} words</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};