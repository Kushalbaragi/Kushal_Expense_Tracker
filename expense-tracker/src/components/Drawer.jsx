import { useNavigate } from 'react-router-dom'

export default function Drawer({ open, onClose }) {
  const navigate = useNavigate()

  function go(path) {
    onClose()
    navigate(path)
  }

  return (
    <>
      {/* Invisible backdrop */}
      <div
        className={`fixed inset-0 z-40 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Popup menu */}
      <div
        className={`fixed top-[52px] left-4 z-50 rounded-2xl overflow-hidden transition-all duration-200 origin-top-left ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        style={{
          minWidth: '190px',
          background: 'rgba(18,18,18,0.94)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}
      >
        <button
          onClick={() => go('/account')}
          className="w-full text-left px-5 py-[14px] text-sm text-white hover:bg-white/5 active:bg-white/10 transition-colors duration-150"
        >
          Account
        </button>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />
        <button
          onClick={() => go('/subscription')}
          className="w-full text-left px-5 py-[14px] text-sm text-white hover:bg-white/5 active:bg-white/10 transition-colors duration-150"
        >
          Subscription
        </button>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 16px' }} />
        <button
          onClick={() => go('/settings')}
          className="w-full text-left px-5 py-[14px] text-sm text-white hover:bg-white/5 active:bg-white/10 transition-colors duration-150"
        >
          Settings
        </button>
      </div>
    </>
  )
}
