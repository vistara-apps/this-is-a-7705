import { useState, useEffect } from 'react'
import { supabaseService } from '../services/supabase'
import { pinataService } from '../services/pinata'
import { incidentCardUtils } from '../utils/incidentCard'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export function useIncidents() {
  const { user, isPremium } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [currentRecording, setCurrentRecording] = useState(null)

  useEffect(() => {
    if (user) {
      loadIncidents()
    }
  }, [user])

  async function loadIncidents() {
    try {
      setLoading(true)
      const { data, error } = await supabaseService.getUserIncidents(user.id)
      
      if (error) {
        console.error('Error loading incidents:', error)
        toast.error('Failed to load incidents')
        return
      }

      setIncidents(data || [])
    } catch (error) {
      console.error('Error loading incidents:', error)
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  async function saveIncident(incidentData, stateRights) {
    try {
      setLoading(true)
      
      const incidentId = uuidv4()
      const timestamp = new Date().toISOString()
      
      // Prepare incident data for database
      const incident = {
        id: incidentId,
        user_id: user?.id || null,
        timestamp: incidentData.timestamp || timestamp,
        location: incidentData.location,
        notes: incidentData.notes || '',
        duration: incidentData.duration || null,
        recording_url: incidentData.recordingUrl || null,
        recording_hash: incidentData.recordingHash || null,
        state: incidentData.selectedState || null,
        created_at: timestamp,
        updated_at: timestamp
      }

      // Save to database
      const { data, error } = await supabaseService.saveIncident(incident)
      
      if (error) {
        toast.error('Failed to save incident')
        return { success: false, error }
      }

      // Generate incident card if premium user
      let incidentCard = null
      if (isPremium && (incidentData.notes || incidentData.location)) {
        const cardResult = await incidentCardUtils.generateIncidentCard(
          incidentData, 
          stateRights
        )
        
        if (cardResult.success) {
          incidentCard = cardResult.incidentCard
          
          // Upload to IPFS
          const uploadResult = await incidentCardUtils.uploadToIPFS(
            incidentCard, 
            user?.id
          )
          
          if (uploadResult.success) {
            // Update incident with card information
            await supabaseService.updateIncident(incidentId, {
              incident_card_hash: uploadResult.ipfsHash,
              incident_card_url: uploadResult.gatewayUrl
            })
          }
        }
      }

      // Update local state
      const newIncident = data[0]
      setIncidents(prev => [newIncident, ...prev])
      
      toast.success('Incident saved successfully')
      
      return { 
        success: true, 
        incident: newIncident,
        incidentCard 
      }
    } catch (error) {
      console.error('Error saving incident:', error)
      toast.error('Failed to save incident')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function updateIncident(incidentId, updates) {
    try {
      setLoading(true)
      
      const { data, error } = await supabaseService.updateIncident(incidentId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      if (error) {
        toast.error('Failed to update incident')
        return { success: false, error }
      }

      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId ? data[0] : incident
        )
      )
      
      toast.success('Incident updated successfully')
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error updating incident:', error)
      toast.error('Failed to update incident')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function deleteIncident(incidentId) {
    try {
      setLoading(true)
      
      const incident = incidents.find(i => i.id === incidentId)
      
      // Delete recording from storage if exists
      if (incident?.recording_url) {
        try {
          const fileName = incident.recording_url.split('/').pop()
          await supabaseService.deleteRecording(fileName)
        } catch (error) {
          console.error('Error deleting recording:', error)
        }
      }

      // Delete incident card from IPFS if exists
      if (incident?.incident_card_hash) {
        try {
          await pinataService.unpinFile(incident.incident_card_hash)
        } catch (error) {
          console.error('Error unpinning incident card:', error)
        }
      }

      // Delete from database
      const { error } = await supabaseService.deleteIncident(incidentId)
      
      if (error) {
        toast.error('Failed to delete incident')
        return { success: false, error }
      }

      // Update local state
      setIncidents(prev => prev.filter(incident => incident.id !== incidentId))
      
      toast.success('Incident deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting incident:', error)
      toast.error('Failed to delete incident')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    if (!isPremium) {
      toast.error('Recording is a premium feature')
      return { success: false, error: 'Premium feature required' }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      const mediaRecorder = new MediaRecorder(stream)
      const chunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const fileName = `recording-${Date.now()}.webm`
        
        // Upload to Supabase storage
        const { data, error } = await supabaseService.uploadRecording(blob, fileName)
        
        if (!error) {
          const recordingUrl = await supabaseService.getRecordingUrl(fileName)
          setCurrentRecording({
            blob,
            url: recordingUrl,
            fileName
          })
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setRecording(true)
      
      return { 
        success: true, 
        mediaRecorder, 
        stream 
      }
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording')
      return { success: false, error }
    }
  }

  function stopRecording(mediaRecorder) {
    if (mediaRecorder && recording) {
      mediaRecorder.stop()
      setRecording(false)
      return { success: true }
    }
    return { success: false, error: 'No active recording' }
  }

  async function shareIncident(incidentId, format = 'text') {
    try {
      const incident = incidents.find(i => i.id === incidentId)
      if (!incident) {
        toast.error('Incident not found')
        return { success: false, error: 'Incident not found' }
      }

      // If incident has a card, get it from IPFS
      let incidentCard = null
      if (incident.incident_card_hash) {
        const cardResult = await pinataService.getFile(incident.incident_card_hash)
        if (cardResult.success) {
          incidentCard = cardResult.data
        }
      }

      // Format for sharing
      let shareText
      if (incidentCard) {
        shareText = incidentCardUtils.formatForSharing(incidentCard, format)
      } else {
        // Basic sharing format
        shareText = `
🚨 Law Enforcement Interaction

📅 Date: ${new Date(incident.timestamp).toLocaleString()}
📍 Location: ${incident.location ? 'Recorded' : 'Not recorded'}
📝 Notes: ${incident.notes || 'No additional notes'}

📋 Generated by KnowYourRights Chat
        `.trim()
      }

      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'Law Enforcement Interaction Documentation',
          text: shareText,
          url: incidentCard?.sharing?.shareableLink
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success('Incident details copied to clipboard')
      }

      return { success: true, shareText }
    } catch (error) {
      console.error('Error sharing incident:', error)
      toast.error('Failed to share incident')
      return { success: false, error }
    }
  }

  return {
    incidents,
    loading,
    recording,
    currentRecording,
    saveIncident,
    updateIncident,
    deleteIncident,
    startRecording,
    stopRecording,
    shareIncident,
    loadIncidents
  }
}
