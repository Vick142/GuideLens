/**
 * Main Backend Server
 * Express server for GuideLens API
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import detectRoutes from './routes/detect'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.BACKEND_PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// CORS configuration
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
)

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
})

// API Routes
app.use('/api', detectRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GuideLens Backend API',
    version: '0.1.0',
    endpoints: {
      health: '/api/health',
      detect: 'POST /api/detect',
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗')
  console.log('║   GuideLens Backend Server Started     ║')
  console.log('╠════════════════════════════════════════╣')
  console.log(`║ 🚀 Server: http://localhost:${PORT}`)
  console.log(`║ 🌐 Frontend: ${FRONTEND_URL}`)
  console.log(`║ 📝 Env: ${process.env.NODE_ENV || 'development'}`)

  if (!process.env.OPENAI_API_KEY) {
    console.log('║ ⚠️  OpenAI API key not configured      ║')
  } else {
    console.log('║ ✅ OpenAI Vision API configured        ║')
  }

  console.log('╚════════════════════════════════════════╝')
})
