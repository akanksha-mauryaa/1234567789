import { useState } from 'react'
import StatsCards from './StatsCards'
import ResultsTable from './ResultsTable'

export default function Dashboard({ items }) {
  const [filter, setFilter] = useState('ALL')

  // Apply quick filters
  const filteredItems = items.filter(item => {
    const isSafe = item.is_safe !== false && item.is_safe !== 'false'
    if (filter === 'SAFE') return isSafe
    if (filter === 'UNSAFE') return !isSafe
    if (filter === 'DOCUMENTS') return item.file_type === 'document'
    if (filter === 'IMAGES') return item.file_type === 'image'
    return true
  })

  const recentItems = filteredItems.slice(0, 6) // Display up to 6 recent items matching filter

  const filterButtons = [
    { id: 'ALL', label: 'All Scans' },
    { id: 'SAFE', label: 'Safe Only' },
    { id: 'UNSAFE', label: 'Unsafe Only' },
    { id: 'DOCUMENTS', label: 'Documents' },
    { id: 'IMAGES', label: 'Images' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-medium tracking-wide">Overview</h2>
        
        {/* Status Quick-Filters pills */}
        <div className="flex flex-wrap gap-1.5 bg-surface/40 p-1 rounded-xl border border-border/50 w-max">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-tight transition-all duration-200
                ${filter === btn.id
                  ? 'bg-accent text-white font-bold shadow-md shadow-accent/20'
                  : 'text-muted hover:text-primary hover:bg-card/50'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      
      <StatsCards items={items} />

      <div className="min-h-[400px] lg:h-[500px]">
        <ResultsTable 
          items={recentItems} 
          title={`${filter} ACTIVITY LOG`} 
          emptyMessage={`No ${filter.toLowerCase()} files processed yet.`} 
        />
      </div>
    </div>
  )
}
