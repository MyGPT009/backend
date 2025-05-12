import { test } from '@japa/runner'
import Message from '#models/message'
import User from '#models/user'
import { AiService } from '#services/ai_service'
import Conversation from '#models/conversation'

test.group('Message', (group) => {
  let user: User
  let conversation: Conversation
  let message1: Message
  let message2: Message

  group.each.teardown(async () => {
    // Supprimer uniquement les données créées lors des tests
    if (message1) {
      await Message.query().where('id', message1.id).delete()
    }
    if (message2) {
      await Message.query().where('id', message2.id).delete()
    }
    if (conversation) {
      await Conversation.query().where('id', conversation.id).delete()
    }
    if (user) {
      await User.query().where('id', user.id).delete()
    }
  })

  test('should return messages for a specific conversation', async ({ client, assert }) => {
    // Création d'un utilisateur fictif
    user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    // Création d'une conversation fictive
    conversation = await Conversation.create({
      title: 'Test Conversation',
      userId: user.id,
    })

    // Création de messages fictifs associés à la conversation
    message1 = await Message.create({
      content: 'Premier message',
      conversationId: conversation.id,
      userId: user.id,
    })

    message2 = await Message.create({
      content: 'Deuxième message',
      conversationId: conversation.id,
      userId: user.id,
    })

    // Faire une requête pour récupérer les messages de la conversation
    const response = await client.get(`/message/conversation/${conversation.id}`)

    response.assertStatus(200)

    const messages = response.body()

    assert.equal(messages.length, 2)
    assert.equal(messages[0].content, message1.content)
    assert.equal(messages[1].content, message2.content)
  })

  test('should create a message with AI response', async ({ client, assert }) => {
    // Création d'un utilisateur fictif
    user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    // Génération d’un token API
    const token = await User.accessTokens.create(user)
    if (!token.value) {
      throw new Error('Le token généré n’a pas de valeur')
    }

    // Création d'une conversation fictive avant d'envoyer un message
    conversation = await Conversation.create({
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

