import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VibeCheck — What vibe does your Instagram give?',
  description: 'AI analyzes your Instagram and reveals your Aura Type, Attraction Factor, TV character match and more.',
  openGraph: {
    title: 'VibeCheck — What vibe does your Instagram give?',
    description: 'AI analyzes your Instagram profile and tells you exactly who you are.',
    images: ['/og.png'],
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
