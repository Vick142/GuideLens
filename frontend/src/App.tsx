import React, { useState, useEffect } from 'react'
import { useCamera, useSpeech, useDetection } from './hooks'
import CameraView from './components/CameraView'
import DetectionResults from './components/DetectionResults'
import GuidancePanel from './components/GuidancePanel'
import { captureFrame } from './utils/camera'
import './App.css'

/**
 * Main App Component
 * Orchestrates camera, speech, and detection for blind navigation
 */
function App() {
  const { videoRef, isRunning, error: cameraError, start: startCamera, stop: stopCamera } = useCamera()
  const {
    isMuted,
    isListening,
    speechSupported,
    voiceSupported,
    sayText,
    stopTalkingNow,
    startListening,
    stopListening,
    toggleMute,
  } = useSpeech()

  const { detectionResult, isDetecting, detectionError, analyzeFrame, clearResults } = useDetection()

  // Search/guidance state
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasAutoExplained, setHasAutoExplained] = useState(false)

  // Auto-explain scene when camera starts
  useEffect(() => {
    if (isRunning && !hasAutoExplained && !isDetecting) {
      // Wait a moment for camera to stabilize
      const timeout = setTimeout(async () => {
        if (!isMuted) {
          sayText('Camera started. Analyzing scene...')
        }
        const success = await analyzeFrame(videoRef.current)
        setHasAutoExplained(true)
      }, 1500)

      return () => clearTimeout(timeout)
    }
  }, [isRunning, hasAutoExplained, isDetecting, isMuted, sayText, analyzeFrame, videoRef])

  // Auto-announce results
  useEffect(() => {
    if (detectionResult && detectionResult.success && detectionResult.description && !isMuted) {
      sayText(detectionResult.description)
    }
  }, [detectionResult, isMuted, sayText])

  // Handle camera start
  const handleStartCamera = async () => {
    await startCamera()
    if (!cameraError) {
      setHasAutoExplained(false)
      if (!isMuted) {
        sayText('Camera is now active.')
      }
    }
  }

  // Handle camera stop
  const handleStopCamera = () => {
    stopCamera()
    stopTalkingNow()
    clearResults()
    setHasAutoExplained(false)
    if (!isMuted) {
      sayText('Camera stopped.')
    }
  }

  // Handle scene analysis
  const handleAnalyzeScene = async () => {
    if (!isRunning || !videoRef.current) return

    setIsSearching(true)
    try {
      const success = await analyzeFrame(videoRef.current)
      if (success && !isMuted) {
        sayText('Scene analyzed.')
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search for object
  const handleSearch = async (target: string) => {
    if (!target.trim() || !isRunning || !videoRef.current) return

    setIsSearching(true)
    try {
      const success = await analyzeFrame(videoRef.current)
      if (success && detectionResult?.objects) {
        setTimeout(() => {
          if (!isMuted) {
            sayText(`Searching for ${target}.`)
          }
        }, 500)
      }
    } finally {
      setIsSearching(false)
    }
  }

  // Handle voice input
  const handleVoiceStart = () => {
    startListening((text) => {
      setSearchText(text)
      if (!isMuted) {
        sayText(`You said: ${text}.`)
      }
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GuideLens</h1>
        <p className="subtitle">AI-Powered Vision Navigation</p>

        <div className="header-status">
          <div className="status-indicator">
            <span className={`status-dot ${isRunning ? 'active' : ''}`}></span>
            <span>{isRunning ? 'Camera Active' : 'Camera Ready'}</span>
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${!isMuted ? 'active' : ''}`}></span>
            <span>{!isMuted ? 'Audio On' : 'Audio Off'}</span>
          </div>
        </div>

        <div className="header-controls">
          <button
            onClick={isRunning ? handleStopCamera : handleStartCamera}
            className={`icon-btn ${isRunning ? 'danger' : 'success'}`}
            title={isRunning ? 'Stop camera immediately' : 'Start camera'}
            aria-label={isRunning ? 'Emergency stop: halts camera and audio' : 'Start camera to begin navigation'}
            aria-pressed={isRunning}
          >
            {isRunning ? '⏹️' : '▶️'}
          </button>

          <button
            onClick={toggleMute}
            className={`icon-btn ${isMuted ? 'muted' : ''}`}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isMuted ? 'Audio is muted. Click to unmute' : 'Audio is enabled. Click to mute'}
            aria-pressed={isMuted}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {cameraError && (
          <div className="alert error" role="alert">
            <strong>📹 Camera Error:</strong> {cameraError}
          </div>
        )}

        {detectionError && (
          <div className="alert warning" role="alert">
            <strong>⚠️ Detection Error:</strong> {detectionError}
          </div>
        )}

        <div className="content-section">
          <CameraView
            videoRef={videoRef}
            isRunning={isRunning}
            onStartClick={handleStartCamera}
            onStopClick={handleStopCamera}
            error={cameraError}
          />
        </div>

        {isRunning && (
          <>
            <div className="content-section">
              <DetectionResults
                result={detectionResult}
                isDetecting={isDetecting}
                onAnalyzeClick={handleAnalyzeScene}
                error={detectionError}
              />
            </div>

            <div className="content-section">
              <GuidancePanel
                detectionResult={detectionResult}
                isSearching={isSearching}
                onSearchChange={setSearchText}
                onVoiceStart={handleVoiceStart}
                onVoiceStop={stopListening}
                isListening={isListening}
                searchText={searchText}
                voiceSupported={voiceSupported}
              />
            </div>
          </>
        )}

        {!isRunning && (
          <div className="alert info text-center">
            <h3>Ready to Navigate</h3>
            <p>Click the camera button to begin. The scene will be automatically explained.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>GuideLens v0.1.0 • Built for accessibility</p>
      </footer>
    </div>
  )
}

export default App
