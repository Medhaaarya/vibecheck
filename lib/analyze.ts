import { FEMALE_AURAS, MALE_AURAS, NEUTRAL_AURAS, TV_CHARACTERS } from './auraTypes'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function analyzeProfile(imageBase64: string, username: string) {
  const allAuras = {
    female: shuffle(FEMALE_AURAS).slice(0, 20).join(', '),
    male: shuffle(MALE_AURAS).slice(0, 20).join(', '),
    neutral: shuffle(NEUTRAL_AURAS).slice(0, 10).join(', ')
  }

  const tvList = shuffle(TV_CHARACTERS).map(c => `${c.name} (${c.show})`).join(', ')

  const prompt = `Analyze this Instagram profile image for @${username} and return ONLY a JSON object with no extra text, no markdown, no backticks.

Return exactly this JSON shape with keys auraType, auraGender, auraDescription, attractionFactor (number 1-10), mysteryLevel (low/medium/high/very high), tvCharacter, tvShow, tvEmoji (one emoji), tvReason, assumption (starts with "You"), redFlags (array of 3), greenFlags (array of 3), roast (playful, never mean).

Pick the aura type from: Female: ${allAuras.female}. Male: ${allAuras.male}. Neutral: ${allAuras.neutral}.

For tvCharacter: the list below is intentionally shuffled. Pick whichever character's vibe genuinely matches the image — judge purely on look, energy, and style. Do not have a default favorite. Options: ${tvList}.

Return ONLY the JSON, nothing else.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.9,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    })
  })

  const json = await response.json()

  if (!response.ok) {
    console.error('Groq error:', JSON.stringify(json).slice(0, 400))
    throw new Error('ANALYSIS_FAILED')
  }

  const raw = json.choices?.[0]?.message?.content

  if (!raw) {
    console.error('Empty Groq response:', JSON.stringify(json).slice(0, 300))
    throw new Error('ANALYSIS_FAILED')
  }

  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    console.error('JSON parse failed:', clean.slice(0, 300))
    throw new Error('ANALYSIS_FAILED')
  }
}
