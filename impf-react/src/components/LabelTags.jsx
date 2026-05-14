export default function LabelTags({ labels }) {
  if (!Array.isArray(labels)) {
    labels = labels ? [labels] : []
  }

  const renderLabel = (label, i) => {
    const name = typeof label === 'object' ? label.name : String(label)
    const confidence = typeof label === 'object' ? label.confidence : null
    
    // Color based on confidence
    let colorClass = "bg-accent/10 border-accent/20 text-accent"
    if (confidence !== null) {
      if (confidence > 90) colorClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      else if (confidence < 70) colorClass = "bg-danger/10 border-danger/30 text-danger"
    }

    return (
      <span 
        key={i} 
        className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded text-xs ${colorClass}`}
      >
        <span className="font-semibold">{name}</span>
        {confidence !== null && (
          <span className="opacity-70 font-mono text-[10px]">{Math.round(confidence)}%</span>
        )}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {labels.map((label, i) => renderLabel(label, i))}
    </div>
  )
}
