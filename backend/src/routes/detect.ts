/**
 * Detection Route
 * POST /api/detect - Analyzes images using OpenAI Vision API
 */

import { Router, Request, Response } from 'express'
import OpenAIVisionService from '../services/azureVision'

const router = Router()

// Initialize OpenAI Vision service from environment
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.warn('⚠️  WARNING: OpenAI API key not configured')
  console.warn('   Set OPENAI_API_KEY in backend/.env')
  console.warn('   Vision analysis will fail until API key is added.')
}

let visionService: OpenAIVisionService | null = null
if (apiKey) {
  try {
    visionService = new OpenAIVisionService(apiKey)
  } catch (error) {
    console.error('Failed to initialize OpenAI Vision service:', error)
  }
}

/**
 * POST /api/detect
 * Analyzes a camera frame/image for objects, tags, and description
 */
router.post('/detect', async (req: Request, res: Response) => {
  try {
    const { imageData } = req.body

    // Validation
    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid imageData. Expected base64 string.',
      })
    }

    // Check API key
    if (!visionService || !apiKey) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API not configured. Set OPENAI_API_KEY in backend/.env',
      })
    }

    // Analyze image
    const analysisResult = await visionService.analyzeImage(imageData)

    // Return normalized result
    return res.json({
      success: true,
      objects: analysisResult.objects || [],
      tags: analysisResult.tags || [],
      description: analysisResult.description || 'Unable to describe the scene.',
    })
  } catch (error) {
    console.error('Detection error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return res.status(400).json({
      success: false,
      error: `Detection failed: ${errorMessage}`,
    })
  }
})

export default router
