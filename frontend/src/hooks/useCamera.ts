import { useEffect, useRef, useState } from 'react'
import { startCamera, stopCamera, isCameraSupported } from '../utils/camera'

/**
 * Hook for managing camera stream and video element
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCameraAvailable] = useState(() => isCameraSupported())

  const start = async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      const stream = await startCamera(videoRef.current, { preferRear: true })
      streamRef.current = stream
      setIsRunning(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setIsRunning(false)
    }
  }

  const stop = () => {
    if (streamRef.current) {
      stopCamera(streamRef.current)
      streamRef.current = null
    }
    setIsRunning(false)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current)
      }
    }
  }, [])

  return {
    videoRef,
    isRunning,
    error,
    isCameraAvailable,
    start,
    stop,
  }
}
