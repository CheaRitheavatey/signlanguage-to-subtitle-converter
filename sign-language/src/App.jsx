import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Camera, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import { DetectionPanel } from './components/DetectionPanel';
import { SettingPanel } from './components/SettingPanel';
import { SubtitleHistory } from './components/SubtitleHistory';
import { SeaLionSettings } from './components/SeaLionSettings';
import { TeachableMachineSettings } from './components/TeachableMachineSettings';
import { useCamera } from './hooks/useCamera'; // Import from the correct location
import { useSignDetection } from './hooks/useSignDetection';
import { useSubtitles } from './hooks/useSubtitles';
import { DEFAULT_SETTINGS } from './types';
import CameraTest from './components/CameraTest';

function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState('main');
  const videoContainerRef = useRef(null);
  
  // Use the camera hook (make sure it's imported from './hooks/useCamera')
  const { cameraState, videoRef, startCamera, stopCamera } = useCamera();
  const { 
    isInitialized,
    detectedSigns, 
    currentGesture,
    isDetecting, 
    isProcessing,
    canvasRef,
    detectionMode,
    setDetectionMode,
    apiKey,
    updateApiKey,
    modelInfo,
    initializeTeachableModel,
    startDetection, 
    stopDetection, 
    clearDetections, 
    translateSign,
    processSignsToSentence
  } = useSignDetection(settings);
  const { subtitles, currentSubtitle, processSignsToText, exportSRT, clearSubtitles } = useSubtitles(settings);

  useEffect(() => {
    processSignsToText(detectedSigns, translateSign);
  }, [detectedSigns, processSignsToText, translateSign]);

  useEffect(() => {
  console.log('Camera state changed:', cameraState);
  if (videoRef.current) {
    console.log('Video element:', videoRef.current);
    console.log('Video readyState:', videoRef.current.readyState);
    console.log('Video srcObject:', videoRef.current.srcObject);
  }
}, [cameraState, videoRef]);

  const handleStartDetection = async () => {
    if (isLiveMode && !cameraState.isActive) {
      await startCamera();
      setTimeout(() => {
        if (videoRef.current) {
          startDetection(videoRef.current);
        }
      }, 1000);
    } else if (isLiveMode && videoRef.current) {
      startDetection(videoRef.current);
    } else {
      startDetection();
    }
  };

  const handleStopDetection = () => {
    stopDetection();
    if (isLiveMode) {
      stopCamera();
    }
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // For testing: Use CameraTest instead of the full app
  const [testMode, setTestMode] = useState(true); // Set to true for testing camera

  if (testMode) {
    return (
      <div className={`app ${settings.theme}`}>
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <div className="app-logo">
                <Camera size={20} />
              </div>
              <div className="app-info">
                <h1 className="app-title">Camera Test Mode</h1>
                <p className="app-subtitle">Testing camera functionality</p>
              </div>
            </div>
            <button
              onClick={() => setTestMode(false)}
              className="header-btn"
            >
              Back to Main App
            </button>
          </div>
        </header>
        <CameraTest />
      </div>
    );
  }

  return (
    <div className={`app ${settings.theme}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-logo">
              <Camera size={20} />
            </div>
            <div className="app-info">
              <h1 className="app-title">Sign Language Converter</h1>
              <p className="app-subtitle">Real-time ASL to subtitle conversion</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={toggleTheme}
              className="header-btn theme-btn"
            >
              {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`header-btn settings-btn ${showSettings ? 'active' : ''}`}
            >
              <SettingsIcon size={20} />
            </button>
            
            <button
              onClick={() => setTestMode(true)}
              className="header-btn"
            >
              Test Camera
            </button>
            
            {isDetecting ? (
              <button
                onClick={handleStopDetection}
                className="header-btn stop-btn"
              >
                <Square size={16} />
                <span>Stop Detection</span>
              </button>
            ) : (
              <button
                onClick={handleStartDetection}
                className="header-btn start-btn"
              >
                <Play size={16} />
                <span>Start Detection</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="main-grid">
          {/* Video Section */}
          <div className="video-section">
            <div ref={videoContainerRef} className="video-wrapper">
              <VideoPlayer
                isLiveMode={isLiveMode}
                onModeChange={setIsLiveMode}
                cameraRef={videoRef}
                canvasRef={canvasRef}
              />
              
              <SubtitleOverlay
                currentSubtitle={currentSubtitle}
                settings={settings}
                containerRef={videoContainerRef}
              />
            </div>
            
            {cameraState.error && (
              <div className="error-message">
                <p>
                  <strong>Camera Error:</strong> {cameraState.error}
                </p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="sidebar">
            {showSettings && (
              <SettingPanel
                settings={settings}
                onSettingsChange={setSettings}
              />
            )}
            
            {detectionMode === 'basic' && (
              <SeaLionSettings
                apiKey={apiKey}
                onUpdateApiKey={updateApiKey}
                isInitialized={isInitialized}
              />
            )}
            
            {detectionMode === 'teachable' && (
              <TeachableMachineSettings
                isInitialized={isInitialized}
                isProcessing={isProcessing}
                modelInfo={modelInfo}
                onInitializeModel={initializeTeachableModel}
              />
            )}
            
            <DetectionPanel
              detectedSigns={detectedSigns}
              currentGesture={currentGesture}
              isDetecting={isDetecting}
              isInitialized={isInitialized}
              isProcessing={isProcessing}
              detectionMode={detectionMode}
              onModeChange={setDetectionMode}
              settings={settings}
              translateSign={translateSign}
            />
            
            <SubtitleHistory
              subtitles={subtitles}
              onExportSRT={exportSRT}
              onClearHistory={clearSubtitles}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;