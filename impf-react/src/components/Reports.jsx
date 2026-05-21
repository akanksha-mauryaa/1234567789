import React, { useState } from 'react';

export default function Reports({ items }) {
  const [filter, setFilter] = useState('all'); // 'all', 'safe', 'unsafe'
  const [isPreview, setIsPreview] = useState(false);

  // Filter the items based on user selection
  const filteredItems = items.filter(item => {
    const isSafe = item.is_safe !== false && item.is_safe !== 'false';
    if (filter === 'safe') return isSafe;
    if (filter === 'unsafe') return !isSafe;
    return true;
  });

  const total = filteredItems.length;
  const safeCount = filteredItems.filter(i => i.is_safe !== false && i.is_safe !== 'false').length;
  const unsafeCount = total - safeCount;
  
  const piiIncidents = filteredItems.filter(i => {
    const mod = Array.isArray(i.moderation_details) ? i.moderation_details : [];
    return mod.some(m => m.name?.startsWith('PII:'));
  });

  const handlePrint = () => {
    // Setting isPreview to false just to ensure a clean layout, though CSS handles most of it
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0 print:w-full print:max-w-full">
      
      {/* CONTROLS (Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 print:hidden border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
          <p className="text-muted text-sm mt-1">Filter, preview, and export to PDF.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Documents</option>
            <option value="safe">Safe Documents Only</option>
            <option value="unsafe">Unsafe / Breaches Only</option>
          </select>

          <button 
            onClick={() => setIsPreview(!isPreview)}
            className={`px-4 py-2 rounded font-bold transition-colors text-sm border ${isPreview ? 'bg-primary text-bg border-primary' : 'bg-surface border-border text-primary hover:bg-card'}`}
          >
            {isPreview ? 'Close Preview' : 'Preview Report'}
          </button>

          <button 
            onClick={handlePrint}
            className="bg-primary text-bg px-4 py-2 rounded font-bold hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
          >
            <span>📄</span> Export to PDF
          </button>
        </div>
      </div>

      {/* REPORT PREVIEW CONTAINER */}
      <div className={`transition-all duration-300 ${isPreview ? 'ring-4 ring-primary/20 scale-[1.01] shadow-2xl' : 'opacity-80 grayscale-[30%] pointer-events-none'} print:ring-0 print:scale-100 print:opacity-100 print:grayscale-0 print:pointer-events-auto`}>
        
        {/* A white, formal document background for the PDF */}
        <div className="bg-white text-black p-8 sm:p-12 rounded-xl border border-border print:border-none print:shadow-none print:p-0" id="report-document">
          
          {/* Header */}
          <div className="flex justify-between items-end border-b-2 border-gray-300 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase text-gray-900">IMPF Compliance Report</h1>
              <p className="text-gray-500 mt-2 font-mono text-sm">Generated: {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800 text-xs uppercase tracking-widest">Filter Applied:</p>
              <p className="text-blue-600 font-mono capitalize">{filter} Documents</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Executive Summary</h3>
            <p className="text-lg leading-relaxed text-gray-800">
              The IMPF system processed <strong>{total} files</strong> matching the current filter criteria. 
              Automated AI classification verified that <strong>{safeCount} files</strong> comply with safety standards, 
              while <strong>{unsafeCount} files</strong> were flagged for security violations.
              <br /><br />
              The deep NLP scanner identified <strong>{piiIncidents.length} critical instances</strong> of Personally Identifiable Information (PII) leakage within this dataset.
            </p>
          </div>

          {/* Table */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 border-b border-gray-200 pb-2">Document Log</h3>
            
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 rounded">No documents found for this filter.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
                    <th className="p-3 font-bold border border-gray-200">Timestamp</th>
                    <th className="p-3 font-bold border border-gray-200">File Name</th>
                    <th className="p-3 font-bold border border-gray-200">Safety</th>
                    <th className="p-3 font-bold border border-gray-200">Primary Label / Alerts</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  {filteredItems.map((item, idx) => {
                    const isSafe = item.is_safe !== false && item.is_safe !== 'false';
                    
                    // Handle both legacy string labels and new object labels
                    let topLabel = 'N/A';
                    if (item.labels && item.labels.length > 0) {
                      topLabel = typeof item.labels[0] === 'object' ? item.labels[0].name : item.labels[0];
                    }

                    const alerts = item.moderation_details && item.moderation_details.length > 0 
                      ? item.moderation_details.map(m => typeof m === 'object' ? m.name : m).join(', ') 
                      : topLabel;

                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs border border-gray-200 whitespace-nowrap">{item.timestamp}</td>
                        <td className="p-3 font-medium border border-gray-200">{item.file_name}</td>
                        <td className={`p-3 font-bold text-xs border border-gray-200 ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                          {isSafe ? 'SAFE' : 'UNSAFE'}
                        </td>
                        <td className={`p-3 font-mono text-xs border border-gray-200 ${!isSafe ? 'text-red-600' : 'text-gray-600'}`}>
                          {alerts}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="mt-16 text-center text-gray-400 text-xs font-mono pt-4 border-t border-gray-200">
            Intelligent Media Processing Framework • Confidential Document
          </div>

        </div>
      </div>

    </div>
  );
}
