import type { HttpContext } from '@adonisjs/core/http'
import { storeValidator } from '#validators/message'
import MessageRepository from '../repositories/message_repository.js'
import { AiService } from '#services/ai_service'

export default class MessagesController {
  private messageRepository: MessageRepository

  constructor() {
    this.messageRepository = new MessageRepository()
  }

  async index({ params, response }: HttpContext) {
    try {
      const { conversationId } = params
      const messages = await this.messageRepository.getMessagesByConversationId(conversationId)

      return response.ok(messages)
    } catch {
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }

  // Méthode pour envoyer un message
  async send({ auth, params, request, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()
      const { conversationId } = params
      const { content } = await request.validateUsing(storeValidator)

      if (!content?.trim()) {
        return response.badRequest({ message: 'Le contenu du message ne peut pas être vide.' })
      }

      const aiResponse = await AiService.getAIResponse(content)
      const message = await this.messageRepository.createMessage(
        content,
        aiResponse,
        conversationId,
        authUser.id
      )

      return response.created(message)
    } catch (err) {
      console.error('Erreur interne:', err)
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }
}
