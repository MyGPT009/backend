import { test } from '@japa/runner'
import User from '#models/user'
import Conversation from '#models/conversation'
import MessageRepository from '../../app/repositories/message_repository.js'
import { AiService } from '#services/ai_service'

test.group('Message', (group) => {
  let user: User
  let conversation: Conversation
  let messageRepo: MessageRepository

  // Helpers
  const createTestUser = async (email = 'test@example.com') => {
    return await User.create({ email, password: 'secret' })
  }

  const createTestConversation = async (userId: number, title = 'Test Conversation') => {
    return await Conversation.create({ title, userId })
  }

  const createAuthToken = async (targetUser: User) => {
    const token = await User.accessTokens.create(targetUser)
    if (!token.value) throw new Error('Le token généré n’a pas de valeur')
    return token.value.release()
  }

  group.each.teardown(async () => {
    if (conversation) await Conversation.query().where('id', conversation.id).delete()
    if (user) await User.query().where('id', user.id).delete()
  })

  test('doit retourner les messages pour une conversation spécifique', async ({
    client,
    assert,
  }) => {
    user = await createTestUser()
    conversation = await createTestConversation(user.id)
    messageRepo = new MessageRepository()

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

    const response = await client.get(`/message/conversation/${conversation.id}`)
    response.assertStatus(200)

    const messages = response.body()
    assert.equal(messages.length, 2)
    assert.equal(messages[0].content, message1.content)
    assert.equal(messages[1].content, message2.content)

    await messageRepo.deleteMessage(message1.id)
    await messageRepo.deleteMessage(message2.id)
  })

  test('doit créer un message avec une réponse de l’IA', async ({ client, assert }) => {
    user = await createTestUser()
    const token = await createAuthToken(user)
    conversation = await createTestConversation(user.id)
    messageRepo = new MessageRepository()

    AiService.getAIResponse = async () => 'Réponse IA mockée'

    const response = await client
      .post(`/message/conversation/${conversation.id}/send`)
      .form({ content: 'Bonjour IA !' })
      .bearerToken(token)

    response.assertStatus(201)

    const message = await messageRepo.getMessagesByConversationId(conversation.id)

    assert.equal(message.length, 1)
    assert.equal(message[0].content, 'Bonjour IA !')
    assert.equal(message[0].aiResponse, 'Réponse IA mockée')
    assert.equal(message[0].userId, user.id)

    await messageRepo.deleteMessage(message[0].id)
  })

  test('doit retourner une erreur 401 si non authentifié lors de l’envoi du message', async ({
    client,
    assert,
  }) => {
    user = await createTestUser()
    conversation = await createTestConversation(user.id)

    const response = await client
      .post(`/message/conversation/${conversation.id}/send`)
      .form({ content: 'Message sans auth' })

    response.assertStatus(401)
    assert.deepEqual(response.body(), {
      errors: [{ message: 'Unauthorized access' }],
    })
  })

  test('doit retourner une erreur 400 lors de l’envoi d’un message vide', async ({
    client,
    assert,
  }) => {
    user = await createTestUser('vide@example.com')
    conversation = await createTestConversation(user.id, 'Conversation vide')
    const token = await createAuthToken(user)

    const response = await client
      .post(`/message/conversation/${conversation.id}/send`)
      .form({ content: '   ' })
      .bearerToken(token)

    response.assertStatus(400)
    assert.deepEqual(response.body(), {
      message: 'Le contenu du message ne peut pas être vide.',
    })
  })

  test('doit retourner un tableau vide si la conversation ne contient aucun message', async ({
    client,
    assert,
  }) => {
    user = await createTestUser()
    conversation = await createTestConversation(user.id, 'Empty Conversation')

    const response = await client.get(`/message/conversation/${conversation.id}`)
    response.assertStatus(200)

    const messages = response.body()
    assert.isArray(messages)
    assert.lengthOf(messages, 0)
  })
})
