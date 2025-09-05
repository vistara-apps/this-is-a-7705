import React, { useState } from 'react'
import { Shield, Copy, CheckCircle, Lock, Crown } from 'lucide-react'

export function RightsGuide({ stateData, user, onUpgrade }) {
  const [copiedSection, setCopiedSection] = useState(null)

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  if (!stateData) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Rights Data Available</h2>
        <p className="text-dark-text-secondary">
          Please select a state to view specific rights information.
        </p>
      </div>
    )
  }

  const basicRights = stateData.rights.slice(0, 3)
  const premiumRights = stateData.rights.slice(3)
  const isPremium = user.subscriptionTier === 'premium'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your Rights in {stateData.state}</h1>
        <p className="text-dark-text-secondary">
          Know your constitutional and state-specific rights during law enforcement interactions.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-text">Basic Rights (Free)</h2>
        {basicRights.map((right, index) => (
          <div key={index} className="bg-dark-card rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-dark-text">{right.title}</h3>
              <button
                onClick={() => handleCopy(right.content, `basic-${index}`)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {copiedSection === `basic-${index}` ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-dark-text-secondary">{right.content}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-dark-text">Advanced Rights</h2>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>

        {!isPremium ? (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-dark-text mb-2">Premium Content</h3>
            <p className="text-dark-text-secondary mb-4">
              Upgrade to access advanced state-specific rights, detailed legal procedures, and more.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              Upgrade to Premium
            </button>
          </div>
        ) : (
          premiumRights.map((right, index) => (
            <div key={index} className="bg-dark-card rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-dark-text">{right.title}</h3>
                <button
                  onClick={() => handleCopy(right.content, `premium-${index}`)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedSection === `premium-${index}` ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-dark-text-secondary">{right.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">Important Note</h3>
        <p className="text-dark-text-secondary text-sm">
          This information is for educational purposes only and does not constitute legal advice. 
          Always remain calm and respectful during law enforcement interactions.
        </p>
      </div>
    </div>
  )
}