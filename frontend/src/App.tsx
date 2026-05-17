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
      if (!isMuted) {
        sayText('Camera is now active. Point at your surroundings.')
      }
    }
  }

  // Handle camera stop
  const handleStopCamera = () => {
    stopCamera()
    stopTalkingNow()
    clearResults()
    if (!isMuted) {
      sayText('Camera and audio have stopped.')
    }
  }

  // Handle scene analysis
  const handleAnalyzeScene = async () => {
    if (!isRunning || !videoRef.current) return

    setIsSearching(true)
    try {
      const success = await analyzeFrame(videoRef.current)
      if (success && !isMuted) {
        sayText('Scene analysis complete.')
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
        // Delay guidance generation so it comes after scene analysis
        setTimeout(() => {
          if (!isMuted) {
            // The GuidancePanel will generate the proper guidance text
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
        sayText(`You said: ${text}. Now searching.`)
      }
    })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧭 GuideLens</h1>
        <p className="subtitle">AI-Powered Navigation for the Blind & Visually Impaired</p>

        <div className="header-controls">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isMuted ? 'Audio is muted. Click to unmute' : 'Audio is enabled. Click to mute'}
            aria-pressed={isMuted}
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>

          <button
            onClick={handleStopCamera}
            disabled={!isRunning}
            className="danger"
            title="Stop camera immediately"
            aria-label="Emergency stop: halts camera and audio"
          >
            🛑 STOP
          </button>
        </div>
      </header>

      <main className="app-main">
        {cameraError && (
          <div className="status error" role="alert">
            <strong>Camera Error:</strong> {cameraError}
            <p>Check your browser permissions and try refreshing the page.</p>
          </div>
        )}

        {detectionError && (
          <div className="status warning" role="alert">
            <strong>Detection Error:</strong> {detectionError}
            <p>Ensure your API key is configured and try again.</p>
          </div>
        )}

        <CameraView
          videoRef={videoRef}
          isRunning={isRunning}
          onStartClick={handleStartCamera}
          onStopClick={handleStopCamera}
          error={cameraError}
        />

        {isRunning && (
          <>
            <DetectionResults
              result={detectionResult}
              isDetecting={isDetecting}
              onAnalyzeClick={handleAnalyzeScene}
              error={detectionError}
            />

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
          </>
        )}

        {!isRunning && (
          <div className="status info text-center">
            <h3>Ready to Navigate</h3>
            <p>Click "Start Camera" above to begin. Ensure good lighting for best results.</p>
            {!speechSupported && <p className="warning">Text-to-speech not available in this browser.</p>}
            {!voiceSupported && <p className="info">Voice commands not available in this browser. Use text input instead.</p>}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>GuideLens v0.1.0 • Built for accessibility and safety</p>
        <p className="sr-only">GuideLens is an AI-powered navigation assistant for blind and visually impaired users.</p>
      </footer>
    </div>
  )
}

export default App
