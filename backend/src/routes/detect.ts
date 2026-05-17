/**
 * Detection Route
 * POST /api/detect - Analyzes images using Azure Vision API
 */

import { Router, Request, Response } from 'express'
import AzureVisionService from '../services/azureVision'

const router = Router()

// Initialize Azure Vision service from environment
const endpoint = process.env.AZURE_VISION_ENDPOINT
const apiKey = process.env.AZURE_VISION_KEY

if (!endpoint || !apiKey) {
  console.warn('⚠️  WARNING: Azure Vision API credentials not configured')
  console.warn('   Set AZURE_VISION_ENDPOINT and AZURE_VISION_KEY in backend/.env')
  console.warn('   Detection API will return errors until credentials are added.')
}

let visionService: AzureVisionService | null = null
if (endpoint && apiKey) {
  try {
    visionService = new AzureVisionService(endpoint, apiKey)
  } catch (error) {
    console.error('Failed to initialize Azure Vision service:', error)
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
        error: 'Missing or invalid imageData. Expected base64 string or image URL.',
      })
    }

    // Check credentials
    if (!visionService || !endpoint || !apiKey) {
      return res.status(503).json({
        success: false,
        error: 'Azure Vision API not configured. Set AZURE_VISION_ENDPOINT and AZURE_VISION_KEY in backend/.env',
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
