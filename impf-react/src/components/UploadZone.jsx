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
    <div className="glass rounded-xl border border-border p-8 flex flex-col items-center justify-center relative overflow-hidden group">
      {status === 'uploading' && (
        <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-border border-t-accent rounded-full animate-spin mb-4"></div>
          <p className="font-mono text-accent text-sm animate-pulse">PROCESSING PIPELINE...</p>
        </div>
      )}

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleSelect}
      />

      <div 
        className="w-full max-w-md h-40 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all mb-6"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="text-4xl mb-3 opacity-80 group-hover:scale-110 transition-transform">📡</span>
        <p className="font-medium text-primary">
          {file ? file.name : 'Drop file here or click to select'}
        </p>
        <p className="text-xs text-muted mt-2 font-mono">
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'JPEG PNG GIF BMP WEBP PDF DOCX CSV TXT'}
        </p>
      </div>

      {errorMsg && <p className="text-danger text-xs mb-4 font-mono">Error: {errorMsg}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className={`w-full max-w-md py-3 rounded-lg font-bold tracking-wider text-sm transition-all
          ${file 
            ? 'bg-gradient-to-r from-accent to-accent2 text-bg shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] cursor-pointer' 
            : 'bg-surface text-muted cursor-not-allowed border border-border'
          }`}
      >
        ⚡ ANALYZE WITH REKOGNITION
      </button>
    </div>
  )
}
