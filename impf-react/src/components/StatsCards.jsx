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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
      {cards.map((c, i) => (
        <div key={i} className="glass p-5 md:p-6 rounded-2xl flex flex-col justify-between hover:bg-surface/50 transition-all hover:scale-[1.02] duration-300">
          <div className="text-[10px] text-muted font-black tracking-[0.2em] uppercase">{c.label}</div>
          <div className={`text-3xl md:text-4xl font-mono mt-4 font-black ${c.color} leading-none`}>{c.value}</div>
        </div>
      ))}
    </div>
  )
}
