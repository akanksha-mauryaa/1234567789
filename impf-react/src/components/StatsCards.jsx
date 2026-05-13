export default function StatsCards({ items }) {
  const total = items.length
  const images = items.filter(i => i.file_type === 'image').length
  const docs = items.filter(i => i.file_type === 'document').length
  const data = items.filter(i => i.file_type === 'data').length
  
  const safeCount = items.filter(i => i.is_safe !== false && i.is_safe !== 'false').length
  const safePct = total > 0 ? Math.round((safeCount / total) * 100) : 0

  const cards = [
    { label: 'Total Files', value: total, color: 'text-primary' },
    { label: 'Images', value: images, color: 'text-accent2' },
    { label: 'Documents', value: docs, color: 'text-accent' },
    { label: 'Data Files', value: data, color: 'text-warn' },
    { label: 'Safe Content', value: `${safePct}%`, color: safePct < 100 ? 'text-danger' : 'text-neon' }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="glass p-4 rounded-xl flex flex-col justify-between hover:bg-surface/50 transition-colors">
          <div className="text-[10px] text-muted font-mono tracking-wider">{c.label}</div>
          <div className={`text-3xl font-mono mt-2 font-bold ${c.color}`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
