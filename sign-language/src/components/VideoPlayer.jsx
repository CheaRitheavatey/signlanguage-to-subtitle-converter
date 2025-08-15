import React, { useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Upload, RotateCcw } from 'lucide-react';

export const VideoPlayer = ({
  isLiveMode,
  onModeChange,
  cameraRef,
  canvasRef,
  onVideoLoad,
}) => {
  const fileInputRef = useRef(null);
  const videoFileRef = useRef(null);
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
  });

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file && videoFileRef.current) {
      const url = URL.createObjectURL(file);
      videoFileRef.current.src = url;
      videoFileRef.current.load();
      onModeChange(false);
      if (onVideoLoad) {
        onVideoLoad(videoFileRef.current);
      }
    }
  }, [onModeChange, onVideoLoad]);

  const togglePlayPause = useCallback(() => {
    if (videoFileRef.current) {
      if (videoState.isPlaying) {
        videoFileRef.current.pause();
      } else {
        videoFileRef.current.play();
      }
    }
  }, [videoState.isPlaying]);

  const handleVolumeChange = useCallback((event) => {
    const volume = parseFloat(event.target.value);
    setVideoState(prev => ({ ...prev, volume }));
    if (videoFileRef.current) {
      videoFileRef.current.volume = volume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setVideoState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    if (videoFileRef.current) {
      videoFileRef.current.muted = !videoState.isMuted;
    }
  }, [videoState.isMuted]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player">
      <div className="video-container">
        {isLiveMode ? (
          <>
            <video
              ref={cameraRef}
              autoPlay
              muted
              playsInline
              style={{width: '100%', height: 'auto', background: '#FFFFFF'}}
              className={canvasRef ? "video-hidden" : "video-element"}
            />
            {canvasRef && (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="video-canvas"
              />
            )}
          </>
        ) : (
          <video
            ref={videoFileRef}
            className="video-element"
            onLoadedMetadata={() => {
              if (videoFileRef.current) {
                setVideoState(prev => ({
                  ...prev,
                  duration: videoFileRef.current.duration,
                }));
              }
            }}
            onTimeUpdate={() => {
              if (videoFileRef.current) {
                setVideoState(prev => ({
                  ...prev,
                  currentTime: videoFileRef.current.currentTime,
                }));
              }
            }}
            onPlay={() => setVideoState(prev => ({ ...prev, isPlaying: true }))}
            onPause={() => setVideoState(prev => ({ ...prev, isPlaying: false }))}
          />
        )}
        
        {/* Video overlay indicator */}
        <div className="video-indicator">
          <div className={`indicator-badge ${isLiveMode ? 'live' : 'video'}`}>
            {isLiveMode ? '🔴 LIVE' : '📹 VIDEO'}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="video-controls">
        <div className="controls-main">
          <div className="controls-left">
            <button
              onClick={() => {
                onModeChange(true);
                if (videoFileRef.current) {
                  videoFileRef.current.pause();
                }
              }}
              className={`control-btn ${isLiveMode ? 'active-live' : ''}`}
            >
              <RotateCcw size={20} />
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`control-btn ${!isLiveMode ? 'active-video' : ''}`}
            >
              <Upload size={20} />
            </button>
            
            {!isLiveMode && (
              <button
                onClick={togglePlayPause}
                className="control-btn play-btn"
              >
                {videoState.isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            )}
          </div>
          
          {!isLiveMode && (
            <div className="controls-right">
              <span className="time-display">
                {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
              </span>
              
              <div className="volume-controls">
                <button onClick={toggleMute} className="volume-btn">
                  {videoState.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={videoState.volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </div>
          )}
        </div>
        
        {!isLiveMode && videoState.duration > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(videoState.currentTime / videoState.duration) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="file-input"
      />
    </div>
  );
};