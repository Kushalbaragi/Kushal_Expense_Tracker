import { createClient } from 'jsr:@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'Missing authorization' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('razorpay_subscription_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  // No subscription yet, or checkout never actually completed — nothing to show.
  if (!sub || sub.status === 'created') {
    return json({ method: null })
  }

  const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  const subRes = await fetch(`https://api.razorpay.com/v1/subscriptions/${sub.razorpay_subscription_id}`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  })
  const subData = await subRes.json()
  if (!subRes.ok || !subData.customer_id) {
    return json({ method: null })
  }

  const tokensRes = await fetch(`https://api.razorpay.com/v1/customers/${subData.customer_id}/tokens`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  })
  const tokensData = await tokensRes.json()
  const token = tokensData.items?.[0]
  if (!tokensRes.ok || !token) {
    return json({ method: null })
  }

  return json({
    method: token.method || null,
    card: token.card ? { network: token.card.network, last4: token.card.last4 } : null,
    vpa: token.vpa?.address || null,
  })
})
