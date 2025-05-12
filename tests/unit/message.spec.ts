import { test } from '@japa/runner'
import Message from '#models/message'
import User from '#models/user'
import { AiService } from '#services/ai_service'
import Conversation from '#models/conversation'

test.group('MessageController.send', (group) => {
  group.each.teardown(async () => {
    await User.query().delete()
    await Message.query().delete()
    await Conversation.query().delete()
  })

  test('should create a message with AI response', async ({ client, assert }) => {
    // Création d'un utilisateur fictif
    const user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    // Génération d’un token API
    const token = await User.accessTokens.create(user)
    if (!token.value) {
      throw new Error('Le token généré n’a pas de valeur')
    }

    // Création d'une conversation fictive avant d'envoyer un message
    const conversation = await Conversation.create({
      // Assure-toi que tous les champs nécessaires pour créer une conversation sont fournis
      title: 'Test Conversation',
      userId: user.id,
    })

    // Mock du AiService
    AiService.getAIResponse = async () => 'Réponse IA mockée'

    // Utilisation de l'ID de la conversation créée pour envoyer un message
    const response = await client
      .post(`/message/conversation/${conversation.id}/send`)
      .form({ content: 'Bonjour IA !' })
      .bearerToken(token.value.release())

    response.assertStatus(201)

    const message = await Message.findBy('conversationId', conversation.id)

    assert.exists(message)
    assert.equal(message?.content, 'Bonjour IA !')
    assert.equal(message?.aiResponse, 'Réponse IA mockée')
    assert.equal(message?.userId, user.id)
  })
})
