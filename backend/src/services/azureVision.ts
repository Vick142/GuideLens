/**
 * OpenAI Vision Service
 * Handles object detection and scene description using OpenAI Vision API
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

class OpenAIVisionService {
  private apiKey: string
  private apiUrl = 'https://api.openai.com/v1/chat/completions'

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Analyze an image using OpenAI Vision API
   */
  async analyzeImage(imageData: string): Promise<VisionResponse> {
    try {
      if (!imageData || imageData.length === 0) {
        throw new Error('Image data is empty')
      }

      // Ensure imageData is in proper base64 format
      let base64Image = imageData
      if (imageData.startsWith('data:image')) {
        base64Image = imageData.split(',')[1]
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
                {
                  type: 'text',
                  text: `You are an accessibility assistant for blind users. Analyze this image and provide:
1. A brief scene description (1-2 sentences)
2. List of detected objects/obstacles as JSON array
3. Tags describing the scene type

Respond in this exact JSON format:
{
  "description": "Natural description of the scene",
  "objects": [
    {"name": "object_name", "confidence": 0.95},
    {"name": "obstacle_or_door", "confidence": 0.87}
  ],
  "tags": ["indoor", "room_type", "furniture"]
}`,
                },
              ],
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      const content = response.data.choices[0].message.content
      const parsed = JSON.parse(content)

      return {
        description: parsed.description,
        objects: (parsed.objects || []).map((obj: any) => ({
          name: obj.name,
          confidence: obj.confidence || 0.75,
        })),
        tags: parsed.tags || [],
      }
    } catch (error) {
      console.error('OpenAI Vision API error:', error)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenAI API key')
        } else if (error.response?.status === 400) {
          throw new Error('Invalid image data or request format')
        }
      }

      throw new Error(`Vision analysis failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export default OpenAIVisionService
