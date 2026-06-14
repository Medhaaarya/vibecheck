'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [username, setUsername] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const loadingMessages = [
    'Reading your whole personality...',
    'Judging your feed (respectfully)...',
    'Exposing you kindly...',
    'Almost too accurate...',
  ]
  const [loadingMsg, setLoadingMsg] = useState(loadingMessages[0])

  async function handleAnalyze() {
    if (!file && !username.trim()) {
      setError('Enter a username or upload a screenshot')
      return
    }
    setError('')
    setLoading(true)

    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length
      setLoadingMsg(loadingMessages[msgIdx])
    }, 2000)

    try {
      let imageBase64: string | null = null
      let finalUsername = username.trim() || 'unknown'

      // If username given, try scraping first
      if (username.trim() && !file) {
        const scrapeRes = await fetch(`/api/scrape?username=${username.trim()}`)
        const scrapeData = await scrapeRes.json()

        if (scrapeData.success && scrapeData.profilePicBase64) {
          imageBase64 = scrapeData.profilePicBase64
          finalUsername = scrapeData.username
        } else {
          // Scrape failed — ask for screenshot
          setShowUpload(true)
          setError('Could not fetch this profile automatically. Please upload a screenshot.')
          setLoading(false)
          clearInterval(interval)
          return
        }
      }

      // If file uploaded, convert to base64
      if (file) {
        const buf = await file.arrayBuffer()
        imageBase64 = Buffer.from(buf).toString('base64')
      }

      if (!imageBase64) throw new Error('No image to analyze')

      const formData = new FormData()
      // Send base64 as blob
      const blob = new Blob([Buffer.from(imageBase64, 'base64')], { type: 'image/jpeg' })
      formData.append('image', blob, 'profile.jpg')
      formData.append('username', finalUsername)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok || !json.success) throw new Error(json.error || 'Analysis failed')

      sessionStorage.setItem('vibecheck_result', JSON.stringify(json))
      router.push('/result')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
      clearInterval(interval)
    }
  }

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { setError('Please upload an image file'); return }
    setFile(f)
    setError('')
  }

  const gradStyle = { background: 'linear-gradient(90deg,#f953c6,#ff6a00)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px' }}>
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 16, fontWeight: 900, letterSpacing: '-0.5px' }}>
          vibe<span style={gradStyle}>check</span>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 32px 60px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 22, fontWeight: 600 }}>
          instagram identity test
        </p>

        <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 'clamp(26px, 6vw, 36px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16, maxWidth: 400 }}>
          <span style={{ color: '#fff' }}>what vibe does<br />your insta </span>
          <span style={gradStyle}>give?</span>
        </h1>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 36, maxWidth: 280, lineHeight: 1.7 }}>
          AI reads your profile and tells you exactly who you are. No filter.
        </p>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Username input */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 50, overflow: 'hidden', marginBottom: 14 }}>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setShowUpload(false); setFile(null) }}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="@username"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 22px', height: 52, fontSize: 15, color: '#fff', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{ height: 44, margin: 4, padding: '0 24px', border: 'none', borderRadius: 40, background: 'linear-gradient(90deg,#f953c6,#ff6a00)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Unbounded, sans-serif', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}
            >
              {loading ? '...' : 'analyze ✦'}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontWeight: 600, letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Upload — always visible */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            style={{
              width: '100%', height: 46, background: showUpload ? 'rgba(249,83,198,0.05)' : 'transparent', cursor: 'pointer',
              border: `1.5px dashed ${dragOver ? 'rgba(249,83,198,0.5)' : file ? 'rgba(249,83,198,0.4)' : showUpload ? 'rgba(249,83,198,0.3)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14, color: file ? '#f953c6' : showUpload ? 'rgba(249,83,198,0.7)' : 'rgba(255,255,255,0.25)',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
            }}
          >
            {file ? `✓ ${file.name}` : showUpload ? '↑ upload your instagram screenshot' : '↑ upload screenshot instead'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {error && <p style={{ fontSize: 12, color: '#f953c6', marginTop: 12, textAlign: 'center' }}>{error}</p>}
          {loading && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20, textAlign: 'center', fontStyle: 'italic' }}>{loadingMsg}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32 }}>
          <div style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            <strong style={{ color: 'rgba(255,255,255,0.45)' }}>2,847 people</strong> checked their aura today
          </span>
        </div>
      </div>
    </main>
  )
}
