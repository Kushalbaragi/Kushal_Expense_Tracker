import { createClient } from 'jsr:@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

// All subscription lifecycle events Razorpay can send us. Anything else with
// a `subscription` entity attached (unlikely, but not worth trusting blindly)
// is ignored rather than blindly written to the DB.
const SUBSCRIPTION_EVENTS = new Set([
  'subscription.authenticated',
  'subscription.activated',
  'subscription.charged',
  'subscription.completed',
  'subscription.pending',
  'subscription.halted',
  'subscription.cancelled',
  'subscription.paused',
  'subscription.resumed',
])

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

async function verifySignature(body: string, signature: string, secret: string) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return timingSafeEqual(hex, signature)
}

Deno.serve(async req => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('x-razorpay-signature')
  const rawBody = await req.text()

  if (!signature || !(await verifySignature(rawBody, signature, WEBHOOK_SECRET))) {
    return new Response('Invalid signature', { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const subEntity = event.payload?.subscription?.entity

  if (subEntity?.id && SUBSCRIPTION_EVENTS.has(event.event)) {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    await adminClient
      .from('subscriptions')
      .update({
        status: subEntity.status,
        current_start: subEntity.current_start ? new Date(subEntity.current_start * 1000).toISOString() : null,
        current_end: subEntity.current_end ? new Date(subEntity.current_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_subscription_id', subEntity.id)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
