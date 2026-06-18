# VibeCheck 🔮

> AI analyzes your Instagram and reveals your Aura Type

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your OpenAI API key
```bash
cp .env.local.example .env.local
# Edit .env.local and add your key
```

### 3. Run locally
```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add `OPENAI_API_KEY` in Vercel dashboard → Settings → Environment Variables

---

## How it works

1. User uploads Instagram screenshot
2. Image sent to GPT-4o Vision API
3. AI analyzes visual aesthetic, style, energy
4. Returns: Aura Type, Attraction Factor, TV Character, Assumption, Red/Green Flags, Roast
5. User downloads share card → posts to Instagram Story

---

## File Structure

```
app/
  page.tsx          → Homepage
  result/page.tsx   → Results page
  api/analyze/      → API route (GPT-4o Vision)
  globals.css       → Global styles
lib/
  analyze.ts        → OpenAI prompt logic
  auraTypes.ts      → Aura type database (400+ types)
```

---

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI GPT-4o Vision
- html2canvas (share card export)
- Vercel (deploy)
