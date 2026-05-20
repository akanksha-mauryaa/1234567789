import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Analytics({ items }) {
  // Chart 1: File Types
  const typeCount = items.reduce((acc, curr) => {
    const t = curr.file_type || 'unknown'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const pieData = Object.keys(typeCount).map(k => ({ name: k.toUpperCase(), value: typeCount[k] }))
  const COLORS = ['#4169e1', '#00f2ff', '#3b82f6', '#cbd5e1']

  // Chart 2: Top Labels (excl. DocType, Sentiment, Language, Words etc.)
  const labelCount = {}
  items.forEach(item => {
    const labels = Array.isArray(item.labels) ? item.labels : []
    labels.forEach(l => {
      const name = typeof l === 'object' ? l.name : l
      if (
        name && 
        !name.includes('format') && 
        !name.startsWith('DocType:') && 
        !name.startsWith('Sentiment:') && 
        !name.startsWith('Language:') && 
        !name.startsWith('Words:') && 
        !name.startsWith('⚠')
      ) {
        labelCount[name] = (labelCount[name] || 0) + 1
      }
    })
  })
  const barData = Object.entries(labelCount)
    .map(([name, count]) => ({ name: name.substring(0, 15), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Chart 3: Safety Ratio
  const total = items.length
  const safeCount = items.filter(i => i.is_safe !== false && i.is_safe !== 'false').length
  const unsafeCount = total - safeCount
  const safetyData = [
    { name: 'Safe', value: safeCount },
    { name: 'Unsafe', value: unsafeCount }
  ]
  const SAFE_COLORS = ['#10b981', '#ef4444']

  // Chart 4: Document Type Distribution
  const docTypeCount = items.reduce((acc, curr) => {
    const labels = Array.isArray(curr.labels) ? curr.labels : []
    const docTypeLabel = labels.find(l => typeof l === 'object' && l.name?.startsWith('DocType:'))
    if (docTypeLabel) {
      const type = docTypeLabel.name.replace('DocType: ', '')
      acc[type] = (acc[type] || 0) + 1
    }
    return acc
  }, {})
  const docTypeData = Object.keys(docTypeCount).map(k => ({ name: k, value: docTypeCount[k] }))
  const DOCTYPE_COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981']

  // Chart 5: Text Sentiment Distribution
  const sentimentCount = items.reduce((acc, curr) => {
    const labels = Array.isArray(curr.labels) ? curr.labels : []
    const sentimentLabel = labels.find(l => typeof l === 'object' && l.name?.startsWith('Sentiment:'))
    if (sentimentLabel) {
      const sent = sentimentLabel.name.replace('Sentiment: ', '')
      acc[sent] = (acc[sent] || 0) + 1
    }
    return acc
  }, {})
  const sentimentData = Object.keys(sentimentCount).map(k => ({ name: k, value: sentimentCount[k] }))
  const SENTIMENT_COLOR_MAP = {
    'Positive': '#10b981',
    'Neutral': '#64748b',
    'Negative': '#ef4444',
    'Mixed': '#f59e0b',
    'Unknown': '#94a3b8'
  }

  // Count metrics
  const totalDocs = items.filter(i => i.file_type === 'document').length
  const totalPiiAlerts = items.filter(i => {
    const mod = Array.isArray(i.moderation_details) ? i.moderation_details : []
    return mod.some(m => m.name?.startsWith('PII:'))
  }).length

  if (items.length === 0) return <div className="text-muted text-center p-10 font-mono">No data to analyze.</div>

  return (
    <div className="space-y-6 pb-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-5 rounded-2xl border border-border">
          <div className="text-[10px] text-muted font-mono tracking-wider">TOTAL SCANNED</div>
          <div className="text-3xl font-mono mt-2 font-bold text-primary">{total}</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border">
          <div className="text-[10px] text-muted font-mono tracking-wider">DOCUMENTS SCANNED</div>
          <div className="text-3xl font-mono mt-2 font-bold text-accent">{totalDocs}</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border">
          <div className="text-[10px] text-muted font-mono tracking-wider">TOTAL SAFE FILES</div>
          <div className="text-3xl font-mono mt-2 font-bold text-neon">{safeCount}</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-danger/20 bg-danger/5">
          <div className="text-[10px] text-danger font-mono tracking-wider">PII BREACH INCIDENTS</div>
          <div className="text-3xl font-mono mt-2 font-bold text-danger">{totalPiiAlerts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Types */}
        <div className="glass p-6 rounded-2xl border border-border">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// File Type Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 font-mono text-xs">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                <span className="text-primary font-bold">{d.name} <span className="text-muted">({d.value})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Ratio */}
        <div className="glass p-6 rounded-2xl border border-border">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// Content Safety Ratio</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={safetyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {safetyData.map((entry, index) => <Cell key={`cell-${index}`} fill={SAFE_COLORS[index]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span className="text-primary font-bold">Safe <span className="text-muted">({safeCount})</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
              <span className="text-primary font-bold">Unsafe <span className="text-muted">({unsafeCount})</span></span>
            </div>
          </div>
        </div>

        {/* Document Categories (New Analytics Card!) */}
        {docTypeData.length > 0 && (
          <div className="glass p-6 rounded-2xl border border-pink-500/10">
            <h3 className="font-mono text-xs text-pink-400 mb-6 tracking-[0.2em] uppercase">// Document Category Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={docTypeData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                    {docTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={DOCTYPE_COLORS[index % DOCTYPE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                    itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6 font-mono text-xs">
              {docTypeData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: DOCTYPE_COLORS[i % DOCTYPE_COLORS.length] }}></span>
                  <span className="text-primary font-bold">{d.name} <span className="text-muted">({d.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Sentiment (New Analytics Card!) */}
        {sentimentData.length > 0 && (
          <div className="glass p-6 rounded-2xl border border-amber-500/10">
            <h3 className="font-mono text-xs text-amber-400 mb-6 tracking-[0.2em] uppercase">// Document Sentiment Insights</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLOR_MAP[entry.name] || '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6 font-mono text-xs">
              {sentimentData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: SENTIMENT_COLOR_MAP[d.name] || '#94a3b8' }}></span>
                  <span className="text-primary font-bold">{d.name} <span className="text-muted">({d.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Labels Bar Chart */}
        <div className="glass p-6 rounded-2xl border border-border lg:col-span-2">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// Top 10 Contextual AI Concepts Detected</h3>
          <div className="h-80 md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="var(--accent2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
