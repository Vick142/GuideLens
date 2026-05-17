import { useEffect, useState } from 'react'
import { isSpeechSupported, isVoiceRecognitionSupported, speak, stopSpeech, startVoiceRecognition } from '../utils/speech'

/**
 * Hook for managing text-to-speech and voice recognition
 */
export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [speechSupported] = useState(() => isSpeechSupported())
  const [voiceSupported] = useState(() => isVoiceRecognitionSupported())

  const voiceStopRef = React.useRef<(() => void) | null>(null)

  const sayText = (text: string) => {
    if (isMuted || !speechSupported) return

    setIsSpeaking(true)
    speak(text, (error) => {
      setVoiceError(error)
      setIsSpeaking(false)
    })

    // Set a timeout to update speaking state
    const timeout = setTimeout(() => {
      setIsSpeaking(false)
    }, 5000) // Conservative estimate

    return () => clearTimeout(timeout)
  }

  const stopTalkingNow = () => {
    stopSpeech()
    setIsSpeaking(false)
  }

  const startListening = (onResult: (text: string) => void) => {
    if (!voiceSupported) {
      setVoiceError('Voice recognition not supported')
      return
    }

    setIsListening(true)
    setVoiceError(null)

    voiceStopRef.current = startVoiceRecognition(
      (text) => {
        setIsListening(false)
        onResult(text)
      },
      (error) => {
        setVoiceError(error)
        setIsListening(false)
      }
    )
  }

  const stopListening = () => {
    if (voiceStopRef.current) {
      voiceStopRef.current()
      voiceStopRef.current = null
    }
    setIsListening(false)
  }

  return {
    isSpeaking,
    isListening,
    isMuted,
    voiceError,
    speechSupported,
    voiceSupported,
    sayText,
    stopTalkingNow,
    startListening,
    stopListening,
    toggleMute: () => setIsMuted(!isMuted),
  }
}

// Import React for useRef usage
import React from 'react'
