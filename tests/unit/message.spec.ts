import { test } from '@japa/runner'
import User from '#models/user'
import Conversation from '#models/conversation'
import MessageRepository from '../../app/repositories/message_repository.js'
import { AiService } from '#services/ai_service'

test.group('Message', (group) => {
  let user: User
  let conversation: Conversation
  let messageRepo: MessageRepository

  group.each.teardown(async () => {
    // Supprimer uniquement les données créées lors des tests
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

    // Instancier le repository
    messageRepo = new MessageRepository()

    // Création de messages fictifs associés à la conversation via le repository
    const message1 = await messageRepo.createMessage(
      'Premier message',
      'Réponse IA 1',
      conversation.id,
      user.id
    )
    const message2 = await messageRepo.createMessage(
      'Deuxième message',
      'Réponse IA 2',
      conversation.id,
      user.id
    )

    // Faire une requête pour récupérer les messages de la conversation
    const response = await client.get(`/message/conversation/${conversation.id}`)

    response.assertStatus(200)

    const messages = response.body()

    assert.equal(messages.length, 2)
    assert.equal(messages[0].content, message1.content)
    assert.equal(messages[1].content, message2.content)

    // Supprimer les messages créés à la fin
    await messageRepo.deleteMessage(message1.id)
    await messageRepo.deleteMessage(message2.id)
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

    // Instancier le repository
    messageRepo = new MessageRepository()

    // Mock du AiService
    AiService.getAIResponse = async () => 'Réponse IA mockée'

    // Utilisation de l'ID de la conversation créée pour envoyer un message
    const response = await client
      .post(`/message/conversation/${conversation.id}/send`)
      .form({ content: 'Bonjour IA !' })
      .bearerToken(token.value.release())

    response.assertStatus(201)

    // Récupérer le message via le repository
    const message = await messageRepo.getMessagesByConversationId(conversation.id)

    assert.equal(message.length, 1)
    assert.equal(message[0].content, 'Bonjour IA !')
    assert.equal(message[0].aiResponse, 'Réponse IA mockée')
    assert.equal(message[0].userId, user.id)

    // Supprimer le message créé à la fin
    await messageRepo.deleteMessage(message[0].id)
  })
})
