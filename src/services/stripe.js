import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const stripeService = {
  // Create subscription checkout session
  async createSubscriptionCheckout(priceId, userId, userEmail) {
    try {
      const stripe = await stripePromise
      
      // In a real app, this would call your backend API
      // For demo purposes, we'll simulate the flow
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          mode: 'subscription'
        }),
      })

      const session = await response.json()

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Create one-time payment checkout
  async createOneTimeCheckout(amount, userId, userEmail) {
    try {
      const stripe = await stripePromise
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          userId,
          userEmail,
          mode: 'payment'
        }),
      })

      const session = await response.json()

      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }

      return { success: true }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get customer subscription status
  async getSubscriptionStatus(customerId) {
    try {
      const response = await fetch(`/api/subscription-status/${customerId}`)
      const data = await response.json()
      
      return {
        success: true,
        subscription: data.subscription
      }
    } catch (error) {
      console.error('Subscription status error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        }),
      })

      const data = await response.json()
      
      return {
        success: true,
        subscription: data.subscription
      }
    } catch (error) {
      console.error('Cancel subscription error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Pricing configuration
  pricing: {
    premium: {
      monthly: {
        priceId: 'price_premium_monthly',
        amount: 500, // $5.00 in cents
        interval: 'month'
      },
      yearly: {
        priceId: 'price_premium_yearly',
        amount: 5000, // $50.00 in cents (2 months free)
        interval: 'year'
      }
    },
    lifetime: {
      priceId: 'price_lifetime',
      amount: 9900 // $99.00 in cents
    }
  }
}
