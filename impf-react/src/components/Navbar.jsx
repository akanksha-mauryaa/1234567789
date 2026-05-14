export default function Navbar({ page, setPage, unsafeCount, theme, toggleTheme }) {
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'upload',    icon: '📤', label: 'Upload' },
    { id: 'current',   icon: '🆕', label: 'Current File' },
    { id: 'files',     icon: '🗃️',  label: 'All Files' },
    { id: 'unsafe',    icon: '⚠️',  label: 'Unsafe', badge: unsafeCount },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4169e1,#00f2ff)' }}>
            🛡️
          </div>
          <div className="hidden sm:block">
            <div className="font-mono text-base font-black tracking-tighter text-primary leading-none">AEGIS MEDIA</div>
            <div className="text-[9px] text-accent font-bold tracking-widest uppercase opacity-80">Intelligent Shield</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-300 group
                ${page === item.id
                  ? 'text-accent bg-accent/5 font-bold'
                  : 'text-muted hover:text-primary hover:bg-card'
                }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:inline tracking-wide">{item.label}</span>
              
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] text-white">
                  {item.badge}
                </span>
              )}
              {page === item.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="hidden sm:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-md border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-card hover:border-accent transition-all duration-200"
            title="Switch Theme"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
