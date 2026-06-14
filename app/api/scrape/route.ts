import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) return NextResponse.json({ error: 'No username' }, { status: 400 })

  try {
    // Start Apify Instagram scraper actor
    const runRes = await fetch(
      'https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=' + process.env.APIFY_TOKEN,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames: [username.replace('@', '')],
          resultsLimit: 1
        })
      }
    )

    if (!runRes.ok) throw new Error('Apify run failed')

    const results = await runRes.json()
    const user = results?.[0]

    if (!user) throw new Error('User not found')

    // Fetch profile pic as base64
    const picUrl = user.profilePicUrlHD || user.profilePicUrl
    const picRes = await fetch(picUrl)
    const picBuffer = await picRes.arrayBuffer()
    const picBase64 = Buffer.from(picBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      username: user.username,
      bio: user.biography,
      profilePicBase64: picBase64,
    })

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 200 })
  }
}
