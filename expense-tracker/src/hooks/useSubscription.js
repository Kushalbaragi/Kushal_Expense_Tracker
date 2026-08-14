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

async function callFunction(name, token, body) {
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
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
    if (!user) { setSubscription(null); setLoading(false); return null }
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    setSubscription(data)
    setLoading(false)
    return data
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const TERMINAL = ['created', 'cancelled', 'expired', 'completed']
    if (!user || !subscription || TERMINAL.includes(subscription.status)) {
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

  const startTrial = useCallback(async (couponCode) => {
    if (!user) return
    setStarting(true)
    setError(null)
    try {
      await loadCheckoutScript()
      const token = await authToken()
      const subData = await callFunction('create-subscription', token, couponCode ? { couponCode } : undefined)
      const initialStatus = subData.status

      let settled = false
      let rzp

      const checkoutPromise = new Promise((resolve, reject) => {
        rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: subData.subscription_id,
          name: 'Okana Plus',
          description: (subData.hasTrial ? '30-day free trial, then ₹499/year' : '₹499/year, starting today')
            + (couponCode ? ' (coupon applied at checkout)' : ''),
          theme: { color: '#4ade80' },
          handler: () => { settled = true; resolve() },
          modal: { ondismiss: () => { if (!settled) reject(new Error('Checkout closed before completing')) } },
        })
        rzp.on('payment.failed', () => { settled = true; reject(new Error('Payment authorization failed')) })
        rzp.open()
      })

      // Razorpay's client-side success callback can be lost during a bank
      // OTP / 3-D Secure redirect even though the payment actually went
      // through server-side — poll the real subscription status in the
      // background so a lost callback doesn't leave the UI stuck on
      // "Starting…" forever.
      const pollPromise = (async () => {
        for (let i = 0; i < 40; i++) {
          if (settled) return
          await new Promise(r => setTimeout(r, 3000))
          if (settled) return
          const data = await refresh()
          if (data && data.status !== initialStatus && data.status !== 'created') {
            settled = true
            rzp?.close?.()
            return
          }
        }
        if (!settled) throw new Error('Still waiting on your bank/payment provider. Please check back in a few minutes, or try again.')
      })()

      await Promise.race([checkoutPromise, pollPromise])

      // The webhook that syncs the real subscription status can lag a second or
      // two behind Checkout's client-side success — poll briefly so the UI
      // doesn't sit on a stale 'created' state (no payment method shown) right
      // after a successful checkout.
      let data = await refresh()
      for (let i = 0; i < 4 && data?.status === 'created'; i++) {
        await new Promise(r => setTimeout(r, 1500))
        data = await refresh()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }, [user, refresh])

  const cancelSubscription = useCallback(async ({ immediate = false } = {}) => {
    if (!user) return false
    setCancelling(true)
    setError(null)
    try {
      const token = await authToken()
      await callFunction('cancel-subscription', token, { immediate })
      await refresh()
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setCancelling(false)
    }
  }, [user, refresh])

  return {
    subscription, loading, starting, cancelling, error, paymentMethod,
    startTrial, cancelSubscription, refresh,
  }
}
