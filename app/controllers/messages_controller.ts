import type { HttpContext } from '@adonisjs/core/http'
import axios from 'axios'
import env from '#start/env'

export default class MessagesController {
  async send({ request, response }: HttpContext) {
    const message = request.input('message')
    const apiKey = env.get('GEMINI_API_KEY')

    try {
      const { data } = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          contents: [{ role: 'user', parts: [{ text: message }] }],
        },
        {
          params: { key: apiKey },
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse.'
      return response.ok({ reply })
    } catch (error) {
      console.error('Erreur Gemini:', error.response?.data || error.message)
      return response.status(500).send({ error: 'Erreur Gemini API' })
    }
  }
}
