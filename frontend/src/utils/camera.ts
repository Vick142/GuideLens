/**
 * Camera utilities for accessing device camera and capturing frames
 */

export interface CameraConstraints {
  preferRear?: boolean
}

/**
 * Get available video input devices
 */
export async function getVideoDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter((device) => device.kind === 'videoinput')
  } catch (error) {
    console.error('Failed to enumerate video devices:', error)
    return []
  }
}

/**
 * Get the ID of the rear-facing camera (for mobile devices)
 */
async function getRearCameraId(): Promise<string | null> {
  const devices = await getVideoDevices()
  const rearCamera = devices.find(
    (device) =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
  )
  return rearCamera?.deviceId || null
}

/**
 * Start camera stream
 */
export async function startCamera(
  videoElement: HTMLVideoElement,
  constraints?: CameraConstraints
): Promise<MediaStream | null> {
  try {
    let deviceId: string | undefined

    // Try to get rear camera if on mobile
    if (constraints?.preferRear) {
      const rearId = await getRearCameraId()
      if (rearId) {
        deviceId = rearId
      }
    }

    const mediaConstraints: MediaStreamConstraints = {
      video: {
        ...(deviceId && { deviceId: { exact: deviceId } }),
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    }

    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)

    videoElement.srcObject = stream
    videoElement.onloadedmetadata = () => {
      videoElement.play().catch((error) => console.error('Failed to play video:', error))
    }

    return stream
  } catch (error) {
    console.error('Failed to start camera:', error)

    // Provide helpful error messages
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera found on this device.')
      }
    }

    throw error
  }
}

/**
 * Stop camera stream
 */
export function stopCamera(stream: MediaStream): void {
  try {
    stream.getTracks().forEach((track) => track.stop())
  } catch (error) {
    console.error('Failed to stop camera:', error)
  }
}

/**
 * Capture a frame from video element as base64 image data
 */
export function captureFrame(videoElement: HTMLVideoElement): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('Failed to capture frame:', error)
    return null
  }
}

/**
 * Check if camera API is available
 */
export function isCameraSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}
