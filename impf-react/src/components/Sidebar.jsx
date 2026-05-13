export default function Sidebar({ page, setPage, unsafeCount }) {
  const nav = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'upload',    icon: '📤', label: 'Upload' },
    { id: 'current',   icon: '🆕', label: 'Current File' },
    { id: 'files',     icon: '🗃️',  label: 'All Files' },
    { id: 'unsafe',    icon: '⚠️',  label: 'Unsafe Files', badge: unsafeCount },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
  ]

  return (
    <aside className="w-56 h-screen flex flex-col bg-surface border-r border-border shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#00e5ff,#7c3aed)' }}>
            ⚡
          </div>
          <div>
            <div className="font-mono text-sm text-accent font-bold tracking-widest">IMPF</div>
            <div className="text-[9px] text-muted tracking-wider">MEDIA FACTORY</div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          <span className="font-mono text-[9px] text-neon tracking-widest">PIPELINE ACTIVE</span>
        </div>
        <div className="font-mono text-[9px] text-muted">ap-south-1 · SERVERLESS</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group
              ${page === item.id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-muted hover:text-primary hover:bg-card'
              }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left font-medium">{item.label}</span>
            {item.badge > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-danger/20 text-danger font-mono text-[9px] border border-danger/30">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

    </aside>
  )
}
