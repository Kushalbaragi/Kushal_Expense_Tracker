function HamburgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <line x1="0" y1="1" x2="20" y2="1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export default function Header({ activeTab, onTabChange, onMenuOpen }) {
  return (
    <div className="flex items-center justify-between pt-6 pb-4 px-5">
      {/* Hamburger */}
      <button
        onClick={onMenuOpen}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 hover:bg-white/8 active:scale-90"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>

      {/* Tab toggle */}
      <div className="flex glass rounded-full p-1 gap-1">
        {['expense', 'income'].map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              px-5 py-2 rounded-full text-sm font-medium transition-all duration-250
              ${activeTab === tab
                ? 'glass-active text-white shadow-sm'
                : 'text-white/40 hover:text-white/70'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Spacer to balance the hamburger */}
      <div className="w-9" />
    </div>
  )
}
