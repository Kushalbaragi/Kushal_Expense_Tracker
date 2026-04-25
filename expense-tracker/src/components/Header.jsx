function HamburgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <line x1="0" y1="1" x2="20" y2="1" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="7" x2="14" y2="7" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="0" y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

const BTN_W = 78
const PAD   = 3

function ChartTabToggle({ value, onChange }) {
  const tabs = ['expense', 'income', 'overview']
  const idx  = tabs.indexOf(value)
  return (
    <div
      className="relative flex glass rounded-full"
      style={{ width: `${BTN_W * 3 + PAD * 2}px`, padding: `${PAD}px` }}
    >
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full glass-active"
        style={{
          width:      `${BTN_W}px`,
          left:       `${PAD + idx * BTN_W}px`,
          transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative z-10 py-[6px] rounded-full text-[11px] font-medium transition-colors duration-200 text-center ${
            value === tab ? 'text-white' : 'text-white/35 hover:text-white/60'
          }`}
          style={{ width: `${BTN_W}px` }}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}

export default function Header({ onMenuOpen, chartTab, onChartTabChange }) {
  return (
    <div className="flex items-center justify-between pt-6 pb-3 px-5">
      <button
        onClick={onMenuOpen}
        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 hover:bg-white/8 active:scale-90"
        aria-label="Menu"
      >
        <HamburgerIcon />
      </button>

      <ChartTabToggle value={chartTab} onChange={onChartTabChange} />

      {/* spacer mirrors hamburger width */}
      <div className="w-9" />
    </div>
  )
}
