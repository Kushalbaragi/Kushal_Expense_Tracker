import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatJoinDate(iso) {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function Avatar({ user }) {
  if (user?.avatar) {
    return <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
  }
  const initials = (user?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
      {initials}
    </div>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MenuItem({ label, value, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-[14px] px-4 transition-colors duration-150 hover:bg-white/5 active:bg-white/10 text-left"
    >
      <span className={`text-sm font-normal ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-white/35 truncate max-w-[140px]">{value}</span>}
        {!danger && <ChevronRight />}
      </div>
    </button>
  )
}

function Divider() {
  return <div className="mx-4" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
}

export default function Drawer({ open, onClose }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    onClose()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[300px] flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(14,14,14,0.96)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Profile section */}
        <div className="px-5 pt-14 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {user && profile ? (
            <>
              <Avatar user={profile} />
              <p className="text-white text-base font-semibold mt-4 mb-0.5">{profile.name}</p>
              <p className="text-xs font-medium" style={{ color: '#4ade80' }}>
                Tracking money since {formatJoinDate(profile.joinDate)}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="10" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                  <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-white text-base font-semibold mt-4 mb-1">Not signed in</p>
              <p className="text-white/35 text-xs mb-5">Sign in to sync your data</p>
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center glass-active text-white hover:brightness-110 active:scale-95 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-center glass text-white hover:glass-active active:scale-95 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto py-2">
          {user && profile && (
            <>
              <MenuItem label="Name" value={profile.name} onClick={() => {}} />
              <Divider />
              <MenuItem label="Phone" value={profile.phone || '—'} onClick={() => {}} />
              <Divider />
              <MenuItem label="Email" value={profile.email || '—'} onClick={() => {}} />
              <Divider />
              <MenuItem label="Subscription" value="Free" onClick={() => {}} />
              <div className="mt-4" />
            </>
          )}

          <MenuItem label="Privacy Policy" onClick={() => {}} />
          <Divider />
          <MenuItem label="Terms & Conditions" onClick={() => {}} />

          {user && (
            <>
              <div className="mt-4" />
              <MenuItem label="Log Out" danger onClick={handleLogout} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
