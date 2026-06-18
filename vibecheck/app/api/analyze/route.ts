import { NextRequest, NextResponse } from 'next/server'
import { analyzeProfile } from '@/lib/analyze'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const username = (formData.get('username') as string) || 'unknown'

    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    if (!base64 || base64.length < 100) throw new Error('Image too small or corrupted')

    const result = await analyzeProfile(base64, username)

    return NextResponse.json({ success: true, data: result, username })
  } catch (err: any) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}
