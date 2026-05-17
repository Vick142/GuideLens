/**
 * Azure Computer Vision Service
 * Handles object detection using Azure Vision API
 */

import axios from 'axios'

export interface DetectedObject {
  name: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    w: number
    h: number
  }
}

export interface VisionResponse {
  objects?: DetectedObject[]
  tags?: string[]
  description?: string
}

class AzureVisionService {
  private endpoint: string
  private apiKey: string
  private apiVersion = '2023-02-01-preview'

  constructor(endpoint: string, apiKey: string) {
    if (!endpoint || !apiKey) {
      throw new Error('Azure Vision endpoint and API key are required')
    }
    this.endpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/'
    this.apiKey = apiKey
  }

  /**
   * Analyze an image (base64 or URL) using Azure Vision API
   */
  async analyzeImage(imageData: string): Promise<VisionResponse> {
    try {
      // Validate that we have image data
      if (!imageData || imageData.length === 0) {
        throw new Error('Image data is empty')
      }

      // Determine if it's base64 or URL
      let requestBody: any
      const isBase64 = imageData.startsWith('data:image')

      if (isBase64) {
        // Convert data URL to binary
        const base64String = imageData.split(',')[1]
        const imageBuffer = Buffer.from(base64String, 'base64')

        requestBody = imageBuffer
      } else {
        // Assume it's a URL
        requestBody = { url: imageData }
      }

      // Call Azure Vision API for analysis
      const response = await axios.post(
        `${this.endpoint}vision/v${this.apiVersion}/analyze?visualFeatures=Objects,Tags,Description`,
        requestBody,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': this.apiKey,
            'Content-Type': isBase64 ? 'application/octet-stream' : 'application/json',
          },
        }
      )

      // Parse and normalize the response
      return this.normalizeResponse(response.data)
    } catch (error) {
      console.error('Azure Vision API error:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Invalid Azure Vision API credentials')
        } else if (error.response?.status === 400) {
          throw new Error('Invalid image data or request format')
        }
      }

      throw new Error(`Azure Vision API failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Normalize Azure Vision API response into our internal format
   */
  private normalizeResponse(azureResponse: any): VisionResponse {
    const result: VisionResponse = {}

    // Extract objects
    if (azureResponse.objects && Array.isArray(azureResponse.objects)) {
      result.objects = azureResponse.objects.map((obj: any) => ({
        name: obj.objectName || obj.object || 'unknown',
        confidence: obj.confidence || 0.5,
        boundingBox: obj.rectangle
          ? {
              x: obj.rectangle.x / azureResponse.metadata?.width || 1280,
              y: obj.rectangle.y / azureResponse.metadata?.height || 720,
              w: obj.rectangle.w / azureResponse.metadata?.width || 1280,
              h: obj.rectangle.h / azureResponse.metadata?.height || 720,
            }
          : undefined,
      }))
    }

    // Extract tags
    if (azureResponse.tags && Array.isArray(azureResponse.tags)) {
      result.tags = azureResponse.tags.map((tag: any) => tag.name || tag)
    }

    // Extract description
    if (azureResponse.description && azureResponse.description.captions) {
      result.description = azureResponse.description.captions[0]?.text || ''
    }

    return result
  }
}

export default AzureVisionService
