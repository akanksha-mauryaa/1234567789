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
    <div className="glass rounded-[2rem] border border-border p-6 md:p-16 lg:p-24 flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px] md:min-h-[600px]">
      {status === 'uploading' && (
        <div className="absolute inset-0 bg-bg/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-border border-t-accent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(225,29,72,0.2)]"></div>
          <p className="font-mono text-accent text-xl font-black tracking-[0.3em] animate-pulse">SYSTEM_SCAN_ACTIVE</p>
        </div>
      )}

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleSelect}
      />

      <div 
        className="w-full max-w-2xl h-80 border-2 border-dashed border-border/60 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all mb-10"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="text-7xl mb-6 opacity-90 group-hover:scale-110 transition-transform duration-500">📡</span>
        <p className="text-2xl font-bold text-primary text-center px-4">
          {file ? file.name : 'Drop file here or click to select'}
        </p>
        <p className="text-sm text-muted mt-4 font-mono tracking-widest uppercase">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supported: JPEG • PNG • GIF • BMP • WEBP • PDF • DOCX • CSV • TXT'}
        </p>
      </div>

      {errorMsg && <p className="text-danger text-sm mb-6 font-mono bg-danger/10 px-4 py-2 rounded-lg border border-danger/20">Error: {errorMsg}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className={`w-full max-w-2xl py-5 rounded-2xl font-black tracking-[0.25em] text-lg transition-all duration-300
          ${file 
            ? 'bg-gradient-to-r from-accent to-accent2 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
            : 'bg-surface text-muted cursor-not-allowed border border-border opacity-50'
          }`}
      >
        ⚡ ANALYZE WITH REKOGNITION
      </button>
    </div>
  )
}
