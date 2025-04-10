import { test } from '@japa/runner'
import { registerValidator, loginValidator } from '#validators/auth'

test.group('register', () => {
  test('register valid user', async ({ assert }) => {
    const validUser = {
      name: 'test',
      email: 'test@gmail.com',
      password: 'validpassword123',
    }

    try {
      await registerValidator.validate(validUser)
      assert.ok(true)
    } catch (error) {
      assert.fail('Not valid user')
    }
  })

  test('register invalid name', async ({ assert }) => {
    const invalidUser = {
      name: 'te',
      email: 'test@gmail.com',
      password: 'validpassword123',
    }

    try {
      await registerValidator.validate(invalidUser)
      assert.fail('Validation should fail due to short name')
    } catch (error) {
      assert.equal(error.message, 'Validation failure')
    }
  })

  test('register invalid email', async ({ assert }) => {
    const invalidUser = {
      name: 'test',
      email: 'invalid-email',
      password: 'validpassword123',
    }

    try {
      await registerValidator.validate(invalidUser)
      assert.fail('Validation should fail due to invalid email')
    } catch (error) {
      assert.equal(error.message, 'Validation failure')
    }
  })

  test('register invalid password', async ({ assert }) => {
    const invalidUser = {
      name: 'test',
      email: 'test@gmail.com',
      password: 'test',
    }

    try {
      await registerValidator.validate(invalidUser)
      assert.fail('Validation should fail due to short password')
    } catch (error) {
      assert.equal(error.message, 'Validation failure')
    }
  })
})

test.group('login', () => {
  test('login valid user', async ({ assert }) => {
    const validLogin = {
      email: 'testuser@gmail.com',
      password: 'validpassword123',
    }

    try {
      await loginValidator.validate(validLogin)
      assert.ok(true)
    } catch (error) {
      assert.fail('Not valid user')
    }
  })

  test('login invalid email', async ({ assert }) => {
    const invalidLogin = {
      email: 'invalid-email',
      password: 'validpassword123',
    }

    try {
      await loginValidator.validate(invalidLogin)
      assert.fail('Validation should fail due to invalid email')
    } catch (error) {
      assert.equal(error.message, 'Validation failure')
    }
  })

  test('login invalid password', async ({ assert }) => {
    const invalidLogin = {
      email: 'testuser@gmail.com',
      password: 'test',
    }

    try {
      await loginValidator.validate(invalidLogin)
      assert.fail('Validation should fail due to short password')
    } catch (error) {
      assert.equal(error.message, 'Validation failure')
    }
  })
})
