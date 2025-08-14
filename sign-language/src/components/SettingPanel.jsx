import React from 'react';
import { Settings, Globe, Type, Monitor, Eye, Sliders } from 'lucide-react';

export const SettingPanel = ({
  settings,
  onSettingsChange,
}) => {
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <Settings className="panel-icon" size={20} />
        <h3>Settings</h3>
      </div>
      
      <div className="settings-content">
        {/* Language Settings */}
        <div className="setting-group">
          <div className="setting-label">
            <Globe size={16} className="setting-icon" />
            <label>Output Language</label>
          </div>
          <select
            value={settings.language}
            onChange={(e) => updateSetting('language', e.target.value)}
            className="setting-select"
          >
            <option value="english">English</option>
            <option value="spanish">Español</option>
            <option value="khmer">ខ្មែរ</option>
          </select>
        </div>
        
        {/* Model Selection */}
        <div className="setting-group">
          <div className="setting-label">
            <Monitor size={16} className="setting-icon" />
            <label>Detection Model</label>
          </div>
          <select
            value={settings.modelType}
            onChange={(e) => updateSetting('modelType', e.target.value)}
            className="setting-select"
          >
            <option value="basic">Basic ASL</option>
            <option value="advanced">Advanced ASL</option>
            <option value="multilingual">Multilingual</option>
          </select>
        </div>
        
        {/* Subtitle Position */}
        <div className="setting-group">
          <div className="setting-label">
            <Type size={16} className="setting-icon" />
            <label>Subtitle Position</label>
          </div>
          <div className="button-group">
            {['top', 'center', 'bottom'].map((position) => (
              <button
                key={position}
                onClick={() => updateSetting('subtitlePosition', position)}
                className={`group-btn ${settings.subtitlePosition === position ? 'active' : ''}`}
              >
                {position.charAt(0).toUpperCase() + position.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Subtitle Size */}
        <div className="setting-group">
          <div className="setting-label">
            <Type size={16} className="setting-icon" />
            <label>Subtitle Size</label>
          </div>
          <div className="button-group">
            {['small', 'medium', 'large'].map((size) => (
              <button
                key={size}
                onClick={() => updateSetting('subtitleSize', size)}
                className={`group-btn ${settings.subtitleSize === size ? 'active' : ''}`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Confidence Settings */}
        <div className="setting-group">
          <div className="setting-label">
            <Sliders size={16} className="setting-icon" />
            <label>Min Confidence: {Math.round(settings.minConfidence * 100)}%</label>
          </div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={settings.minConfidence}
            onChange={(e) => updateSetting('minConfidence', parseFloat(e.target.value))}
            className="setting-range"
          />
        </div>
        
        {/* Toggle Settings */}
        <div className="setting-group">
          <div className="toggle-setting">
            <div className="toggle-label">
              <Eye size={16} className="setting-icon" />
              <span>Show Confidence Scores</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.showConfidence}
                onChange={(e) => updateSetting('showConfidence', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};