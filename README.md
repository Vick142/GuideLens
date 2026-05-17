# GuideLens: AI-Powered Indoor Navigation for Blind & Visually Impaired Users

An accessible web app that uses device camera, AI object detection, and voice guidance to help blind users understand and safely navigate indoor spaces.

## Features

- **Live Camera Feed**: Real-time video from device camera with rear-camera preference on mobile
- **AI Object Detection**: Uses Azure Computer Vision to detect room objects (door, chair, bed, obstacles, etc.)
- **Voice Guidance**: Spoken directional assistance ("The door is on your right", "Obstacle ahead")
- **Voice Commands**: Natural language search ("Help me find the door")
- **Accessibility First**: Large buttons, high-contrast UI, keyboard navigation, screen reader support, clear audio prompts
- **Safety-Focused**: Never suggests movement toward obstacles; immediate Stop button halts all processing

## Architecture

```
GuideLens/
├── frontend/          # React + TypeScript Vite app
│   ├── src/
│   │   ├── components/     # React components (Camera, Guidance, etc.)
│   │   ├── hooks/          # Custom hooks (useCamera, useSpeech, etc.)
│   │   ├── utils/          # Utility functions (speech synthesis, detection)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/           # Express.js server
│   ├── src/
│   │   ├── middleware/     # CORS, error handling
│   │   ├── routes/         # API routes (/api/detect)
│   │   ├── services/       # Azure Vision service
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
├── README.md
├── .gitignore
├── .env.example        # Example environment variables
└── package.json        # Root workspace config
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript
- **Vision API**: Azure Computer Vision API
- **Speech**: Web Speech API (recognition + synthesis)
- **Accessibility**: WCAG 2.1 AA standards, ARIA labels, keyboard navigation

## Prerequisites

1. **Node.js** (16+ recommended)
2. **npm** or **yarn**
3. **Azure subscription** with:
   - Azure Computer Vision API endpoint and key
   - (Optional) Azure OpenAI for enhanced scene guidance

## Setup

### 1. Clone/Open the Project

```bash
cd c:\Users\USER\Documents\Hackathon\GuideLens
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

#### Backend Setup

1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` and add your Azure credentials:
   ```env
   AZURE_VISION_ENDPOINT=https://<your-region>.api.cognitive.microsoft.com/
   AZURE_VISION_KEY=<your-api-key>
   BACKEND_PORT=5000
   ```

   **Get your Azure credentials:**
   - Sign into [Azure Portal](https://portal.azure.com)
   - Create or open a **Computer Vision** resource
   - Navigate to **Keys and Endpoint** section
   - Copy the **Endpoint** and **Key 1**

#### Frontend Setup

1. Copy `frontend/.env.example` to `frontend/.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Edit `frontend/.env`:
   ```env
   VITE_API_BASE=http://localhost:5000
   ```

### 4. Enable Camera & Microphone Permissions

When you first run the app in your browser, allow:
- **Camera access** (required for object detection)
- **Microphone access** (optional, for voice commands)

Most browsers will prompt for these permissions automatically.

## Running the App

### Development Mode (Both Frontend + Backend)

From the root directory:

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

Then open your browser to **http://localhost:5173**

### Run Frontend Only

```bash
npm run frontend
```

Opens at http://localhost:5173 (requires backend running separately)

### Run Backend Only

```bash
npm run backend
```

Runs at http://localhost:5000

## Testing the App

### 1. Test Camera Access

- Click **Start Camera**
- Grant camera permission when prompted
- You should see a live video feed from your camera

### 2. Test Object Detection

- With camera running, click **Analyze Scene**
- The app captures a snapshot and sends it to Azure Vision API
- Results appear on-screen and are spoken aloud

### 3. Test Voice Commands (Optional)

- Click **Help me find…**
- Say or type an object name (e.g., "door", "chair", "stairs")
- The app analyzes the scene for that object and speaks direction guidance

### 4. Test Stop Button

- During any guidance or capture, click **Stop**
- Camera, capture loop, and audio should immediately halt

### 5. Accessibility Testing

**Keyboard-only navigation:**
- Use Tab to navigate between buttons
- Use Enter/Space to activate
- All controls should be reachable without a mouse

**Screen Reader:**
- Enable your system screen reader (Windows: Narrator; macOS: VoiceOver; Linux: Orca)
- All buttons, status text, and guidance should be announced clearly

## API Endpoints

### POST /api/detect

Sends a camera snapshot to Azure Vision for object detection.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,..."
}
```

**Response (on success):**
```json
{
  "success": true,
  "objects": [
    { "name": "door", "confidence": 0.95, "boundingBox": { "x": 0.1, "y": 0.2, "w": 0.3, "h": 0.4 } },
    { "name": "obstacle", "confidence": 0.87, "boundingBox": { "x": 0.4, "y": 0.3, "w": 0.2, "h": 0.25 } }
  ],
  "tags": ["indoor", "room", "hallway"],
  "description": "A hallway with a door and furniture"
}
```

**Response (on error):**
```json
{
  "success": false,
  "error": "Missing API credentials"
}
```

## Usage Tips

### For Blind & Low-Vision Users

1. **Start with a quiet room** to avoid audio confusion
2. **Use voice commands** to search for specific objects
3. **Listen carefully to left/center/right guidance** — the app is conservative and won't suggest forward movement if an obstacle is detected directly ahead
4. **Use Stop immediately** if you feel uncertain
5. **Ask for audio confirmation** by triggering a new analysis if guidance is unclear

### For Developers

- **Low confidence warnings**: The app speaks a warning if detection confidence is below 70%
- **Obstacle detection**: Any detected obstacle centered in the frame blocks forward guidance
- **Modular design**: Vision provider (Azure), speech engine, and guidance logic are separated for easy future upgrades
- **TODO markers**: Search for `TODO:` in the code to find areas for future enhancement

## Troubleshooting

### "Missing API key" Error

- Ensure `backend/.env` has `AZURE_VISION_KEY` and `AZURE_VISION_ENDPOINT` set
- Restart the backend server after updating `.env`
- Check that your Azure Computer Vision resource is active and not expired

### Camera Not Working

- Check browser permissions: Settings > Privacy > Camera
- Try a different browser (Chrome, Edge, Firefox all support the Camera API)
- Ensure your device has a camera (built-in or external)

### No Audio Output

- Check system volume and browser volume
- Verify microphone/speaker permissions in browser settings
- Use the **Mute/Unmute** button in the app to toggle speech output

### Slow Detection or Timeouts

- Azure Vision API can take 2–5 seconds per frame
- Move the app to a faster network if possible
- Reduce snapshot frequency (see `frontend/src/utils/detection.ts`)

## Future Enhancements

- [ ] Multi-language voice commands
- [ ] Real-time detection (process every frame)
- [ ] Depth sensor integration (mobile AR, LiDAR)
- [ ] Offline object detection (TensorFlow.js fallback)
- [ ] More sophisticated spatial reasoning (3D tracking)
- [ ] Integration with Azure OpenAI for richer scene understanding
- [ ] Mobile app (React Native)
- [ ] Haptic feedback for navigation cues
- [ ] Indoor map learning and navigation persistence

## Contributing

Feedback, bug reports, and pull requests are welcome. Please ensure:
- All new features maintain accessibility standards (WCAG 2.1 AA)
- Code is commented and follows the existing style
- Environment variables are never hardcoded
- Error messages are clear and user-friendly

## License

MIT

## Contact & Support

For questions or accessibility feedback, please open an issue on this repository.

---

**Built with ❤️ for accessibility and safety.**
