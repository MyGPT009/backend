import { test } from '@japa/runner'
import User from '#models/user'
import ConversationRepository from '../../app/repositories/conversation_repository.js'

test.group('Conversation', (group) => {
  let user: User
  let conversationRepo: ConversationRepository

  group.each.teardown(async () => {
    // Supprimer uniquement les utilisateurs créés pendant les tests
    if (user) {
      await User.query().where('id', user.id).delete()
    }
  })

  test('should return conversations for the authenticated user', async ({ client, assert }) => {
    // Création d'un utilisateur fictif
    user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    // Génération d'un token API
    const token = await User.accessTokens.create(user)
    if (!token.value) {
      throw new Error('Le token généré n’a pas de valeur')
    }

    // Instancier le repository
    conversationRepo = new ConversationRepository()

    // Création de conversations fictives pour cet utilisateur via le repository
    const conversation1 = await conversationRepo.createConversation(user.id)
    const conversation2 = await conversationRepo.createConversation(user.id)

    // Faire une requête pour récupérer les conversations de l'utilisateur
    const response = await client.get('/conversation').bearerToken(token.value.release())

    response.assertStatus(200)

    const conversations = response.body()

    // Vérification que les conversations créées existent dans la réponse et sont triées par date de création (du plus récent au plus ancien)
    assert.equal(conversations.length, 2)
    assert.equal(conversations[0].title, conversation2.title)
    assert.equal(conversations[1].title, conversation1.title)

    // Supprimer les conversations créées à la fin
    await conversationRepo.deleteConversation(conversation1.id)
    await conversationRepo.deleteConversation(conversation2.id)
  })

  test('should create a new conversation for the authenticated user', async ({
    client,
    assert,
  }) => {
    // Création d'un utilisateur fictif
    user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    // Génération d'un token API
    const token = await User.accessTokens.create(user)
    if (!token.value) {
      throw new Error('Le token généré n’a pas de valeur')
    }

    // Instancier le repository
    conversationRepo = new ConversationRepository()

    // Faire une requête pour créer une nouvelle conversation via le repository
    const response = await client.post('/conversation/new').bearerToken(token.value.release())

    response.assertStatus(201)

    const conversation = response.body()

    // Vérification que la conversation a bien été créée
    assert.equal(conversation.title, 'New Conversation')
    assert.equal(conversation.userId, user.id)

    // Supprimer la conversation créée à la fin
    await conversationRepo.deleteConversation(conversation.id)
  })

  test('should return 401 when fetching conversations without authentication', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/conversation')

    response.assertStatus(401)

    assert.deepEqual(response.body(), {
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('should return 401 when trying to create a conversation without authentication', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/conversation/new')

    response.assertStatus(401)

    assert.deepEqual(response.body(), {
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('should delete a conversation by ID', async ({ assert }) => {
    // Créer un utilisateur fictif
    user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    conversationRepo = new ConversationRepository()

    // Créer une conversation
    const conversation = await conversationRepo.createConversation(user.id)

    // Supprimer la conversation
    const deletedRows = await conversationRepo.deleteConversation(conversation.id)

    // Vérifier que la conversation a été supprimée
    assert.equal(deletedRows, 1)

    const result = await conversationRepo.getConversationsByUserId(user.id)
    assert.lengthOf(result, 0)
  })
})
