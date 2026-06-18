import { FEMALE_AURAS, MALE_AURAS, NEUTRAL_AURAS, TV_CHARACTERS } from './auraTypes'

export async function analyzeProfile(imageBase64: string, username: string) {
  const allAuras = {
    female: FEMALE_AURAS.slice(0, 20).join(', '),
    male: MALE_AURAS.slice(0, 20).join(', '),
    neutral: NEUTRAL_AURAS.slice(0, 10).join(', ')
  }

  const tvList = TV_CHARACTERS.slice(0, 15).map(c => `${c.name} (${c.show})`).join(', ')

  const prompt = `Analyze this Instagram profile image for @${username} and return ONLY a JSON object with no extra text, no markdown, no backticks.

Return exactly this JSON shape (customize all values based on the image):
{"auraType":"Old Money Heiress","auraGender":"female","auraDescription":"2-3 sentences, second person, horoscope feel.","attractionFactor":8.5,"mysteryLevel":"high","tvCharacter":"Blair Waldorf","tvShow":"Gossip Girl","tvEmoji":"👸","tvReason":"one sentence","assumption":"one eerily accurate statement starting with You","redFlags":["flag1","flag2","flag3"],"greenFlags":["flag1","flag2","flag3"],"roast":"one playful roast, never mean"}

Pick the aura type from: Female: ${allAuras.female}. Male: ${allAuras.male}. Neutral: ${allAuras.neutral}.
Pick TV character from: ${tvList}.
Return ONLY the JSON, nothing else.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      temperature: 0.7,
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
