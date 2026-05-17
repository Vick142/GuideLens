import React, { useState } from 'react'
import { DetectionResponse, estimateDirection, isObstacle } from '../utils/detection'
import { generateFindingGuidance, computeAverageConfidence } from '../utils/guidance'
import styles from './GuidancePanel.module.css'

interface GuidancePanelProps {
  detectionResult: DetectionResponse | null
  isSearching: boolean
  onSearchChange: (target: string) => void
  onVoiceStart: () => void
  onVoiceStop: () => void
  isListening: boolean
  searchText: string
  voiceSupported: boolean
}

/**
 * GuidancePanel Component
 * Handles "Help me find" queries with text or voice input
 * Shows guidance and warnings
 */
export const GuidancePanel: React.FC<GuidancePanelProps> = ({
  detectionResult,
  isSearching,
  onSearchChange,
  onVoiceStart,
  onVoiceStop,
  isListening,
  searchText,
  voiceSupported,
}) => {
  const [currentTarget, setCurrentTarget] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const target = searchText.trim().toLowerCase()
    if (target) {
      setCurrentTarget(target)
      onSearchChange(target)
    }
  }

  const handleClearTarget = () => {
    setCurrentTarget(null)
    onSearchChange('')
  }

  const getGuidance = () => {
    if (!detectionResult || !detectionResult.success || !currentTarget) {
      return null
    }

    const objects = detectionResult.objects || []
    const avgConfidence = computeAverageConfidence(objects)

    return generateFindingGuidance(currentTarget, objects, avgConfidence)
  }

  const guidance = getGuidance()

  // Check for obstacles ahead
  const obstaclesAhead =
    detectionResult && detectionResult.success && detectionResult.objects
      ? detectionResult.objects.filter((obj) => {
          if (!isObstacle(obj.name)) return false
          const dir = estimateDirection(obj.boundingBox || { x: 0.5, y: 0.5, w: 0.2, h: 0.3 })
          return dir === 'center'
        })
      : []

  return (
    <section className={styles.container} aria-labelledby="guidance-heading">
      <h2 id="guidance-heading">Navigation Assistance</h2>

      {obstaclesAhead.length > 0 && (
        <div className={styles.obstacleWarning} role="alert" aria-live="assertive">
          <strong>⚠️ Obstacle Ahead!</strong> {obstaclesAhead.map((o) => o.name).join(', ')}.
          <br />
          Do not move forward. Stay in place.
        </div>
      )}

      <form onSubmit={handleSearch} className={styles.searchForm}>
        <label htmlFor="target-input" className="sr-only">
          What do you want to find?
        </label>
        <input
          id="target-input"
          type="text"
          placeholder="e.g., 'door', 'chair', 'stairs'"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isSearching}
          aria-label="Search for object to find"
          aria-describedby="search-hint"
        />
        <p id="search-hint" className="sr-only">
          Enter an object name or use voice to ask for help finding something
        </p>

        <button
          type="submit"
          disabled={isSearching || !searchText.trim()}
          className="primary"
          aria-label="Search for target object"
        >
          {isSearching ? 'Searching...' : 'Find It'}
        </button>

        {voiceSupported && (
          <button
            type="button"
            onClick={isListening ? onVoiceStop : onVoiceStart}
            className={isListening ? 'danger' : ''}
            aria-label={isListening ? 'Stop listening' : 'Start voice search'}
            title={isListening ? 'Stop listening to voice input' : 'Speak the object you want to find'}
          >
            {isListening ? '⏹️ Stop Listening' : '🎤 Voice'}
          </button>
        )}

        {currentTarget && (
          <button
            type="button"
            onClick={handleClearTarget}
            aria-label="Clear search"
            title="Clear the search target"
          >
            Clear
          </button>
        )}
      </form>

      {currentTarget && (
        <div className={styles.targetStatus} aria-live="polite">
          <p>
            Searching for: <strong>{currentTarget}</strong>
          </p>
        </div>
      )}

      {guidance && (
        <div
          className={`${styles.guidance} ${
            guidance.isWarning ? styles.warning : ''
          }`}
          role="status"
          aria-live="assertive"
          aria-atomic="true"
        >
          {guidance.isWarning && <strong>⚠️ Warning: </strong>}
          {guidance.text}
        </div>
      )}

      {!guidance && currentTarget && detectionResult && detectionResult.success && (
        <p className={styles.noGuidance} aria-label="No guidance available">
          No clear direction found. Adjust your position and try again.
        </p>
      )}
    </section>
  )
}

export default GuidancePanel
