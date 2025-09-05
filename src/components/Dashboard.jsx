import React from 'react'
import { Shield, MessageSquare, Video, FileText, Lock, Crown } from 'lucide-react'

export function Dashboard({ selectedState, setCurrentView, user, onUpgrade }) {
  const features = [
    {
      id: 'rights',
      title: 'Your Rights',
      description: 'State-specific legal rights and information',
      icon: Shield,
      color: 'bg-blue-500',
      premium: false
    },
    {
      id: 'scripts',
      title: 'De-escalation Scripts',
      description: 'Proven phrases for calm communication',
      icon: MessageSquare,
      color: 'bg-green-500',
      premium: false
    },
    {
      id: 'record',
      title: 'Record Incident',
      description: 'One-tap recording and documentation',
      icon: Video,
      color: 'bg-red-500',
      premium: true
    },
    {
      id: 'history',
      title: 'Incident History',
      description: 'View and manage your recorded incidents',
      icon: FileText,
      color: 'bg-purple-500',
      premium: true
    }
  ]

  const handleFeatureClick = (feature) => {
    if (feature.premium && user.subscriptionTier === 'free') {
      onUpgrade()
    } else {
      setCurrentView(feature.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-dark-text-secondary">
          You're protected under {selectedState} law
        </p>
      </div>

      <div className="grid gap-4">
        {features.map((feature) => {
          const Icon = feature.icon
          const isPremiumLocked = feature.premium && user.subscriptionTier === 'free'
          
          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              className={`relative bg-dark-card rounded-lg p-6 text-left hover:bg-dark-surface transition-colors ${
                isPremiumLocked ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`${feature.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-dark-text">{feature.title}</h3>
                    {feature.premium && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-dark-text-secondary text-sm">{feature.description}</p>
                </div>
                {isPremiumLocked && (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {user.subscriptionTier === 'free' && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-dark-text">Upgrade to Premium</h3>
          </div>
          <p className="text-dark-text-secondary text-sm mb-3">
            Unlock incident recording, cloud storage, and advanced features for just $5/month.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div className="bg-dark-card rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-dark-text">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{user.incidents?.length || 0}</div>
            <div className="text-sm text-dark-text-secondary">Incidents Recorded</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">{selectedState}</div>
            <div className="text-sm text-dark-text-secondary">State Selected</div>
          </div>
        </div>
      </div>
    </div>
  )
}