import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTransactions } from '../hooks/useTransactions'

const APP_VERSION = '1.0.0'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />
}

function Row({ label, value, onClick, right }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-[14px] ${onClick ? 'cursor-pointer hover:bg-white/5 active:bg-white/8 transition-colors' : ''}`}
      onClick={onClick}
    >
      <span className="text-white text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-white/35 text-xs">{value}</span>}
        {right || (onClick && !right && <ChevronRight />)}
      </div>
    </div>
  )
}

/* ── Info modals ── */
function InfoModal({ open, title, children, onClose }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-[480px] rounded-t-3xl px-6 pt-5 pb-10 transition-all duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'rgba(14,14,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', maxHeight: '80vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <p className="text-white font-semibold text-base mb-4">{title}</p>
        <div className="text-white/45 text-sm leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { transactions } = useTransactions()

  const [modal, setModal] = useState(null) // 'privacy' | 'terms' | 'developer'

  function exportData() {
    if (!transactions.length) return
    const csv = ['Date,Type,Amount,Description',
      ...transactions.map(t => `${t.date},${t.type},${t.amount},"${t.description}"`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-tracker-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Settings</span>
        </div>

        <div className="px-4 space-y-3 pb-16">

          {/* Legal */}
          <p className="text-white/30 text-[11px] font-medium uppercase tracking-widest px-1 pt-2">Legal</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Row label="Privacy Policy" onClick={() => setModal('privacy')} />
            <Divider />
            <Row label="Terms & Conditions" onClick={() => setModal('terms')} />
          </div>

          {/* Data */}
          <p className="text-white/30 text-[11px] font-medium uppercase tracking-widest px-1 pt-2">Data</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Row label="Backup" value="Coming soon" />
            <Divider />
            <Row label="Export / Import" onClick={exportData} right={
              <span className="text-white/35 text-xs">CSV</span>
            } />
          </div>

          {/* About */}
          <p className="text-white/30 text-[11px] font-medium uppercase tracking-widest px-1 pt-2">About</p>
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Row label="Developer" onClick={() => setModal('developer')} />
            <Divider />
            <Row label="App Version" value={APP_VERSION} />
          </div>

        </div>
      </div>

      {/* Privacy Policy modal */}
      <InfoModal open={modal === 'privacy'} title="Privacy Policy" onClose={() => setModal(null)}>
        <p>Kushal Expense Tracker is designed with your privacy as the top priority.</p>
        <p><strong className="text-white/70">Data storage:</strong> All your financial data is stored securely in Supabase with row-level security. Only you can access your own data.</p>
        <p><strong className="text-white/70">No selling:</strong> We do not sell, share, or monetise your personal data in any way.</p>
        <p><strong className="text-white/70">Authentication:</strong> Login is handled by Supabase Auth with industry-standard encryption.</p>
        <p><strong className="text-white/70">Analytics:</strong> No third-party analytics or tracking libraries are used in this app.</p>
        <p><strong className="text-white/70">Deletion:</strong> You can erase all your data or delete your account at any time from the Account page.</p>
        <p className="text-white/25 text-xs">Last updated: April 2026</p>
      </InfoModal>

      {/* Terms & Conditions modal */}
      <InfoModal open={modal === 'terms'} title="Terms & Conditions" onClose={() => setModal(null)}>
        <p>By using Kushal Expense Tracker you agree to the following terms.</p>
        <p><strong className="text-white/70">Personal use:</strong> This app is provided for personal, non-commercial use only.</p>
        <p><strong className="text-white/70">Accuracy:</strong> The app is a tracking tool and does not constitute financial advice. Always verify important financial decisions with a qualified professional.</p>
        <p><strong className="text-white/70">Availability:</strong> The app is provided "as is". We make no guarantees regarding uptime or data availability.</p>
        <p><strong className="text-white/70">Changes:</strong> We may update these terms at any time. Continued use of the app constitutes acceptance.</p>
        <p><strong className="text-white/70">Contact:</strong> For any queries, reach out to the developer directly.</p>
        <p className="text-white/25 text-xs">Last updated: April 2026</p>
      </InfoModal>

      {/* Developer modal */}
      <InfoModal open={modal === 'developer'} title="Developer" onClose={() => setModal(null)}>
        <div className="text-center py-4 space-y-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold text-white" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>K</div>
          <p className="text-white font-semibold text-base">Kushal Baragi</p>
          <p className="text-white/40 text-sm">Built this app to make personal finance simple, beautiful, and private.</p>
          <p className="text-white/25 text-xs mt-4">Kushal Expense Tracker v{APP_VERSION}<br/>Made with <span style={{ color: 'rgba(248,113,113,0.7)' }}>♥</span> in India</p>
        </div>
      </InfoModal>
    </div>
  )
}
