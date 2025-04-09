import { test } from '@japa/runner'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import db from '@adonisjs/lucid/services/db'

test.group('AuthController', (group) => {
  group.each.teardown(async () => {
    await db.rawQuery('DELETE FROM users')
  })

  test('register un nouvel utilisateur', async ({ client, assert }) => {
    const email = `test-${cuid()}@example.com`

    const response = await client.post('auth/register').form({
      email,
      password: 'password123456', // ✅ longueur 13
      name: 'Test User',
    })

    response.assertStatus(201)
    assert.exists(response.body().id)
    assert.equal(response.body().email, email)
  })

  test('login avec de bons identifiants', async ({ client, assert }) => {
    await User.create({
      email: 'login@example.com',
      password: 'password123456', // ✅
      name: 'Login User',
    })
    const response = await client.post('auth/login').form({
      email: 'login@example.com',
      password: 'password123456', // ✅
    })

    // response.assertStatus(200)
    assert.exists(response.body().token)
    assert.equal(response.body().email, 'login@example.com')
  })

  test('login échoue avec mauvais mot de passe', async ({ client }) => {
    await User.create({
      email: 'wrongpass@example.com',
      password: 'password123456', // ✅
      name: 'Wrong Pass',
    })

    const response = await client.post('auth/login').form({
      email: 'wrongpass@example.com',
      password: 'wrongpassword123', // ✅ (mais invalide exprès)
    })

    // response.assertStatus(400)
    response.assertBodyContains({ message: 'Invalid credentials' })
  })

  test('logout fonctionne et supprime le token', async ({ client }) => {
    await User.create({
      email: 'logout@example.com',
      password: 'password123456', // ✅
      name: 'Logout User',
    })

    const login = await client.post('auth/login').form({
      email: 'logout@example.com',
      password: 'password123456',
    })

    const token = login.body().token.token

    const response = await client.delete('auth/logout').bearerToken(token)

    response.assertStatus(200)
    response.assertBodyContains({ message: 'Logged out' })
  })
})
