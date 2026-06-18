import { FEMALE_AURAS, MALE_AURAS, NEUTRAL_AURAS, TV_CHARACTERS } from './auraTypes'

async function callGemini(imageBase64: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          responseMimeType: 'application/json'
        }
      })
    }
  )
  return response
}

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

  let response = await callGemini(imageBase64, prompt)

  // If rate limited, wait 5s and retry once
  if (response.status === 429) {
    await new Promise(r => setTimeout(r, 5000))
    response = await callGemini(imageBase64, prompt)
  }

  const json = await response.json()

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMITED')
    }
    console.error('Gemini error:', JSON.stringify(json).slice(0, 300))
    throw new Error('ANALYSIS_FAILED')
  }

  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!raw) {
    console.error('Empty Gemini response:', JSON.stringify(json).slice(0, 300))
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
