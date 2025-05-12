import axios from 'axios'
import env from '#start/env'

export class AiService {
  public static async getAIResponse(userText: string): Promise<string> {
    if (!userText.trim()) return 'Pas de réponse.'

    try {
      const apiKey = env.get('GEMINI_API_KEY')
      const apiUrl = env.get('GEMINI_API_URL')
      const { data } = await axios.post(
        apiUrl,
        {
          contents: [{ role: 'user', parts: [{ text: userText }] }],
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      )

      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse.'
    } catch (err) {
      console.error('Erreur Gemini:', err.response?.data || err.message)
      return 'Pas de réponse.'
    }
  }
}
