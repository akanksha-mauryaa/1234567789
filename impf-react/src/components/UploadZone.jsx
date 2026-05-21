import { useState, useRef } from 'react'
import { getPresignedUrl, uploadToS3 } from '../hooks/useIMPF'

export default function UploadZone({ onUploadComplete }) {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, error
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setStatus('idle')
    }
  }

  const handleSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setErrorMsg('')
    try {
      console.log("Step 1: Requesting presigned URL for:", file.name, file.type);
      const { uploadUrl } = await getPresignedUrl(file.name, file.type || 'application/octet-stream')
      
      console.log("Step 2: Uploading to S3...");
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file
      })

      if (!res.ok) {
        const errorText = await res.text();
        console.error("S3 Upload Failed Status:", res.status);
        console.error("S3 Response:", errorText);
        throw new Error(`S3 Rejected Upload: ${res.status} ${errorText.substring(0, 50)}`);
      }

      console.log("Step 3: Upload successful. Waiting for AI analysis...");
      
      // Give Rekognition/DynamoDB a few seconds to process
      setTimeout(() => {
        setStatus('idle')
        setFile(null)
        if (onUploadComplete) onUploadComplete()
      }, 5000)
    } catch (err) {
      console.error("Upload process failed:", err)
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="glass rounded-2xl border border-border p-8 md:p-12 flex flex-col items-center justify-center relative min-h-[500px] w-full max-w-4xl mx-auto shadow-sm">
      {status === 'uploading' && (
        <div className="absolute inset-0 bg-surface/90 z-20 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-bold">Uploading...</p>
        </div>
      )}

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleSelect}
      />

      <div 
        className="w-full max-w-2xl h-72 border border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all mb-8 group bg-surface shadow-sm"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 rounded-full bg-surface shadow-sm border border-border mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <span className="text-4xl opacity-80">📤</span>
        </div>
        <p className="text-xl font-bold text-primary text-center px-4 max-w-lg truncate">
          {file ? file.name : 'Click or Drag & Drop File'}
        </p>
        <p className="text-xs text-muted mt-4 font-mono tracking-widest uppercase text-center px-6">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supported: JPEG, PNG, PDF, DOCX, CSV, TXT'}
        </p>
      </div>

      {errorMsg && <p className="text-danger text-sm mb-6 font-mono bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">Error: {errorMsg}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className={`w-full max-w-2xl py-4 rounded-lg font-bold text-sm tracking-widest transition-all uppercase
          ${file 
            ? 'bg-primary text-bg hover:opacity-90 cursor-pointer shadow-md' 
            : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
      >
        ANALYZE FILE
      </button>
    </div>
  )
}
