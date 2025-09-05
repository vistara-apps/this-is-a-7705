import { openaiService } from '../services/openai'
import { pinataService } from '../services/pinata'
import { v4 as uuidv4 } from 'uuid'

export const incidentCardUtils = {
  // Generate a comprehensive incident card
  async generateIncidentCard(incidentData, stateRights) {
    try {
      const cardId = uuidv4()
      const timestamp = new Date().toISOString()
      
      // Generate AI summary if available
      let aiSummary = null
      if (incidentData.notes || incidentData.location) {
        const summaryResult = await openaiService.generateIncidentCard({
          ...incidentData,
          stateRights
        })
        
        if (summaryResult.success) {
          aiSummary = summaryResult.summary
        }
      }

      // Create incident card data structure
      const incidentCard = {
        id: cardId,
        timestamp,
        version: '1.0',
        type: 'law-enforcement-interaction',
        
        // Basic incident information
        incident: {
          date: incidentData.timestamp || timestamp,
          duration: incidentData.duration || null,
          location: incidentData.location ? {
            latitude: incidentData.location.latitude,
            longitude: incidentData.location.longitude,
            accuracy: incidentData.location.accuracy || null
          } : null,
          notes: incidentData.notes || '',
          recordingUrl: incidentData.recordingUrl || null,
          recordingHash: incidentData.recordingHash || null
        },

        // User-provided context
        context: {
          state: incidentData.selectedState || 'Unknown',
          userNotes: incidentData.notes || '',
          witnessCount: incidentData.witnessCount || 0,
          officerCount: incidentData.officerCount || 1,
          vehicleInvolved: incidentData.vehicleInvolved || false
        },

        // Relevant rights information
        applicableRights: stateRights ? stateRights.map(right => ({
          title: right.title,
          content: right.content,
          relevance: this.assessRightRelevance(right, incidentData)
        })) : [],

        // AI-generated insights
        aiAnalysis: aiSummary ? {
          summary: aiSummary,
          generatedAt: timestamp,
          model: 'gpt-3.5-turbo'
        } : null,

        // Sharing and legal information
        sharing: {
          shareableLink: null, // Will be populated after IPFS upload
          qrCode: null, // Can be generated client-side
          accessLevel: 'public', // public, private, legal-only
          expiresAt: null // Optional expiration
        },

        // Legal disclaimers
        disclaimers: [
          'This incident card is for documentation purposes only and does not constitute legal advice.',
          'Consult with a qualified attorney for legal guidance specific to your situation.',
          'The AI-generated analysis is based on general legal principles and may not apply to your specific case.'
        ],

        // Metadata
        metadata: {
          appVersion: '1.0.0',
          platform: 'web',
          userAgent: navigator.userAgent,
          createdBy: 'KnowYourRights Chat',
          dataIntegrity: null // Will be populated with hash
        }
      }

      // Calculate data integrity hash
      incidentCard.metadata.dataIntegrity = await this.calculateDataHash(incidentCard)

      return {
        success: true,
        incidentCard
      }
    } catch (error) {
      console.error('Error generating incident card:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Upload incident card to IPFS
  async uploadToIPFS(incidentCard, userId) {
    try {
      const metadata = {
        name: `incident-card-${incidentCard.id}`,
        type: 'incident-card',
        timestamp: incidentCard.timestamp,
        userId: userId || 'anonymous',
        customData: {
          state: incidentCard.context.state,
          hasRecording: !!incidentCard.incident.recordingUrl,
          hasAiAnalysis: !!incidentCard.aiAnalysis
        }
      }

      const uploadResult = await pinataService.uploadJSON(incidentCard, metadata)
      
      if (uploadResult.success) {
        // Update the incident card with IPFS information
        incidentCard.sharing.shareableLink = pinataService.generateShareableLink(
          uploadResult.ipfsHash, 
          'incident-card'
        )
        incidentCard.metadata.ipfsHash = uploadResult.ipfsHash
        incidentCard.metadata.ipfsGatewayUrl = uploadResult.gatewayUrl
      }

      return uploadResult
    } catch (error) {
      console.error('Error uploading incident card to IPFS:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Assess how relevant a right is to the incident
  assessRightRelevance(right, incidentData) {
    const title = right.title.toLowerCase()
    const notes = (incidentData.notes || '').toLowerCase()
    
    // Simple relevance scoring based on keywords
    let relevance = 'low'
    
    if (title.includes('record') && (notes.includes('record') || notes.includes('video'))) {
      relevance = 'high'
    } else if (title.includes('search') && (notes.includes('search') || notes.includes('consent'))) {
      relevance = 'high'
    } else if (title.includes('silent') && (notes.includes('question') || notes.includes('interrogat'))) {
      relevance = 'high'
    } else if (title.includes('stop') && notes.includes('stop')) {
      relevance = 'medium'
    }
    
    return relevance
  },

  // Calculate a simple hash for data integrity
  async calculateDataHash(data) {
    try {
      const jsonString = JSON.stringify(data, Object.keys(data).sort())
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(jsonString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    } catch (error) {
      console.error('Error calculating data hash:', error)
      return null
    }
  },

  // Generate QR code data for sharing
  generateQRCodeData(shareableLink) {
    return {
      url: shareableLink,
      format: 'QR',
      size: '200x200',
      data: shareableLink
    }
  },

  // Format incident card for sharing via text/email
  formatForSharing(incidentCard, format = 'text') {
    const incident = incidentCard.incident
    const context = incidentCard.context
    
    if (format === 'text') {
      return `
🚨 Law Enforcement Interaction Documentation

📅 Date: ${new Date(incident.date).toLocaleString()}
📍 Location: ${incident.location ? `${incident.location.latitude}, ${incident.location.longitude}` : 'Not recorded'}
⏱️ Duration: ${incident.duration || 'Not recorded'}
🏛️ State: ${context.state}

📝 Notes: ${incident.notes || 'No additional notes'}

🔗 Full Documentation: ${incidentCard.sharing.shareableLink || 'Processing...'}

⚖️ Applicable Rights:
${incidentCard.applicableRights.map(right => `• ${right.title}`).join('\n')}

${incidentCard.aiAnalysis ? `🤖 AI Summary: ${incidentCard.aiAnalysis.summary}` : ''}

📋 Generated by KnowYourRights Chat
⚠️ This is for documentation purposes only. Consult an attorney for legal advice.
      `.trim()
    }
    
    if (format === 'html') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🚨 Law Enforcement Interaction Documentation</h2>
          <p><strong>Date:</strong> ${new Date(incident.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${incident.location ? `${incident.location.latitude}, ${incident.location.longitude}` : 'Not recorded'}</p>
          <p><strong>Duration:</strong> ${incident.duration || 'Not recorded'}</p>
          <p><strong>State:</strong> ${context.state}</p>
          <p><strong>Notes:</strong> ${incident.notes || 'No additional notes'}</p>
          <p><strong>Full Documentation:</strong> <a href="${incidentCard.sharing.shareableLink}">${incidentCard.sharing.shareableLink}</a></p>
          <h3>Applicable Rights:</h3>
          <ul>
            ${incidentCard.applicableRights.map(right => `<li>${right.title}</li>`).join('')}
          </ul>
          ${incidentCard.aiAnalysis ? `<p><strong>AI Summary:</strong> ${incidentCard.aiAnalysis.summary}</p>` : ''}
          <p><small>Generated by KnowYourRights Chat. This is for documentation purposes only. Consult an attorney for legal advice.</small></p>
        </div>
      `
    }
    
    return incidentCard
  }
}
