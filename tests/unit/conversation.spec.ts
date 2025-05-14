import { test } from '@japa/runner'
import User from '#models/user'
import ConversationRepository from '../../app/repositories/conversation_repository.js'

test.group('Conversation', (group) => {
  let user: User
  let conversationRepo: ConversationRepository

  // Helpers
  const createTestUser = async (email = 'test@example.com') => {
    return await User.create({ email, password: 'secret' })
  }

  const createAuthToken = async (targetUser: User) => {
    const token = await User.accessTokens.create(targetUser)
    if (!token.value) throw new Error('Le token généré n’a pas de valeur')
    return token.value.release()
  }

  group.each.teardown(async () => {
    if (user) await User.query().where('id', user.id).delete()
  })

  test('doit retourner les conversations de l’utilisateur authentifié', async ({
    client,
    assert,
  }) => {
    user = await createTestUser()
    const token = await createAuthToken(user)
    conversationRepo = new ConversationRepository()

    const conversation1 = await conversationRepo.createConversation(user.id)
    const conversation2 = await conversationRepo.createConversation(user.id)

    const response = await client.get('/conversation').bearerToken(token)
    response.assertStatus(200)

    const conversations = response.body()
    assert.equal(conversations.length, 2)
    assert.equal(conversations[0].title, conversation2.title)
    assert.equal(conversations[1].title, conversation1.title)

    await conversationRepo.deleteConversation(conversation1.id)
    await conversationRepo.deleteConversation(conversation2.id)
  })

  test('doit créer une nouvelle conversation pour l’utilisateur authentifié', async ({
    client,
    assert,
  }) => {
    user = await createTestUser()
    const token = await createAuthToken(user)
    conversationRepo = new ConversationRepository()

    const response = await client.post('/conversation/new').bearerToken(token)
    response.assertStatus(201)

    const conversation = response.body()
    assert.equal(conversation.title, 'New Conversation')
    assert.equal(conversation.userId, user.id)

    await conversationRepo.deleteConversation(conversation.id)
  })

  test('doit retourner une erreur 401 lors de la récupération des conversations sans authentification', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/conversation')
    response.assertStatus(401)
    assert.deepEqual(response.body(), {
      errors: [{ message: 'Unauthorized access' }],
    })
  })

  test('doit retourner une erreur 401 lors de la création d’une conversation sans authentification', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/conversation/new')
    response.assertStatus(401)
    assert.deepEqual(response.body(), {
      errors: [{ message: 'Unauthorized access' }],
    })
  })

  test('doit supprimer une conversation par ID', async ({ assert }) => {
    user = await createTestUser()
    conversationRepo = new ConversationRepository()

    const conversation = await conversationRepo.createConversation(user.id)
    const deletedRows = await conversationRepo.deleteConversation(conversation.id)

    assert.equal(deletedRows, 1)

    const result = await conversationRepo.getConversationsByUserId(user.id)
    assert.lengthOf(result, 0)
  })
})
