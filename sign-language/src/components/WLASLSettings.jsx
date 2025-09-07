import React, { useState, useEffect } from 'react';
import { Database, Video, List, AlertCircle, CheckCircle } from 'lucide-react';

export const WLASLSettings = ({ isInitialized, onDatasetLoad }) => {
  const [datasetInfo, setDatasetInfo] = useState(null);
  const [sampleVideos, setSampleVideos] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'YOUR_CLOUD_RUN_URL/api'  // Replace with your actual Cloud Run URL
    : 'http://localhost:8080/api';

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setConnectionStatus('connected');
        await loadDatasetInfo();
      } else {
        setConnectionStatus('error');
        setError('Failed to connect to WLASL service');
      }
    } catch (err) {
      setConnectionStatus('error');
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDatasetInfo = async () => {
    try {
      // Load dataset information
      const infoResponse = await fetch(`${API_BASE_URL}/dataset-info`);
      const info = await infoResponse.json();
      setDatasetInfo(info);

      // Load sample words
      const wordsResponse = await fetch(`${API_BASE_URL}/words`);
      const wordsData = await wordsResponse.json();
      setWords(wordsData.words.slice(0, 50)); // First 50 words

      // Load sample videos
      const videosResponse = await fetch(`${API_BASE_URL}/sample-videos?limit=6`);
      const videosData = await videosResponse.json();
      setSampleVideos(videosData.videos);

      // Notify parent component that dataset is loaded
      if (onDatasetLoad) {
        onDatasetLoad({
          info,
          words: wordsData.words,
          totalVideos: info.totalVideos
        });
      }
    } catch (err) {
      setError(`Failed to load dataset: ${err.message}`);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected to WLASL Dataset';
      case 'error':
        return 'Connection Failed';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="wlasl-settings">
      <div className="settings-section">
        <h3 className="section-title">
          <Database size={18} />
          WLASL Dataset
        </h3>

        {/* Connection Status */}
        <div className="connection-status">
          <div className={`status-indicator ${connectionStatus}`}>
            {getStatusIcon()}
            <span className="status-text">{getStatusText()}</span>
          </div>
          
          {connectionStatus === 'error' && (
            <button 
              onClick={checkConnection}
              className="retry-btn"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Retry Connection'}
            </button>
          )}
        </div>

        {/* Dataset Information */}
        {datasetInfo && (
          <div className="dataset-info">
            <div className="info-grid">
              <div className="info-item">
                <Video size={16} />
                <span className="info-label">Videos:</span>
                <span className="info-value">{datasetInfo.totalVideos?.toLocaleString()}</span>
              </div>
              
              <div className="info-item">
                <List size={16} />
                <span className="info-label">Words:</span>
                <span className="info-value">{datasetInfo.totalWords?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sample Words */}
        {words.length > 0 && (
          <div className="sample-section">
            <h4 className="sample-title">Available Words (Sample)</h4>
            <div className="word-tags">
              {words.slice(0, 20).map((word, index) => (
                <span key={index} className="word-tag">
                  {word}
                </span>
              ))}
              {words.length > 20 && (
                <span className="word-tag more">
                  +{words.length - 20} more...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sample Videos */}
        {sampleVideos.length > 0 && (
          <div className="sample-section">
            <h4 className="sample-title">Sample Videos</h4>
            <div className="video-grid">
              {sampleVideos.slice(0, 4).map((video) => (
                <div key={video.id} className="video-sample">
                  <video 
                    width="120" 
                    height="90" 
                    controls
                    muted
                    preload="metadata"
                  >
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p className="video-id">ID: {video.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-display">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <p className="instruction-text">
            The WLASL dataset contains over 11,000 videos of American Sign Language words. 
            Make sure your backend server is running to access the dataset.
          </p>
        </div>
      </div>

      <style jsx>{`
        .wlasl-settings {
          background: var(--panel-bg);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .connection-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          background: var(--input-bg);
        }

        .status-indicator.connected {
          background: #dcfce7;
          color: #166534;
        }

        .status-indicator.error {
          background: #fef2f2;
          color: #dc2626;
        }

        .retry-btn {
          padding: 6px 12px;
          background: var(--accent-color);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .retry-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .dataset-info {
          background: var(--input-bg);
          border-radius: 6px;
          padding: 12px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }

        .info-label {
          color: var(--text-secondary);
        }

        .info-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .sample-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sample-title {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary);
          margin: 0;
        }

        .word-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .word-tag {
          background: var(--accent-color);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .word-tag.more {
          background: var(--text-secondary);
        }

        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .video-sample {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .video-sample video {
          border-radius: 4px;
          background: #000;
        }

        .video-id {
          font-size: 10px;
          color: var(--text-secondary);
          margin: 0;
        }

        .error-display {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          background: #fef2f2;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
        }

        .instructions {
          background: var(--input-bg);
          padding: 12px;
          border-radius: 6px;
        }

        .instruction-text {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }
      `}</style>
    </div>
  );
};