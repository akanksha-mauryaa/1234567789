export default function LabelTags({ labels }) {
  if (!Array.isArray(labels)) {
    labels = labels ? [labels] : []
  }

  const getColorClass = (name, confidence) => {
    // Category-based coloring for document intelligence labels
    if (name?.startsWith('DocType:'))    return "bg-pink-500/15 border-pink-500/40 text-pink-600 dark:text-pink-400 font-bold"
    if (name?.startsWith('Topic:'))      return "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400"
    if (name?.startsWith('Sentiment:'))  return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
    if (name?.startsWith('Language:'))   return "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
    if (name?.startsWith('Words:'))      return "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
    if (name?.startsWith('PII:'))        return "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
    if (name?.startsWith('⚠'))           return "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400 font-bold"
    if (name?.startsWith('Security:'))   return "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"
    if (name?.includes('Error'))         return "bg-red-500/10 border-red-500/30 text-red-500"
    
    // Confidence-based coloring for standard labels
    if (confidence !== null) {
      if (confidence > 90) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
      if (confidence < 70) return "bg-danger/10 border-danger/30 text-danger"
    }
    return "bg-accent/10 border-accent/20 text-accent"
  }

  const getCategoryIcon = (name) => {
    if (name?.startsWith('DocType:'))    return '📄'
    if (name?.startsWith('Topic:'))      return '📌'
    if (name?.startsWith('Sentiment:'))  return '💭'
    if (name?.startsWith('Language:'))   return '🌐'
    if (name?.startsWith('Words:'))      return '📊'
    if (name?.startsWith('PII:'))        return '🔐'
    if (name?.startsWith('⚠'))           return '⚠️'
    if (name?.startsWith('Security:'))   return '🛡️'
    if (name?.includes('PERSON'))        return '👤'
    if (name?.includes('ORGANIZATION'))  return '🏢'
    if (name?.includes('LOCATION'))      return '📍'
    if (name?.includes('DATE'))          return '📅'
    if (name?.includes('QUANTITY'))      return '🔢'
    return null
  }

  const renderLabel = (label, i) => {
    const name = typeof label === 'object' ? label.name : String(label)
    const confidence = typeof label === 'object' ? label.confidence : null
    const colorClass = getColorClass(name, confidence)
    const icon = getCategoryIcon(name)

    return (
      <span 
        key={i} 
        className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded text-xs ${colorClass} transition-all hover:scale-105`}
      >
        {icon && <span className="text-[10px]">{icon}</span>}
        <span className="font-semibold">{name}</span>
        {confidence !== null && (
          <span className="opacity-70 font-mono text-[10px]">{Math.round(confidence)}%</span>
        )}
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 py-1">
      {labels.length > 0 ? (
        labels.map((label, i) => renderLabel(label, i))
      ) : (
        <span className="text-sm text-muted font-mono italic">No labels detected</span>
      )}
    </div>
  )
}
