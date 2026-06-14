'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface VibeResult {
  auraType: string
  auraGender: string
  auraDescription: string
  attractionFactor: number
  mysteryLevel: string
  tvCharacter: string
  tvShow: string
  tvEmoji: string
  tvReason: string
  assumption: string
  redFlags: string[]
  greenFlags: string[]
  roast: string
}

export default function ResultPage() {
  const [data, setData] = useState<VibeResult | null>(null)
  const [username, setUsername] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const router = useRouter()
  const shareCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('vibecheck_result')
    if (!stored) { router.push('/'); return }
    const parsed = JSON.parse(stored)
    setData(parsed.data)
    setUsername(parsed.username || 'unknown')
    setImageUrl(parsed.imageUrl || null)
  }, [])

  async function handleShare() {
    if (!shareCardRef.current) return
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: '#0d0d0d', scale: 2 })
      const link = document.createElement('a')
      link.download = `vibecheck-${username}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Share failed', e)
    }
  }

  if (!data) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Sans, sans-serif' }}>Loading your vibe...</p>
    </div>
  )

  const gradText = { background: 'linear-gradient(90deg,#f953c6,#ff6a00)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const }
  const [auraFirst, ...auraRest] = data.auraType.split(' ')

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'DM Sans, sans-serif' }}>
      {/* NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 15, fontWeight: 900 }}>
          vibe<span style={gradText}>check</span>
        </div>
        <button onClick={() => router.push('/')} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← analyze another
        </button>
      </nav>

      {/* AURA HERO */}
      <div style={{ padding: '36px 24px 28px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 360, height: 200, background: 'radial-gradient(ellipse,rgba(249,83,198,0.15),transparent 70%)', top: -40, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {imageUrl ? (
            <img src={imageUrl} alt={username} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.15)' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#f953c6,#ff6a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
              {username[0]?.toUpperCase() || '?'}
            </div>
          )}
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>@{username}</span>
        </div>

        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10, fontWeight: 600 }}>your aura type is</p>

        <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 'clamp(24px,6vw,32px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>
          <span style={gradText}>{auraFirst}</span>{' '}
          <span style={{ color: '#fff' }}>{auraRest.join(' ')}</span>
        </h1>

        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, maxWidth: 310, margin: '0 auto' }}>
          {data.auraDescription}
        </p>
      </div>

      {/* SCORES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { label: 'attraction factor', value: `${data.attractionFactor} / 10` },
          { label: 'mystery level', value: data.mysteryLevel }
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.25)', marginBottom: 8, fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 20, fontWeight: 900, ...gradText }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TV CHARACTER */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: 14, fontWeight: 600 }}>📺 tv character energy you match</p>
        <div style={{ background: 'rgba(249,83,198,0.06)', border: '1px solid rgba(249,83,198,0.15)', borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 34 }}>{data.tvEmoji}</span>
          <div>
            <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 15, fontWeight: 900, marginBottom: 4 }}>{data.tvCharacter}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{data.tvShow}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{data.tvReason}</p>
          </div>
        </div>
      </div>

      {/* ASSUMPTION */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: 14, fontWeight: 600 }}>👁️ what people assume about you</p>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '22px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 16, fontWeight: 900, lineHeight: 1.4, letterSpacing: '-0.5px' }}>
            "{data.assumption.split(' ').slice(0, Math.ceil(data.assumption.split(' ').length / 2)).join(' ')}{' '}
            <span style={gradText}>{data.assumption.split(' ').slice(Math.ceil(data.assumption.split(' ').length / 2)).join(' ')}"</span>
          </p>
        </div>
      </div>

      {/* FLAGS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>🚩 red flags</p>
          {data.redFlags.map((f, i) => <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, padding: '2px 0' }}>{f}</p>)}
        </div>
        <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 14, padding: '14px 16px' }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: '#22c55e', marginBottom: 10 }}>🟢 green flags</p>
          {data.greenFlags.map((f, i) => <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, padding: '2px 0' }}>{f}</p>)}
        </div>
      </div>

      {/* ROAST */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.2)', marginBottom: 14, fontWeight: 600 }}>🔥 roast</p>
        <div style={{ background: 'rgba(255,106,0,0.06)', border: '1px solid rgba(255,106,0,0.15)', borderRadius: 14, padding: 18 }}>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontStyle: 'italic' }}>"{data.roast}"</p>
          <p style={{ fontSize: 11, color: 'rgba(255,106,0,0.5)', marginTop: 10, fontWeight: 600 }}>— vibecheck AI, with love</p>
        </div>
      </div>

      {/* SHARE CARD (hidden, used for screenshot) */}
      <div ref={shareCardRef} style={{
        position: 'fixed', left: '-9999px', top: 0,
        width: 320, background: '#0d0d0d', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg,#f953c6,#ff6a00)' }} />
        <div style={{ width: '100%', height: 280, background: 'linear-gradient(160deg,#1a0030,#2d0050 40%,#0a0a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg,#f953c6,#ff6a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'Unbounded, sans-serif', border: '3px solid rgba(255,255,255,0.15)' }}>
            {username[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 14px', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
            ✦ main character frame
          </div>
        </div>
        <div style={{ padding: '20px 20px 22px', fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(249,83,198,0.08)', border: '1px solid rgba(249,83,198,0.2)', borderRadius: 20, padding: '5px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: '#f953c6', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>✦ AI analyzed my instagram</span>
          </div>
          <p style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 6, fontWeight: 600 }}>aura type</p>
          <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 24, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16, color: '#fff' }}>
            <span style={{ background: 'linear-gradient(90deg,#f953c6,#ff6a00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{auraFirst}</span>{' '}
            {auraRest.join(' ')}
          </p>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
          <div style={{ display: 'flex', marginBottom: 14 }}>
            {[{ label: 'attraction factor', value: `${data.attractionFactor} / 10` }, { label: 'mystery level', value: data.mysteryLevel }].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', marginBottom: 4, fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 13, fontWeight: 900, background: 'linear-gradient(90deg,#f953c6,#ff6a00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>{data.tvEmoji}</span>
            <div>
              <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>tv character energy you match</p>
              <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 13, fontWeight: 900, color: '#fff' }}>{data.tvCharacter}</p>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />
          <p style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 12, fontWeight: 900, lineHeight: 1.4, color: '#fff', letterSpacing: '-0.3px', marginBottom: 18 }}>
            "{data.assumption}"
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>@{username}</span>
            <div style={{ background: 'linear-gradient(90deg,#f953c6,#ff6a00)', borderRadius: 20, padding: '6px 14px' }}>
              <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 10, fontWeight: 900, color: '#fff' }}>aura.ai</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHARE BUTTON */}
      <div style={{ padding: '20px 24px 40px' }}>
        <button
          onClick={handleShare}
          style={{ width: '100%', height: 52, border: 'none', borderRadius: 50, background: 'linear-gradient(90deg,#f953c6,#ff6a00)', color: '#fff', fontFamily: 'Unbounded, sans-serif', fontSize: 13, fontWeight: 900, cursor: 'pointer', letterSpacing: '-0.3px' }}
        >
          ✦ share my aura type
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 10 }}>
          downloads a story card · share to instagram
        </p>
      </div>
    </main>
  )
}
