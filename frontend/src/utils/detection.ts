/**
 * Detection API client
 * Communicates with backend /api/detect endpoint
 */

export interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
}

export interface DetectedObject {
  name: string
  confidence: number
  boundingBox?: BoundingBox
}

export interface DetectionResponse {
  success: boolean
  objects?: DetectedObject[]
  tags?: string[]
  description?: string
  error?: string
}

/**
 * Send a camera frame to the backend for AI object detection
 */
export async function detectObjects(imageData: string): Promise<DetectionResponse> {
  const apiBase = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000'

  try {
    const response = await fetch(`${apiBase}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData }),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Detection error:', error)
    return {
      success: false,
      error: `Detection failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Estimate direction of an object based on bounding box center
 * Returns 'left', 'center', or 'right' based on horizontal position
 */
export function estimateDirection(boundingBox: BoundingBox): 'left' | 'center' | 'right' {
  const centerX = boundingBox.x + boundingBox.w / 2

  if (centerX < 0.33) {
    return 'left'
  } else if (centerX > 0.67) {
    return 'right'
  } else {
    return 'center'
  }
}

/**
 * List of common indoor objects prioritized for blind navigation
 */
export const PRIORITY_OBJECTS = [
  'door',
  'stairs',
  'obstacle',
  'person',
  'chair',
  'table',
  'bed',
  'wall',
  'floor',
  'ceiling',
  'window',
  'counter',
  'cabinet',
  'shelf',
]

/**
 * Filter detected objects by priority (indoor navigation objects)
 */
export function filterPriorityObjects(objects: DetectedObject[]): DetectedObject[] {
  return objects.filter((obj) =>
    PRIORITY_OBJECTS.some((priority) => obj.name.toLowerCase().includes(priority.toLowerCase()))
  )
}

/**
 * Check if an object is an obstacle
 */
export function isObstacle(objectName: string): boolean {
  const obstacleKeywords = ['obstacle', 'wall', 'person', 'furniture', 'shelf', 'cabinet', 'rack']
  return obstacleKeywords.some((keyword) =>
    objectName.toLowerCase().includes(keyword.toLowerCase())
  )
}
