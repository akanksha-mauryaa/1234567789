import LabelTags from './LabelTags'

export default function CurrentFile({ item }) {
  if (!item) {
    return (
      <div className="glass rounded-xl border border-border p-8 text-center text-muted font-mono text-xs">
        No file data available. Upload a file to see it here.
      </div>
    )
  }

  const safe = item.is_safe !== false && item.is_safe !== 'false'
  const ts = item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 16) : '—'
  const fname = item.file_name || (item.s3_key || '').split('/').pop() || item.file_id || '—'

  // Extract labels and moderation details
  const displayLabels = Array.isArray(item.labels) ? item.labels : []
  const modDetails = Array.isArray(item.moderation_details) ? item.moderation_details : []
  
  // Get top 5 labels for the breakdown
  const topLabels = displayLabels
    .filter(l => typeof l === 'object')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* File Header with Scan Effect */}
      <div className="glass p-6 rounded-xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden group">
        {/* Laser Scan Animation Overlay */}
        <div className="absolute inset-x-0 h-1 bg-accent/30 blur-[2px] animate-scan pointer-events-none z-10 hidden group-hover:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="flex-1 z-20">
          <h3 className="text-[10px] font-mono tracking-widest text-muted mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            FILE NAME // ANALYSIS ACTIVE
          </h3>
          <p className="text-xl font-medium text-primary break-all">{fname}</p>
        </div>
        <div className="md:text-right z-20">
          <h3 className="text-[10px] font-mono tracking-widest text-muted mb-2">TIMESTAMP</h3>
          <p className="text-sm font-mono text-primary bg-surface/50 px-3 py-1.5 rounded-lg border border-border/50">{ts}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-border hover:bg-surface/50 transition-colors">
          <div className="text-[10px] text-muted font-mono tracking-wider">TYPE</div>
          <div className="text-2xl md:text-3xl font-mono mt-3 font-bold text-accent uppercase">{item.file_type || 'unknown'}</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border hover:bg-surface/50 transition-colors">
          <div className="text-[10px] text-muted font-mono tracking-wider">STATUS</div>
          <div className={`text-2xl md:text-3xl font-mono mt-3 font-bold ${item.status === 'completed' ? 'text-neon' : 'text-danger'} uppercase`}>
            {item.status || '—'}
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border hover:bg-surface/50 transition-colors">
          <div className="text-[10px] text-muted font-mono tracking-wider">SAFE?</div>
          <div className={`text-2xl md:text-3xl font-mono mt-3 font-bold ${safe ? 'text-neon' : 'text-danger'} uppercase`}>
            {safe ? 'YES' : 'NO'}
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border hover:bg-surface/50 transition-colors">
          <div className="text-[10px] text-muted font-mono tracking-wider">LABEL COUNT</div>
          <div className="text-2xl md:text-3xl font-mono mt-3 font-bold text-accent2 uppercase">{item.label_count ?? '0'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detected Labels Tags */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-border">
          <h3 className="text-[10px] font-mono tracking-widest text-muted mb-6 uppercase">// Detected AI Labels</h3>
          <div className="bg-surface/30 p-4 md:p-6 rounded-xl border border-border/50 min-h-[120px]">
            <LabelTags labels={item.labels} />
          </div>
        </div>

        {/* Confidence Breakdown Bars */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-border">
          <h3 className="text-[10px] font-mono tracking-widest text-muted mb-6 uppercase">// Confidence Breakdown</h3>
          <div className="space-y-6">
            {topLabels.length > 0 ? topLabels.map((l, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-2 font-mono">
                  <span className="text-primary font-bold uppercase tracking-tight">{l.name}</span>
                  <span className="text-accent">{Math.round(l.confidence)}%</span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                  <div 
                    className={`h-full transition-all duration-1000 ${l.confidence > 90 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-accent'}`} 
                    style={{ width: `${l.confidence}%` }} 
                  />
                </div>
              </div>
            )) : (
              <div className="text-sm text-muted font-mono italic p-4 text-center">No confidence data available for this file.</div>
            )}
          </div>
        </div>

        {/* Moderation Details if Unsafe */}
        {!safe && modDetails.length > 0 && (
          <div className="glass p-6 md:p-8 rounded-2xl border border-danger/40 lg:col-span-2 bg-danger/5">
            <h3 className="text-[10px] font-mono tracking-widest text-danger mb-6 uppercase">// Moderation Alerts Detected</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {modDetails.map((m, i) => (
                <div key={i} className="flex flex-col gap-2 bg-surface/50 p-4 rounded-xl border border-danger/20">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-tighter">Category</span>
                  <span className="text-sm font-black text-danger uppercase">{m.name}</span>
                  <span className="text-xs font-mono text-muted">Conf: {Math.round(m.confidence)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
