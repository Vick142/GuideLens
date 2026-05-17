/**
 * Guidance Engine
 * Generates safe, accessibility-friendly navigation prompts
 */

import { DetectedObject, estimateDirection, isObstacle, BoundingBox } from './detection'

export interface GuidancePrompt {
  text: string
  isSafe: boolean
  isWarning: boolean
}

/**
 * Generate guidance for finding a specific target object
 */
export function generateFindingGuidance(
  targetObject: string,
  detectedObjects: DetectedObject[],
  overallConfidence: number
): GuidancePrompt {
  // Check if low confidence
  if (overallConfidence < 0.7) {
    return {
      text: `Analyzing scene. Confidence is low. Please ensure good lighting and clear view.`,
      isSafe: true,
      isWarning: true,
    }
  }

  // Find the target object
  const targetMatch = detectedObjects.find((obj) =>
    obj.name.toLowerCase().includes(targetObject.toLowerCase())
  )

  if (!targetMatch) {
    return {
      text: `I do not see a ${targetObject} in the current view. Move slowly and try again.`,
      isSafe: true,
      isWarning: false,
    }
  }

  // Check for obstacles blocking the path to the target
  const obstaclesInWay = detectedObjects.filter(
    (obj) =>
      isObstacle(obj.name) &&
      obj.name.toLowerCase() !== targetMatch.name.toLowerCase() &&
      (obj.confidence || 0.5) > 0.6
  )

  const direction = estimateDirection(targetMatch.boundingBox || { x: 0.5, y: 0.5, w: 0.2, h: 0.3 })
  const directionText = direction === 'left' ? 'on your left' : direction === 'right' ? 'on your right' : 'straight ahead'

  let guidance = `The ${targetMatch.name} is ${directionText}.`

  // Safety check: only suggest forward movement if no obstacles are directly ahead
  const obstaclesAhead = obstaclesInWay.filter((obj) => {
    const objDir = estimateDirection(obj.boundingBox || { x: 0.5, y: 0.5, w: 0.2, h: 0.3 })
    return objDir === 'center'
  })

  if (obstaclesAhead.length === 0 && direction === 'center') {
    guidance += ` Move slowly forward.`
  } else if (obstaclesAhead.length > 0) {
    guidance += ` Obstacle ahead. Do not move forward. Adjust your position.`
  } else if (direction !== 'center') {
    guidance += ` Turn ${direction === 'left' ? 'left' : 'right'} to face it.`
  }

  return {
    text: guidance,
    isSafe: true,
    isWarning: obstaclesAhead.length > 0,
  }
}

/**
 * Generate a scene description based on detected objects
 */
export function generateSceneDescription(
  detectedObjects: DetectedObject[],
  tags: string[],
  confidence: number
): GuidancePrompt {
  if (confidence < 0.6) {
    return {
      text: 'Scene analysis has low confidence. Try again with better lighting.',
      isSafe: true,
      isWarning: true,
    }
  }

  if (detectedObjects.length === 0) {
    return {
      text: 'I cannot identify any objects in the current view.',
      isSafe: true,
      isWarning: false,
    }
  }

  // Prioritize important objects for blind users
  const importantObjects = detectedObjects
    .filter((obj) => (obj.confidence || 0.5) > 0.6)
    .slice(0, 5)
    .map((obj) => obj.name)

  const sceneType = tags.length > 0 ? tags[0] : 'area'

  const objectList =
    importantObjects.length > 0
      ? importantObjects.join(', ')
      : 'various objects'

  const text = `You are in a ${sceneType}. I detect: ${objectList}.`

  return {
    text,
    isSafe: true,
    isWarning: false,
  }
}

/**
 * Warn about obstacles in the path
 */
export function generateObstacleWarning(
  obstacles: DetectedObject[],
  centerObstacles: DetectedObject[]
): GuidancePrompt | null {
  if (centerObstacles.length === 0) {
    return null
  }

  const obstacleNames = centerObstacles.map((o) => o.name).join(' and ')

  return {
    text: `Obstacle ahead: ${obstacleNames}. Do not move forward. Stop.`,
    isSafe: true,
    isWarning: true,
  }
}

/**
 * Compute average confidence from detected objects
 */
export function computeAverageConfidence(objects: DetectedObject[]): number {
  if (objects.length === 0) return 0
  const sum = objects.reduce((acc, obj) => acc + (obj.confidence || 0.5), 0)
  return sum / objects.length
}
