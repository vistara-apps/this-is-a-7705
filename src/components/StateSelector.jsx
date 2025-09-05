import React, { useState } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { usStates } from '../data/states'

export function StateSelector({ onStateSelect }) {
  const [selectedState, setSelectedState] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedState) {
      onStateSelect(selectedState)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-dark-text">KnowYourRights Chat</h1>
          <p className="text-dark-text-secondary text-lg">
            Your pocket guide to rights and de-escalation with law enforcement
          </p>
        </div>

        <div className="bg-dark-card rounded-lg p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4 text-dark-text">Select Your State</h2>
          <p className="text-dark-text-secondary mb-6">
            We'll provide you with state-specific legal information and rights guides.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-dark-bg border border-gray-600 rounded-lg px-4 py-3 text-dark-text appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Choose your state...</option>
                {usStates.map((state) => (
                  <option key={state.code} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={!selectedState}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Get Started
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-dark-text-secondary">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  )
}