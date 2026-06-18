import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

let counter = 2847

export async function GET() {
  return NextResponse.json({ count: counter })
}

export async function POST() {
  counter += 1
  return NextResponse.json({ count: counter })
}
