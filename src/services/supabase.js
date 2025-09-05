import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const supabaseService = {
  // User management
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // User profile management
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  },

  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Incident management
  async saveIncident(incident) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
    return { data, error }
  },

  async getUserIncidents(userId) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async updateIncident(incidentId, updates) {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', incidentId)
      .select()
    return { data, error }
  },

  async deleteIncident(incidentId) {
    const { error } = await supabase
      .from('incidents')
      .delete()
      .eq('id', incidentId)
    return { error }
  },

  // File storage for recordings
  async uploadRecording(file, fileName) {
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, file)
    return { data, error }
  },

  async getRecordingUrl(fileName) {
    const { data } = supabase.storage
      .from('recordings')
      .getPublicUrl(fileName)
    return data.publicUrl
  },

  async deleteRecording(fileName) {
    const { error } = await supabase.storage
      .from('recordings')
      .remove([fileName])
    return { error }
  }
}
