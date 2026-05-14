import LabelTags from './LabelTags'

export default function ResultsTable({ items, title, emptyMessage }) {
  if (items.length === 0) {
    return (
      <div className="glass rounded-xl border border-border p-8 text-center text-muted font-mono text-xs">
        {emptyMessage || "No files found."}
      </div>
    )
  }

  return (
    <div className="glass rounded-xl border border-border overflow-hidden flex flex-col h-full max-h-[600px]">
      {title && (
        <div className="px-5 py-3 border-b border-border bg-surface/50 font-mono text-[10px] text-muted tracking-widest flex justify-between items-center">
          <span>// {title}</span>
          <span className="text-accent">{items.length} RECORDS</span>
        </div>
      )}
      <div className="overflow-x-auto flex-1 p-0 custom-scrollbar">
        <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
          <thead className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-border text-muted font-mono z-20">
            <tr>
              <th className="p-4 font-normal sticky left-0 bg-bg z-30 border-r border-border max-w-[140px] sm:max-w-none">File Name</th>
              <th className="p-4 font-normal">Type</th>
              <th className="p-4 font-normal">Labels</th>
              <th className="p-3 font-normal">Confidence</th>
              <th className="p-3 font-normal">Count</th>
              <th className="p-3 font-normal">Safe</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const safe = item.is_safe !== false && item.is_safe !== 'false'
              const ts = item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 16) : '—'
              const fname = item.file_name || (item.s3_key || '').split('/').pop() || item.file_id || '—'
              
              // Get top confidence
              const labels = Array.isArray(item.labels) ? item.labels : []
              const topConf = labels.reduce((max, curr) => {
                if (typeof curr === 'object' && curr.confidence > max) return curr.confidence
                return max
              }, 0)

              let typeClass = 'bg-[var(--muted)]/10 text-[var(--muted)] border border-[var(--muted)]/20'
              if (item.file_type === 'image') typeClass = 'bg-[var(--accent2)]/10 text-[var(--accent2)] border border-[var(--accent2)]/20'
              if (item.file_type === 'document') typeClass = 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
              if (item.file_type === 'data') typeClass = 'bg-warn/10 text-warn border border-warn/20'

              let statusClass = 'text-[var(--muted)]'
              if (item.status === 'completed') statusClass = 'text-neon'
              if (item.status === 'error' || item.status === 'failed') statusClass = 'text-danger'

              return (
                <tr key={i} className="border-b border-border/50 hover:bg-surface/50 transition-colors group">
                  <td className="p-4 font-bold text-primary max-w-[140px] sm:max-w-[250px] truncate sticky left-0 bg-bg z-10 border-r border-border group-hover:bg-bg transition-colors shadow-xl" title={fname}>{fname}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-lg font-mono text-xs font-bold uppercase ${typeClass}`}>
                      {item.file_type || 'unknown'}
                    </span>
                  </td>
                  <td className="p-3 py-4"><LabelTags labels={item.labels} /></td>
                  <td className="p-3 font-mono">
                    {topConf > 0 ? (
                      <span className={topConf > 90 ? 'text-neon' : 'text-accent'}>
                        {Math.round(topConf)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-3 font-mono text-muted">{item.label_count ?? '—'}</td>
                  <td className="p-3 font-mono text-sm">
                    {safe 
                      ? <span className="text-neon">✓ YES</span> 
                      : <span className="text-danger">✕ NO</span>}
                  </td>
                  <td className="p-3 font-mono text-xs">
                    <span className={statusClass}>{item.status || '—'}</span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-muted">{ts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
