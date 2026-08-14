import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FEEDBACK_TO = 'kushalbaragibusiness@gmail.com'
const MAX_MESSAGE_LENGTH = 5000

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

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let message = ''
  try {
    const body = await req.json()
    message = String(body?.message || '').trim()
  } catch {
    // No/invalid JSON body — message stays empty and fails validation below.
  }
  if (!message) {
    return json({ error: 'Message is required' }, 400)
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return json({ error: 'Message is too long' }, 400)
  }

  const senderEmail = user.email || 'unknown@okana.app'

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Okana Feedback <onboarding@resend.dev>',
      to: [FEEDBACK_TO],
      reply_to: senderEmail,
      subject: 'Okana Feedback',
      text: `From: ${senderEmail}\nUser ID: ${user.id}\n\n${message}`,
    }),
  })

  if (!emailRes.ok) {
    const errText = await emailRes.text()
    console.error('Resend error:', errText)
    return json({ error: 'Failed to send feedback' }, 502)
  }

  return json({ sent: true })
})
