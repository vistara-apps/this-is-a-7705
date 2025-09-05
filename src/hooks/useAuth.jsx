import { useState, useEffect, useContext, createContext } from 'react'
import { supabaseService } from '../services/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Check for existing session
    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    try {
      const user = await supabaseService.getCurrentUser()
      if (user) {
        setUser(user)
        await loadUserProfile(user.id)
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadUserProfile(userId) {
    try {
      const { data, error } = await supabaseService.getUserProfile(userId)
      if (error) {
        console.error('Error loading profile:', error)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  async function signUp(email, password, userData = {}) {
    try {
      setLoading(true)
      const { data, error } = await supabaseService.signUp(email, password, {
        ...userData,
        subscription_tier: 'free',
        state: userData.state || null
      })

      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      toast.success('Account created! Please check your email to verify.')
      return { success: true, data }
    } catch (error) {
      toast.error('Failed to create account')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    try {
      setLoading(true)
      const { data, error } = await supabaseService.signIn(email, password)

      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      toast.success('Welcome back!')
      return { success: true, data }
    } catch (error) {
      toast.error('Failed to sign in')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    try {
      setLoading(true)
      const { error } = await supabaseService.signOut()
      
      if (error) {
        toast.error(error.message)
        return { success: false, error }
      }

      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully')
      return { success: true }
    } catch (error) {
      toast.error('Failed to sign out')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(updates) {
    try {
      if (!user) return { success: false, error: 'No user logged in' }

      const { data, error } = await supabaseService.updateUserProfile(user.id, updates)
      
      if (error) {
        toast.error('Failed to update profile')
        return { success: false, error }
      }

      setProfile(data[0])
      toast.success('Profile updated successfully')
      return { success: true, data: data[0] }
    } catch (error) {
      toast.error('Failed to update profile')
      return { success: false, error }
    }
  }

  async function upgradeSubscription(tier) {
    try {
      if (!user) return { success: false, error: 'No user logged in' }

      const updates = {
        subscription_tier: tier,
        subscription_updated_at: new Date().toISOString()
      }

      const result = await updateProfile(updates)
      
      if (result.success) {
        toast.success(`Upgraded to ${tier} plan!`)
      }
      
      return result
    } catch (error) {
      toast.error('Failed to upgrade subscription')
      return { success: false, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    upgradeSubscription,
    isAuthenticated: !!user,
    isPremium: profile?.subscription_tier === 'premium',
    isLifetime: profile?.subscription_tier === 'lifetime'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
