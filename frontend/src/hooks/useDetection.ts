import { useState } from 'react'
import { detectObjects, DetectionResponse } from '../utils/detection'
import { captureFrame } from '../utils/camera'

/**
 * Hook for managing object detection state and API calls
 */
export function useDetection() {
  const [detectionResult, setDetectionResult] = useState<DetectionResponse | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)

  const analyzeFrame = async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return false

    try {
      setIsDetecting(true)
      setDetectionError(null)

      const frameData = captureFrame(videoElement)
      if (!frameData) {
        throw new Error('Failed to capture frame from camera')
      }

      const result = await detectObjects(frameData)
      setDetectionResult(result)

      if (!result.success) {
        setDetectionError(result.error || 'Detection failed')
        return false
      }

      return true
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      setDetectionError(msg)
      setDetectionResult(null)
      return false
    } finally {
      setIsDetecting(false)
    }
  }

  const clearResults = () => {
    setDetectionResult(null)
    setDetectionError(null)
  }

  return {
    detectionResult,
    isDetecting,
    detectionError,
    analyzeFrame,
    clearResults,
  }
}
