import type { HttpContext } from '@adonisjs/core/http'
import { storeValidator } from '#validators/message'
import Message from '#models/message'
import { AiService } from '#services/ai_service'

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

      // Utilisation du service Ai
      const aiResponse = await AiService.getAIResponse(content)

      const message = await Message.create({
        content,
        aiResponse: aiResponse,
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
