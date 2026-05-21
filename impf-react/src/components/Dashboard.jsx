import StatsCards from './StatsCards'
import ResultsTable from './ResultsTable'

export default function Dashboard({ items }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-medium tracking-wide">Overview</h2>
      </div>
      
      <StatsCards items={items} />

      <div className="min-h-[400px] lg:h-[500px]">
        <ResultsTable 
          items={items} 
          title="ACTIVITY LOG" 
          emptyMessage="No files processed yet."
          limit={6}
        />
      </div>
    </div>
  )
}
