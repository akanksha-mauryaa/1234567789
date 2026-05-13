const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'https://vwo7017dig.execute-api.ap-south-1.amazonaws.com/prod'

export async function getPresignedUrl(fileName, fileType) {
  const res = await fetch(`${API_BASE}/presigned`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, fileType }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function uploadToS3(uploadUrl, file) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`)
}

export async function fetchResults() {
  const res = await fetch(`${API_BASE}/results`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.Items)) return data.Items
  if (data && Array.isArray(data.items)) return data.items
  return []
}
