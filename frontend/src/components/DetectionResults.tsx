import React from 'react'
import { DetectionResponse, filterPriorityObjects } from '../utils/detection'
import styles from './DetectionResults.module.css'

interface DetectionResultsProps {
  result: DetectionResponse | null
  isDetecting: boolean
  onAnalyzeClick: () => void
  error?: string | null
}

/**
 * DetectionResults Component
 * Displays detected objects, tags, and scene description
 */
export const DetectionResults: React.FC<DetectionResultsProps> = ({
  result,
  isDetecting,
  onAnalyzeClick,
  error,
}) => {
  return (
    <section className={styles.container} aria-labelledby="detection-heading">
      <h2 id="detection-heading">Scene Analysis</h2>

      <div className={styles.buttonGroup}>
        <button
          onClick={onAnalyzeClick}
          disabled={isDetecting}
          className="primary"
          aria-label="Analyze scene"
          title="Analyze the current scene with AI"
        >
          {isDetecting ? 'Analyzing...' : 'Analyze Scene'}
        </button>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <strong>Analysis Error:</strong> {error}
        </div>
      )}

      {result && result.success && (
        <div className={styles.results} aria-live="polite" aria-atomic="true">
          {result.description && (
            <div className={styles.description}>
              <h3>Scene Description</h3>
              <p>{result.description}</p>
            </div>
          )}

          {result.objects && result.objects.length > 0 && (
            <div className={styles.objects}>
              <h3>Detected Objects</h3>
              <ul>
                {filterPriorityObjects(result.objects).map((obj, idx) => (
                  <li key={idx}>
                    <strong>{obj.name}</strong> — Confidence: {Math.round(obj.confidence * 100)}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.tags && result.tags.length > 0 && (
            <div className={styles.tags}>
              <h3>Scene Tags</h3>
              <div className={styles.tagList}>
                {result.tags.map((tag, idx) => (
                  <span key={idx} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isDetecting && !result && !error && (
        <p className={styles.placeholder} aria-label="No analysis yet">
          Click "Analyze Scene" to detect objects in your surroundings.
        </p>
      )}
    </section>
  )
}

export default DetectionResults
