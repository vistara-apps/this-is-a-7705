import React, { useState, useRef, useEffect } from 'react'
import { Video, Square, MapPin, Clock, Save, Lock, Crown } from 'lucide-react'

export function IncidentRecorder({ selectedState, onIncidentSaved, user, onUpgrade }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [location, setLocation] = useState(null)
  const [notes, setNotes] = useState('')
  const [recordingData, setRecordingData] = useState(null)
  const intervalRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const isPremium = user.subscriptionTier === 'premium'

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied')
        }
      )
    }
  }, [])

  const startRecording = async () => {
    if (!isPremium) {
      onUpgrade()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordingData({ blob, url })
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsRecording(false)
      clearInterval(intervalRef.current)
    }
  }

  const saveIncident = () => {
    const incident = {
      timestamp: new Date().toISOString(),
      location,
      recordingTime,
      notes,
      state: selectedState,
      recordingUrl: recordingData?.url
    }
    
    onIncidentSaved(incident)
    
    // Reset form
    setNotes('')
    setRecordingData(null)
    setRecordingTime(0)
    
    alert('Incident saved successfully!')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Video className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Incident Recorder</h1>
          <p className="text-dark-text-secondary">
            Record and document law enforcement interactions with one tap.
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-text mb-3">Premium Feature</h3>
          <p className="text-dark-text-secondary mb-6">
            Incident recording requires a Premium subscription. Get instant access to:
          </p>
          <ul className="text-left text-dark-text-secondary mb-6 space-y-2">
            <li>• One-tap video and audio recording</li>
            <li>• Automatic location logging</li>
            <li>• Cloud storage for recordings</li>
            <li>• Shareable incident cards</li>
            <li>• Secure evidence preservation</li>
          </ul>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            Upgrade to Premium - $5/month
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Video className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Incident Recorder</h1>
        <p className="text-dark-text-secondary">
          Record and document law enforcement interactions with one tap.
        </p>
      </div>

      <div className="bg-dark-card rounded-lg p-6 text-center">
        <div className="mb-6">
          {isRecording ? (
            <div className="space-y-4">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse-red">
                <Square className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div className="text-2xl font-mono text-red-400">
                {formatTime(recordingTime)}
              </div>
              <p className="text-dark-text-secondary">Recording in progress...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto hover:bg-red-600 transition-colors cursor-pointer">
                <Video className="w-8 h-8 text-white" />
              </div>
              <p className="text-dark-text-secondary">Tap to start recording</p>
            </div>
          )}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-full py-4 rounded-lg font-semibold transition-colors ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      <div className="bg-dark-card rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="font-medium text-dark-text">Location</span>
        </div>
        <p className="text-dark-text-secondary text-sm">
          {location 
            ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
            : 'Location access denied'
          }
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-dark-text">
          Incident Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any relevant details about the incident..."
          rows={4}
          className="w-full bg-dark-surface border border-gray-600 rounded-lg px-4 py-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
        />
      </div>

      {recordingData && (
        <div className="space-y-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="font-medium text-green-400">Recording Complete</span>
            </div>
            <p className="text-dark-text-secondary text-sm">
              Duration: {formatTime(recordingTime)}
            </p>
          </div>

          <button
            onClick={saveIncident}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Incident
          </button>
        </div>
      )}

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">Recording Tips</h3>
        <ul className="text-dark-text-secondary text-sm space-y-1">
          <li>• Keep your phone steady and visible</li>
          <li>• Announce that you are recording (where legal)</li>
          <li>• Capture audio clearly - speak up when necessary</li>
          <li>• Continue recording until the interaction is complete</li>
        </ul>
      </div>
    </div>
  )
}