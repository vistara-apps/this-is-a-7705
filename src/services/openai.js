import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

export const openaiService = {
  // Generate incident card summary
  async generateIncidentCard(incidentData) {
    try {
      const { location, notes, timestamp, stateRights, duration } = incidentData
      
      const prompt = `
        Create a concise incident summary card for a law enforcement interaction with the following details:
        
        Date/Time: ${new Date(timestamp).toLocaleString()}
        Duration: ${duration || 'Unknown'}
        Location: ${location ? `${location.latitude}, ${location.longitude}` : 'Not available'}
        Notes: ${notes || 'No additional notes'}
        
        State Rights Context: ${stateRights ? stateRights.map(r => r.title).join(', ') : 'General rights'}
        
        Please generate:
        1. A brief, factual summary (2-3 sentences)
        2. Key rights that were relevant
        3. Important actions taken
        4. Any recommendations for follow-up
        
        Keep it professional, factual, and suitable for sharing with legal counsel or advocacy groups.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal assistant helping create factual incident summaries for law enforcement interactions. Be concise, professional, and focus on rights and documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })

      return {
        success: true,
        summary: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Generate contextual de-escalation scripts
  async generateContextualScript(scenario, userContext) {
    try {
      const prompt = `
        Generate a professional, respectful de-escalation script for this law enforcement interaction scenario:
        
        Scenario: ${scenario}
        Context: ${userContext || 'General interaction'}
        
        The script should:
        1. Be calm and respectful
        2. Assert constitutional rights appropriately
        3. Avoid escalation
        4. Be practical for real-world use
        5. Be 1-2 sentences maximum
        
        Provide the script in both English and Spanish.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert in constitutional rights and de-escalation techniques. Generate practical, respectful scripts for law enforcement interactions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.4
      })

      return {
        success: true,
        script: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Analyze incident for legal insights
  async analyzeIncident(incidentData) {
    try {
      const { notes, location, duration, stateRights } = incidentData
      
      const prompt = `
        Analyze this law enforcement interaction for potential legal considerations:
        
        Duration: ${duration}
        Location: ${location ? 'Recorded' : 'Not recorded'}
        Notes: ${notes}
        Applicable Rights: ${stateRights ? stateRights.map(r => r.title).join(', ') : 'General'}
        
        Provide:
        1. Key legal observations
        2. Rights that may have been relevant
        3. Recommended next steps
        4. Documentation quality assessment
        
        Keep analysis factual and educational.
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a legal education assistant. Provide factual, educational analysis of law enforcement interactions focusing on constitutional rights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.3
      })

      return {
        success: true,
        analysis: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
