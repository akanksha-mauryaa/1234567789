import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, CartesianGrid } from 'recharts'

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

  // Chart 4: File Format Distribution (Extensions)
  const docTypeCount = items.reduce((acc, curr) => {
    const fname = curr.file_name || (curr.s3_key || '').split('/').pop() || curr.file_id || ''
    const ext = fname.includes('.') ? fname.split('.').pop().toUpperCase() : 'UNKNOWN'
    if (ext) {
      acc[ext] = (acc[ext] || 0) + 1
    }
    return acc
  }, {})
  const docTypeData = Object.keys(docTypeCount).map(k => ({ name: k, value: docTypeCount[k] })).sort((a, b) => b.value - a.value)
  const DOCTYPE_COLORS = ['#ec4899', '#a855f7', '#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#10b981']

  // Chart 5: System Activity Timeline
  const timelineCount = items.reduce((acc, curr) => {
    if (curr.timestamp) {
      const dateOnly = curr.timestamp.split(' ')[0]
      const formattedDate = dateOnly.split('-').slice(1).join('/') // e.g. 05/21
      acc[formattedDate] = (acc[formattedDate] || 0) + 1
    }
    return acc
  }, {})
  
  const timelineData = Object.keys(timelineCount)
    .sort() // Sort alphabetically (chronological for MM/DD)
    .map(k => ({ date: k, scans: timelineCount[k] }))

  // Count metrics
  const totalDocs = items.filter(i => i.file_type === 'document').length
  const totalPiiAlerts = items.filter(i => {
    const mod = Array.isArray(i.moderation_details) ? i.moderation_details : []
    return mod.some(m => m.name?.startsWith('PII:'))
  }).length

  if (items.length === 0) return <div className="text-muted text-center p-10 font-mono">No data to analyze.</div>

  return (
    <div className="space-y-4 pb-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
          <div className="text-[10px] text-muted font-mono tracking-wider">TOTAL SCANNED</div>
          <div className="text-3xl font-mono mt-2 font-bold text-primary">{total}</div>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
          <div className="text-[10px] text-muted font-mono tracking-wider">DOCUMENTS SCANNED</div>
          <div className="text-3xl font-mono mt-2 font-bold text-accent">{totalDocs}</div>
        </div>
        <div className="bg-surface p-5 rounded-2xl border border-border shadow-sm">
          <div className="text-[10px] text-muted font-mono tracking-wider">TOTAL SAFE FILES</div>
          <div className="text-3xl font-mono mt-2 font-bold text-neon">{safeCount}</div>
        </div>
        <div className="glass p-5 rounded-2xl border border-danger/20 bg-danger/5">
          <div className="text-[10px] text-danger font-mono tracking-wider">PII BREACH INCIDENTS</div>
          <div className="text-3xl font-mono mt-2 font-bold text-danger">{totalPiiAlerts}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* File Types */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// File Type Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value">
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
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// Content Safety Ratio</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={safetyData} innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value">
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

        {/* File Format Distribution */}
        {docTypeData.length > 0 && (
          <div className="glass p-6 rounded-2xl border border-pink-500/10">
            <h3 className="font-mono text-xs text-pink-400 mb-6 tracking-[0.2em] uppercase">// File Format Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={docTypeData} innerRadius={70} outerRadius={90} paddingAngle={3} dataKey="value">
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

        {/* System Activity Timeline (Replaced Language Chart) */}
        {timelineData.length > 0 && (
          <div className="glass p-6 rounded-2xl border border-cyan-500/10">
            <h3 className="font-mono text-xs text-cyan-400 mb-6 tracking-[0.2em] uppercase">// Processing Volume Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={30} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}
                    itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
                    cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#00f2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" activeDot={{ r: 6, fill: '#00f2ff', stroke: 'var(--surface)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Labels Bar Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-border lg:col-span-2 shadow-sm">
          <h3 className="font-mono text-xs text-muted mb-6 tracking-[0.2em] uppercase">// Top 10 Contextual AI Concepts Detected</h3>
          <div className="h-80 md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={30} tickMargin={10} />
                <Tooltip 
                  cursor={{ fill: 'var(--accent)', opacity: 0.1 }}
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow)' }}
                  itemStyle={{ color: 'var(--accent2)', fontFamily: 'Space Mono', fontSize: '12px' }}
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
