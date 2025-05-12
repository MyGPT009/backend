import Message from '#models/message'

export default class MessageRepository {
  // Récupérer les messages d'une conversation
  public async getMessagesByConversationId(conversationId: number) {
    return Message.query().where({ conversationId }).orderBy('createdAt', 'asc')
  }

  // Créer un message
  public async createMessage(
    content: string,
    aiResponse: string,
    conversationId: number,
    userId: number
  ) {
    return await Message.create({
      content,
      aiResponse,
      conversationId,
      userId,
    })
  }

  // Supprimer un message
  public async deleteMessage(messageId: number) {
    return Message.query().where('id', messageId).delete()
  }
}
