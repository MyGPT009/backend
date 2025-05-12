import { test } from '@japa/runner'
import Conversation from '#models/conversation'
import User from '#models/user'

test.group('Conversation', (group) => {
  let user: User
  let conversation1: Conversation
  let conversation2: Conversation

  group.each.teardown(async () => {
    // Supprimer uniquement les conversations et utilisateurs créés pendant les tests
    if (conversation1) {
      await Conversation.query().where('id', conversation1.id).delete()
    }
    if (conversation2) {
      await Conversation.query().where('id', conversation2.id).delete()
    }
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

    // Création de conversations fictives pour cet utilisateur
    conversation1 = await Conversation.create({
      title: 'Conversation 1',
      userId: user.id,
    })

    conversation2 = await Conversation.create({
      title: 'Conversation 2',
      userId: user.id,
    })

    // Faire une requête pour récupérer les conversations de l'utilisateur
    const response = await client.get('/conversation').bearerToken(token.value.release())

    response.assertStatus(200)

    const conversations = response.body()

    // Vérification que les conversations créées existent dans la réponse et sont triées par date de création (du plus récent au plus ancien)
    assert.equal(conversations.length, 2)
    assert.equal(conversations[0].title, conversation2.title)
    assert.equal(conversations[1].title, conversation1.title)
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

    // Faire une requête pour créer une nouvelle conversation
    const response = await client.post('/conversation/new').bearerToken(token.value.release())

    response.assertStatus(201)

    const conversation = response.body()

    // Vérification que la conversation a bien été créée
    assert.equal(conversation.title, 'New Conversation')
    assert.equal(conversation.userId, user.id)
  })
})
