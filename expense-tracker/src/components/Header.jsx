function HamburgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <line x1="0" y1="1" x2="20" y2="1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export default function Header({ onMenuOpen }) {
  return (
    <div className="flex items-center pt-6 pb-2 px-5">
      <button
        onClick={onMenuOpen}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 hover:bg-white/8 active:scale-90"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>
    </div>
  )
}
