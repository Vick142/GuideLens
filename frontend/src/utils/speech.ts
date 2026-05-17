/**
 * Speech Synthesis & Recognition Utilities
 * Provides text-to-speech and voice command capabilities with fallback handling.
 */

/**
 * Speak text aloud using Web Speech API
 */
export function speak(text: string, onError?: (error: string) => void): void {
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error)
      onError?.(event.error)
    }

    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Failed to speak:', error)
    onError?.(String(error))
  }
}

/**
 * Stop all ongoing speech
 */
export function stopSpeech(): void {
  try {
    window.speechSynthesis.cancel()
  } catch (error) {
    console.error('Failed to stop speech:', error)
  }
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window
}

/**
 * Start voice recognition (returns recognized text via callback)
 * Requires microphone permission
 */
export function startVoiceRecognition(
  onResult: (text: string) => void,
  onError?: (error: string) => void
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) {
    const msg = 'Voice recognition not supported in this browser'
    console.warn(msg)
    onError?.(msg)
    return () => {}
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.language = 'en-US'

  recognition.onresult = (event: any) => {
    let finalTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' '
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript.trim().toLowerCase())
    }
  }

  recognition.onerror = (event: any) => {
    console.error('Voice recognition error:', event.error)
    onError?.(event.error)
  }

  recognition.onend = () => {
    console.log('Voice recognition ended')
  }

  try {
    recognition.start()
  } catch (error) {
    console.error('Failed to start voice recognition:', error)
    onError?.(String(error))
  }

  // Return a function to stop the recognition
  return () => {
    try {
      recognition.stop()
    } catch (error) {
      console.error('Failed to stop voice recognition:', error)
    }
  }
}

/**
 * Check if voice recognition is available
 */
export function isVoiceRecognitionSupported(): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  return !!SpeechRecognition
}
