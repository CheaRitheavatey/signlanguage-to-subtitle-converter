import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Camera, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { VideoPlayer } from './components/VideoPlayer';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import { DetectionPanel } from './components/DetectionPanel';
import { SettingPanel } from './components/SettingPanel';
import { SubtitleHistory } from './components/SubtitleHistory';
// import { MediaPipeSettings } from './components/MediaPipeSettings';
// import { AboutPage } from './components/AboutPage';
import { useCamera } from './hooks/useCamera';
import { useSignDetection } from './hooks/useSignDetection';
import { useSubtitles } from './hooks/useSubtitles';
import { DEFAULT_SETTINGS } from './types';
import BackendBridge from './components/BackendBridge';

function App() {

const [useBackend, setUseBackend] = useState(false); // toggle: false = client-side, true = backend
const [backendDetectedSigns, setBackendDetectedSigns] = useState([]);
const [backendCurrentGesture, setBackendCurrentGesture] = useState(null);
const [backendRunning, setBackendRunning] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState('main'); // 'main' or 'about'
  const videoContainerRef = useRef(null);
  
  const { cameraState, videoRef, startCamera, stopCamera } = useCamera();
  const { 
    isInitialized,
    detectedSigns, 
    currentGesture,
    isDetecting, 
    isProcessing,
    canvasRef,
    startDetection, 
    stopDetection, 
    clearDetections, 
    translateSign,
    initializeMediaPipe
  } = useSignDetection(settings);
  const { subtitles, currentSubtitle, processSignsToText, exportSRT, clearSubtitles } = useSubtitles(settings);

//   useEffect(() => {
//     processSignsToText(detectedSigns, translateSign);
//   }, [detectedSigns, processSignsToText, translateSign]);

useEffect(() => {
  const source = useBackend ? backendDetectedSigns : detectedSigns;
  processSignsToText(source, translateSign);
}, [useBackend, detectedSigns, backendDetectedSigns, processSignsToText, translateSign]);


// handle backend priction
const handleBackendPrediction = (res) => {
  const now = Date.now();
  const newSign = {
    id: `${res.word}-${now}`,
    sign: res.word,
    confidence: res.confidence ?? 0,
    timestamp: now,
    category: null
  };
  // append and keep last N (avoid memory growth)
  setBackendDetectedSigns(prev => {
    const arr = [...prev, newSign];
    return arr.slice(-200);
  });
  setBackendCurrentGesture({ name: res.word, confidence: res.confidence ?? 0 });
};



  const handleStartDetection = async () => {
    if (isLiveMode && !cameraState.isActive) {
      await startCamera();
      // delay a bit to have frame
      await new Promise(r => setTimeout(r,600));
    } 
    
    if (useBackend) {
        setBackendDetectedSigns([]);
        setBackendCurrentGesture(null);
        setBackendRunning(true);
    }
    else {
        if (isLiveMode && videoRef.current) {
      startDetection(videoRef.current);
    } else {
      startDetection();
    }
     }
  };

  const handleStopDetection = () => {
  if (useBackend) {
    setBackendRunning(false);
    if (isLiveMode) stopCamera();
  } else {
    stopDetection();
    if (isLiveMode) stopCamera();
  }
};

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Handle page navigation
//   if (currentPage === 'about') {
//     return <AboutPage onBackToMain={() => setCurrentPage('main')} />;
//   }

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
              <p className="app-subtitle">Real-time ASL detection with MediaPipe</p>
            </div>
          </div>
          
          <div className="header-actions">
            {/* testing this button */}
            <button
                onClick={() => setUseBackend(u => !u)}
                className={`header-btn ${useBackend ? 'active' : ''}`}
                >
                {useBackend ? 'Backend' : 'Client'}
            </button>

            
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
              onClick={() => setCurrentPage('about')}
              className="header-btn demo-btn"
            >
              <Play size={16} />
              <span>Video Demo</span>
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
                disabled={!isInitialized}
              >
                <Play size={16} />
                <span>{isInitialized ? 'Start Detection' : 'Loading MediaPipe...'}</span>
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

              {/* connect with python */}
              <BackendBridge
                videoRef={videoRef}
                running={backendRunning}
                onPrediction={handleBackendPrediction}
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
            
            {/* <MediaPipeSettings
              isInitialized={isInitialized}
              isProcessing={isProcessing}
              onInitialize={initializeMediaPipe}
            /> */}
            
            <DetectionPanel
              detectedSigns={useBackend ? backendDetectedSigns : detectedSigns}
              currentGesture={useBackend ? backendCurrentGesture : currentGesture}
              isDetecting={isDetecting || backendRunning}
              isInitialized={isInitialized}
              isProcessing={isProcessing}
              settings={settings}
              translateSign={translateSign}
            />
            
            <SubtitleHistory
              subtitles={useBackend ? backendDetectedSigns : subtitles}
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