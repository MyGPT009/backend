import type { HttpContext } from '@adonisjs/core/http'
import Conversation from '#models/conversation'

export default class ConversationsController {
  async index({ auth, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()

      const conversations = await Conversation.query()
        .where('userId', authUser.id)
        .orderBy('createdAt', 'desc')

      return response.ok(conversations)
    } catch (error) {
      console.error(error) // Pour debugging en dev
      return response.internalServerError({
        message: 'Une erreur est survenue, veuillez réessayer plus tard.',
      })
    }
  }

  async store({ auth, response }: HttpContext) {
    try {
      const authUser = auth.getUserOrFail()

      const conversation = await Conversation.create({
        title: 'New Conversation',
        userId: authUser.id,
      })

      return response.created(conversation)
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        message: 'Impossible de créer la conversation.',
      })
    }
  }
}
