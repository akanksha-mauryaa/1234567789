export default function Navbar({ page, setPage, unsafeCount, theme, toggleTheme, onLogout }) {
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'upload',    icon: '📤', label: 'Upload' },
    { id: 'current',   icon: '🆕', label: 'Current File' },
    { id: 'files',     icon: '🗃️',  label: 'All Files' },
    { id: 'unsafe',    icon: '⚠️',  label: 'Unsafe' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'reports',   icon: '📑', label: 'Reports' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-[var(--surface)]">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center text-lg bg-border">
            🛡️
          </div>
          <div className="hidden sm:block">
            <div className="font-mono text-base font-black tracking-tighter text-primary leading-none">IMPF</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar max-w-[calc(100vw-80px)] sm:max-w-none">
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

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-md border border-border text-[10px] font-bold uppercase tracking-widest text-danger hover:bg-danger/10 hover:border-danger transition-all duration-200"
            title="Logout"
          >
            Logout
          </button>
          
          <div className="h-8 w-[1px] bg-border hidden sm:block"></div>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase">Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
