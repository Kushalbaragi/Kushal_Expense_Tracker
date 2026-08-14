import { createClient } from 'jsr:@supabase/supabase-js@2'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!
const PLAN_ID = 'plan_TPVOuJVHao79jC'
const TRIAL_DAYS = 30

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

  const adminClient = createClient(supabaseUrl, serviceRoleKey)

  let couponCode: string | undefined
  try {
    const body = await req.json()
    couponCode = body?.couponCode
  } catch {
    // No body / not JSON — coupon is optional, just proceed without one.
  }

  let coupon: { id: string; razorpay_offer_id: string; times_redeemed: number } | null = null
  if (couponCode) {
    const normalized = couponCode.trim().toUpperCase()
    const { data: found } = await adminClient
      .from('coupons')
      .select('id, razorpay_offer_id, active, expires_at, max_redemptions, times_redeemed')
      .eq('code', normalized)
      .maybeSingle()

    if (!found || !found.active || (found.expires_at && new Date(found.expires_at) < new Date())) {
      return json({ error: 'Invalid or expired coupon code' }, 400)
    }
    if (found.max_redemptions != null && found.times_redeemed >= found.max_redemptions) {
      return json({ error: 'This coupon has already been fully redeemed' }, 400)
    }
    const { data: alreadyUsed } = await adminClient
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', found.id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (alreadyUsed) {
      return json({ error: 'You already used this coupon' }, 400)
    }
    coupon = found
  }

  // Reuse an existing subscription unless it's in a terminal state — a cancelled/expired
  // one can't be reactivated on Razorpay, so a resubscribe needs a genuinely new one.
  const { data: existing } = await adminClient
    .from('subscriptions')
    .select('razorpay_subscription_id, status, trial_start, trial_used, current_start, trial_end, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const TERMINAL = ['cancelled', 'expired', 'completed']
  if (existing && !TERMINAL.includes(existing.status)) {
    return json({
      subscription_id: existing.razorpay_subscription_id,
      status: existing.status,
      // Still framed as a trial as long as this row has never actually been
      // billed — covers resuming an incomplete checkout or re-authenticating
      // a halted subscription that failed before its first real charge.
      hasTrial: !existing.current_start,
    })
  }

  // A user only ever gets one free trial. If they've already had one — even
  // if they cancelled mid-trial and are resubscribing after it lapsed — this
  // is a paid subscription starting immediately, not another 30-day trial.
  const grantTrial = !existing?.trial_used
  const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)

  const subscriptionBody: Record<string, unknown> = {
    plan_id: PLAN_ID,
    total_count: 100,
    customer_notify: 1,
    notes: { user_id: user.id },
  }
  if (grantTrial) {
    subscriptionBody.start_at = Math.floor(Date.now() / 1000) + TRIAL_DAYS * 86400
  }
  if (coupon) {
    subscriptionBody.offer_id = coupon.razorpay_offer_id
  }

  const rpRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify(subscriptionBody),
  })

  const rpData = await rpRes.json()
  if (!rpRes.ok) {
    return json({ error: rpData.error?.description || 'Failed to create subscription' }, 502)
  }

  const trialEnd = grantTrial
    ? new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString().slice(0, 10)
    : (existing?.trial_end ?? null)

  const row = {
    user_id: user.id,
    razorpay_subscription_id: rpData.id,
    status: rpData.status,
    plan_id: PLAN_ID,
    trial_start: grantTrial ? new Date().toISOString().slice(0, 10) : (existing?.trial_start ?? null),
    trial_used: true,
    cancel_at_period_end: false,
    current_start: null,
    current_end: null,
    // Platform-agnostic fields — kept in sync for future Apple/Google rows too.
    platform: 'razorpay',
    product_id: PLAN_ID,
    trial_end: trialEnd,
    current_period_start: null,
    current_period_end: null,
    auto_renew: true,
    expires_at: grantTrial ? new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString() : (existing?.expires_at ?? null),
  }

  const { error: writeError } = existing
    ? await adminClient.from('subscriptions').update(row).eq('user_id', user.id)
    : await adminClient.from('subscriptions').insert(row)

  if (writeError) {
    return json({ error: 'Failed to save subscription' }, 500)
  }

  if (coupon) {
    await adminClient.from('coupon_redemptions').insert({ coupon_id: coupon.id, user_id: user.id })
    await adminClient.from('coupons').update({ times_redeemed: coupon.times_redeemed + 1 }).eq('id', coupon.id)
  }

  return json({ subscription_id: rpData.id, status: rpData.status, hasTrial: grantTrial })
})
