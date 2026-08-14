import { createClient } from 'jsr:@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const PROD_ORIGIN = 'https://lightsteelblue-moose-697724.hostingersite.com'

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false
  if (origin === PROD_ORIGIN) return true
  try {
    return new URL(origin).hostname === 'localhost'
  } catch {
    return false
  }
}

function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : PROD_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

Deno.serve(async req => {
  const CORS_HEADERS = corsHeaders(req.headers.get('Origin'))
  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

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

  let immediate = false
  try {
    const body = await req.json()
    immediate = body?.immediate === true
  } catch {
    // No JSON body sent — default to the period-end cancellation flow.
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  const { data: sub } = await adminClient
    .from('subscriptions')
    .select('razorpay_subscription_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    return json({ error: 'No subscription found' }, 404)
  }
  if (['cancelled', 'expired', 'completed'].includes(sub.status)) {
    return json({ status: sub.status })
  }

  const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  async function razorpayCancel(cancelAtCycleEnd: 0 | 1) {
    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${sub.razorpay_subscription_id}/cancel`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${basicAuth}` },
        body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd }),
      },
    )
    return { res, data: await res.json() }
  }

  let rpRes: Response
  let rpData: any
  let cancelAtPeriodEnd: boolean

  if (immediate) {
    // Account is being deleted — no access to preserve, cancel outright.
    ;({ res: rpRes, data: rpData } = await razorpayCancel(0))
    cancelAtPeriodEnd = false
  } else {
    // Try to let the user keep access through the current cycle. Razorpay
    // rejects cancel_at_cycle_end specifically when no cycle has actually
    // started yet (e.g. the customer closed Checkout before authenticating) —
    // only fall back to immediate cancellation for that exact case, so an
    // unrelated transient error doesn't silently cut off a paying customer's
    // access early.
    ;({ res: rpRes, data: rpData } = await razorpayCancel(1))
    cancelAtPeriodEnd = true
    if (!rpRes.ok && /no billing cycle/i.test(rpData?.error?.description || '')) {
      ;({ res: rpRes, data: rpData } = await razorpayCancel(0))
      cancelAtPeriodEnd = false
    }
  }
  if (!rpRes.ok) {
    return json({ error: rpData.error?.description || 'Failed to cancel subscription' }, 502)
  }

  await adminClient
    .from('subscriptions')
    .update({
      status: rpData.status || sub.status,
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_subscription_id', sub.razorpay_subscription_id)

  return json({ status: rpData.status || sub.status, cancelAtPeriodEnd })
})
