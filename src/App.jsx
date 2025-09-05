import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import { Header } from './components/Header'
import { StateSelector } from './components/StateSelector'
import { Dashboard } from './components/Dashboard'
import { RightsGuide } from './components/RightsGuide'
import { ScriptsLibrary } from './components/ScriptsLibrary'
import { IncidentRecorder } from './components/IncidentRecorder'
import { IncidentHistory } from './components/IncidentHistory'
import { SubscriptionModal } from './components/SubscriptionModal'
import { stateRightsData } from './data/stateRights'

function App() {
  const [isDark, setIsDark] = useState(true)
  const [currentView, setCurrentView] = useState('onboarding')
  const [selectedState, setSelectedState] = useState('')
  const [user, setUser] = useState({
    subscriptionTier: 'free',
    incidents: []
  })
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const handleStateSelect = (state) => {
    setSelectedState(state)
    setCurrentView('dashboard')
  }

  const handleUpgrade = () => {
    setShowSubscriptionModal(true)
  }

  const handleSubscribe = (tier) => {
    setUser(prev => ({ ...prev, subscriptionTier: tier }))
    setShowSubscriptionModal(false)
  }

  const addIncident = (incident) => {
    setUser(prev => ({
      ...prev,
      incidents: [...prev.incidents, { ...incident, id: Date.now() }]
    }))
  }

  const currentStateData = stateRightsData[selectedState]

  return (
    <AuthProvider>
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-dark-bg text-dark-text' : 'bg-bg text-text-primary'
      }`}>
        <div className="max-w-screen-sm mx-auto px-5 min-h-screen flex flex-col">
          {currentView !== 'onboarding' && (
            <Header 
              isDark={isDark}
              setIsDark={setIsDark}
              currentView={currentView}
              setCurrentView={setCurrentView}
              selectedState={selectedState}
              user={user}
              onUpgrade={handleUpgrade}
            />
          )}

          <main className="flex-1 pb-6">
            {currentView === 'onboarding' && (
              <StateSelector onStateSelect={handleStateSelect} />
            )}

            {currentView === 'dashboard' && (
              <Dashboard 
                selectedState={selectedState}
                setCurrentView={setCurrentView}
                user={user}
                onUpgrade={handleUpgrade}
              />
            )}

            {currentView === 'rights' && (
              <RightsGuide 
                stateData={currentStateData}
                user={user}
                onUpgrade={handleUpgrade}
              />
            )}

            {currentView === 'scripts' && (
              <ScriptsLibrary 
                user={user}
                onUpgrade={handleUpgrade}
              />
            )}

            {currentView === 'record' && (
              <IncidentRecorder 
                selectedState={selectedState}
                onIncidentSaved={addIncident}
                user={user}
                onUpgrade={handleUpgrade}
              />
            )}

            {currentView === 'history' && (
              <IncidentHistory 
                incidents={user.incidents}
                user={user}
                onUpgrade={handleUpgrade}
              />
            )}
          </main>

          {showSubscriptionModal && (
            <SubscriptionModal 
              onClose={() => setShowSubscriptionModal(false)}
              onSubscribe={handleSubscribe}
            />
          )}
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? '#1f2937' : '#ffffff',
              color: isDark ? '#f9fafb' : '#111827',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App
