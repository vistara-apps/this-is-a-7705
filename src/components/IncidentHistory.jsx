import React, { useState } from 'react'
import { FileText, Calendar, MapPin, Clock, Share2, Download, Lock, Crown } from 'lucide-react'

export function IncidentHistory({ incidents, user, onUpgrade }) {
  const [selectedIncident, setSelectedIncident] = useState(null)

  const isPremium = user.subscriptionTier === 'premium'

  const shareIncident = (incident) => {
    if (!isPremium) {
      onUpgrade()
      return
    }

    const shareData = {
      title: 'Incident Report',
      text: `Incident recorded on ${new Date(incident.timestamp).toLocaleDateString()}\nLocation: ${incident.location ? `${incident.location.latitude}, ${incident.location.longitude}` : 'Unknown'}\nNotes: ${incident.notes || 'No notes'}`,
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareData.text)
      alert('Incident details copied to clipboard!')
    }
  }

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Incident History</h1>
          <p className="text-dark-text-secondary">
            View and manage your recorded incidents and documentation.
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-text mb-3">Premium Feature</h3>
          <p className="text-dark-text-secondary mb-6">
            Incident history and management requires a Premium subscription. Get access to:
          </p>
          <ul className="text-left text-dark-text-secondary mb-6 space-y-2">
            <li>• Complete incident history</li>
            <li>• Shareable incident cards</li>
            <li>• Cloud storage and backup</li>
            <li>• Export and download options</li>
            <li>• Advanced search and filtering</li>
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

  if (!incidents || incidents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Incident History</h1>
          <p className="text-dark-text-secondary">
            View and manage your recorded incidents and documentation.
          </p>
        </div>

        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-dark-text">No Incidents Recorded</h2>
          <p className="text-dark-text-secondary">
            Your recorded incidents will appear here. Use the incident recorder to document interactions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Incident History</h1>
        <p className="text-dark-text-secondary">
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      <div className="space-y-4">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-dark-card rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-dark-text font-medium">
                    {new Date(incident.timestamp).toLocaleDateString()} at{' '}
                    {new Date(incident.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                {incident.location && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-dark-text-secondary text-sm">
                      {incident.location.latitude.toFixed(6)}, {incident.location.longitude.toFixed(6)}
                    </span>
                  </div>
                )}

                {incident.recordingTime && (
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-red-400" />
                    <span className="text-dark-text-secondary text-sm">
                      Recording: {Math.floor(incident.recordingTime / 60)}m {incident.recordingTime % 60}s
                    </span>
                  </div>
                )}

                {incident.notes && (
                  <p className="text-dark-text-secondary text-sm mt-2">
                    "{incident.notes}"
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => shareIncident(incident)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Share incident"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </button>
                
                {incident.recordingUrl && (
                  <a
                    href={incident.recordingUrl}
                    download={`incident-${incident.id}.webm`}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Download recording"
                  >
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                {incident.state}
              </span>
              {incident.recordingUrl && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  Video Recorded
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">Data Privacy</h3>
        <p className="text-dark-text-secondary text-sm">
          Your incident data is stored securely and encrypted. You maintain full control over your recordings and can delete them at any time.
        </p>
      </div>
    </div>
  )
}