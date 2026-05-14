import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics({ items }) {
  // Chart 1: File Types
  const typeCount = items.reduce((acc, curr) => {
    const t = curr.file_type || 'unknown'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})
  const pieData = Object.keys(typeCount).map(k => ({ name: k.toUpperCase(), value: typeCount[k] }))
  const COLORS = ['#4169e1', '#00f2ff', '#3b82f6', '#cbd5e1']

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
  const SAFE_COLORS = ['#10b981', '#ef4444'] // Brighter Emerald and Red for both modes

  if (items.length === 0) return <div className="text-muted text-center p-10 font-mono">No data to analyze.</div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
      
      {/* File Types */}
      <div className="glass p-6 md:p-10 rounded-2xl border border-border">
        <h3 className="font-mono text-xs text-muted mb-10 tracking-[0.2em] uppercase">// File Type Distribution</h3>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-10 font-mono text-xs">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
              <span className="text-primary font-bold">{d.name} <span className="text-muted">({d.value})</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Ratio */}
      <div className="glass p-6 md:p-10 rounded-2xl border border-border">
        <h3 className="font-mono text-xs text-muted mb-10 tracking-[0.2em] uppercase">// Content Safety Ratio</h3>
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={safetyData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                {safetyData.map((entry, index) => <Cell key={`cell-${index}`} fill={SAFE_COLORS[index]} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                itemStyle={{ color: 'var(--accent)', fontFamily: 'Space Mono', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10b981]"></span>
            <span className="text-primary font-bold">Safe <span className="text-muted">({safeCount})</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ef4444]"></span>
            <span className="text-primary font-bold">Unsafe <span className="text-muted">({unsafeCount})</span></span>
          </div>
        </div>
      </div>

      {/* Top Labels Bar Chart */}
      <div className="glass p-6 md:p-10 rounded-2xl border border-border lg:col-span-2">
        <h3 className="font-mono text-xs text-muted mb-10 tracking-[0.2em] uppercase">// Top 10 AI Labels Detected</h3>
        <div className="h-80 md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
  )
}
