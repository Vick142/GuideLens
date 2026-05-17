import React, { useRef, useEffect } from 'react'
import styles from './CameraView.module.css'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isRunning: boolean
  onStartClick: () => void
  onStopClick: () => void
  error?: string | null
}

/**
 * CameraView Component
 * Displays live camera feed with start/stop controls
 */
export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isRunning,
  onStartClick,
  onStopClick,
  error,
}) => {
  return (
    <section className={styles.container} aria-labelledby="camera-heading">
      <h2 id="camera-heading">Camera Feed</h2>

      {error && (
        <div className={styles.error} role="alert">
          <strong>Camera Error:</strong> {error}
        </div>
      )}

      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          aria-label="Live camera feed"
        />
      </div>

      <div className={styles.controls}>
        <button
          onClick={onStartClick}
          disabled={isRunning}
          className="primary"
          aria-label="Start camera"
          title="Start camera to begin navigation"
        >
          Start Camera
        </button>

        <button
          onClick={onStopClick}
          disabled={!isRunning}
          className="danger"
          aria-label="Stop camera"
          title="Stop camera immediately"
        >
          Stop Camera
        </button>
      </div>

      {isRunning && (
        <p className={styles.status} aria-live="polite">
          ✓ Camera is active. Point at your surroundings.
        </p>
      )}
    </section>
  )
}

export default CameraView
