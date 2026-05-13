import { useState } from 'react'

export default function LabelTags({ labels, maxVisible = 4 }) {
  const [expanded, setExpanded] = useState(false)
  
  if (!Array.isArray(labels)) {
    labels = [labels || 'N/A']
  }

  const renderLabel = (label, i, isExtra = false) => {
    const name = typeof label === 'object' ? label.name : String(label)
    const confidence = typeof label === 'object' ? label.confidence : null
    
    // Color based on confidence
    let colorClass = "bg-accent/10 border-accent/20 text-accent"
    if (confidence !== null) {
      if (confidence > 90) colorClass = "bg-neon/10 border-neon/30 text-neon"
      else if (confidence < 70) colorClass = "bg-danger/10 border-danger/30 text-danger"
    }

    return (
      <span 
        key={isExtra ? `extra-${i}` : i} 
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 border rounded text-[9px] ${colorClass}`}
      >
        <span className="font-medium">{name.substring(0, 20)}</span>
        {confidence !== null && (
          <span className="opacity-60 font-mono scale-[0.8]">{Math.round(confidence)}%</span>
        )}
      </span>
    )
  }

  const visible = labels.slice(0, maxVisible)
  const extra = labels.slice(maxVisible)

  return (
    <div className="flex flex-wrap gap-1.5 max-w-[280px]">
      {visible.map((label, i) => renderLabel(label, i))}
      
      {extra.length > 0 && !expanded && (
        <button 
          onClick={() => setExpanded(true)}
          className="inline-block px-1.5 py-0.5 bg-accent2/15 border border-accent2/40 text-[#a78bfa] rounded text-[9px] cursor-pointer hover:bg-accent2/30 transition-colors font-mono"
        >
          +{extra.length} more
        </button>
      )}

      {expanded && extra.map((label, i) => renderLabel(label, i, true))}
      
      {expanded && (
        <button 
          onClick={() => setExpanded(false)}
          className="inline-block px-1.5 py-0.5 bg-accent2/15 border border-accent2/40 text-[#a78bfa] rounded text-[9px] cursor-pointer hover:bg-accent2/30 transition-colors font-mono"
        >
          ▲ hide
        </button>
      )}
    </div>
  )
}
