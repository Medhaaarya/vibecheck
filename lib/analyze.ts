import { FEMALE_AURAS, MALE_AURAS, NEUTRAL_AURAS, TV_CHARACTERS } from './auraTypes'

export async function analyzeProfile(imageBase64: string, username: string) {
  const allAuras = {
    female: FEMALE_AURAS.join(', '),
    male: MALE_AURAS.join(', '),
    neutral: NEUTRAL_AURAS.join(', ')
  }

  const tvList = TV_CHARACTERS.map(c => `${c.name} (${c.show})`).join(', ')

  const prompt = `You are VibeCheck — an AI that analyzes Instagram profiles for entertainment purposes only.

Analyze this Instagram profile screenshot/image for user @${username}.

You must respond ONLY with a valid JSON object. No extra text. No markdown. No explanation.

Rules:
- Analyze ONLY visual aesthetic, style, fashion, poses, color palette, energy, facial expressions, photography style
- IGNORE followers, likes, engagement metrics
- Pick ONE aura type that best fits — be decisive, never give multiple
- The result should feel like a personality test — eerily accurate and shareable
- Keep roast playful, never mean

Available Female Aura Types: ${allAuras.female}
Available Male Aura Types: ${allAuras.male}
Available Neutral Aura Types: ${allAuras.neutral}
Available TV Characters: ${tvList}

Respond with exactly this JSON structure:
{
  "auraType": "exact aura type from the list above",
  "auraGender": "female" or "male" or "neutral",
  "auraDescription": "2-3 sentences describing why this aura fits. Second person, present tense. Make it feel like a horoscope.",
  "attractionFactor": 7.5,
  "mysteryLevel": "low" or "medium" or "high" or "very high",
  "tvCharacter": "exact character name from list",
  "tvShow": "show name",
  "tvEmoji": "one emoji",
  "tvReason": "one sentence why they match this character",
  "assumption": "one single eerily accurate statement about what people assume. Start with 'You'. Make it feel true.",
  "redFlags": ["flag 1", "flag 2", "flag 3"],
  "greenFlags": ["flag 1", "flag 2", "flag 3"],
  "roast": "one funny, playful roast. Never mean. Max 2 sentences."
}`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: imageBase64
              }
            },
            { text: prompt }
          ]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 800,
        }
      })
    }
  )

  const json = await response.json()
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
