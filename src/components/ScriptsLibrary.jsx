import React, { useState } from 'react'
import { MessageSquare, Copy, CheckCircle, Search, Lock, Crown } from 'lucide-react'
import { scriptsData } from '../data/scripts'

export function ScriptsLibrary({ user, onUpgrade }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedScript, setCopiedScript] = useState(null)
  const [selectedLanguage, setSelectedLanguage] = useState('english')

  const handleCopy = (text, scriptId) => {
    navigator.clipboard.writeText(text)
    setCopiedScript(scriptId)
    setTimeout(() => setCopiedScript(null), 2000)
  }

  const filteredScripts = scriptsData.filter(script =>
    script.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.scriptText.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const freeScripts = filteredScripts.slice(0, 3)
  const premiumScripts = filteredScripts.slice(3)
  const isPremium = user.subscriptionTier === 'premium'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">De-escalation Scripts</h1>
        <p className="text-dark-text-secondary">
          Proven phrases for calm and respectful communication during law enforcement interactions.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search scripts by scenario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-surface border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLanguage('english')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLanguage === 'english'
                ? 'bg-green-500 text-white'
                : 'bg-dark-surface text-dark-text-secondary hover:bg-gray-700'
            }`}
          >
            English
          </button>
          {isPremium ? (
            <button
              onClick={() => setSelectedLanguage('spanish')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLanguage === 'spanish'
                  ? 'bg-green-500 text-white'
                  : 'bg-dark-surface text-dark-text-secondary hover:bg-gray-700'
              }`}
            >
              Español
            </button>
          ) : (
            <button
              onClick={onUpgrade}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-dark-surface text-dark-text-secondary hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              Español <Crown className="w-3 h-3 text-yellow-500" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-dark-text">Free Scripts</h2>
        {freeScripts.map((script) => (
          <div key={script.scriptId} className="bg-dark-card rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-dark-text mb-1">{script.scenario}</h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {script.type}
                </span>
              </div>
              <button
                onClick={() => handleCopy(script.scriptText, script.scriptId)}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
              >
                {copiedScript === script.scriptId ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-dark-text-secondary italic">"{script.scriptText}"</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-dark-text">Premium Scripts</h2>
          <Crown className="w-5 h-5 text-yellow-500" />
        </div>

        {!isPremium ? (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold text-dark-text mb-2">Premium Scripts</h3>
            <p className="text-dark-text-secondary mb-4">
              Access advanced de-escalation scripts, multilingual support, and scenario-specific phrases.
            </p>
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all"
            >
              Upgrade for Full Library
            </button>
          </div>
        ) : (
          premiumScripts.map((script) => (
            <div key={script.scriptId} className="bg-dark-card rounded-lg p-4 border border-yellow-500/30">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-dark-text mb-1">{script.scenario}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {script.type}
                    </span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      Premium
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(script.scriptText, script.scriptId)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  {copiedScript === script.scriptId ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-dark-text-secondary italic">"{script.scriptText}"</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-400 mb-2">Usage Tips</h3>
        <ul className="text-dark-text-secondary text-sm space-y-1">
          <li>• Speak slowly and clearly</li>
          <li>• Keep your hands visible</li>
          <li>• Avoid sudden movements</li>
          <li>• Remain calm and respectful</li>
          <li>• Ask for clarification if needed</li>
        </ul>
      </div>
    </div>
  )
}