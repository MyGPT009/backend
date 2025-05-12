import type { HttpContext } from '@adonisjs/core/http'
import ConversationRepository from '../repositories/conversation_repository.js'

export default class ConversationsController {
  private conversationRepository: ConversationRepository

  constructor() {
    this.conversationRepository = new ConversationRepository()
  }

  // Méthode pour lister les conversations
  async index({ auth, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()
      const conversations = await this.conversationRepository.getConversationsByUserId(authUser.id)

      return response.ok(conversations)
    } catch (error) {
      console.error(error) // Pour debugging en dev
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }

  // Méthode pour créer une conversation
  async store({ auth, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()
      const conversation = await this.conversationRepository.createConversation(authUser.id)

      return response.created(conversation)
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        message: 'Impossible de créer la conversation.',
      })
    }
  }
}
