import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })

  try {
    const cleanUsername = username.replace('@', '').trim()

    // Run sync — waits for result automatically, returns dataset items directly
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}&timeout=50`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [cleanUsername] })
      }
    )

    const text = await res.text()
    console.log('Apify raw response:', text.slice(0, 300))

    if (!text || text.trim() === '') throw new Error('Empty response from Apify')

    const items = JSON.parse(text)

    if (!Array.isArray(items) || items.length === 0) throw new Error('User not found or private')

    const user = items[0]

    // Profile pic — try HD first
    const picUrl = user.profilePicUrlHD || user.profilePicUrl || user.profile_pic_url_hd || user.profile_pic_url
    if (!picUrl) throw new Error('No profile picture found')

    const picRes = await fetch(picUrl)
    const picBuffer = await picRes.arrayBuffer()
    const picBase64 = Buffer.from(picBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      username: user.username || cleanUsername,
      bio: user.biography || user.bio || '',
      profilePicBase64: picBase64,
    })

  } catch (e: any) {
    console.error('Scrape error:', e.message)
    return NextResponse.json({ success: false, error: e.message }, { status: 200 })
  }
}
