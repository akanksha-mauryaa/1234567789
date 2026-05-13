import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics({ items }) {
  // Chart 1: File Types
  const typeCount = items.reduce((acc, curr) => {
    const t = curr.file_type || 'unknown'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const pieData = Object.keys(typeCount).map(k => ({ name: k.toUpperCase(), value: typeCount[k] }))
  const COLORS = ['#7c3aed', '#00e5ff', '#ffd32a', '#6b6b8a']

  // Chart 2: Top Labels
  const labelCount = {}
  items.forEach(item => {
    const labels = Array.isArray(item.labels) ? item.labels : []
    labels.forEach(l => {
      const name = typeof l === 'object' ? l.name : l
      if (name && !name.includes('format')) {
        labelCount[name] = (labelCount[name] || 0) + 1
      }
    })
  })
  const barData = Object.entries(labelCount)
    .map(([name, count]) => ({ name: name.substring(0,10), count }))
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
  const SAFE_COLORS = ['#00ff88', '#ff4757']

  if (items.length === 0) return <div className="text-muted text-center p-10 font-mono">No data to analyze.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* File Types */}
      <div className="glass p-6 rounded-xl border border-border">
        <h3 className="font-mono text-xs text-muted mb-6 tracking-widest">// FILE TYPE DISTRIBUTION</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0e0e16', border: '1px solid #1e1e30', borderRadius: '8px' }}
                itemStyle={{ color: '#00e5ff', fontFamily: 'Space Mono' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 font-mono text-[10px]">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
              <span className="text-primary">{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Ratio */}
      <div className="glass p-6 rounded-xl border border-border">
        <h3 className="font-mono text-xs text-muted mb-6 tracking-widest">// CONTENT SAFETY RATIO</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={safetyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {safetyData.map((entry, index) => <Cell key={`cell-${index}`} fill={SAFE_COLORS[index]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0e0e16', border: '1px solid #1e1e30', borderRadius: '8px' }}
                itemStyle={{ color: '#00e5ff', fontFamily: 'Space Mono' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 font-mono text-[10px]">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon"></span><span className="text-primary">Safe ({safeCount})</span></div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger"></span><span className="text-primary">Unsafe ({unsafeCount})</span></div>
        </div>
      </div>

      {/* Top Labels Bar Chart */}
      <div className="glass p-6 rounded-xl border border-border md:col-span-2">
        <h3 className="font-mono text-xs text-muted mb-6 tracking-widest">// TOP 10 AI LABELS DETECTED</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6b6b8a" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b6b8a" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,229,255,0.05)' }}
                contentStyle={{ background: '#0e0e16', border: '1px solid #1e1e30', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
