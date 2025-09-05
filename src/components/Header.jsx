import React from 'react'
import { Menu, Moon, Sun, Crown, ArrowLeft } from 'lucide-react'

export function Header({ 
  isDark, 
  setIsDark, 
  currentView, 
  setCurrentView, 
  selectedState, 
  user,
  onUpgrade 
}) {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard'
      case 'rights': return 'Your Rights'
      case 'scripts': return 'De-escalation Scripts'
      case 'record': return 'Record Incident'
      case 'history': return 'Incident History'
      default: return 'KnowYourRights'
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-dark-surface/80 backdrop-blur-md border-b border-gray-700/50 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentView !== 'dashboard' && (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold">{getTitle()}</h1>
            {selectedState && (
              <p className="text-sm text-dark-text-secondary">{selectedState}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.subscriptionTier === 'free' && (
            <button
              onClick={onUpgrade}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </button>
          )}
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  )
}