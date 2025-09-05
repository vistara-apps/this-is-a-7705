import React from 'react'
import { X, Crown, Check } from 'lucide-react'

export function SubscriptionModal({ onClose, onSubscribe }) {
  const features = {
    free: [
      'Basic rights guides',
      'Limited de-escalation scripts',
      'State selection',
      'Educational content'
    ],
    premium: [
      'All state-specific rights guides',
      'Complete script library',
      'Multi-language support',
      'One-tap incident recording',
      'Cloud storage for recordings',
      'Shareable incident cards',
      'Advanced documentation tools',
      'Priority support'
    ]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-surface border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-dark-text">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Free Plan */}
          <div className="border border-gray-600 rounded-lg p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-dark-text">Free</h3>
              <div className="text-2xl font-bold text-dark-text">$0</div>
              <p className="text-dark-text-secondary text-sm">Forever</p>
            </div>
            
            <ul className="space-y-2 mb-4">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-dark-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                onSubscribe('free')
                onClose()
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Continue with Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="border-2 border-yellow-500 rounded-lg p-4 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Recommended
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-dark-text">Premium</h3>
              </div>
              <div className="text-3xl font-bold text-dark-text">$5</div>
              <p className="text-dark-text-secondary text-sm">per month</p>
            </div>
            
            <ul className="space-y-2 mb-4">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-dark-text">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                onSubscribe('premium')
                onClose()
              }}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-lg font-medium transition-all"
            >
              Upgrade to Premium
            </button>
          </div>

          <div className="text-center text-xs text-dark-text-secondary">
            Cancel anytime. No long-term commitments.
          </div>
        </div>
      </div>
    </div>
  )
}