import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchResults()
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
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const unsafeItems = items.filter(i => i.is_safe === false || i.is_safe === 'false')

  const renderPage = () => {
    if (loading && items.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-border border-t-accent rounded-full animate-spin"></div>
        </div>
      )
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard items={items} />
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto mt-10 animate-fadeIn">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Upload Media</h2>
            <UploadZone onUploadComplete={async () => {
              await loadData()
              setPage('current')
            }} />
          </div>
        )
      case 'current':
        return <div className="animate-fadeIn"><CurrentFile item={items[0]} /></div>
      case 'files':
        return <div className="animate-fadeIn"><ResultsTable items={items} title="ALL FILES" /></div>
      case 'unsafe':
        return <div className="animate-fadeIn"><ResultsTable items={unsafeItems} title="UNSAFE FILES DETECTED" emptyMessage="No unsafe files found. Great!" /></div>
      case 'analytics':
        return <div className="animate-fadeIn"><Analytics items={items} /></div>
      case 'settings':
        return (
          <div className="max-w-xl mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold tracking-tight mb-8">Settings</h2>
            <div className="glass p-8 rounded-2xl border border-border">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">API GATEWAY URL</label>
              <input 
                type="text" 
                readOnly
                value={import.meta.env.VITE_API_BASE || 'Loaded from .env'}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-primary font-mono outline-none shadow-sm"
              />
              <p className="text-xs text-muted mt-4">Edit your .env file to change the base URL configuration.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`${theme} transition-colors duration-300`}>
      <div className="min-h-screen bg-bg text-primary grid-bg selection:bg-accent/30">
        <Navbar 
          page={page} 
          setPage={setPage} 
          unsafeCount={unsafeItems.length} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        <main className="max-w-[1600px] mx-auto p-6 md:p-10">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

