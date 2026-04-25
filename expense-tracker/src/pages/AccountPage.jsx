import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3"/>
      <circle cx="8" cy="8" r="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3"/>
      <line x1="2" y1="2" x2="14" y2="14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.3" strokeLinecap="round"/>
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

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onCancel}
    >
      <div
        className={`w-full max-w-sm rounded-2xl p-6 transition-all duration-200 ${open ? 'scale-100' : 'scale-95'}`}
        style={{ background: 'rgba(20,20,20,0.98)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white font-semibold text-base mb-2">{title}</p>
        <p className="text-white/45 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-all" style={{ background: 'rgba(248,113,113,0.14)', color: 'rgba(248,113,113,0.9)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ open, onClose }) {
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSave() {
    setError('')
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return }
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPw })
    setSaving(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => { setDone(false); setNewPw(''); setConfirmPw(''); onClose() }, 1200)
  }

  function handleClose() {
    setNewPw(''); setConfirmPw(''); setError(''); setDone(false); onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-[480px] rounded-t-3xl px-6 pt-5 pb-10 transition-all duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'rgba(14,14,14,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 rounded-full mx-auto mb-5" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <p className="text-white font-semibold text-base mb-5">{done ? '✓ Password updated' : 'Change Password'}</p>

        {!done && (
          <>
            <div className="mb-4">
              <label className="block text-white/35 text-[11px] font-medium uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none pr-10 placeholder-border focus:glass-active transition-all"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
                  <EyeIcon open={showNew} />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-white/35 text-[11px] font-medium uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass rounded-xl px-4 py-3 text-white text-sm outline-none pr-10 placeholder-border focus:glass-active transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || !newPw || !confirmPw}
              className="w-full py-[14px] rounded-2xl text-sm font-semibold glass-active text-white active:scale-95 transition-all disabled:opacity-30"
            >
              {saving ? 'Saving…' : 'Update Password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AccountPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar || null)
  const [uploading, setUploading] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)

  const [pwVisible, setPwVisible] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)

  const [showEraseConfirm, setShowEraseConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [working, setWorking] = useState(false)

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setAvatarUrl(publicUrl)
    }
    setUploading(false)
    e.target.value = ''
  }

  async function saveName() {
    if (!nameInput.trim() || nameInput.trim() === profile?.name) { setEditingName(false); return }
    setSavingName(true)
    await supabase.auth.updateUser({ data: { name: nameInput.trim() } })
    setSavingName(false)
    setEditingName(false)
  }

  async function handleEraseData() {
    setWorking(true)
    await supabase.from('transactions').delete().eq('user_id', user.id)
    setWorking(false)
    setShowEraseConfirm(false)
  }

  async function handleDeleteAccount() {
    setWorking(true)
    await supabase.from('transactions').delete().eq('user_id', user.id)
    try { await supabase.rpc('delete_user') } catch (_) {}
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (profile?.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-bg font-sans">
      <div className="mx-auto max-w-[480px] min-h-screen">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/8 transition-colors text-white">
            <BackIcon />
          </button>
          <span className="text-white text-base font-semibold">Account</span>
        </div>

        {/* Avatar */}
        <div className="flex justify-center py-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
            disabled={uploading}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-20 h-20 rounded-full object-cover" style={{ border: '1px solid rgba(255,255,255,0.13)' }} />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold" style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.13)' }}>
                {uploading ? '…' : initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 12V6M6 9l3-3 3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="1" y="1" width="16" height="16" rx="4" stroke="white" strokeWidth="1.2" opacity="0.5"/>
              </svg>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        {/* Fields */}
        <div className="mx-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Name */}
          <div className="px-4 py-4">
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-wider mb-1">Name</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-white/20 pb-1 focus:border-white/50 transition-colors" />
                <button onClick={saveName} disabled={savingName} className="text-xs text-white/60 hover:text-white transition-colors">
                  {savingName ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{profile?.name || '—'}</p>
                <button onClick={() => { setNameInput(profile?.name || ''); setEditingName(true) }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors">
                  <EditIcon />
                </button>
              </div>
            )}
          </div>

          <Divider />

          {/* Email */}
          <div className="px-4 py-4">
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-wider mb-1">Email</p>
            <p className="text-white/60 text-sm">{profile?.email || '—'}</p>
          </div>

          <Divider />

          {/* Password */}
          <div className="px-4 py-4">
            <p className="text-white/35 text-[11px] font-medium uppercase tracking-wider mb-1">Password</p>
            <div className="flex items-center justify-between">
              <p className="text-white text-sm tracking-widest">{pwVisible ? 'Hidden for security' : '••••••••'}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPwVisible(v => !v)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors">
                  <EyeIcon open={pwVisible} />
                </button>
                <button onClick={() => setShowPwModal(true)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/8 transition-colors">
                  <EditIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="mx-4 mt-4 rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowEraseConfirm(true)}>
            <p className="text-red-400 text-sm">Erase Data</p>
            <ChevronRight />
          </div>
          <Divider />
          <div className="flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowDeleteConfirm(true)}>
            <p className="text-red-400 text-sm">Delete Account</p>
            <ChevronRight />
          </div>
        </div>

      </div>

      <ChangePasswordModal open={showPwModal} onClose={() => setShowPwModal(false)} />

      <ConfirmModal open={showEraseConfirm} title="Erase All Data"
        message="This will permanently delete all your transactions. This cannot be undone."
        confirmLabel={working ? 'Erasing…' : 'Erase Data'} onConfirm={handleEraseData} onCancel={() => setShowEraseConfirm(false)} />

      <ConfirmModal open={showDeleteConfirm} title="Delete Account"
        message="Your account and all data will be permanently deleted. This cannot be undone."
        confirmLabel={working ? 'Deleting…' : 'Delete Account'} onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteConfirm(false)} />
    </div>
  )
}
