import React from 'react';
import { FileText, Download, Trash2, Clock } from 'lucide-react';

export const SubtitleHistory = ({
  subtitles,
  onExportSRT,
  onClearHistory,
}) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="subtitle-history">
      <div className="panel-header">
        <div className="panel-title">
          <FileText className="panel-icon" size={20} />
          <h3>Subtitle History</h3>
        </div>
        
        <div className="history-actions">
          <button
            onClick={onExportSRT}
            disabled={subtitles.length === 0}
            className="action-btn export-btn"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={onClearHistory}
            disabled={subtitles.length === 0}
            className="action-btn clear-btn"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="history-list">
        {subtitles.map((subtitle, index) => (
          <div key={`${subtitle.id || subtitle.timestamp}-${index}`} className="history-item">
            <div className="item-content">
              <p className="item-text">{subtitle.text}</p>
              <div className="item-meta">
                <Clock size={12} className="meta-icon" />
                <span className="item-time">
                  {formatTime(subtitle.startTime)}
                </span>
                <span className="item-confidence">
                  {Math.round(subtitle.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {subtitles.length === 0 && (
          <div className="empty-state">
            <FileText size={32} className="empty-icon" />
            <p className="empty-title">No subtitles generated yet</p>
            <p className="empty-subtitle">Detected signs will appear here</p>
          </div>
        )}
      </div>
      
      {subtitles.length > 0 && (
        <div className="history-footer">
          <p className="history-count">
            {subtitles.length} subtitle{subtitles.length !== 1 ? 's' : ''} generated
          </p>
        </div>
      )}
    </div>
  );
};