import { createClient } from 'jsr:@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!
const PLAN_ID = 'plan_TPVOuJVHao79jC'
const TRIAL_DAYS = 30

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

  // Reuse an existing subscription unless it's in a terminal state — a cancelled/expired
  // one can't be reactivated on Razorpay, so a resubscribe needs a genuinely new one.
  const { data: existing } = await adminClient
    .from('subscriptions')
    .select('razorpay_subscription_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const TERMINAL = ['cancelled', 'expired', 'completed']
  if (existing && !TERMINAL.includes(existing.status)) {
    return json({ subscription_id: existing.razorpay_subscription_id, status: existing.status })
  }

  const startAt = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 86400
  const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  const rpRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      plan_id: PLAN_ID,
      total_count: 100,
      customer_notify: 1,
      start_at: startAt,
      notes: { user_id: user.id },
    }),
  })

  const rpData = await rpRes.json()
  if (!rpRes.ok) {
    return json({ error: rpData.error?.description || 'Failed to create subscription' }, 502)
  }

  const row = {
    user_id: user.id,
    razorpay_subscription_id: rpData.id,
    status: rpData.status,
    plan_id: PLAN_ID,
    trial_start: new Date().toISOString().slice(0, 10),
    cancel_at_period_end: false,
    current_start: null,
    current_end: null,
  }

  const { error: writeError } = existing
    ? await adminClient.from('subscriptions').update(row).eq('user_id', user.id)
    : await adminClient.from('subscriptions').insert(row)

  if (writeError) {
    return json({ error: 'Failed to save subscription' }, 500)
  }

  return json({ subscription_id: rpData.id, status: rpData.status })
})
