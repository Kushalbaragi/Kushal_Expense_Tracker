import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PRICE_PER_YEAR, formatChargeDate } from '../utils/trial'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />
}

function SectionLabel({ children }) {
  return <p className="text-white/30 text-[11px] font-medium uppercase tracking-widest px-1 pt-2 mb-2">{children}</p>
}

function Card({ children }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {children}
    </div>
  )
}

function Pill({ children, tone = 'green' }) {
  const style = tone === 'green'
    ? { background: 'rgba(74,222,128,0.14)', color: '#4ade80' }
    : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" style={style}>
      {children}
    </span>
  )
}

const PLAN_PILL = {
  not_started: { label: 'Free', tone: 'grey' },
  trial:       { label: 'Trial', tone: 'green' },
  subscribed:  { label: 'Pro', tone: 'green' },
  expired:     { label: 'Free', tone: 'grey' },
}

const CARD_NETWORK_LABEL = {
  visa: 'VISA', mastercard: 'MC', amex: 'AMEX', rupay: 'RUPAY', diners: 'DINERS',
}

export default function SubscriptionPage({
  onBack, trialInfo, onStartTrial, onCancel, starting, cancelling, error,
  paymentMethod,
}) {
  const navigate = useNavigate()
  const handleBack = () => onBack ? onBack() : navigate(-1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [showCoupon, setShowCoupon] = useState(false)
  const [couponCode, setCouponCode] = useState('')

  const status = trialInfo?.status || 'not_started'
  const isEnding = trialInfo?.cancelAtPeriodEnd && (status === 'trial' || status === 'subscribed')
  const pill = isEnding ? { label: 'Ending', tone: 'grey' } : PLAN_PILL[status]
  const canCancel = (status === 'trial' || status === 'subscribed') && !trialInfo?.cancelAtPeriodEnd
  const needsAction = status === 'not_started' || status === 'expired'

  async function handleConfirmCancel() {
    const ok = await onCancel()
    setConfirmOpen(false)
    if (ok) {
      setCancelSuccess(true)
      setTimeout(() => setCancelSuccess(false), 4000)
    }
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-4">
          <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Subscription</span>
        </div>

        <div className="flex-1 px-4 pb-16 space-y-3">

          {error && (
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <span className="text-red-300 text-[13px]">{error}</span>
            </div>
          )}

          {cancelSuccess && (
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <span className="text-[13px]" style={{ color: '#4ade80' }}>You've successfully unsubscribed</span>
            </div>
          )}

          {/* Current plan */}
          <div>
            <SectionLabel>Current Plan</SectionLabel>
            <Card>
              <div className="flex items-center justify-between px-4 py-[14px]">
                <span className="text-white text-sm">{needsAction ? 'Okana' : 'Okana Plus'}</span>
                <Pill tone={pill.tone}>{pill.label}</Pill>
              </div>

              {status === 'trial' && (
                <>
                  <Divider />
                  <div className="px-4 py-[14px]">
                    <span className="text-white/40 text-xs">
                      {trialInfo.cancelAtPeriodEnd
                        ? `Plus access ends ${formatChargeDate(trialInfo.chargeDate)} — you won't be charged`
                        : `You'll be charged ₹${PRICE_PER_YEAR} on ${formatChargeDate(trialInfo.chargeDate)}`}
                    </span>
                  </div>
                </>
              )}
              {status === 'subscribed' && trialInfo.cancelAtPeriodEnd && (
                <>
                  <Divider />
                  <div className="px-4 py-[14px]">
                    <span className="text-white/40 text-xs">Access until {formatChargeDate(trialInfo.chargeDate)}</span>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Payment method */}
          {(paymentMethod || status === 'trial' || status === 'subscribed') && (
            <div>
              <SectionLabel>Payment Method</SectionLabel>
              <Card>
                {paymentMethod ? (
                  <div className="flex items-center justify-between px-4 py-[14px]">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-bold px-2 py-1 rounded"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
                      >
                        {paymentMethod.card
                          ? (CARD_NETWORK_LABEL[paymentMethod.card.network?.toLowerCase()] || 'CARD')
                          : (paymentMethod.method || 'UPI').toUpperCase()}
                      </span>
                      <span className="text-white/70 text-sm">
                        {paymentMethod.card ? `•••• ${paymentMethod.card.last4}` : paymentMethod.vpa || 'Linked'}
                      </span>
                    </div>
                    {trialInfo.paymentFailed && (
                      <span className="text-[12px] font-medium" style={{ color: 'rgba(248,113,113,0.85)' }}>Payment failed</span>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-[14px]">
                    <span className="text-white/30 text-[13px]">No payment method on file</span>
                  </div>
                )}
              </Card>
            </div>
          )}

          {needsAction && (
            <>
              <button
                onClick={() => onStartTrial(couponCode.trim() || undefined)}
                disabled={starting}
                className="w-full py-[13px] rounded-2xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
                style={{ background: 'rgba(74,222,128,0.25)', color: '#4ade80' }}
              >
                {starting
                  ? 'Starting…'
                  : trialInfo.paymentFailed
                    ? 'Update Payment Method'
                    : status === 'not_started'
                      ? 'Start 30-Day Free Trial'
                      : 'Subscribe Now'}
              </button>

              {!trialInfo.paymentFailed && (
                showCoupon ? (
                  <input
                    autoFocus
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="w-full px-4 py-[10px] rounded-xl text-sm text-white outline-none placeholder-border text-center tracking-wide"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}
                  />
                ) : (
                  <button
                    onClick={() => setShowCoupon(true)}
                    className="w-full text-center text-white/30 text-xs hover:text-white/55 transition-colors"
                  >
                    Have a coupon code?
                  </button>
                )
              )}
            </>
          )}

          {/* Cancel plan */}
          {canCancel && (
            <div>
              <SectionLabel>Cancel Plan</SectionLabel>
              <Card>
                <div className="flex items-center justify-between gap-3 px-4 py-[14px]">
                  <p className="text-white/40 text-xs leading-relaxed">
                    If you cancel, you'll keep full access until {formatChargeDate(trialInfo.chargeDate)}.
                  </p>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="shrink-0 text-[12px] font-medium px-3 py-[7px] rounded-full transition-colors"
                    style={{ border: '1px solid rgba(248,113,113,0.35)', color: 'rgba(248,113,113,0.85)' }}
                  >
                    Cancel
                  </button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <p className="text-white font-semibold text-base mb-2">
              End access on {formatChargeDate(trialInfo.chargeDate)}?
            </p>
            <p className="text-white/45 text-sm leading-relaxed mb-6">
              If you cancel now, you'll still be able to access all features until {formatChargeDate(trialInfo.chargeDate)}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-[11px] rounded-xl text-sm font-medium text-white/60"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                Go back
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-[11px] rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'rgba(248,113,113,0.14)', color: 'rgba(248,113,113,0.9)' }}
              >
                {cancelling ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
