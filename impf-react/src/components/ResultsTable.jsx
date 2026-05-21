import { useState } from 'react'
import LabelTags from './LabelTags'

export default function ResultsTable({ items, title, emptyMessage, hideControls = false, isUnsafePage = false, limit }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  if (items.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center text-muted font-mono text-xs">
        {emptyMessage || "No files found."}
      </div>
    )
  }

  // Filter items based on search and dropdown
  const filteredItems = items.filter(item => {
    // 1. Dropdown Filter
    const isSafe = item.is_safe !== false && item.is_safe !== 'false';
    if (typeFilter === 'SAFE' && !isSafe) return false;
    if (typeFilter === 'UNSAFE' && isSafe) return false;
    if (typeFilter === 'DOCUMENTS' && item.file_type !== 'document') return false;
    if (typeFilter === 'IMAGES' && item.file_type !== 'image') return false;
    if (typeFilter === 'DATA' && item.file_type !== 'data') return false;

    // 2. Search Filter
    if (!search) return true;
    const q = search.toLowerCase();
    
    // Check filename
    const fname = (item.file_name || item.s3_key || item.file_id || '').toLowerCase();
    if (fname.includes(q)) return true;

    // Check PII / Moderation
    if (item.moderation_details) {
      const hasModMatch = item.moderation_details.some(m => {
        const name = typeof m === 'object' ? m.name : m;
        return name && name.toLowerCase().includes(q);
      });
      if (hasModMatch) return true;
    }

    // Check normal labels
    if (item.labels) {
      const hasLabelMatch = item.labels.some(l => {
        const name = typeof l === 'object' ? l.name : l;
        return name && name.toLowerCase().includes(q);
      });
      if (hasLabelMatch) return true;
    }

    return false;
  });

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col h-full max-h-[700px] shadow-sm">
      
      <div className="px-5 py-4 border-b border-border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="font-mono text-[10px] text-muted tracking-widest flex flex-col">
          <span className="font-bold text-primary text-sm mb-1">{title || 'DATABASE ENTRIES'}</span>
          <span className="text-accent">{filteredItems.length} RECORDS FOUND</span>
        </div>
        
        {!hideControls && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Dropdown Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none w-full sm:w-40 bg-surface border border-border rounded-lg pl-4 pr-10 py-2 text-sm text-primary focus:outline-none focus:border-primary font-mono cursor-pointer"
              >
                <option value="ALL">All Scans</option>
                {!isUnsafePage && <option value="SAFE">Safe Only</option>}
                {!isUnsafePage && <option value="UNSAFE">Unsafe Only</option>}
                <option value="DOCUMENTS">Documents</option>
                <option value="IMAGES">Images</option>
                <option value="DATA">Data / CSV</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-primary focus:outline-none focus:border-primary font-mono placeholder:text-muted/50 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto flex-1 p-0 custom-scrollbar">
        <table className="w-full text-left border-collapse text-sm min-w-[1200px]">
          <thead className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-border text-muted font-mono z-20">
            <tr>
              <th className="p-4 font-normal sticky left-0 bg-surface z-30 border-r border-border max-w-[200px]">File Name</th>
              <th className="p-4 font-normal">Type</th>
              <th className="p-4 font-normal">Language</th>
              <th className="p-4 font-normal">Sentiment</th>
              <th className="p-4 font-normal">Top AI Labels</th>
              <th className="p-3 font-normal">Safe</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(limit ? filteredItems.slice(0, limit) : filteredItems).map((item, i) => {
              const safe = item.is_safe !== false && item.is_safe !== 'false'
              const ts = item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 16) : '—'
              const fname = item.file_name || (item.s3_key || '').split('/').pop() || item.file_id || '—'
              
              const labelsArray = Array.isArray(item.labels) ? item.labels : []
              
              // Extract Lang and Sentiment
              let lang = '—';
              let sentiment = '—';
              
              labelsArray.forEach(l => {
                const name = typeof l === 'object' ? l.name : l;
                if (!name) return;
                if (name.startsWith('Language:')) lang = name.replace('Language:', '').trim();
                if (name.startsWith('Sentiment:')) sentiment = name.replace('Sentiment:', '').trim();
              });

              let typeClass = 'bg-gray-500/10 text-gray-500 border-gray-500/20'
              if (item.file_type === 'image') typeClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
              if (item.file_type === 'document') typeClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
              if (item.file_type === 'data') typeClass = 'bg-orange-500/10 text-orange-500 border-orange-500/20'

              let statusClass = 'text-gray-400'
              if (item.status === 'completed') statusClass = 'text-green-500'
              if (item.status === 'error' || item.status === 'failed') statusClass = 'text-red-500'

              return (
                <tr key={i} className="border-b border-border/50 hover:bg-card/50 transition-colors group">
                  <td className="p-4 font-bold text-primary max-w-[200px] truncate sticky left-0 bg-surface z-10 border-r border-border group-hover:bg-card/50 transition-colors shadow-sm" title={fname}>{fname}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-lg font-mono text-xs font-bold uppercase border ${typeClass}`}>
                      {item.file_type || 'unknown'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{lang}</td>
                  <td className="p-4 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">{sentiment}</td>
                  <td className="p-3 py-4 max-w-[300px] overflow-hidden"><LabelTags labels={item.labels} /></td>
                  <td className="p-3 font-mono text-sm">
                    {safe 
                      ? <span className="text-green-500 font-bold">✓ YES</span> 
                      : <span className="text-red-500 font-bold">✕ NO</span>}
                  </td>
                  <td className="p-3 font-mono text-xs font-bold">
                    <span className={statusClass}>{item.status || '—'}</span>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-muted">{ts}</td>
                </tr>
              )
            })}
            
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="8" className="p-8 text-center text-muted font-mono">No matching files found for "{search}"</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
