import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadCheckoutScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')))
      return
    }
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(script)
  })
}

async function authToken() {
  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  if (!token) throw new Error('Not signed in')
  return token
}

async function callFunction(name, token) {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Failed to call ${name}`)
  return data
}

export function useSubscription(user) {
  const [subscription,  setSubscription]  = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [starting,      setStarting]      = useState(false)
  const [cancelling,    setCancelling]    = useState(false)
  const [error,         setError]         = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)

  const refresh = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return }
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    setSubscription(data)
    setLoading(false)
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    if (!user || !subscription || subscription.status === 'created') {
      setPaymentMethod(null)
      return
    }
    let cancelled = false
    authToken()
      .then(token => callFunction('get-payment-method', token))
      .then(data => { if (!cancelled) setPaymentMethod(data.method ? data : null) })
      .catch(() => { if (!cancelled) setPaymentMethod(null) })
    return () => { cancelled = true }
  }, [user, subscription])

  const startTrial = useCallback(async () => {
    if (!user) return
    setStarting(true)
    setError(null)
    try {
      await loadCheckoutScript()
      const token = await authToken()
      const data = await callFunction('create-subscription', token)

      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: data.subscription_id,
          name: 'Okana Plus',
          description: '30-day free trial, then ₹499/year',
          theme: { color: '#4ade80' },
          handler: () => resolve(),
          modal: { ondismiss: () => reject(new Error('Checkout closed before completing')) },
        })
        rzp.on('payment.failed', () => reject(new Error('Payment authorization failed')))
        rzp.open()
      })

      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }, [user, refresh])

  const cancelSubscription = useCallback(async () => {
    if (!user) return
    setCancelling(true)
    setError(null)
    try {
      const token = await authToken()
      await callFunction('cancel-subscription', token)
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }, [user, refresh])

  return {
    subscription, loading, starting, cancelling, error, paymentMethod,
    startTrial, cancelSubscription, updatePaymentMethod: startTrial, refresh,
  }
}
