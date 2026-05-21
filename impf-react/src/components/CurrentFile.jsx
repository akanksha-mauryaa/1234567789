import LabelTags from './LabelTags'

export default function CurrentFile({ item }) {
  if (!item) {
    return (
      <div className="glass rounded-xl border border-border p-8 text-center text-muted font-mono text-xs">
        No file data available. Upload a file to see it here.
      </div>
    )
  }

  const safe = item.is_safe !== false && item.is_safe !== 'false'
  const ts = item.timestamp ? item.timestamp.replace('T', ' ').substring(0, 16) : '—'
  const fname = item.file_name || (item.s3_key || '').split('/').pop() || item.file_id || '—'

  // Extract labels and moderation details
  const displayLabels = Array.isArray(item.labels) ? item.labels : []
  const modDetails = Array.isArray(item.moderation_details) ? item.moderation_details : []
  const embeddedImages = Array.isArray(item.embedded_images) ? item.embedded_images : []
  
  // Get top 8 labels for the breakdown
  const topLabels = displayLabels
    .filter(l => typeof l === 'object')
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8)

  // Categorize labels for document intelligence view
  const docTypeLabel = displayLabels.find(l => l?.name?.startsWith('DocType:'))
  const topicLabels = displayLabels.filter(l => l?.name?.startsWith('Topic:'))
  const entityLabels = displayLabels.filter(l => 
    l?.name && !l.name.startsWith('Topic:') && 
    !l.name.startsWith('Language:') && 
    !l.name.startsWith('Sentiment:') && 
    !l.name.startsWith('Words:') &&
    !l.name.startsWith('DocType:') &&
    !l.name.startsWith('⚠')
  )
  const sentimentLabel = displayLabels.find(l => l?.name?.startsWith('Sentiment:'))
  const languageLabel = displayLabels.find(l => l?.name?.startsWith('Language:'))
  const wordCountLabel = displayLabels.find(l => l?.name?.startsWith('Words:'))
  const piiLabel = displayLabels.find(l => l?.name?.startsWith('⚠'))

  // Document stats from backend
  const docStats = item.doc_stats || null
  const isDocument = item.file_type === 'document'

  // Bar color based on label category
  const getBarColor = (name, confidence) => {
    if (name?.startsWith('DocType:')) return 'bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
    if (name?.startsWith('Topic:')) return 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
    if (name?.startsWith('Sentiment:')) return 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
    if (name?.startsWith('Language:')) return 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
    if (name?.startsWith('Words:')) return 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
    if (confidence > 90) return 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
    return 'bg-accent'
  }

  const fileExt = fname.includes('.') ? fname.split('.').pop().toUpperCase() : ''
  const displayType = fileExt ? `${item.file_type || 'unknown'} (${fileExt})` : (item.file_type || 'unknown')

  // Group security violations cleanly
  const piiAlerts = modDetails.filter(m => m.name?.startsWith('PII:') || m.name?.includes('PII'))
  const threatKeywords = modDetails.filter(m => m.name?.startsWith('Flagged Keyword:') || m.name?.includes('Keyword'))
  const visualThreats = modDetails.filter(m => m.name?.startsWith('Unsafe Embedded Image:') || m.name?.includes('Embedded Image'))
  const otherAlerts = modDetails.filter(m => 
    !m.name?.startsWith('PII:') && !m.name?.includes('PII') &&
    !m.name?.startsWith('Flagged Keyword:') && !m.name?.includes('Keyword') &&
    !m.name?.startsWith('Unsafe Embedded Image:') && !m.name?.includes('Embedded Image')
  )

  return (
    <div className="space-y-4">
      {/* File Header with Scan Effect */}
      <div className="glass p-6 rounded-xl border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden group">
        <div className="absolute inset-x-0 h-1 bg-accent/30 blur-[2px] animate-scan pointer-events-none z-10 hidden group-hover:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="flex-1 z-20">
          <h3 className="text-[10px] font-mono tracking-widest text-muted mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            FILE NAME // ANALYSIS ACTIVE
          </h3>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-primary break-all leading-tight" title={fname}>
            {fname}
          </h2>
          <p className="text-xs font-mono text-muted mt-2 tracking-widest uppercase">// {ts}</p>
          {docTypeLabel && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-lg">
              <span className="text-[10px] font-mono text-pink-400 tracking-wider">CLASSIFIED AS</span>
              <span className="text-sm font-black text-pink-400 uppercase">{docTypeLabel.name.replace('DocType: ', '')}</span>
              <span className="text-[10px] font-mono text-pink-400/60">{Math.round(docTypeLabel.confidence)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Structural Split Page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ========================================================
            LEFT COLUMN (Core Info, Security, & Stats)
            ======================================================== */}
        <div className="space-y-4 lg:col-span-1">
          {/* File Telemetry Details */}
          <div className="glass p-5 rounded-2xl border border-border space-y-4">
            <h3 className="text-[10px] font-mono tracking-widest text-muted uppercase">// File Metadata</h3>
            
            <div className="border-b border-border/40 pb-3 flex justify-between items-center">
              <span className="text-xs font-mono text-muted">PHYSICAL TYPE</span>
              <span className="text-sm font-mono font-bold text-accent uppercase">{displayType}</span>
            </div>

            <div className="border-b border-border/40 pb-3 flex justify-between items-center">
              <span className="text-xs font-mono text-muted">SCAN STATUS</span>
              <span className={`text-sm font-mono font-bold ${item.status === 'completed' ? 'text-neon' : 'text-danger'} uppercase`}>
                {item.status || '—'}
              </span>
            </div>

            <div className="border-b border-border/40 pb-3 flex justify-between items-center">
              <span className="text-xs font-mono text-muted">COMPLIANT / SAFE</span>
              <span className={`text-sm font-mono font-bold ${safe ? 'text-neon' : 'text-danger'} uppercase`}>
                {safe ? 'COMPLIANT' : 'VIOLATION DETECTED'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-muted">AI LABELS SCANNED</span>
              <span className="text-sm font-mono font-bold text-accent2">{item.label_count ?? '0'}</span>
            </div>
          </div>

          {/* Inline Security Violations Inspector (Requirement 3) */}
          {!safe && (
            <div className="glass p-5 rounded-2xl border border-danger/40 bg-danger/5 space-y-4">
              <div className="flex items-center justify-between border-b border-danger/20 pb-3">
                <h3 className="text-[10px] font-mono tracking-widest text-danger uppercase font-bold flex items-center gap-2">
                  ⚠️ SECURITY VIOLATIONS
                </h3>
                <span className="text-[9px] font-mono bg-danger/25 text-danger px-2 py-0.5 rounded font-black">
                  {modDetails.length} ALERT{modDetails.length !== 1 ? 'S' : ''}
                </span>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {/* 1. PII Exposure Section */}
                {piiAlerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono text-muted font-bold tracking-wider flex items-center gap-2 text-danger/80">
                      🔒 PII DATA EXPOSURE ({piiAlerts.length})
                    </div>
                    <div className="space-y-1.5">
                      {piiAlerts.map((m, i) => (
                        <div key={i} className="bg-surface/50 border border-danger/10 p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-xs font-mono text-primary font-bold">{m.name.replace('PII: ', '')}</span>
                          <span className="text-[10px] font-mono text-danger font-medium bg-danger/10 px-1.5 py-0.5 rounded">{Math.round(m.confidence)}% risk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Flagged Threat Keywords Section */}
                {threatKeywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-danger/10">
                    <div className="text-[10px] font-mono text-muted font-bold tracking-wider flex items-center gap-2 text-danger/80">
                      🛡️ THREAT TERMS FLAG ({threatKeywords.length})
                    </div>
                    <div className="space-y-1.5">
                      {threatKeywords.map((m, i) => (
                        <div key={i} className="bg-surface/50 border border-danger/10 p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-xs font-mono text-primary font-bold">Keyword: "{m.name.replace('Flagged Keyword: ', '')}"</span>
                          <span className="text-[10px] font-mono text-danger font-medium bg-danger/10 px-1.5 py-0.5 rounded">{Math.round(m.confidence)}% risk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Visual Threats / Embedded Images Alerts */}
                {visualThreats.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-danger/10">
                    <div className="text-[10px] font-mono text-muted font-bold tracking-wider flex items-center gap-2 text-danger/80">
                      🖼️ EMBEDDED IMAGE THREATS ({visualThreats.length})
                    </div>
                    <div className="space-y-1.5">
                      {visualThreats.map((m, i) => (
                        <div key={i} className="bg-surface/50 border border-danger/10 p-2.5 rounded-lg flex flex-col gap-1">
                          <span className="text-xs font-mono text-primary font-bold break-all leading-tight">{m.name}</span>
                          <span className="text-[10px] font-mono text-danger align-self-start bg-danger/10 px-1.5 py-0.5 rounded w-max">{Math.round(m.confidence)}% risk</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Other Standard Alerts */}
                {otherAlerts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-danger/10">
                    <div className="text-[10px] font-mono text-muted font-bold tracking-wider flex items-center gap-2 text-danger/80">
                      🚨 MODERATION FLAGS ({otherAlerts.length})
                    </div>
                    <div className="space-y-1.5">
                      {otherAlerts.map((m, i) => (
                        <div key={i} className="bg-surface/50 border border-danger/10 p-2.5 rounded-lg flex items-center justify-between">
                          <span className="text-xs font-mono text-primary font-bold">{m.name}</span>
                          <span className="text-[10px] font-mono text-danger font-medium bg-danger/10 px-1.5 py-0.5 rounded">{Math.round(m.confidence)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            RIGHT COLUMN (Deep Analytics, Lists & Media)
            ======================================================== */}
        <div className="space-y-4 lg:col-span-2">
          
          {/* Document Intelligence Stats — only for documents */}
          {isDocument && (docStats || sentimentLabel || languageLabel || docTypeLabel) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {languageLabel && (
                <div className="glass p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors">
                  <div className="text-[10px] text-cyan-400 font-mono tracking-wider">LANGUAGE</div>
                  <div className="text-xl font-mono mt-2 font-bold text-cyan-400">{languageLabel.name.replace('Language: ', '')}</div>
                  <div className="text-[10px] text-muted font-mono mt-1">{Math.round(languageLabel.confidence)}% conf</div>
                </div>
              )}
              {sentimentLabel && (
                <div className="glass p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                  <div className="text-[10px] text-amber-400 font-mono tracking-wider">SENTIMENT</div>
                  <div className="text-xl font-mono mt-2 font-bold text-amber-400">{sentimentLabel.name.replace('Sentiment: ', '')}</div>
                  <div className="text-[10px] text-muted font-mono mt-1">{Math.round(sentimentLabel.confidence)}% conf</div>
                </div>
              )}
              {(docStats?.word_count || wordCountLabel) && (
                <div className="glass p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                  <div className="text-[10px] text-blue-400 font-mono tracking-wider">WORDS</div>
                  <div className="text-xl font-mono mt-2 font-bold text-blue-400">
                    {docStats?.word_count?.toLocaleString() || wordCountLabel?.name?.replace('Words: ', '') || '—'}
                  </div>
                </div>
              )}
              {docStats?.sentence_count && (
                <div className="glass p-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
                  <div className="text-[10px] text-violet-400 font-mono tracking-wider">SENTENCES</div>
                  <div className="text-xl font-mono mt-2 font-bold text-violet-400">
                    {docStats.sentence_count.toLocaleString()}
                  </div>
                </div>
              )}
              {docStats?.avg_word_length && (
                <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <div className="text-[10px] text-emerald-400 font-mono tracking-wider">AVG WORD LENGTH</div>
                  <div className="text-xl font-mono mt-2 font-bold text-emerald-400">
                    {docStats.avg_word_length} <span className="text-xs text-muted">chars</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Data/Spreadsheet Intelligence Stats (New Feature 1) */}
          {item.file_type === 'data' && docStats && (docStats.row_count || docStats.column_count) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {docStats.row_count !== undefined && (
                <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <div className="text-[10px] text-emerald-400 font-mono tracking-wider">TOTAL ROWS</div>
                  <div className="text-xl font-mono mt-2 font-bold text-emerald-400">
                    {docStats.row_count.toLocaleString()}
                  </div>
                </div>
              )}
              {docStats.column_count !== undefined && (
                <div className="glass p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                  <div className="text-[10px] text-blue-400 font-mono tracking-wider">TOTAL COLUMNS</div>
                  <div className="text-xl font-mono mt-2 font-bold text-blue-400">
                    {docStats.column_count.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Embedded Images / Hybrid Document-Image Scanning Gallery (Requirement 4) */}
          {isDocument && embeddedImages.length > 0 && (
            <div className="glass p-6 md:p-8 rounded-2xl border border-pink-500/30 bg-pink-500/5 space-y-4">
              <div>
                <h3 className="text-[10px] font-mono tracking-widest text-pink-400 uppercase font-black">// Embedded Visual Assets Extracted ({embeddedImages.length})</h3>
                <p className="text-xs text-muted font-mono mt-1">AWS Rekognition deep visual scanning completed on all images found inside this document.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {embeddedImages.map((img, i) => (
                  <div key={i} className="bg-surface/50 border border-border/40 p-4 rounded-xl flex flex-col justify-between hover:bg-surface transition-all duration-300 relative group overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🖼️</span>
                        <div className="truncate">
                          <span className="text-xs font-mono font-bold text-primary block truncate max-w-[120px]" title={img.name}>{img.name}</span>
                          <span className="text-[9px] font-mono text-muted uppercase">Embedded Image</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex-shrink-0 uppercase ${img.is_safe ? 'bg-neon/15 text-neon border border-neon/30' : 'bg-danger/15 text-danger border border-danger/30'}`}>
                        {img.is_safe ? 'Safe' : 'Unsafe'}
                      </span>
                    </div>

                    {!img.is_safe && img.alerts && img.alerts.length > 0 && (
                      <div className="mt-3 space-y-1 bg-danger/5 border border-danger/10 p-2 rounded-lg">
                        <div className="text-[8px] font-mono text-danger tracking-wider uppercase font-bold">Threat Detected:</div>
                        {img.alerts.map((a, j) => (
                          <div key={j} className="text-[10px] font-mono text-danger font-medium flex justify-between">
                            <span>• {a.name}</span>
                            <span>{Math.round(a.confidence)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Labels & Confidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Detected Labels Tags */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-border">
              <h3 className="text-[10px] font-mono tracking-widest text-muted mb-6 uppercase">// Detected AI Labels</h3>
              <div className="bg-surface/30 p-4 rounded-xl border border-border/50 min-h-[120px]">
                <LabelTags labels={item.labels} />
              </div>
            </div>

            {/* Confidence Breakdown Bars */}
            <div className="glass p-6 md:p-8 rounded-2xl border border-border">
              <h3 className="text-[10px] font-mono tracking-widest text-muted mb-6 uppercase">// Confidence Breakdown</h3>
              <div className="space-y-4">
                {topLabels.length > 0 ? topLabels.map((l, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5 font-mono">
                      <span className="text-primary font-bold uppercase tracking-tight truncate mr-2" title={l.name}>{l.name}</span>
                      <span className="text-accent flex-shrink-0">{Math.round(l.confidence)}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-border/50">
                      <div 
                        className={`h-full transition-all duration-1000 ${getBarColor(l.name, l.confidence)}`} 
                        style={{ width: `${l.confidence}%` }} 
                      />
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-muted font-mono italic p-4 text-center">No confidence data available for this file.</div>
                )}
              </div>
            </div>
          </div>

          {/* Key Topics & Named Entities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Key Topics — only show if topics were detected */}
            {topicLabels.length > 0 && (
              <div className="glass p-6 md:p-8 rounded-2xl border border-violet-500/30 bg-violet-500/5">
                <h3 className="text-[10px] font-mono tracking-widest text-violet-400 mb-6 uppercase">// Key Topics Extracted</h3>
                <div className="flex flex-wrap gap-2">
                  {topicLabels.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/25 rounded-lg text-xs text-violet-300 font-mono">
                      <span className="font-bold">{t.name.replace('Topic: ', '')}</span>
                      <span className="opacity-60 text-[10px]">{Math.round(t.confidence)}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Entities — only show if entity labels detected */}
            {isDocument && entityLabels.length > 0 && (
              <div className="glass p-6 md:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                <h3 className="text-[10px] font-mono tracking-widest text-emerald-400 mb-6 uppercase">// Named Entities</h3>
                <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {entityLabels.slice(0, 12).map((e, i) => {
                    const parts = e.name.split(': ')
                    const type = parts[0] || ''
                    const value = parts.slice(1).join(': ') || e.name
                    return (
                      <div key={i} className="flex items-center gap-3 bg-surface/30 p-2.5 rounded-xl border border-border/50">
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-tight flex-shrink-0">{type}</span>
                        <span className="text-xs text-primary font-medium truncate" title={value}>{value}</span>
                        <span className="text-[10px] text-muted font-mono ml-auto flex-shrink-0">{Math.round(e.confidence)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
