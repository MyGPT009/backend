import type { HttpContext } from '@adonisjs/core/http'
import { storeValidator } from '#validators/message'
import Message from '#models/message'
import axios from 'axios'
import env from '#start/env'

export default class MessagesController {
  async index({ params, response }: HttpContext) {
    try {
      const { conversationId } = params

      const messages = await Message.query().where({ conversationId }).orderBy('createdAt', 'asc')

      return response.ok(messages)
    } catch {
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }

  async send({ auth, params, request, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()
      const { conversationId } = params
      const { content } = await request.validateUsing(storeValidator)

      if (!content?.trim()) {
        return response.badRequest({ message: 'Le contenu du message ne peut pas être vide.' })
      }

      // Appel à l'API Gemini
      let aiReply = 'Pas de réponse.'
      try {
        const apiKey = env.get('GEMINI_API_KEY')
        const { data } = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
          {
            contents: [{ role: 'user', parts: [{ text: content }] }],
          },
          {
            params: { key: apiKey },
            headers: { 'Content-Type': 'application/json' },
          }
        )
        aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || aiReply
      } catch (err) {
        console.error('Erreur Gemini:', err.response?.data || err.message)
      }

      // Création du message avec réponse IA
      const message = await Message.create({
        content,
        aiResponse: aiReply,
        conversationId,
        userId: authUser.id,
      })

      return response.created(message)
    } catch (err) {
      console.error('Erreur interne:', err)
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }
}
