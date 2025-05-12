import Conversation from '#models/conversation'

export default class ConversationRepository {
  // Récupérer les conversations d'un utilisateur
  public async getConversationsByUserId(userId: number) {
    return Conversation.query().where('userId', userId).orderBy('createdAt', 'desc')
  }

  // Créer une nouvelle conversation
  public async createConversation(userId: number) {
    return await Conversation.create({
      title: 'New Conversation',
      userId,
    })
  }
}
