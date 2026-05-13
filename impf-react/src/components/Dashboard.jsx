import StatsCards from './StatsCards'
import ResultsTable from './ResultsTable'

export default function Dashboard({ items }) {
  const recentItems = items.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium tracking-wide">Overview</h2>
      </div>
      
      <StatsCards items={items} />

      <div className="h-[400px]">
        <ResultsTable 
          items={recentItems} 
          title="RECENT PROCESSING ACTIVITY" 
          emptyMessage="No files have been processed yet." 
        />
      </div>
    </div>
  )
}
