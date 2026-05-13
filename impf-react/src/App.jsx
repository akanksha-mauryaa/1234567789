import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import UploadZone from './components/UploadZone'
import ResultsTable from './components/ResultsTable'
import Analytics from './components/Analytics'
import CurrentFile from './components/CurrentFile'
import { fetchResults } from './hooks/useIMPF'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchResults()
      // Sort newest first
      data.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Auto refresh every 30s
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const unsafeItems = items.filter(i => i.is_safe === false || i.is_safe === 'false')

  const renderPage = () => {
    if (loading && items.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin"></div>
        </div>
      )
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard items={items} />
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto mt-10">
            <h2 className="text-xl font-medium tracking-wide mb-6">Upload Media</h2>
            <UploadZone onUploadComplete={async () => {
              await loadData()
              setPage('current')
            }} />
          </div>
        )
      case 'current':
        return <CurrentFile item={items[0]} />
      case 'files':
        return <ResultsTable items={items} title="ALL FILES" />
      case 'unsafe':
        return <ResultsTable items={unsafeItems} title="UNSAFE FILES DETECTED" emptyMessage="No unsafe files found. Great!" />
      case 'analytics':
        return <Analytics items={items} />
      case 'settings':
        return (
          <div className="max-w-xl">
            <h2 className="text-xl font-medium tracking-wide mb-6">Settings</h2>
            <div className="glass p-6 rounded-xl border border-border">
              <label className="block text-xs font-mono text-muted mb-2">API GATEWAY URL</label>
              <input 
                type="text" 
                readOnly
                value={import.meta.env.VITE_API_BASE || 'Loaded from .env'}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-primary font-mono outline-none"
              />
              <p className="text-[10px] text-muted mt-2">Edit your .env file to change the base URL.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-full bg-bg text-primary overflow-hidden grid-bg">
      <Sidebar page={page} setPage={setPage} unsafeCount={unsafeItems.length} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-medium tracking-wide capitalize">{page.replace('-', ' ')}</h1>
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-card border border-border text-xs font-mono text-muted hover:text-accent hover:border-accent/30 transition-colors"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span> REFRESH
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
