import { FEMALE_AURAS, MALE_AURAS, NEUTRAL_AURAS, TV_CHARACTERS } from './auraTypes'

export async function analyzeProfile(imageBase64: string, username: string) {
  const allAuras = {
    female: FEMALE_AURAS.slice(0, 20).join(', '),
    male: MALE_AURAS.slice(0, 20).join(', '),
    neutral: NEUTRAL_AURAS.slice(0, 10).join(', ')
  }

  const tvList = TV_CHARACTERS.slice(0, 15).map(c => `${c.name} (${c.show})`).join(', ')

  const prompt = `Analyze this Instagram profile image for @${username} and return ONLY a JSON object with no extra text, no markdown, no backticks.

Return exactly this JSON:
{"auraType":"Old Money Heiress","auraGender":"female","auraDescription":"You project exclusivity without trying. Your feed feels curated not performed.","attractionFactor":8.5,"mysteryLevel":"high","tvCharacter":"Blair Waldorf","tvShow":"Gossip Girl","tvEmoji":"👸","tvReason":"Same quiet authority that makes people nervous.","assumption":"You never text first and everyone knows it.","redFlags":["Replies late on purpose","Overthinks captions","Hard to read"],"greenFlags":["Fiercely loyal","Knows what she wants","Zero fake energy"],"roast":"Your feed looks like a mood board that became sentient and started posting."}

But customize ALL values based on what you actually see in the image. Available aura types female: ${allAuras.female}. Male: ${allAuras.male}. Neutral: ${allAuras.neutral}. TV characters: ${tvList}.

IMPORTANT: Return ONLY the JSON. Nothing else.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

  const json = await response.json()
  
  // Log full response for debugging
  console.log('Gemini status:', response.status)
  console.log('Gemini response:', JSON.stringify(json).slice(0, 500))

  if (!response.ok) {
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(json).slice(0, 200)}`)
  }

  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!raw) {
    // Check for safety blocks
    const blockReason = json.candidates?.[0]?.finishReason
    const safetyRatings = json.candidates?.[0]?.safetyRatings
    console.log('Block reason:', blockReason, 'Safety:', JSON.stringify(safetyRatings))
    throw new Error(`Empty response from Gemini. Reason: ${blockReason || 'unknown'}`)
  }

  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
